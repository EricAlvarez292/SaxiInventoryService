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
        this.router.put("/:product_id", this.updateProducts.bind(this));
        this.router.delete("/:product_id", this.deleteProduct.bind(this));
        this.router.get("/categories", this.getProductCategories.bind(this));
    }

    async getProducts(req, res) {
        try {
            const { product_id, supplier_id, category, sortBy, sortOrder } = req.query;

            console.log(`getProducts() : ${JSON.stringify(req.query)}`)
            const whereConditions = [];
            whereConditions.push('isDeleted IS NOT TRUE')
            let sortCondition = `Order by name asc`
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
            res.status(500).json({ message: err.message });
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
            res.status(500).json({ message: err.message });
        }
    }


    async getProductCategories(req, res) {
        try {
            const { supplier_id } = req.query;
            const whereConditions = [];
            if (supplier_id) {
                whereConditions.push(`supplier_id = ${supplier_id}`);
            }
            const whereClause = whereConditions.length ? "WHERE " + whereConditions.join(" AND ") : "";
            console.log(`getProductsCategory() where clause : ${whereClause}`)
            const result = await this.pgdb.getDbInstance().any(`SELECT DISTINCT category FROM products ${whereClause} ORDER BY category`);
            const resultList = result.map(item => item.category)
            console.log(`getProductsCategory() : ${JSON.stringify(resultList)}`)
            res.json(resultList);
        } catch (err) {
            console.error("Error getProductsCategory():", err);
            res.status(500).json({ message: err.message });
        }
    }

    async updateProducts(req, res) {
        try {
            const productsInfo = req.body;
            const { product_id } = req.params;
            console.log(`updateProducts() : ${JSON.stringify(req.params)}`)
            console.log(`updateProducts() Request Data : ${JSON.stringify(productsInfo)}`)
            if (!product_id) {
                res.status(400).json({ message: "Missig product_id" });
                return
            }
            const columns = this.pgdb.getColumns(models.update_product);
            const sanitizedData = this.pgdb.sanitizeData(productsInfo, models.update_product)
            const updateQuery = this.pgdb.getDbHelpers().helpers.update(sanitizedData, columns, 'products') + `WHERE product_id='${product_id}'`;
            await this.pgdb.getDbInstance().any(updateQuery);
            console.log(`updateProducts() Response Data : ${JSON.stringify(sanitizedData)}`)
            res.status(201).send(sanitizedData);
        } catch (err) {
            console.error("Error updateProducts():", err);
            res.status(500).json({ message: err.message });
        }
    }

    async deleteProduct(req, res) {
        try {
            const { product_id } = req.params;
            console.log(`deleteProduct() : ${JSON.stringify(req.params)}`)
            if (!product_id) {
                res.status(400).json({ message: "Missig product_id" });
                return
            }
            const columns = this.pgdb.getColumns(models.delete_product);
            const sanitizedData = this.pgdb.sanitizeData({ isdeleted: true }, models.delete_product)
            const updateQuery = this.pgdb.getDbHelpers().helpers.update(sanitizedData, columns, 'products') + ` WHERE product_id='${product_id}'`;
            await this.pgdb.getDbInstance().any(updateQuery);
            console.log(`deleteProduct() Response Data : ${JSON.stringify(sanitizedData)}`)
            res.status(201).send(sanitizedData);
        } catch (err) {
            console.error("Error deleteProduct():", err);
            res.status(500).json({ message: err.message });
        }
    }


    getRouter() {
        return this.router;
    }
}


module.exports = Product;