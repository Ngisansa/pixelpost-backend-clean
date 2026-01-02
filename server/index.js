require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* ======================
   Middleware
====================== */
app.use(cors());
app.use(express.json());

/* ======================
   Database
====================== */
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Mongo connected"))
    .catch((err) => console.error("❌ Mongo connect error", err));
}

/* ======================
   Routes
====================== */
app.use("/users", require("./routes/users"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/posts", require("./routes/posts"));

/* ======================
   Health Check
====================== */
app.get("/", (req, res) => {
  res.send("PixelPost backend running");
});

/* ======================
   Start Server
====================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.get("/__debug", (req, res) => {
  res.json({
    status: "ok",
    file: "server/index.js",
    time: new Date().toISOString(),
  });
});
