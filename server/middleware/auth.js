import jwt from "jsonwebtoken"; // ✅ correct way for CommonJS module
const { verify } = jwt;

const auth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid/Expired token" });
  }
};

export default auth;
