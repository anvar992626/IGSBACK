const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const authRoutes     = require("./routes/auth");
const productRoutes  = require("./routes/products");
const cartRoutes     = require("./routes/cart");
const orderRoutes    = require("./routes/orders");
const userRoutes     = require("./routes/users");
const errorHandler   = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/users",    userRoutes);

app.use(errorHandler);

module.exports = app;
