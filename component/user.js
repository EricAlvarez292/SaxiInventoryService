const express = require('express');
const router = express.Router();

const db = require('../db/mysqlDb')

router.get("/", async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users');
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

router.post("/", async (req, res) => {
    try {
        const users = req.body;
        const values = users.map(supplier => [
            supplier.name,
            supplier.role,
            supplier.contact_info
        ]);
        const result = await new User().addUsers(values)
        res.status(201).json({ message: "Users added successfully!", insertedRows: result.affectedRows });
    } catch (err) {
        console.error("Error inserting users:", err);
        res.status(500).json({ error: err.message });
    }
});

class User {
    async getUsers() {
        return await db.query('SELECT * FROM users');
    }

    async addUsers(usersInfo) {
        const sql = "INSERT INTO users (name, role, contact_info ) VALUES ?";
        return await db.query(sql, [usersInfo]);
    }
}


module.exports = { router, User };