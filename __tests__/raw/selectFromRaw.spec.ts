import { selectFromRaw } from '../../lib';

// fix
it('Can insert a user into the database', async () => {
    expect(selectFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1, username: 'svemat'})).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=?', args: [1, 'svemat']});
});


it('Can add extra args to query', async () => {
    expect(selectFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1, username: 'svemat'}, 'ALLOW FILTERING')).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=? ALLOW FILTERING', args: [1, 'svemat']});
});