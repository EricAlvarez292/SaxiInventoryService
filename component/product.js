const express = require('express');
const pgdb = require('../db/pgdb');
const models = require('../models/models')

class Product {

    constructor() {
        this.pgdb = new pgdb();
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/", this.getProducts.bind(this));
        this.router.post("/", this.addProducts.bind(this));
    }

    async getProducts(req, res) {
        try {
            const { product_id, supplier_id } = req.query;
            console.log(`getProducts() : ${JSON.stringify(req.query)}`)
            const conditions = [];
            const values = [];
            if (product_id) {
                conditions.push(`product_id = ${product_id}`);
                values.push(product_id);
            }
            if (supplier_id) {
                conditions.push(`supplier_id = ${supplier_id}`);
                values.push(supplier_id);
            }
            const whereClause = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
            console.log(`getProducts() where clause : ${whereClause}`)
            const result = await this.pgdb.getDbInstance().any(`SELECT * FROM products ${whereClause}`);
            console.log(`getProducts() : ${JSON.stringify(result)}`)
            res.json(result);
        } catch (err) {
            console.error("Error getProducts():", err);
            res.status(500).send(err.message);
        }
    }

    async addProducts(req, res) {
        try {
            const productsInfo = req.body;
            console.log(`addProducts() Request Data : ${JSON.stringify(productsInfo)}`)
            const columns = this.pgdb.getColumns(models.product);
            const sanitizedData = productsInfo.map((data) => this.pgdb.sanitizeData(data, models.product))
            const insertQuery = this.pgdb.getDbHelpers().helpers.insert(sanitizedData, columns, 'products');
            await this.pgdb.getDbInstance().any(insertQuery);
            console.log(`addProducts() Response Data : ${JSON.stringify(sanitizedData)}`)
            res.status(201).send(sanitizedData);
        } catch (err) {
            console.error("Error addProducts():", err);
            res.status(500).json({ error: err.message });
        }
    }


    getRouter() {
        return this.router;
    }
}


module.exports = Product;