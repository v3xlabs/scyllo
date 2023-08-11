import { selectFromRaw, eqGreaterThanOrEqual, eqIn, eqContains } from '../../lib';

// fix
it('Can insert a user into the database', async () => {
    expect(selectFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1, username: 'svemat'})).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=?', args: [1, 'svemat']});
});


it('Can add extra args to query', async () => {
    expect(selectFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1, username: 'svemat'}, 'ALLOW FILTERING')).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=? ALLOW FILTERING', args: [1, 'svemat']});
});

it('Can do number equality', async () => {
    expect(selectFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: eqGreaterThanOrEqual(1), username: 'antony'}, 'ALLOW FILTERING')).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid>=? AND username=? ALLOW FILTERING', args: [1, 'antony']});
})

it('Can do in equality', async () => {
    expect(selectFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1, username: eqIn('antony', 'luc', 'jakob', 'elliot')}, 'ALLOW FILTERING')).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username in (?,?,?,?) ALLOW FILTERING', args: [1, 'antony', 'luc', 'jakob', 'elliot']});
})

it('Can do contains equality', async () => {
    expect(selectFromRaw<{'users': {uid: number, roles: string[]}}, 'users'>('scyllo', 'users', '*', {uid: 1, roles: eqContains("admin")}, 'ALLOW FILTERING')).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND roles contains ? ALLOW FILTERING', args: [1, 'admin']});
})
