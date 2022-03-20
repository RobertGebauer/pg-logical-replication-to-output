const fs = require("fs")

class Config {
    constructor(/** @type {string} */ configFileLocation) {
        this.config = JSON.parse(fs.readFileSync(configFileLocation))
    }

    getDatabaseConnection() { return this.config["database-connection"] }
    getLogicalReplicationConfig() { return this.config["logical-replication"] }
}

module.exports = Config