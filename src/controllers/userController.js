const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

const getProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, password } = req.body;
    const data = {};
    if (firstName) data.firstName = firstName;
    if (lastName)  data.lastName  = lastName;
    if (phone)     data.phone     = phone;
    if (password)  data.password  = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
    });
    res.json(user);
  } catch (err) { next(err); }
};

// Admin: list all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, getAllUsers };
