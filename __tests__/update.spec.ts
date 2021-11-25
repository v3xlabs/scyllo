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
        },
        debug: true
    });
    await DB.awaitConnection();
});
it('Can update a specific user in the database', async () => {
    expect(await DB.update('users', { username: "Jest" }, { uid: 1234567890 }));
});

afterAll(async () => {
    await DB.shutdown();
});