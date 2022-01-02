import Long from "long";
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
it('Can execute batch', async () => {
    expect(
        await DB.batch()
            .insertInto('users', { username: 'Antony', uid: 123456000 })
            .insertInto('users', { username: 'Luc', uid: 123456001 })
            .update('users', { username: "Lucemans" }, { uid: 123456001 })
            .execute()
    )
});

afterAll(async () => {
    await DB.shutdown();
});