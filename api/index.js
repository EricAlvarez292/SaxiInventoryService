const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 5000;

/* DB*/
const database = require('../db/mysqlDb')

/* components */
const user = require('../component/user');
const supplier = require('../component/supplier');
const product = require('../component/product');
const inventory = require('../component/inventory');
const transaction = require('../component/transaction');
const purchases = require('../component/purchase');
const sales = require('../component/sales');

// Parsing middleware
// Parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false })); // Remove 
app.use(express.urlencoded({ extended: true })); // New
// Parse application/json
// app.use(bodyParser.json()); // Remove
app.use(express.json()); // New

// MySQL Code goes here
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

/*Routes*/
app.use('/api/v1/users', user.router);
app.use('/api/v1/suppliers', supplier.router);
app.use('/api/v1/products', product.router);
app.use('/api/v1/inventory', inventory.router);
app.use('/api/v1/transactions', transaction.router);
app.use('/api/v1/purchases', purchases.router);
app.use('/api/v1/sales', sales.router);

// DB connection test
app.get('/api/hello', async (req, res) => {
    res.json({ message: 'Hello from your Express API! 🎉' });
});

// Listen on enviroment port or 5000 for local dev
/* app.listen(port, () => console.log(`Listening on port ${port}`)) */
module.exports = app;