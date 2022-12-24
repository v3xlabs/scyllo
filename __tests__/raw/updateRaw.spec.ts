import { updateRaw } from '../../lib';
import { eqGreaterThanOrEqual, eqIn } from '../../lib/EqualityBuilder';

it('Can update a specific user in the database', async () => {
    expect(updateRaw<{'users': {uid: number, username: string}}, 'users', 'uid' | 'username'>('scyllo', 'users', { username: "Jest" }, { uid: 1234567890 })).toEqual({query: 'UPDATE scyllo.users SET username=? WHERE uid=?', args: ['Jest', 1234567890]});
});

it('Can add extra args to query', async () => {
    expect(updateRaw<{'users': {uid: number, username: string}}, 'users', 'uid' | 'username'>('scyllo', 'users', { username: "Jest" }, { uid: 1234567890 }, 'ALLOW FILTERING')).toEqual({query: 'UPDATE scyllo.users SET username=? WHERE uid=? ALLOW FILTERING', args: ['Jest', 1234567890]});
});

it('Can do number equality', async () => {
    expect(updateRaw<{'users': {uid: number, username: string}}, 'users', 'uid' | 'username'>('scyllo', 'users', { username: "Jest" }, { uid: eqGreaterThanOrEqual(1) }, 'ALLOW FILTERING')).toEqual({query: 'UPDATE scyllo.users SET username=? WHERE uid>=? ALLOW FILTERING', args: ['Jest', 1]});
});

it('Can do in equality', async () => {
    expect(updateRaw<{'users': {uid: number, username: string}}, 'users', 'uid' | 'username'>('scyllo', 'users', { username: "Jest" }, { username: eqIn('antony', 'luc', 'jakob', 'elliot') }, 'ALLOW FILTERING')).toEqual({query: 'UPDATE scyllo.users SET username=? WHERE username in (?,?,?,?) ALLOW FILTERING', args: ['Jest', 'antony', 'luc', 'jakob', 'elliot']});
});
