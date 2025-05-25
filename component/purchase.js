const express = require('express');
const router = express.Router();

const db = require('../db/mysqlDb')

router.get("/", async (req, res) => {
    try {
        const result = await new Purchase().getPurchases();
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

class Purchase {

    async getPurchases() {
        return await db.query('SELECT * FROM purchases')
    }

    async addPurchase(purchaseInfo) {
        const purchasesSql = "INSERT INTO purchases SET ?";
        return await db.query(purchasesSql, purchaseInfo);
    }
}


module.exports = { router, Purchase } 