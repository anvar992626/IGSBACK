const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName)
      return res.status(400).json({ message: "All fields required" });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, firstName, lastName, phone },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    res.status(201).json({ token: signToken(user.id), user });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const { password: _, ...safeUser } = user;
    res.json({ token: signToken(user.id), user: safeUser });
  } catch (err) { next(err); }
};

const me = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, me };
