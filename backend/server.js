require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Haal alle apartments op
app.get("/api/apartments", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM apartments ORDER BY id DESC"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Eén appartement ophalen via ID
app.get("/api/apartments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute("SELECT * FROM apartments WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Apartment not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Missing fields" });

        const [exists] = await db.execute("SELECT id FROM users WHERE username = ?", [username]);
        if (exists.length) return res.status(400).json({ message: "User exists" });

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.execute("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed]);
        res.status(201).json({ message: "User created", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Missing fields" });

        const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        // Option: maak hier JWT token en stuur die terug
        res.json({ username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/apartments", async (req, res) => {
    try {
        const { type, medewerker, nummer, beschrijving, status, huishouden } = req.body;

        if (!type || !medewerker || !nummer) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const [result] = await db.execute(
            "INSERT INTO apartments (type, medewerker, nummer, beschrijving, status, huishouden) VALUES (?, ?, ?, ?, ?, ?)",
            [type, medewerker, nummer, beschrijving, status, huishouden]
        );

        res.status(201).json({ message: "Apartment added", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete("/api/apartments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing id" });

        const [result] = await db.execute("DELETE FROM apartments WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Apartment not found" });
        }
        res.json({ message: "Apartment deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Update apartment details
app.put("/api/apartments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing id" });

        const allowed = ["type", "medewerker", "nummer", "beschrijving", "status", "huishouden", "foto"];
        const payload = req.body || {};

        const fields = Object.keys(payload).filter(
            (k) => allowed.includes(k) && payload[k] !== undefined
        );
        if (fields.length === 0) return res.status(400).json({ message: "No valid fields to update" });


        const sets = fields.map((k) => `${k} = ?`).join(", ");
        const values = fields.map((k) => payload[k]);
        values.push(id);

        await db.execute(`UPDATE apartments SET ${sets} WHERE id = ?`, values);

        const [rows] = await db.execute("SELECT * FROM apartments WHERE id = ?", [id]);
        if (!rows.length) return res.status(404).json({ message: "Apartment not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


// Toggle household done flag by prefixing with a check mark
app.patch("/api/apartments/:id/household-done", async (req, res) => {
    try {
        const { id } = req.params;
        const { done } = req.body || {};

        if (!id || typeof done === "undefined") {
            return res.status(400).json({ message: "Missing id or done flag" });
        }

        const [rows] = await db.execute("SELECT huishouden FROM apartments WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Apartment not found" });

        const current = rows[0].huishouden || "";
        const hasCheck = current.trim().startsWith("✅");
        let updated = current;
        if (done && !hasCheck) {
            updated = `✅ ${current}`.trim();
        } else if (!done && hasCheck) {
            updated = current.replace(/^\s*✅\s*/u, "").trim();
        }

        await db.execute("UPDATE apartments SET huishouden = ? WHERE id = ?", [updated, id]);

        const [after] = await db.execute("SELECT * FROM apartments WHERE id = ?", [id]);
        res.json(after[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

db.execute("SELECT 1")
    .then(() => console.log("✅ Database connected"))
    .catch(err => console.error("❌ Database error:", err));

