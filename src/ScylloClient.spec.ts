import { ScylloClient } from ".";

type User = {
    username: string,
    uid: number
}

type BlogPost = {
    uid: number,
    title: string,
    description: string
}

(async () => {
    const DB = new ScylloClient<{ 'users': User, 'blogposts': BlogPost }>({
        client: {
            contactPoints: [
                'localhost:9042'
            ],
            'localDataCenter': 'datacenter1'
        }
    });

    await DB.useKeyspace('shopkeeper');

    // DB.client.execute('SELECT * FROM scyllo.users WHERE uid=?', [12345]);
    // console.log(await DB.selectFrom('users', '*'));
    // console.log(await DB.selectFrom('users', '*', {}));
    // console.log(await DB.selectFrom('users', '*', { username: 'lucemans' }, 'ALLOW FILTERING'));

})();