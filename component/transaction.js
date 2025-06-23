const express = require('express');
const pgdb = require('../db/pgdb');
const models = require('../models/models')

class Transaction {

    constructor() {
        this.pgdb = new pgdb();
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/", this.getTransactions.bind(this));
        this.router.post("/", this.addTransaction.bind(this));
    }

    async getTransactions(req, res) {
        try {
            const result = await this.pgdb.getDbInstance().any(`SELECT * FROM transactions`);
            console.log(`getTransactions() : ${JSON.stringify(result)}`)
            res.json(result);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async addTransaction(req, res) {
        try {
            console.log(`addTransaction() : ${JSON.stringify(req.body)}`)
            const transactionInfo = req.body;
            const transactionItemsInfo = transactionInfo.items;

            const transactionColumns = this.pgdb.getColumns(models.transaction);
            const transactionSanitizedData = this.pgdb.sanitizeData(transactionInfo, models.transaction)
            const transactionInsertQuery = this.pgdb.getDbHelpers().helpers.insert(transactionSanitizedData, transactionColumns, 'transactions') + 'RETURNING transaction_id';
            const transactionInsertResult = await this.pgdb.getDbInstance().one(transactionInsertQuery);
            console.log(`addTransaction() Transaction: ${transactionInsertQuery}`)

            const transactionItemColumns = this.pgdb.getColumns(models.transaction_item);
            const transactionItemSanitizedData = transactionItemsInfo.map((data) => {
                const sanitized = this.pgdb.sanitizeData(data, models.transaction_item);
                sanitized.transaction_id = transactionInsertResult.transaction_id;
                return sanitized;
            })
            const transactionItemInsertQuery = this.pgdb.getDbHelpers().helpers.insert(transactionItemSanitizedData, transactionItemColumns, 'transaction_items');
            await this.pgdb.getDbInstance().any(transactionItemInsertQuery);
            console.log(`addTransaction() Transaction Items: ${transactionItemInsertQuery}`)

            const updateInventory = []
            const insertInventory = []
            for (const item of transactionItemSanitizedData) {
                let previousQuantity = 0
                let latestQuantity = 0
                const result = await this.pgdb.getDbInstance().any(`SELECT * FROM inventory WHERE product_id = ${item.product_id}`);
                const inventorySanitizedData = this.pgdb.sanitizeData(item, models.inventory)
                if (result.length != 0) {
                    const inventory = result[0]
                    previousQuantity = inventory.quantity_in_stock;
                }
                if (transactionInfo.transaction_type == 'PURCHASE') {
                    latestQuantity = previousQuantity + item.quantity;
                } else {
                    latestQuantity = previousQuantity - item.quantity;
                }
                inventorySanitizedData.quantity_in_stock = latestQuantity
                item.quantity = latestQuantity
                if (result.length != 0) {
                    updateInventory.push(inventorySanitizedData)
                } else {
                    insertInventory.push(inventorySanitizedData)
                }
            }
            if (updateInventory.length != 0) {
                const inventoryColumnsUpdate = this.pgdb.getColumnsUpdate(models.inventory, 'product_id');
                const inventoryUpdateQuery = this.pgdb.getDbHelpers().helpers.update(updateInventory, inventoryColumnsUpdate, 'inventory') + ' WHERE v.product_id = t.product_id';
                await this.pgdb.getDbInstance().any(inventoryUpdateQuery);
                console.log(`addTransaction() Update Inventory(): ${JSON.stringify(inventoryUpdateQuery)}`)
            }
            if (insertInventory.length != 0) {
                const inventoryColumns = this.pgdb.getColumns(models.inventory);
                const inventorySanitizedData = insertInventory.map((data) => this.pgdb.sanitizeData(data, models.inventory))
                const inventoryInsertQuery = this.pgdb.getDbHelpers().helpers.insert(inventorySanitizedData, inventoryColumns, 'inventory');
                await this.pgdb.getDbInstance().any(inventoryInsertQuery);
                console.log(`addTransaction() Insert Inventory(): ${JSON.stringify(inventoryInsertQuery)}`)
            }
            transactionSanitizedData.items = transactionItemSanitizedData
            res.status(201).send(transactionSanitizedData);
        } catch (err) {
            console.error("Error addTransaction:", err);
            res.status(500).send(err.message);
        }
    }

    getRouter() {
        return this.router;
    }

}


module.exports = Transaction;