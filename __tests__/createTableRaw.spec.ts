import { createTableRaw } from "../lib";

it('Can create a basic table', async () => {
    expect(createTableRaw<{'atable': {a:string}}, 'atable'>('scyllo', 'atable', false, {a: {type: 'bigint'}}, 'a')).toEqual({"args": ["a", "bigint", "a"], "query": "CREATE TABLE scyllo.atable (? ?, PRIMARY KEY (?))"});
});

it('Can create a basic table if not exists', async () => {
    expect(createTableRaw<{'atable': {a:string}}, 'atable'>('scyllo', 'atable', true, {a: {type: 'bigint'}}, 'a')).toEqual({"args": ["a", "bigint", "a"], "query": "CREATE TABLE IF NOT EXISTS scyllo.atable (? ?, PRIMARY KEY (?))"});
});