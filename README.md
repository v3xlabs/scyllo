![./scyllo.png](./scyllo.png)

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)
  - [Quickstart](#quickstart)
- [Documentation](#documentation)
  - [selectFrom](#selectfrom)
  - [selectOneFrom](#selectonefrom)
  - [insertInto](#insertinto)
  - [deleteFrom](#deletefrom)
  - [update](#update)
  - [createTable](#createtable)
  - [dropTable](#droptable)
  - [truncateTable](#truncatetable)
  - [createIndex](#createindex)
  - [createLocalIndex](#createlocalindex)
  - [useKeyspace](#usekeyspace)
  - [createKeyspace](#createkeyspace)
  - [dropKeyspace](#dropkeyspace)
  - [awaitConnection](#awaitconnection)
  - [shutdown](#shutdown)
  - [raw / rawWithParams](#raw--rawwithparams)
  - [query](#query)
- [What to use for ID's](#what-to-use-for-ids)
- [Debug Mode & Logging](#debug-mode--logging)
- [Type Conversion](#type-conversion)
- [Known Restrictions](#known-restrictions)
- [Contributors](#contributors)
- [LICENSE](#license)

## Installation

Using `npm`:

```sh
npm install scyllo
```

or if you prefer to use the `yarn` package manager:

```sh
yarn add scyllo
```

## Usage

To start our journey we must first instantiate an instance of our client.

At the heart of Scyllo are the types we create for our tables, to find the appropriate type for a column, check [Type Conversion](#type-conversion).

Scyllo by default allows you to specify your own `type`/`interface`/`class` without having to bloat your code with any extra information.

```ts
type User = {
  user_id: string;
  username: string;
  email: string;
};

type Order = {
  order_id: string;
};
```

In the below example we instantiate two types, `User` and `Order`, we then communicate to Scyllo that we would like to have a table called `users` and store the `User` object in there, and a table called `orders` which stores the `Order` object. The result will look as follows

```ts
{ users: User, orders: Order }
```

Now we can create the client as follows

```ts
const DB = new ScylloClient<{ users: User; orders: Order }>({
  client: {
    contactPoints: ["localhost:9042"], // Where to access the database
    keyspace: "mykeyspace", // Default keyspace
    localDataCenter: "datacenter1", 
  },
});
```

And voila! All Done! You are ready to Rock and Roll!

### Quickstart

All of the above combined results in this final result:

```ts
import { ScylloClient } from "scyllo";

type User = {
  user_id: string;
  username: string;
  email: string;
};

type Order = {
  order_id: string;
};

const DB = new ScylloClient<{ users: User; orders: Order }>({
  client: {
    contactPoints: ["localhost:9042"], // Where to access the database
    keyspace: "mykeyspace", // Default keyspace
    localDataCenter: "datacenter1", 
  },
});
```

## Documentation

### selectFrom

Selecting from a database table is as easy as it should be. Simply call the `selectFrom` function on the client instance like so:

```ts
const users = await DB.selectFrom("users", "*");
```

In the event you only want a specific column/field of your object.

```ts
const usernames = await DB.selectFrom("users", ["username"]);
```

In the event you want to apply specific restrictions to what entries should be returned.

```ts
const users = await DB.selectFrom("users", ["username"], { user_id: "12345" });
```

Adding extra values to this query should be as simple as

```ts
const users = await DB.selectFrom("users", ["username"], { user_id: "12345" }, "ALLOW FILTERING");
```

### selectOneFrom

Selecting a single entry from a table is as easy as it should be. Simply call the `selectOneFrom` function on the client instance like so:

```ts
const user = await DB.selectOneFrom("users", "*");
```

In the event you only want a specific column/field of your object.

```ts
const username = await DB.selectOneFrom("users", ["username"]);
```

In the event you want to apply specific restrictions to what entries should be returned.

```ts
const user = await DB.selectOneFrom("users", ["username"], { user_id: "12345" });
```

Adding extra values to this query should be as simple as

```ts
const user = await DB.selectOneFrom("users", ["username"], { user_id: "12345" }, "ALLOW FILTERING");
```

The difference is that the `selectOneFrom` function will return a single object or undefined instead of an array of objects.

### insertInto

Inserting an object into the database is also a breeze. Simply call the `insertInto` function on the client instance like so:

```ts
await DB.insertInto('users', {user_id: "12345", username: "lucemans"});
```

or simply directly with your user object like so:

```ts
const userObject: User = {user_id: "12345", username: "lucemans"};
await DB.insertInto('users', userObject);
```

Adding extra values to this query should be as simple as

```ts
await DB.insertInto('users', {user_id: "12345", username: "lucemans"}, "ALLOW FILTERING");
```

### deleteFrom

Deleting fromt he database can be done in a multitude of ways. In the event of deleting the entire row from the table, you can do it like so:

```ts
await DB.deleteFrom('users', '*', {user_id: "12345"});
```

The above code will delete the user with the `user_id` of `12345`.

In the event you want to simply delete/clear one of the cells in a specific row you can do that like so:

```ts
await DB.deleteFrom('users', ['username'], {user_id: "12345"});
```

Adding extra values to this query should be as simple as

```ts
await DB.deleteFrom('users', ['username'], {user_id: "12345"}, "ALLOW FILTERING");
```

### update

Update allows you to edit only some parts of a row. This is done by passing an object with the values you want to update and the criteria to find the row you want to update.

```ts
await DB.update('users', {username: "lucemans"}, {user_id: "12345"})
```

Adding extra values to this query should be as simple as

```ts
await DB.update('users', {username: "lucemans"}, {user_id: "12345"}, "ALLOW FILTERING");
```

### createTable

Creating a table is easily done with the `createTable` function.

```ts
await DB.createTable('users', 
    true, // Wether we should create the table if it does not exist yet. Will throw an error if the table already exists.
    {
        user_id: { type: "text" },
        username: { type: "text" },
    },
    'user_id' // The primary key for the table.
);
```

The primary key can also be a composite key if you want a combination of multiple keys to be the primary key.

```ts
await DB.createTable('users', 
    true,
    {
        user_id: { type: "text" },
        username: { type: "text" },
    },
    ['user_id', 'username'] // The composite key for the table.
);
```

Additionally a clustering-key can also be provided as follows

```ts
await DB.createTable('users', 
    true,
    {
        user_id: { type: "text" },
        username: { type: "text" },
    },
    'user_id', // The primary key for the table.
    'username' // The clustering key for the table.
);
```

### dropTable

Dropping a table is a very simple process.

```ts
await DB.dropTable('users');
```

### truncateTable

Truncating a table is a very simple process as well.

```ts
await DB.truncateTable('users');
```

### createIndex

Sometimes you will want to index a table by different fields. So that you can search your user table by both `user_id` and `email` for example.
In scylla we use [Secondary Indexes](https://docs.scylladb.com/using-scylla/secondary-indexes/) for this. You can create them like so:

```ts
await DB.createIndex('users', 'users_by_email', 'email');
```

Once the key is created we are able to query the same users table as follows

```ts
await DB.selectOneFrom('users', '*', { email: 'noreply@lucemans.nl' });
```

### createLocalIndex

In contrary to [createIndex](#createIndex), `createLocalIndex` allows you to create a narrower search ability, thus letting you optimize your database performance even more. Usng localIndex you can search your user table by both `user_id` and `user_id and email` for example.
To read more on localIndexes, have a look at [Local Secondary Indexes](https://docs.scylladb.com/using-scylla/local-secondary-indexes/) for this. Regardless You can create them like so:

```ts
await DB.createLocalIndex('users', 'users_by_email', 'email');
```

Once the key is created we are able to query the same users table as follows

```ts
await DB.selectOneFrom('users', '*', { user_id: 'lucemans', email: 'noreply@lucemans.nl' });
```

Do keep in mind that usage of local indexes do require you to know the primary key during query-time. If you are looking to search only on the secondary key, try [createIndex](#createIndex).

### useKeyspace

If you want to use another keyspace than the one specified in the client options, you can use the `useKeyspace` function.

```ts
await DB.useKeyspace('myotherkeyspace');
```

This will error out if the keyspace doesn't exist. To get around this, you could pass in a boolean as the second argument.to create the keyspace if it doesn't exist.

```ts
await DB.useKeyspace('myotherkeyspace', true);
```

### createKeyspace

Using `createKeyspace` you can create a keyspace. This function is useful in situations when we want to be more specific about our keyspace settings.

A simple keyspace:

```ts
await DB.createKeyspace('mykeyspace');
```

A keyspace with replicationClass and replicationFactor

```ts
await DB.useKeyspace('myotherkeyspace', 'SimpleStrategy', 1);
```

### dropKeyspace

Dropping a keyspace is a very simple process.

```ts
await DB.dropKeyspace('mykeyspace');
```

By default, it will only drop the keyspace if it exists. If you want to try to drop the keyspace without `IF EXISTS`, then you can pass in a boolean as the second argument. Note that this will throw an error if the keyspace doesn't exist.

```ts
await DB.dropKeyspace('mykeyspace', false);
```

### awaitConnection

In some cases you will want to trigger database requests in order to run queries right after. Or maybe you just want to be 100% sure we can connect to the database.

We can use `awaitConnection` for this!

```ts
await DB.awaitConnection();
```

The above code snippet will simply wait for the database to have fully booted up and connected and then allow further code to execute.

### shutdown

The shutdown function is simple and straight forward. It shuts down the client. Although it might not always be necessary it is probably a good idea to shutdown the connection when you exit your process.

```ts
await DB.shutdown();
```

### raw / rawWithParams

In the event you would like to execute a CQL query that Scyllo does not support yet, thats totally okay too! Use the `.raw` function in order to do so

```ts
await DB.raw('GRANT SELECT ON ALL KEYSPACES TO lucemans');
```

If the query you are trying to execute requires injecting javascript-objects then you could do the following

```ts
await DB.rawWithParams(
  'INSERT INTO users (user_id, username, email) VALUES (?, ?, ?)',
  [Long.fromString('987654321'), 'lucemans', 'noreply@lucemans.nl']
);
```

The above with attempt to safely convert the javascript objects into Cassandra friendly data in order to keep everything working.

### query

The query function is similar to the `rawWithParams` function as mentioned above and allows for an object-way of inserting values.

```ts
await DB.query({
  query: 'INSERT INTO users (user_id, username, email) VALUES (?, ?, ?)',
  args: [Long.fromString('987654321'), 'lucemans', 'noreply@lucemans.nl']
});
```

## What to use for ID's

However nice Cassandra/Scylla and hereby also Scyllo may be, ID generation is not something native to the database. This is done by design, see [Lightweight Transactions](https://www.datastax.com/blog/lightweight-transactions-cassandra-20).
When looking at companies that utalise CQL at scale, we notice the common trend of [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID), a Twitter created system for generating IDs at scale.

Obviously [@lvkdotsh](https://github.com/lvkdotsh) has a library for this, and we highly recommend you checkout [Sunflake](https://github.com/lvkdotsh/sunflake), a zero-depedency lightweight typescript-safe Snowflake ID generator.

## Debug Mode & Logging

In the event you encounter situations where you would like to view the underlying queries, scyllo allows you to set `debug`-mode.

Simply during creation of the client, specify `debug` as `true.

```ts
const DB = new ScylloClient<{ users: User; orders: Order }>({
  client: {
    contactPoints: ["localhost:9042"],
    keyspace: "mykeyspace",
    localDataCenter: "datacenter1",
  },
  debug: true // <-- Enable Debug Mode
});
```

Debug Mode by default will log all performed queries to the console. If you would rather have these queries piped to some other method ([@lvksh/logger](https://github.com/lvkdotsh/logger) in our example) then you can do that with the following.

```ts
import { ScylloClient } from 'scyllo';
import { createLogger } from '@lvksh/logger';

// Initialize the logger
const logger = createLogger({
  database: 'DB',
  info: 'INFO',
  success: 'OK'
});

// Initialize the database
const DB = new ScylloClient<{ users: User; orders: Order }>({
  client: {
    contactPoints: ["localhost:9042"],
    keyspace: "mykeyspace",
    localDataCenter: "datacenter1",
  },
  debug: true,
  log: logger.database // <-- use the logger.database function
});
```

## Type Conversion

In order to keep track of the corresponding Javascript type for a CQL data type, we can use the link bellow.
[https://docs.datastax.com/en/developer/nodejs-driver/4.6/features/datatypes/](https://docs.datastax.com/en/developer/nodejs-driver/4.6/features/datatypes/)

When `prepare = true` *(default behaviour)* in the Scyllo config, it understand that a javascript types should be converted to the corresponding cassandra type. When `prepare = false` it may cause issues with more advanced types as it will not convert them, it thus recommended to leave this option as `true`.

Note that Tuples have to be create in a specific way, which you can read about [here](https://docs.datastax.com/en/developer/nodejs-driver/4.6/features/datatypes/tuples/).

## Known Restrictions

Limited multi-keyspace support. This is something that is on our roadmap and hopefully some day in the future we will be able to handle this.
As of right now scyllo is unable to provide you with a smooth multi-keyspace experience, but this is in the works.

Query-ing restrictions are currently limited to only allow direct equality checks, for ex. `user_id = 5` etc. We hope to be able to support `user_id > 5` and `user_id >= 5` in the near future as well. If this is something you are interested in, please let us know.

## Contributors

[![](https://contrib.rocks/image?repo=lvkdotsh/scyllo)](https://github.com/lvkdotsh/scyllo/graphs/contributors)

## LICENSE

This package is licensed under the [GNU Lesser General Public License](https://www.gnu.org/licenses/lgpl-3.0).
