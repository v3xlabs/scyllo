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

it('Can delete a row from the database', async () => {
    await DB.insertInto('users', {uid: 432894398023546, username: 'Jest2'})
    expect(await DB.deleteFrom('users', '*', {uid: 432894398023546}));
});

it('Can delete a single field from the database', async () => {
    await DB.insertInto('users', {uid: 65098546897342, username: 'Jest3'})
    expect(await DB.deleteFrom('users', ['username'], {uid: 65098546897342}));
});

it('Expects deleting a non existent row to throw error', async () => {
    expect.assertions(1);
    try {
        await DB.deleteFrom('users', '*', {uid: 949575482946512, username: 'ThisUserShouldNotExist'});
    } catch (e) {
        expect(e).toBeTruthy();
    }
});

afterAll(async () => {
    await DB.shutdown();
});