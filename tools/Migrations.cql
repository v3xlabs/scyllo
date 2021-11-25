CREATE KEYSPACE IF NOT EXISTS  scyllo WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 3};
USE scyllo;

CREATE TABLE IF NOT EXISTS scyllo.users (
    uid bigint,
    username text,
    PRIMARY KEY (uid)
)