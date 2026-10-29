require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const foodSchema = new mongoose.Schema({
  foodId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  cuisine: { type: String, required: true },
  ingredients: {
    type: [String],
    validate: {
      validator: v => v.length > 0,
      message: "Can co nguyen lieu"
    }
  },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  imageUrl: { type: String, default: "" }
});

const Food = mongoose.model("Food", foodSchema, "foods");

function handleError(res, err) {
  if (err.code === 11000) {
    return res.status(409).json({ error: "Trung ma mon an" });
  }
  if (err.name === "ValidationError" ||
      err.name === "CastError") {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Loi may chu" });
}

app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "database unavailable"
  });
});

app.get("/api/foods", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = search ? {
      $or: ["name", "category", "cuisine"].map(field => ({
        [field]: { $regex: safe, $options: "i" }
      }))
    } : {};
    res.json(await Food.find(filter));
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/api/foods/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({
      error: "Khong tim thay mon an"
    });
    res.json(food);
  } catch (err) {
    handleError(res, err);
  }
});

app.post("/api/foods", async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (err) {
    handleError(res, err);
  }
});

app.put("/api/foods/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!food) return res.status(404).json({
      error: "Khong tim thay mon an"
    });
    res.json(food);
  } catch (err) {
    handleError(res, err);
  }
});

app.delete("/api/foods/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({
      error: "Khong tim thay mon an"
    });
    res.json({ message: "Xoa thanh cong" });
  } catch (err) {
    handleError(res, err);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "API khong ton tai" });
});

app.use((err, req, res, next) => {
  if (err.status === 400 && err instanceof SyntaxError) {
    return res.status(400).json({ error: "JSON khong hop le" });
  }
  handleError(res, err);
});

if (!process.env.MONGODB_URI) {
  console.error("Thieu MONGODB_URI");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log("Server running on port " + PORT);
    });
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
