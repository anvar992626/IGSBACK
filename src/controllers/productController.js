const prisma = require("../lib/prisma");

const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort, page = 1, limit = 20, saleOnly } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      active: true,
      ...(category && { category }),
      ...(saleOnly === "true" && { salePrice: { not: null } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const orderBy = (() => {
      switch (sort) {
        case "price-asc":  return { price: "asc" };
        case "price-desc": return { price: "desc" };
        case "name":       return { name: "asc" };
        default:           return { createdAt: "desc" };
      }
    })();

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: Number(limit) }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { reviews: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { next(err); }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  } catch (err) { next(err); }
};

const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ message: "Product deactivated" });
  } catch (err) { next(err); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
