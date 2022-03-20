const LogicalReplication = require('pg-logical-replication');

class LogicalReplicationReceiver {

    constructor(/** @type {object} **/ databaseConnection, /** @type {object} **/ logicalReplicationConfig) {
        this.databaseConnection = databaseConnection
        this.logicalReplicationConfig = logicalReplicationConfig

        // set minimum timeout to 2000 and adjust standby message timeout of underlying replication receiver
        this.logicalReplicationConfig.timeout = this.logicalReplicationConfig.timeout < 3 ? 3 : this.logicalReplicationConfig.timeout
        this.standbyMessageTimeout = this.logicalReplicationConfig.timeout - 2
    }

    logChanges() {
        const setWALStopTimeout = () => setTimeout(() => stream.stop(), this.logicalReplicationConfig.timeout * 1000)
        var timeout = setWALStopTimeout()

        var stream = (new LogicalReplication(this.databaseConnection))
            .on('data', (msg) => {
                clearTimeout(timeout)
                console.log((msg.log || '').toString('utf8')) 
                timeout = setWALStopTimeout()
                return true
            })
            .on('error', (err) => console.error('Error on getting data.', err))

        stream.getChanges(this.logicalReplicationConfig.slot, null, { standbyMessageTimeout: this.standbyMessageTimeout }, (err) => console.error('Logical replication initialize error', err));
    }
}

module.exports = LogicalReplicationReceiver