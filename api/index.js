require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path');
const cors = require('cors')

const app = express()
const port = process.env.PORT || 5000;

const jwt = require('jsonwebtoken');

/* DB*/
const PgDB = require('../db/pgdb')

/* components */
const User = require('../component/user');
const Supplier = require('../component/supplier');
const Product = require('../component/product');
const Inventory = require('../component/inventory');
const Transaction = require('../component/transaction');

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
app.use(cors())

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

function generateNewToken() {
    const token = jwt.sign({ username: 'saxipapsi' }, process.env.JWT_SECRET, { expiresIn: '3y' });
    console.log('New Token:', token);
    return token;
}


/*Routes*/
app.use('/api/v1/users', verifyToken, new User().getRouter());
app.use('/api/v1/suppliers', verifyToken, new Supplier().getRouter());
app.use('/api/v1/products', verifyToken, new Product().getRouter());
app.use('/api/v1/inventory', verifyToken, new Inventory().getRouter());
app.use('/api/v1/transactions', verifyToken, new Transaction().getRouter());

// DB connection test
app.get('/api/hello', async (req, res) => {
    res.json({ message: 'Hello from your Express API! 🎉' });
});
(function initDB() { new PgDB().testConnection() }());

app.use(express.static(path.join(__dirname, 'public')));
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, '../public/swagger.yaml')); // adjust path as needed
const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss:
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL
}));

// Listen on enviroment port or 5000 for local dev
/* app.listen(port, () => console.log(`Listening on port ${port}`)) */
module.exports = app;