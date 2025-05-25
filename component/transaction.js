const express = require('express');
const router = express.Router();

const db = require('../db/mysqlDb')

const { Purchase } = require('../component/purchase')
const { Product } = require('../component/product')
const { Inventory } = require('../component/inventory');
const { Sales } = require('../component/sales');
const { Supplier } = require('../component/supplier');

router.get("/", async (req, res) => {
    try {
        const result = await new Transaction().getTransactions()
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
})


router.post("/", async (req, res) => {
    try {
        const transactionsSqlResult = await new Transaction().addTransaction(req.body)
        res.status(201).json({ message: "Transactions added successfully!", transaction_id: transactionsSqlResult.insertId });
    } catch (err) {
        console.error("Error inserting transactions:", err);
        res.status(500).json({ error: err.message });
    }
});


class Transaction {

    async getTransactions() {
        return await db.query('SELECT * FROM transactions');
    }

    async addTransaction(transactionBody) {
        const existingProduct = await new Product().getProduct("products", transactionBody.product.product_id)
        if (existingProduct.length == 0 && transactionBody.transaction_type == "purchase") {
            const existingSupplier = await new Supplier().getSuppliers("suppliers", transactionBody.product.supplier_id)
            if (existingSupplier.length == 0) {
                const eternalSupplier = await new Supplier().getSuppliers("external_suppliers", transactionBody.product.supplier_id)
                const values = eternalSupplier.map(supplier => [
                    supplier.supplier_id,
                    supplier.name,
                    supplier.contact_info,
                    supplier.address
                ]);
                console.log(`Inserting new supplier: ${values}`)
                await new Supplier().addSuppliers("suppliers", "(supplier_id, name, contact_info, address)", values)
            }
            console.log(`Inserting new product: ${transactionBody.product}`)
            await new Product().addProduct(transactionBody.product)
        }
        const transactionDetails = transactionBody.transaction_details
        const transactionInfo = {
            product_id: transactionBody.product.product_id,
            transaction_type: transactionBody.transaction_type,
            quantity_changed: transactionDetails.quantity,
            user_id: transactionBody.user_id
        }
        const transactionsSql = "INSERT INTO transactions SET ?";
        const transactionsSqlResult = await db.query(transactionsSql, transactionInfo);

        let previousQuantity = 0
        let latestQuantity = 0
        const latestInventory = await new Inventory().getInventory(transactionBody.product.product_id)
        if (latestInventory.length != 0) {
            previousQuantity = latestInventory[0].quantity_available
        }

        if (transactionBody.transaction_type == "purchase") {
            latestQuantity = (previousQuantity + transactionDetails.quantity)
            const purchaseInfo = {
                transaction_id: transactionsSqlResult.insertId,
                supplier_id: transactionBody.product.supplier_id,
                payment_method: transactionDetails.payment_method,
                quantity: transactionDetails.quantity,
                price_per_unit: transactionBody.product.price,
                total_amount: transactionDetails.total_amount,
                expected_delivery_date: transactionDetails.expected_delivery_date
            }
            await new Purchase().addPurchase(purchaseInfo)
        } else {
            latestQuantity = (previousQuantity - transactionDetails.quantity)
            const salesInfo = {
                transaction_id: transactionsSqlResult.insertId,
                payment_method: transactionDetails.payment_method,
                quantity: transactionDetails.quantity,
                price_per_unit: transactionBody.product.price,
                total_amount: transactionDetails.total_amount,
                customer_id: transactionDetails.customer_id,
                customer_name: transactionDetails.customer_name,
            }
            await new Sales().addSales(salesInfo)
        }
        const inventoryInfo = {
            product_id: transactionBody.product.product_id,
            quantity_available: latestQuantity,
            reorder_level: 20
        }
        await new Inventory().addInventory(inventoryInfo)
        return transactionsSqlResult
    }

}


module.exports = { router, Transaction };