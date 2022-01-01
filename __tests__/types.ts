import { types } from 'cassandra-driver';
import Long from 'long';


export type User = {
    username: string,
    uid: number
}

export type CollectionTest = {
    id: string,
    map_test: {
        test: string
    },
    set_test: string[],
    tuple_test: types.Tuple,
    list_test: string[]
};

export type ScylloJestTables = { 'users': User, 'collections': CollectionTest }