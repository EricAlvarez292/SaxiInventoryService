const express = require('express');
const router = express.Router();

const db = require('../db/mysqlDb')

router.get("/", async (req, res) => {
    try {
        const result = await new Product().getProduct("products", null)
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
})


router.get("/external/:supplier_id", async (req, res) => {
    try {
        const supplierId = req.params.supplier_id;
        const result = await new Product().getProduct("external_products", null, supplierId)
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
})


router.post("/external", async (req, res) => {
    try {
        const products = req.body;
        const values = products.map(supplier => [
            supplier.supplier_id,
            supplier.name,
            supplier.description,
            supplier.category,
            supplier.price
        ]);
        const result = await new Product().addProducts("external_products", values)
        res.status(201).json({ message: "External Products added successfully!", insertedRows: result.affectedRows });
    } catch (err) {
        console.error("Error inserting products:", err);
        res.status(500).json({ error: err.message });
    }
});


class Product {

    async addProduct(purchaseInfo) {
        return await db.query("INSERT INTO products SET ?", purchaseInfo);
    }

    async addProducts(dbName = "products", purchasesInfo) {
        return await db.query(`INSERT INTO ${dbName} (supplier_id, name, description, category, price) VALUES ?`, [purchasesInfo]);
    }

    async getProduct(dbName = "products", product_id = null, supplier_id = null) {
        let conditions = [];
        if (product_id !== null) {
            conditions.push(`p.product_id = ${product_id}`);
        }
        if (supplier_id !== null) {
            conditions.push(`p.supplier_id = ${supplier_id}`);
        }
        let whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        return await db.query(`SELECT p.*, iv.quantity_available
                        FROM ${dbName} p
                        LEFT JOIN (
                            SELECT product_id, quantity_available
                            FROM inventory
                            WHERE last_updated = (SELECT MAX(last_updated) FROM inventory i WHERE i.product_id = inventory.product_id)
                        ) iv ON iv.product_id = p.product_id
                        ${whereClause};`)
    }
}


module.exports = { router, Product };