const prisma = require("../lib/prisma");

const getCart = async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });
    res.json(items);
  } catch (err) { next(err); }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, qty = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: "productId required" });

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { qty: { increment: qty } },
      create: { userId: req.user.id, productId, qty },
      include: { product: true },
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { qty } = req.body;
    if (qty < 1) {
      await prisma.cartItem.delete({ where: { id: req.params.id } });
      return res.json({ message: "Item removed" });
    }
    const item = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { qty },
      include: { product: true },
    });
    res.json(item);
  } catch (err) { next(err); }
};

const removeFromCart = async (req, res, next) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ message: "Item removed" });
  } catch (err) { next(err); }
};

const clearCart = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.json({ message: "Cart cleared" });
  } catch (err) { next(err); }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
