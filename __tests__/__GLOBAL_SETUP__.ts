import { ScylloClient } from '../lib';
import { ScylloJestTables} from './types';


export default async () => {
    console.log('Preparing Database for Tests');
    
    const DB = new ScylloClient<ScylloJestTables>({
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
    await DB.createTable('collections', true, {
        id: { type: 'text' },
        map_test: { type: 'map', keyType: 'text', valueType: 'text' },
        set_test: { type: 'set', typeDef: 'text' },
        tuple_test: { type: 'tuple', types: ['text', 'bigint'] },
        list_test: {type: 'list', typeDef: 'text'}
    }, 'id');
    await DB.shutdown();
};