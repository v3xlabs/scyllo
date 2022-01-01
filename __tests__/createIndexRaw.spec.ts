import { createIndexRaw, createLocalIndexRaw } from '../lib';

it('Can create a basic table', async () => {
    expect(
        createIndexRaw<{ buildings: { name: string, city: string } }, 'buildings', 'name' | 'city'>(
            'scyllo',
            'buildings',
            'buildings_city',
            'city'
        )
    ).toEqual({
        args: [],
        query: 'CREATE INDEX IF NOT EXISTS buildings_city ON scyllo.buildings (city)',
    });
});

it('Can create a basic table if not exists', async () => {
    expect(
        createLocalIndexRaw<{ buildings: { name: string, city: string } }, 'buildings', 'name' | 'city'>(
            'scyllo',
            'buildings',
            'buildings_index',
            'name',
            'city'
        )).toEqual({
        args: [],
        query: 'CREATE INDEX IF NOT EXISTS buildings_index ON scyllo.buildings ((name), city)',
    });
});

// it('Can create a basic table', async () => {
//     expect(createTableRaw<{'atable': {a:string}}, 'atable'>('scyllo', 'atable', false, {a: {type: 'bigint'}}, 'a')).toEqual({"args": [], "query": "CREATE TABLE scyllo.atable (a bigint, PRIMARY KEY (a))"});
// });

// it('Can create a basic table if not exists', async () => {
//     expect(createTableRaw<{'atable': {a:string}}, 'atable'>('scyllo', 'atable', true, {a: {type: 'bigint'}}, 'a')).toEqual({"args": [], "query": "CREATE TABLE IF NOT EXISTS scyllo.atable (a bigint, PRIMARY KEY (a))"});
// });
