import { deleteFromRaw } from "../../lib";
import { eqGreaterThanOrEqual, eqIn } from '../../lib/EqualityBuilder';

// fix
it('Can delete whole row', async () => {
    expect(deleteFromRaw<{'users': {uid: number, username: string}}, 'users', 'uid' | 'username', 'uid' | 'username'>('scyllo', 'users', '*', {uid: 1234567890, username: 'Jest'})).toEqual({query: 'DELETE FROM scyllo.users WHERE uid=? AND username=?', args: [1234567890, 'Jest']});
});

it('Can delete single field', async () => {
    expect(deleteFromRaw<{'users': {uid: number, username: string}}, 'users', 'uid' | 'username', 'uid' | 'username'>('scyllo', 'users', ['username'], {uid: 1234567890, username: 'Jest'})).toEqual({query: 'DELETE username FROM scyllo.users WHERE uid=? AND username=?', args: [1234567890, 'Jest']});
});

it('Can delete multiple fields', async () => {
    expect(deleteFromRaw<{'users': {uid: number, username: string}}, 'users', 'uid' | 'username', 'uid' | 'username'>('scyllo', 'users', ['username', 'uid'], {uid: 1234567890, username: 'Jest'})).toEqual({query: 'DELETE username,uid FROM scyllo.users WHERE uid=? AND username=?', args: [1234567890, 'Jest']});
});

it('Can do number equality', async () => {
    expect(deleteFromRaw<{'users': {uid: number, username: string}}, 'users', 'uid' | 'username', 'uid' | 'username'>('scyllo', 'users', ['username', 'uid'], {uid: eqGreaterThanOrEqual(1), username: 'Jest'})).toEqual({query: 'DELETE username,uid FROM scyllo.users WHERE uid>=? AND username=?', args: [1, 'Jest']});
});

it('Can do in equality', async () => {
    expect(deleteFromRaw<{'users': {uid: number, username: string}}, 'users', 'uid' | 'username', 'uid' | 'username'>('scyllo', 'users', ['username', 'uid'], {uid: 1, username: eqIn('antony', 'luc', 'jakob', 'elliot')})).toEqual({query: 'DELETE username,uid FROM scyllo.users WHERE uid=? AND username in (?,?,?,?)', args: [1, 'antony', 'luc', 'jakob', 'elliot']});
});
