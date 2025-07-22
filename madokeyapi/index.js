const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

const PORT = process.env.PORT || 3000;

// 🗝️ In-memory key database
const keys = {}; // key: { hwid: string | null, createdAt: timestamp }

// 🧠 Key Generator
function generateKey(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// 🎁 Route: Generate new key
app.get("/generate", (req, res) => {
  const key = generateKey();
  keys[key] = {
    hwid: null,
    createdAt: Date.now()
  };
  res.json({ key });
});

// ✅ Route: Check key validity
app.get("/check", (req, res) => {
  const { key, hwid } = req.query;
  const record = keys[key];
  if (!record) return res.json({ valid: false, reason: "Invalid key" });

  const now = Date.now();
  const age = now - record.createdAt;
  const maxAge = 5 * 60 * 60 * 1000; // 5 hours

  if (age > maxAge) return res.json({ valid: false, reason: "Expired key" });

  if (record.hwid && record.hwid !== hwid) {
    return res.json({ valid: false, reason: "Key already used" });
  }

  if (!record.hwid) {
    record.hwid = hwid;
    return res.json({ valid: true, firstUse: true });
  }

  return res.json({ valid: true, firstUse: false });
});

app.get("/", (req, res) => res.send("MadoHub API is running 🔐"));

app.listen(PORT, () => console.log(`✅ Mado API running on port ${PORT}`));
