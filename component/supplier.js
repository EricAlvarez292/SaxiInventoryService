const express = require('express');
const router = express.Router();

const db = require('../db/mysqlDb')

router.get("/", async (req, res) => {
    try {
        const result = await new Supplier().getSuppliers("suppliers", null)
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

router.post("/", async (req, res) => {
    try {
        const suppliers = req.body;
        const values = suppliers.map(supplier => [
            supplier.supplier_id,
            supplier.name,
            supplier.contact_info,
            supplier.address
        ]);
        const result = await new Supplier().addSuppliers("suppliers", "(supplier_id, name, contact_info, address)", values)
        res.status(201).json({ message: "Suppliers added successfully!", insertedRows: result.affectedRows });
    } catch (err) {
        console.error("Error inserting suppliers:", err);
        res.status(500).json({ error: err.message });
    }
});


router.get("/external", async (req, res) => {
    try {
        const result = await new Supplier().getSuppliers("external_suppliers", null)
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
})


router.post("/external", async (req, res) => {
    try {
        const suppliers = req.body;
        const values = suppliers.map(supplier => [
            supplier.name,
            supplier.contact_info,
            supplier.address
        ]);
        const result = await new Supplier().addSuppliers("external_suppliers", "(name, contact_info, address)", values)
        res.status(201).json({ message: "External Suppliers added successfully!", insertedRows: result.affectedRows });
    } catch (err) {
        console.error("Error inserting suppliers:", err);
        res.status(500).json({ error: err.message });
    }
});


class Supplier {

    async addSuppliers(dbName = "suppliers", columns, suppliersInfo) {
        return await db.query(`INSERT INTO ${dbName} ${columns} VALUES ?`, [suppliersInfo]);
    }

    async getSuppliers(dbName = "suppliers", supplier_id = null) {
        if (supplier_id == null) {
            return await db.query(`SELECT * FROM ${dbName}`)
        } else {
            return await db.query(`SELECT * FROM ${dbName} WHERE supplier_id = ?`, [supplier_id])
        }
    }
}

module.exports = { router, Supplier };