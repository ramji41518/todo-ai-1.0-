import { useSelector, useDispatch } from "react-redux";
import api from "../api/axios";
import { setMe } from "../store/userSlice";
import { useEffect, useState } from "react";

export default function SubscriptionPage() {
  const { isSubscribed, credits, email } = useSelector((s) => s.user);
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();

  const go = async (mode, type) => {
    setBusy(true);
    try {
      const { data } = await api.post("/billing/create-checkout-session", {
        mode,
        type,
      });
      window.location.href = data.url;
    } finally {
      setBusy(false);
    }
  };

  const openPortal = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/billing/portal");
      window.location.href = data.url;
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    const { data } = await api.get("/auth/me");
    dispatch(setMe(data.user));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") refresh();
  }, []);

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h1>Subscription</h1>
      <div>Email: {email}</div>
      <div>Subscribed: {isSubscribed ? "Yes" : "No"}</div>
      <div>Credits: {credits}</div>

      <div className="small text-muted" style={{ marginTop: 8 }}>
        Pro plan is $5/month. You receive 20 credits monthly. Each AI message
        costs 1 credit. Completing all high-priority tasks in any collection
        grants +5 credits.
      </div>

      <div className="divider" />

      <div className="col">
        <button
          className="btn btn-primary"
          disabled={busy}
          onClick={() => go("subscription", "pro")}
        >
          Subscribe – Pro ($5/mo)
        </button>
        <button
          className="btn btn-outline"
          disabled={busy}
          onClick={openPortal}
        >
          Manage Billing
        </button>
        <button className="btn" onClick={refresh}>
          Refresh Status
        </button>
      </div>
    </div>
  );
}
