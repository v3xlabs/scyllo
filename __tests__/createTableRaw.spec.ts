import { createTableRaw } from "../lib";

it('Can create a basic table', async () => {
    expect(createTableRaw<{'atable': {a:string}}, 'atable'>('scyllo', 'atable', false, {a: {type: 'bigint'}}, 'a')).toEqual({"args": [], "query": "CREATE TABLE scyllo.atable (a bigint, PRIMARY KEY (a))"});
});

it('Can create a basic table if not exists', async () => {
    expect(createTableRaw<{'atable': {a:string}}, 'atable'>('scyllo', 'atable', true, {a: {type: 'bigint'}}, 'a')).toEqual({"args": [], "query": "CREATE TABLE IF NOT EXISTS scyllo.atable (a bigint, PRIMARY KEY (a))"});
});