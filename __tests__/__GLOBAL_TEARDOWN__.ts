import { ScylloClient } from '../lib';
import { ScylloJestTables } from './types';

type User = {
    username: string,
    uid: number
}

export default async () => {
    console.log('Cleaning Database after Tests');
    
    const DB = new ScylloClient<ScylloJestTables>({
        client: {
            contactPoints: [
                'localhost:9042'
            ],
            localDataCenter: 'datacenter1',
            keyspace: 'system'
        },
        prepare: false
    });
    await DB.awaitConnection();
    await DB.raw('DROP KEYSPACE IF EXISTS scyllojestsuite');
    await DB.shutdown();
};