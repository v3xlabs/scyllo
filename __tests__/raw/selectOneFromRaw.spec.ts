import { selectOneFromRaw } from '../../lib';
import { eqGreaterThanOrEqual, eqIn } from '../../lib/EqualityBuilder';

// fix
it('Can insert a user into the database', async () => {
    expect(selectOneFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1, username: 'svemat'})).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=? LIMIT 1', args: [1, 'svemat']});
});


it('Can add extra args to query', async () => {
    expect(selectOneFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1, username: 'svemat'}, 'ALLOW FILTERING')).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=? LIMIT 1 ALLOW FILTERING', args: [1, 'svemat']});
});

it('Can do number equality', async () => {
    expect(selectOneFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: eqGreaterThanOrEqual(1), username: 'antony'}, 'ALLOW FILTERING')).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid>=? AND username=? LIMIT 1 ALLOW FILTERING', args: [1, 'antony']});
})

it('Can do in equality', async () => {
    expect(selectOneFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1, username: eqIn('antony', 'luc', 'jakob', 'elliot')}, 'ALLOW FILTERING')).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username in (?,?,?,?) LIMIT 1 ALLOW FILTERING', args: [1, 'antony', 'luc', 'jakob', 'elliot']});
})
