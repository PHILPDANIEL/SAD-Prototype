// seedAddons.js
// Run once: node seedAddons.js

const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/sayotea_pos")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => { console.error(err); process.exit(1); });

const addonSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  isAvailable: { type: Boolean, default: true }
});

const Addon = mongoose.model("Addon", addonSchema, "addons");

const addons = [
  // Milktea Add-Ons
  { name: "Cheesecake",    price: 15, category: "Milktea" },
  { name: "Cream Cheese",  price: 15, category: "Milktea" },
  { name: "Crushed Oreo",  price: 15, category: "Milktea" },
  { name: "Egg Pudding",   price: 15, category: "Milktea" },
  { name: "Black Pearl",   price: 10, category: "Milktea" },
  { name: "Nata de Coco",  price: 15, category: "Milktea" },
  { name: "Taro Bits",     price: 10, category: "Milktea" },
  { name: "Coffee Jelly",  price: 15, category: "Milktea" },

  // FruiTea Add-Ons
  { name: "Lychee Popping Boba",     price: 20, category: "FruiTea" },
  { name: "Strawberry Popping Boba", price: 20, category: "FruiTea" },
  { name: "Fruit Jelly",             price: 15, category: "FruiTea" },

  // Cake Corner
  { name: "Triple Chocolate Cake", price: 70, category: "Cake Corner" },
  { name: "Blueberry Cheesecake",  price: 80, category: "Cake Corner" },
  { name: "New York Cheesecake",   price: 80, category: "Cake Corner" },
];

async function seed() {
  await Addon.deleteMany({}); // clear existing
  await Addon.insertMany(addons);
  console.log(`✅ Seeded ${addons.length} addons`);
  mongoose.disconnect();
}

seed();