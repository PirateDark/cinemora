import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cinemora-jwt-secret-2024";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "غير مصرح" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "انتهت الجلسة" });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {}
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "غير مصرح" });
  }
  next();
}

export function adminKeyAuth(req, res, next) {
  // Accept admin key in header
  const key = req.headers["x-admin-key"];
  if (key === process.env.ADMIN_KEY) {
    return next();
  }
  // Also accept JWT with admin role
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role === "admin") {
        req.user = decoded;
        return next();
      }
    } catch {}
  }
  return res.status(403).json({ success: false, error: "مفتاح المشرف مطلوب" });
}
