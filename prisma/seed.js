require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  { name: "Air Max 270",      brand: "Nike",          category: "sneakers", price: 129.99, emoji: "👟" },
  { name: "Stan Smith",       brand: "Adidas",        category: "sneakers", price: 99.99,  emoji: "👟" },
  { name: "574 Classic",      brand: "New Balance",   category: "sneakers", price: 119.99, emoji: "👟" },
  { name: "RS-X Bold",        brand: "Puma",          category: "sneakers", price: 89.99,  emoji: "👟" },
  { name: "Old Skool",        brand: "Vans",          category: "sneakers", price: 79.99,  emoji: "👟" },
  { name: "Chuck Taylor",     brand: "Converse",      category: "sneakers", price: 74.99,  emoji: "👟" },
  { name: "Classic Leather",  brand: "Reebok",        category: "sneakers", price: 84.99,  emoji: "👟" },
  { name: "Gel-Lyte III",     brand: "Asics",         category: "sneakers", price: 109.99, emoji: "👟" },
  { name: "D'Lites Chunky",   brand: "Skechers",      category: "sneakers", price: 69.99,  emoji: "👟" },
  { name: "Disruptor II",     brand: "Fila",          category: "sneakers", price: 74.99, salePrice: 59.99, emoji: "👟" },

  { name: "Nuptse 700",       brand: "The North Face",category: "jackets",  price: 349.99, emoji: "🧥" },
  { name: "Watertight II",    brand: "Columbia",      category: "jackets",  price: 149.99, emoji: "🧥" },
  { name: "Kånken Jacket",    brand: "Fjällräven",    category: "jackets",  price: 279.99, emoji: "🧥" },
  { name: "Nano Puff",        brand: "Patagonia",     category: "jackets",  price: 299.99, emoji: "🧥" },
  { name: "Cypress Shell",    brand: "Canada Goose",  category: "jackets",  price: 899.99, salePrice: 749.99, emoji: "🧥" },
  { name: "Atom LT",          brand: "Arc'teryx",     category: "jackets",  price: 399.99, emoji: "🧥" },
  { name: "Crew Jacket",      brand: "Helly Hansen",  category: "jackets",  price: 179.99, emoji: "🧥" },
  { name: "Stranda Insulated",brand: "Bergans",       category: "jackets",  price: 199.99, emoji: "🧥" },
  { name: "Björnen Kids",     brand: "Didriksons",    category: "jackets",  price: 129.99, emoji: "🧥" },
  { name: "Stormlock Shell",  brand: "Jack Wolfskin", category: "jackets",  price: 219.99, emoji: "🧥" },

  { name: "Basic Slim Tee",   brand: "Calvin Klein",  category: "tshirts",  price: 39.99,  emoji: "👕" },
  { name: "Flag Logo Tee",    brand: "Tommy Hilfiger",category: "tshirts",  price: 44.99,  emoji: "👕" },
  { name: "Classic Piqué",    brand: "Lacoste",       category: "tshirts",  price: 59.99,  emoji: "👕" },
  { name: "Polo Crew Tee",    brand: "Ralph Lauren",  category: "tshirts",  price: 54.99,  emoji: "👕" },
  { name: "Crew Neck",        brand: "Hugo Boss",     category: "tshirts",  price: 49.99, salePrice: 34.99, emoji: "👕" },
  { name: "Graphic Tee",      brand: "Levi's",        category: "tshirts",  price: 29.99,  emoji: "👕" },
  { name: "Original Solid",   brand: "Gant",          category: "tshirts",  price: 39.99,  emoji: "👕" },
  { name: "Ringer Tee",       brand: "Fred Perry",    category: "tshirts",  price: 64.99,  emoji: "👕" },
  { name: "Performance Tee",  brand: "Björn Borg",    category: "tshirts",  price: 24.99,  emoji: "👕" },
  { name: "Player Tee",       brand: "Peak Performance",category:"tshirts", price: 34.99,  emoji: "👕" },

  { name: "501 Original Fit", brand: "Levi's",        category: "jeans",    price: 99.99,  emoji: "👖" },
  { name: "3301 Slim",        brand: "G-Star Raw",    category: "jeans",    price: 119.99, emoji: "👖" },
  { name: "Tight Terry",      brand: "Nudie Jeans",   category: "jeans",    price: 159.99, emoji: "👖" },
  { name: "North Skinny",     brand: "Acne Studios",  category: "jeans",    price: 249.99, salePrice: 179.99, emoji: "👖" },
  { name: "Space Relaxed",    brand: "Weekday",       category: "jeans",    price: 59.99,  emoji: "👖" },
  { name: "Snap Skinny",      brand: "Dr. Denim",     category: "jeans",    price: 69.99,  emoji: "👖" },
  { name: "Evolve Slim",      brand: "Tiger of Sweden",category:"jeans",    price: 179.99, emoji: "👖" },
  { name: "Jay Slim Fit",     brand: "J.Lindeberg",   category: "jeans",    price: 149.99, emoji: "👖" },
  { name: "Texas Regular",    brand: "Wrangler",      category: "jeans",    price: 79.99,  emoji: "👖" },
  { name: "Brooklyn Straight",brand: "Lee",           category: "jeans",    price: 89.99,  emoji: "👖" },

  { name: "Dri-FIT Shorts",   brand: "Nike",          category: "sport",    price: 44.99,  emoji: "🏃" },
  { name: "Tiro Track Pants", brand: "Adidas",        category: "sport",    price: 59.99,  emoji: "🏃" },
  { name: "HeatGear Tights",  brand: "Under Armour",  category: "sport",    price: 49.99,  emoji: "🏃" },
  { name: "Vital Seamless",   brand: "Gymshark",      category: "sport",    price: 69.99,  emoji: "🏃" },
  { name: "Compression Tights",brand:"2XU",           category: "sport",    price: 89.99,  emoji: "🏃" },
  { name: "ADV Essence",      brand: "Craft",         category: "sport",    price: 54.99,  emoji: "🏃" },
  { name: "Ceramicool Top",   brand: "Odlo",          category: "sport",    price: 64.99,  emoji: "🏃" },
  { name: "Agile Shorts",     brand: "Salomon",       category: "sport",    price: 79.99, salePrice: 59.99, emoji: "🏃" },
  { name: "Iconic Tights",    brand: "Röhnisch",      category: "sport",    price: 39.99,  emoji: "🏃" },
  { name: "Essential Tank",   brand: "Casall",        category: "sport",    price: 49.99,  emoji: "🏃" },

  { name: "Wrap Midi Dress",  brand: "Gina Tricot",   category: "dresses",  price: 39.99,  emoji: "👗" },
  { name: "Silk Midi Dress",  brand: "& Other Stories",category:"dresses",  price: 89.99,  emoji: "👗" },
  { name: "Conscious Maxi",   brand: "H&M",           category: "dresses",  price: 59.99,  emoji: "👗" },
  { name: "Floral Mini Dress",brand: "Zara",          category: "dresses",  price: 44.99, salePrice: 29.99, emoji: "👗" },
  { name: "Slip Dress",       brand: "Filippa K",     category: "dresses",  price: 199.99, emoji: "👗" },
  { name: "Elara Dress",      brand: "Tiger of Sweden",category:"dresses",  price: 249.99, emoji: "👗" },
  { name: "Libra Dress",      brand: "Acne Studios",  category: "dresses",  price: 349.99, emoji: "👗" },
  { name: "Puff Sleeve Dress",brand: "NA-KD",         category: "dresses",  price: 34.99,  emoji: "👗" },
  { name: "Shirt Dress",      brand: "Monki",         category: "dresses",  price: 29.99,  emoji: "👗" },
  { name: "Smock Dress",      brand: "Pieces",        category: "dresses",  price: 27.99,  emoji: "👗" },
];

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.product.createMany({ data: products });
  console.log(`✅ ${products.length} products created`);

  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@igshop.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "IGS",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created — admin@igshop.com / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
