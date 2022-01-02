import { selectOneFromRaw } from "../../lib";

// fix
it('Can insert a user into the database', async () => {
    expect(selectOneFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1234567890, username: 'Jest'})).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=? LIMIT 1', args: [1234567890, 'Jest']});
});

it('Can add extra args to query', async () => {
    expect(selectOneFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1234567890, username: 'Jest'}, "ALLOW FILTERING")).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=? LIMIT 1 ALLOW FILTERING', args: [1234567890, 'Jest']});
});