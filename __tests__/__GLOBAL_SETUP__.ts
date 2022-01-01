import { ScylloClient } from '../lib';

type User = {
    username: string,
    uid: number
}

export default async () => {
    console.log('Preparing Database for Tests');
    
    const DB = new ScylloClient<{ 'users': User }>({
        client: {
            contactPoints: [
                'localhost:9042'
            ],
            localDataCenter: 'datacenter1',
            keyspace: 'system'
        }
    });
    await DB.awaitConnection();
    await DB.useKeyspace('scyllojestsuite', true);
    await DB.createTable('users', true, {
        username: { type: 'text' },
        uid: { type: 'bigint' },
    }, 'uid');
    await DB.shutdown();
};