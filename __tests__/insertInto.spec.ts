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
            localDataCenter: 'datacenter1',
            keyspace: 'scyllo'
        }
    });
    await DB.awaitConnection();
});

it('Can insert a user into the database', async () => {
    expect(await DB.insertInto('users', {uid: 1234567890, username: 'Jest'}));
});

it('Expects insert an empty user into the database, to throw error', async () => {
    expect.assertions(1);
    try {
        await DB.insertInto('users', {});
    } catch (e) {
        expect(e).toBeTruthy();
    }
});

afterAll(async () => {
    await DB.shutdown();
});