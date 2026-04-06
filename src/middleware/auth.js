const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { protect, adminOnly };
