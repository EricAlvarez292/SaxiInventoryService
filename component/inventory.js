const express = require('express');
const pgdb = require('../db/pgdb');

class Inventory {

    constructor() {
        this.pgdb = new pgdb();
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/", this.getInventory.bind(this));
    }

    async getInventory(req, res) {
        try {
            const { user_id, product_id } = req.query;
            console.log(`getInventory() : ${JSON.stringify(req.query)}`)
            const conditions = [];
            const values = [];
            if (product_id) {
                conditions.push(`ti.product_id = ${product_id}`);
                values.push(product_id);
            }
            if (user_id) {
                conditions.push(`t.user_id = ${user_id}`);
                values.push(user_id);
            }
            const whereClause = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
            console.log(`getInventory() where clause : ${whereClause}`)
            const result = await this.pgdb.getDbInstance().any(`
                            SELECT 
                                i.product_id,
                                p.name,
                                p.description,
                                p.category,
                                p.price,
                                i.quantity_in_stock,
                                i.last_updated
                            FROM inventory i
                            JOIN products p ON i.product_id = p.product_id
                            WHERE i.product_id IN (
                                SELECT ti.product_id
                                FROM transactions t
                                JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
                                ${whereClause})`);
            console.log(`getInventory() : ${JSON.stringify(result)}`)
            res.json(result);
        } catch (err) {
            console.error("Error getInventory():", err);
            res.status(500).send(err.message);
        }
    }


    getRouter() {
        return this.router;
    }
}

module.exports = Inventory;