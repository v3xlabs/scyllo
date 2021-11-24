import { types } from 'cassandra-driver';

import { Tables } from './ScylloClient';
import { toScyllo } from './ScylloTranslator';

export type QueryBuild = {
    query: string,
    args: any[]
};

export const selectFromRaw = <TableMap extends Tables, F extends keyof TableMap>(keyspace: string, table: F, select: '*' | (keyof TableMap[F])[], criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }, extra?: string): QueryBuild => ({
    query: `SELECT ${select == '*' ? select : select.join(',')} FROM ${keyspace}.${table} ${criteria && Object.keys(criteria).length > 0 ? ('WHERE ' + Object.keys(criteria).map(crit => crit + '=?').join(' AND ')) : ''} ${extra || ''}`.trim(),
    args: [...(criteria ? Object.values(criteria) : [])]
});

export const selectOneFromRaw = <TableMap extends Tables, F extends keyof TableMap>(keyspace: string, table: F, select: '*' | (keyof TableMap[F])[], criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }, extra?: string): QueryBuild => ({
    query: `SELECT ${select == '*' ? select : select.join(',')} FROM ${keyspace}.${table} ${criteria && Object.keys(criteria).length > 0 ? ('WHERE ' + Object.keys(criteria).map(crit => crit + '=?').join(' AND ')) : ''} LIMIT 1 ${extra || ''}`.trim(),
    args: [...(criteria ? Object.values(criteria) : [])]
});

export const insertIntoRaw = <TableMap extends Tables, F extends keyof TableMap>(keyspace: string, table: F, obj: Partial<TableMap[F]>): QueryBuild => ({
    query: `INSERT INTO ${keyspace}.${table} (${Object.keys(obj).join(', ')}) VALUES (${Object.keys(obj).map(() => '?').join(', ')})`,
    args: Object.values(obj).map(toScyllo)
});

export const deleteFromRaw = <TableMap extends Tables, F extends keyof TableMap>(keyspace: string, table: F, fields: '*' | (keyof TableMap[F])[], criteria: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }, extra?: string): QueryBuild => ({
    query: `DELETE ${fields == '*' ? '' : fields.join(',')} ${keyspace}.${table} ${criteria && Object.keys(criteria).length > 0 ? ('WHERE ' + Object.keys(criteria).map(crit => crit + '=?').join(' AND ')) : ''} ${extra || ''}`.trim(),
    args: [...(criteria ? Object.values(criteria) : [])]
});

export type ColumnType = { type: keyof typeof types.dataTypes, test?: string };

export const createTableRaw = <TableMap extends Tables, F extends keyof TableMap>(keyspace: string, table: F, createIfNotExists: boolean, columns: { [key in keyof TableMap[F]]: ColumnType }, partition: [keyof TableMap[F], keyof TableMap[F]] | keyof TableMap[F], clustering?: (keyof TableMap[F])[]): QueryBuild => ({
    query: `CREATE TABLE${createIfNotExists ? ' IF NOT EXISTS' : ''} ${keyspace}.${table} (${Object.keys(columns).map(() => '? ?').join(',')}, PRIMARY KEY (${partition instanceof Array ? '('+partition.join(',')+')' : partition}${clustering ? `, ${clustering.join(',')}` : ''}))`,
    args: [...(Object.keys(columns) as (keyof TableMap[F])[]).flatMap(a => [a, (columns[a]).type.toString()])]
});