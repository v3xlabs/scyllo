import { updateRaw } from "../lib"

it('Can update a specific user in the database', async () => {
    expect(updateRaw<{'users': {uid: number, username: string}}, 'users', 'uid' | 'username'>('scyllo', 'users', { username: "Jest" }, { uid: 1234567890 })).toEqual({query: 'UPDATE scyllo.users SET username=? WHERE uid=?', args: ['Jest', 1234567890]});
});