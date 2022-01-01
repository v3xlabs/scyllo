import { createIndexRaw, createLocalIndexRaw } from '../../lib';

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
