import stripe from "../utils/stripe.js";
import User from "../models/User.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const STRIPE_PRICE_PRO_MONTHLY = process.env.STRIPE_PRICE_PRO_MONTHLY;
const STRIPE_PRICE_CREDITS_100 = process.env.STRIPE_PRICE_CREDITS_100;

async function getOrCreateCustomer(user) {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: { userId: String(user._id) },
  });
  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}

export const createCheckoutSession = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User not found" });

  const { mode, type } = req.body || {};
  if (!["subscription", "payment"].includes(mode))
    return res.status(400).json({ message: "Invalid mode" });

  const customerId = await getOrCreateCustomer(user);
  const price =
    mode === "subscription"
      ? STRIPE_PRICE_PRO_MONTHLY
      : STRIPE_PRICE_CREDITS_100;
  if (!price)
    return res.status(500).json({ message: "Stripe price not configured" });

  const session = await stripe.checkout.sessions.create({
    mode,
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${FRONTEND_URL}/subscription?status=success`,
    cancel_url: `${FRONTEND_URL}/subscription?status=cancel`,
    metadata: {
      userId: String(user._id),
      type: type || (mode === "subscription" ? "pro" : "credits"),
    },
  });

  res.json({ url: session.url });
};

export const createPortalSession = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user?.stripeCustomerId)
    return res.status(400).json({ message: "No Stripe customer" });
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${FRONTEND_URL}/subscription`,
  });
  res.json({ url: portal.url });
};

export const webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const customerId = s.customer;

        let user = await User.findOne({ stripeCustomerId: customerId });
        if (!user && s.metadata?.userId)
          user = await User.findById(s.metadata.userId);
        if (!user) break;

        if (s.mode === "subscription") {
          user.stripeSubscriptionId =
            typeof s.subscription === "string"
              ? s.subscription
              : s.subscription?.id;
          user.issubscribed = true;
          user.credits = (user.credits || 0) + 20; // initial +20
          await user.save();
        } else if (s.mode === "payment" && s.metadata?.type === "credits") {
          user.credits = (user.credits || 0) + 100; // optional pack
          await user.save();
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const inv = event.data.object;
        const subId = inv.subscription;
        if (subId) {
          const user = await User.findOne({ stripeSubscriptionId: subId });
          if (user) {
            user.issubscribed = true;
            user.credits = (user.credits || 0) + 20; // monthly topup +20
            await user.save();
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const user =
          (await User.findOne({ stripeSubscriptionId: sub.id })) ||
          (await User.findOne({ stripeCustomerId: sub.customer }));
        if (user) {
          user.issubscribed = false;
          user.stripeSubscriptionId = null;
          await user.save();
        }
        break;
      }

      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error("[Stripe webhook handler] error:", err);
    res.status(500).json({ message: "Webhook handler error" });
  }
};
