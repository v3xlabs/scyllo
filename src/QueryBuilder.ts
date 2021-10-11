import { Tables } from "./ScylloClient";

export type ValidDataType = string | number;

export type QueryBuild = {
    query: string,
    args: any[]
};

export const selectFromRaw = <TableMap extends Tables, F extends keyof TableMap>(keyspace: string, table: F, select: '*' | (keyof TableMap[F])[], criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }, extra?: string): QueryBuild => ({
    query: `SELECT ${select == '*' ? select : select.join(',')} FROM ${keyspace}.${table} ${criteria && Object.keys(criteria).length > 0 ? ('WHERE ' + Object.keys(criteria).map(crit => crit + "=?").join(' AND ')) : ''} ${extra || ''}`.trim(),
    args: [...(criteria ? Object.values(criteria) : [])]
});