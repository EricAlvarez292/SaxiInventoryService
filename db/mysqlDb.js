const mysql = require('mysql');

class Database {
    constructor() {
        this.pool = mysql.createPool({
            connectionLimit: 10,
            host: 'localhost',
            user: 'root',
            password: '', // Add password if needed
            database: 'saxi_inventory'
        });
    }

    query(sql, params) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, params, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    }
}

module.exports = new Database();