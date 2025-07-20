const express = require('express');
const pgdb = require('../db/pgdb');
const models = require('../models/models')

class User {
    constructor() {
        this.pgdb = new pgdb();
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/", this.getUsers.bind(this));
        this.router.post("/", this.addUsers.bind(this));
    }

    async getUsers(req, res) {
        try {
            const result = await this.pgdb.getDbInstance().any(`SELECT * FROM users`);
            console.log(`getUsers() : ${JSON.stringify(result)}`)
            res.json(result);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async addUsers(req, res) {
        try {
            const usersInfo = req.body;
            console.log(`addUsers() Request Data : ${JSON.stringify(usersInfo)}`)
            const columns = this.pgdb.getColumns(models.user);
            const sanitizedData = usersInfo.map((data) => this.pgdb.sanitizeData(data, models.user))
            const insertQuery = this.pgdb.getDbHelpers().helpers.insert(sanitizedData, columns, 'users');
            await this.pgdb.getDbInstance().any(insertQuery);
            console.log(`addUsers() Response Data : ${JSON.stringify(sanitizedData)}`)
            res.status(201).send(sanitizedData);
        } catch (err) {
            console.error("Error addUsers:", err);
            res.status(500).json({ message: err.message });
        }
    }

    getRouter() {
        return this.router;
    }
}

module.exports = User;
