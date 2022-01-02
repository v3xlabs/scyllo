import { ScylloClient } from "../../lib";

type User = {
    username: string,
    uid: number
}

let DB: ScylloClient<{ 'users': User }>;

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

it('Can switch keyspace', async () => {
    expect(DB.useKeyspace('scyllojestsuite'));
});

it('Can fetch every user from the database', async () => {
    expect(await DB.selectFrom('users', '*')).toBeInstanceOf(Array);
});

it('Can fetch every user from the database with empty criteria object', async () => {
    expect(await DB.selectFrom('users', '*', {})).toBeInstanceOf(Array);
});

it('Can request users using key', async () => {
    expect(await DB.selectFrom('users', '*', { uid: 1234567890 }, 'ALLOW FILTERING'));
});

it('Can request users using non-key and extra values', async () => {
    // DB.createTable('users', {uid: {type: 'ascii'}, username: {type: 'bigint'}});
    expect(await DB.selectFrom('users', '*', { username: 'lucemans' }, 'ALLOW FILTERING'));
});

afterAll(async () => {
    await DB.shutdown();
});