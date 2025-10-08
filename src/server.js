import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ FleetMadox API running on http://localhost:${PORT}`);
  console.log("🟢 Press Ctrl + C to stop the server");
});

// 🧠 Keeps Node process alive (for Node 20+ / Windows)
process.stdin.resume();
