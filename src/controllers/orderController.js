const prisma = require("../lib/prisma");
const Stripe = require("stripe");

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, shippingCost = 0 } = req.body;
    if (!items?.length) return res.status(400).json({ message: "No items provided" });

    // Verify products & calculate total
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw Object.assign(new Error(`Product ${item.productId} not found`), { status: 404 });
      const price = product.salePrice ?? product.price;
      total += price * item.qty;
      return { productId: item.productId, qty: item.qty, price };
    });

    total += shippingCost;

    // Create Stripe PaymentIntent
    let stripePaymentId = null;
    let stripeClientSecret = null;
    if (stripe && paymentMethod === "card") {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: "usd",
        metadata: { userId: req.user.id },
      });
      stripePaymentId = intent.id;
      stripeClientSecret = intent.client_secret;
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        shippingCost,
        shippingAddress,
        paymentMethod,
        stripePaymentId,
        stripeClientSecret,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    // Clear cart after order
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    res.status(201).json({ order, clientSecret: stripeClientSecret });
  } catch (err) { next(err); }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) { next(err); }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.user.id && req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Not authorized" });
    res.json(order);
  } catch (err) { next(err); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(order);
  } catch (err) { next(err); }
};

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus };
