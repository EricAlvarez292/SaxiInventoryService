require('dotenv').config();
const initOptions = { schema: ['public'] };
const pgp = require('pg-promise')(initOptions);
const db = pgp({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // required by Neon
});

const _ = require('lodash');

class PgDB {
    constructor() { }
    getDbHelpers() { return pgp }
    getDbInstance() { return db }

    getColumns(schema) {
        var tableKeys = Object.keys(schema).toString();
        return tableKeys.split(",").map(function (val) {
            return val;
        });
    };

    getColumnsUpdate(schema, id, timestamps = []) {
        const tableKeys = Object.keys(schema).toString();
        return tableKeys.split(",").map(function (val) {
            // return (id === val) ? `?${val}` : val;
            if (id === val) {
                return `?${val}`
            } else if (timestamps.includes(val)) {
                return { name: val, cast: 'timestamptz' }
            } else return val
        });
    };

    sanitizeData(data, dataSchema) {
        this.data = data || {};
        let superSanitizeData = _.pick(_.defaults(data, dataSchema), _.keys(dataSchema));
        return _.pickBy(superSanitizeData, function (value, key) {
            return !(value === undefined || value === null);
        });
    };

    testConnection() {
        db.func('version').then((result) => console.log('DB connection end result : ' + JSON.stringify(result))).catch((error) => console.log('ERROR:', error.message || error))
    }
}
module.exports = PgDB