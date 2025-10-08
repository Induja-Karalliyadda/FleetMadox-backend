import { verifyJWT } from "../utils/jwt.js";

/**
 * ✅ Authenticate Middleware
 * Checks for a Bearer token, verifies it, and attaches decoded payload to req.user
 */
export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = verifyJWT(token);
    req.user = payload; // e.g. { id, role }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * ✅ Authorization Middleware
 * Restricts access to specific user roles
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
