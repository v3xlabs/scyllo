import { ScylloClient } from "../../lib";
import { ScylloJestTables } from '../types';
import { types } from "cassandra-driver";
import Long from 'long';

let DB: ScylloClient<ScylloJestTables>;

beforeAll(async () => {
    DB = new ScylloClient({
        client: {
            contactPoints: [
                'localhost:9042'
            ],
            localDataCenter: 'datacenter1',
            keyspace: 'scyllojestsuite'
        }
    });
    await DB.awaitConnection();
});

it('Can insert a user into the database', async () => {
    expect(await DB.insertInto('collections', {
            id: '1234567899',
            map_test: { test: 'test' },
            set_test: ['test', 'test2'],
            tuple_test: new types.Tuple('test', Long.fromString('987654321')),
            list_test: ['hello', 'world']
        }));
});

afterAll(async () => {
    await DB.shutdown();
});