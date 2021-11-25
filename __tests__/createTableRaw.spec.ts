import { createTableRaw } from "../lib";

it('Can create a basic table', async () => {
    expect(createTableRaw<{'atable': {a:Long}}, 'atable'>('scyllo', 'atable', false, {a: {type: 'bigint'}}, 'a')).toEqual({"args": ["a", "bigint", "a"], "query": "CREATE TABLE scyllo.atable (? ?, PRIMARY KEY (?))"});
});

it('Can create a basic table if not exists', async () => {
    expect(createTableRaw<{'atable': {a:Long}}, 'atable'>('scyllo', 'atable', true, {a: {type: 'bigint'}}, 'a')).toEqual({"args": ["a", "bigint", "a"], "query": "CREATE TABLE IF NOT EXISTS scyllo.atable (? ?, PRIMARY KEY (?))"});
});

it('Can create a table with composite partition key', async () => {
    expect(createTableRaw<{'atable': {a:Long, b:string}}, 'atable'>('scyllo', 'atable', false, {a: {type: 'bigint'},b: {type:'text'}}, ["a", "b"])).toEqual({"args": ["a", "bigint", "b", "text", "a", "b"], "query": "CREATE TABLE scyllo.atable (? ?,? ?, PRIMARY KEY ((?,?)))"});
});