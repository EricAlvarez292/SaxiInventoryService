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
        this.router.get("/categories", this.getProductCategories.bind(this));
    }

    async getProducts(req, res) {
        try {
            const { product_id, supplier_id, category, sortBy, sortOrder } = req.query;

            console.log(`getProducts() : ${JSON.stringify(req.query)}`)
            const whereConditions = [];
            let sortCondition = ""
            if (product_id) {
                whereConditions.push(`product_id = ${product_id}`);
            }
            if (supplier_id) {
                whereConditions.push(`supplier_id = ${supplier_id}`);
            }
            if (category) {
                whereConditions.push(`category = '${category}'`);
            }
            if (sortBy) {
                let defaultSort = "asc";
                if (sortOrder) defaultSort = sortOrder
                sortCondition = `Order by ${sortBy} ${defaultSort}`
            }
            const whereClause = whereConditions.length ? "WHERE " + whereConditions.join(" AND ") : "";
            console.log(`getProducts() where clause : ${whereClause}`)
            console.log(`getProducts() sort : ${sortCondition}`)
            const result = await this.pgdb.getDbInstance().any(`SELECT * FROM products ${whereClause} ${sortCondition}`);
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


    async getProductCategories(req, res) {
        try {
            const { product_id } = req.query;
            const whereConditions = [];
            if (product_id) {
                whereConditions.push(`product_id = ${product_id}`);
            }
            const whereClause = whereConditions.length ? "WHERE " + whereConditions.join(" AND ") : "";
            console.log(`getProductsCategory() where clause : ${whereClause}`)
            const result = await this.pgdb.getDbInstance().any(`SELECT DISTINCT category FROM products ${whereClause} ORDER BY category`);
            const resultList = result.map(item => item.category)
            console.log(`getProductsCategory() : ${JSON.stringify(resultList)}`)
            res.json(resultList);
        } catch (err) {
            console.error("Error getProductsCategory():", err);
            res.status(500).json({ error: err.message });
        }
    }


    getRouter() {
        return this.router;
    }
}


module.exports = Product;