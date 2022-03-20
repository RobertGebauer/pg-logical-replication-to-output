const Config = require('./lib/Config');
const LogicalReplicationReceiver = require('./lib/LogicalReplicationReceiver');

var argv = require('minimist')(process.argv.slice(2), {
    string: "config-file",
    alias: {
        "config-file": "c"
    }
});

const config = new Config(argv.c)

new LogicalReplicationReceiver(config.getDatabaseConnection(), config.getLogicalReplicationConfig()).logChanges()