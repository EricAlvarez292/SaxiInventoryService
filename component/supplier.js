const express = require('express');
const pgdb = require('../db/pgdb');
const models = require('../models/models')

class Supplier {

    constructor() {
        this.pgdb = new pgdb();
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/:supplier_id", this.getSuppliers.bind(this));
        this.router.get("/", this.getSuppliers.bind(this));
        this.router.post("/", this.addSuppliers.bind(this));
    }

    async getSuppliers(req, res) {
        try {
            const { supplier_id } = req.params;
            console.log(`getSuppliers() : ${JSON.stringify(req.params)}`)
            const conditions = [];
            const values = [];
            if (supplier_id) {
                conditions.push(`supplier_id = ${supplier_id}`);
                values.push(supplier_id);
            }
            const whereClause = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
            console.log(`getSuppliers() where clause : ${whereClause}`)
            const result = await this.pgdb.getDbInstance().any(`SELECT * FROM suppliers ${whereClause}`);
            console.log(`getSuppliers() : ${JSON.stringify(result)}`)
            res.json(result);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async addSuppliers(req, res) {
        try {
            const suppliersInfo = req.body;
            console.log(`addSuppliers() Request Data : ${JSON.stringify(suppliersInfo)}`)
            const columns = this.pgdb.getColumns(models.supplier);
            const sanitizedData = suppliersInfo.map((data) => this.pgdb.sanitizeData(data, models.supplier))
            const insertQuery = this.pgdb.getDbHelpers().helpers.insert(sanitizedData, columns, 'suppliers');
            await this.pgdb.getDbInstance().any(insertQuery);
            console.log(`addSuppliers() Response Data : ${JSON.stringify(sanitizedData)}`)
            res.status(201).send(sanitizedData);
        } catch (err) {
            console.error("Error addSuppliers():", err);
            res.status(500).json({ error: err.message });
        }
    }

    getRouter() {
        return this.router;
    }
}

module.exports = Supplier;