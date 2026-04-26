const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "srujan sathe";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "srujan@2004";

function isUniqueError(error) {
  return (
    error.code === "23505" || error.message.includes("UNIQUE constraint failed")
  );
}

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }

  res.status(401).json({ error: "Invalid admin credentials." });
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to read database." });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, phone, registeredAt } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Missing registration fields." });
    }

    const result = await db.addUser({
      name,
      email,
      phone,
      registeredAt: registeredAt || new Date().toISOString(),
    });

    res.status(201).json({ success: true, id: result.id });
  } catch (error) {
    console.error(error);
    if (isUniqueError(error)) {
      return res.status(400).json({ error: "A user with that email already exists." });
    }
    res.status(500).json({ error: "Failed to save user." });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const result = await db.updateUser(id, { name, email, phone });

    if (result.changes === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ success: true, message: "User updated successfully." });
  } catch (error) {
    console.error(error);
    if (isUniqueError(error)) {
      return res.status(400).json({ error: "Email already in use." });
    }
    res.status(500).json({ error: "Failed to update user." });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting user with ID:", id);
    const result = await db.deleteUser(id);
    console.log("Delete result:", result);

    if (result.changes === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete user: " + error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

(async () => {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
})();
