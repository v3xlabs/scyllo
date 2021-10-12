![./scyllo.png](./scyllo.png)

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

```ts
import { ScylloClient } from 'scyllo';

type User = {
    user_id: string;
    username: string;
};

type Order = {
    order_id: string;
};

const DB = new ScylloClient<{ users: User, orders: Order }>({
    client: {
        contactPoints: [
            'localhost:9042'
        ],
        keyspace: 'mykeyspace',
        localDataCenter: 'datacenter1'
    }
});

(async () => {

    const user = await DB.selectFrom('users', ['user_id', 'username'], {user_id: 'A4J2I4XZ'});

})();
```

## Known Restrictions

Limited multi-keyspace support.
