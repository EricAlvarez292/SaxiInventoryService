const express = require('express');
const router = express.Router();

const db = require('../db/mysqlDb')

class Inventory {

    async addInventory(inventoryInfo) {
        return await db.query("INSERT INTO inventory SET ?", inventoryInfo);
    }

    async getInventory(product_id = null) {
        if (product_id == null) {
            return await db.query(`SELECT * FROM inventory GROUP BY product_id ORDER BY last_updated DESC`);
        } else return await db.query(`SELECT * FROM inventory WHERE product_id = ${product_id} ORDER BY last_updated DESC LIMIT 1`);
    }
}


router.get("/", async (req, res) => {
    try {
        const result = await new Inventory().getInventory()
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

module.exports = { router, Inventory };