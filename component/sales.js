const express = require('express');
const router = express.Router();

const db = require('../db/mysqlDb')

router.get("/", async (req, res) => {
    try {
        const result = await new Sales().getSales()
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

class Sales {
    async getSales() {
        return await db.query('SELECT * FROM sales');
    }

    async addSales(salesInfo) {
        const salesSql = "INSERT INTO sales SET ?";
        return await db.query(salesSql, salesInfo);
    }
}


module.exports = { router, Sales } 