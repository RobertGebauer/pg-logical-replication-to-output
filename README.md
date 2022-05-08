# pg-logical-replication-to-output
Connects to a PostgreSQL logical replication slot and prints everything retrieved to standard output. 

There are cases where you need to know what's happening on your database. You may need a database replication as hot-standby or a database copy for fast read-only access at the other end of the world. Furthermore, database audit require to log all changes in your database. For most of there scenarios there are solutions ready and you can find a nice overview in the blog post [Row Change Auditing Options For PostgreSQL](https://www.cybertec-postgresql.com/en/row-change-auditing-options-for-postgresql/).

This application is designed for non-streaming purposes. In very rare cases there is neither a chance to directly connect to your database from a foreign server nor to set-up some streaming replication due to firewall restrictions. In such cases you need to log all changes to a file, transport the file to target system and apply all changes there. Happily, PostgreSQL supports a mechanism of [Logical Decoding](https://www.postgresql.org/docs/current/logicaldecoding-explanation.html). Logical decoding is the process of extracting all persistent changes to database's tables into a format which can be interpreted without detailed knowledge of the database's internal state. A [Logical Decoding Plugin](https://wiki.postgresql.org/wiki/Logical_Decoding_Plugins) transforms database changes to a certain format. ```pg-logical-replication-to-output``` logs these transformed changes to standard output. Then, you can transport it to somewhere and apply changes to target. Once called, this application connects to a replication slot, retrieves all changes and quits after a certain timeout. You can call it again whenever you like to get next changes.

# Installation
    npm i -g pg-logical-replication-to-output

# Usage
A logical replication slot in PostgreSQL has to be created to connect to. Furthermore, the application needs some configuration to be done in separate configuration file. The file path is passed as parameter to the application. 

## Logical Replication Slot
Head over to PostgreSQL and configure a logical replication slot. This works an all version 9.4+:
```
SELECT * FROM pg_create_logical_replication_slot('<Slot Name>', '<Logical Decoding Plugin>');
```
* __Slot Name__ is a name that identifies the replication slot and you need to reference it in application configuration
* __Logical Decoding Plugin__ is the server side plugin for logical decoding. Choose one that is available in your database. A very nice one is [Decoder Raw](https://github.com/michaelpq/pg_plugins/tree/main/decoder_raw) which decodes changes to SQL statement. Whatever the plugin produces - it's what this application pipes to standard output.

Be careful to set a valid REPLICA IDENTITY to retrieve ```update``` and ```delete``` statements. It must be neither ```NOTHING``` nor ```DEFAULT``` without a selectivity index.

## Application Configuration
The configuration file is a JSON with following structure
```
{
    "database-connection": {
        "user": <Database User>,
        "host": <Database Host>,
        "database": <Database Name>,
        "password": <Database Password>,
        "port": <Database Port>
    },
    "logical-replication": {
        "slot": <Logical Replication Slot Name>,
        "timeout": <Timeout>
    }
}
```
The ```database connection``` entry is used to connect to database. As the library [node-postgres](https://node-postgres.com/) is used this entry follows the [Connection Documentation](https://node-postgres.com/features/connecting).

The ```logical replication``` entry controls how this application connects to the replication slot.
* __Logical Replication Slot Name__ is the slot name you'd like to connect to.
* __Timeout__ is a value (in seconds) how long the application waits for new changes. If there are no new incoming changes the application quits after this timeout.

## Start
```
pg-logical-replication-to-output -c <Configuration File Name>
```
Please also have a look at [pg-logical-replication](https://github.com/kibae/pg-logical-replication) which is used under the hood.
