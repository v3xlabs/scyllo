import { selectOneFromRaw } from '../../lib';

// fix
it('Can insert a user into the database', async () => {
    expect(selectOneFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1, username: 'svemat'})).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=? LIMIT 1', args: [1, 'svemat']});
});


it('Can add extra args to query', async () => {
    expect(selectOneFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1, username: 'svemat'}, 'ALLOW FILTERING')).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=? LIMIT 1 ALLOW FILTERING', args: [1, 'svemat']});
});