import { selectOneFromRaw } from "../lib";

it('Can insert a user into the database', async () => {
    expect(selectOneFromRaw<{'users': {uid: number, username: string}}, 'users'>('scyllo', 'users', '*', {uid: 1234567890, username: 'Jest'})).toEqual({query: 'SELECT * FROM scyllo.users WHERE uid=? AND username=? LIMIT 1', args: [1234567890, 'Jest']});
});