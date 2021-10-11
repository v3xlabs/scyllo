import { ScylloClient } from "../lib";

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
            'localDataCenter': 'datacenter1'
        }
    });
    await DB.client.execute('SELECT * FROM system.local');
});

it('Can switch keyspace', async () => {
    expect(DB.useKeyspace('scyllo'));
});

it('Can fetch every user from the database', async () => {
    expect(await DB.selectOneFrom('users', '*'));
});

it('Can fetch every user from the database with empty criteria object', async () => {
    expect(await DB.selectOneFrom('users', '*', {}));
});

it('Can request users using key', async () => {
    expect(await DB.selectOneFrom('users', '*', { uid: 1234567890 }, 'ALLOW FILTERING'));
});

it('Can request users using non-key and extra values', async () => {
    expect(await DB.selectOneFrom('users', '*', { username: 'lucemans' }, 'ALLOW FILTERING'));
});

afterAll(async () => {
    await DB.client.shutdown();
});