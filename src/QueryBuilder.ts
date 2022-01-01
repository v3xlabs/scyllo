import { types } from 'cassandra-driver';

import { TableScheme } from './ScylloClient';
import { toScyllo } from './ScylloTranslator';

export type QueryBuild = {
    query: string;
    args: any[];
};

export const selectFromRaw = <
    TableMap extends TableScheme,
    F extends keyof TableMap,
>(
        keyspace: string,
        table: F,
        select: '*' | (keyof TableMap[F])[],
        criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string },
        extra?: string,
    ): QueryBuild => ({
        query: `SELECT ${
            select == '*' ? select : select.join(',')
        } FROM ${keyspace}.${table} ${
            criteria && Object.keys(criteria).length > 0
                ? 'WHERE ' +
              Object.keys(criteria)
                  .map((crit) => crit + '=?')
                  .join(' AND ')
                : ''
        } ${extra || ''}`.trim(),
        args: [...(criteria ? Object.values(criteria) : [])],
    });

export const selectOneFromRaw = <
    TableMap extends TableScheme,
    F extends keyof TableMap,
>(
        keyspace: string,
        table: F,
        select: '*' | (keyof TableMap[F])[],
        criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string },
        extra?: string,
    ): QueryBuild => ({
        query: `SELECT ${
            select == '*' ? select : select.join(',')
        } FROM ${keyspace}.${table} ${
            criteria && Object.keys(criteria).length > 0
                ? 'WHERE ' +
              Object.keys(criteria)
                  .map((crit) => crit + '=?')
                  .join(' AND ')
                : ''
        } LIMIT 1 ${extra || ''}`.trim(),
        args: [...(criteria ? Object.values(criteria) : [])],
    });

export const insertIntoRaw = <
    TableMap extends TableScheme,
    F extends keyof TableMap,
>(
        keyspace: string,
        table: F,
        obj: Partial<TableMap[F]>,
    ): QueryBuild => ({
        query: `INSERT INTO ${keyspace}.${table} (${Object.keys(obj).join(
            ', ',
        )}) VALUES (${Object.keys(obj)
            .map(() => '?')
            .join(', ')})`,
        args: Object.values(obj).map(toScyllo),
    });

export const updateRaw = <
    TableMap extends TableScheme,
    TableName extends keyof TableMap,
    ColumnName extends keyof TableMap[TableName],
>(
        keyspace: string,
        table: TableName,
        obj: Partial<TableMap[TableName]>,
        criteria: { [key in ColumnName]?: TableMap[TableName][key] | string },
    ): QueryBuild => ({
        query: `UPDATE ${keyspace}.${table} SET ${Object.keys(obj)
            .map((it) => it + '=?')
            .join(',')} ${
            criteria && Object.keys(criteria).length > 0
                ? 'WHERE ' +
              Object.keys(criteria)
                  .map((crit) => (crit += '=?'))
                  .join(' AND ')
                : ''
        }`.trim(),
        args: [...Object.values(obj), ...(criteria ? Object.values(criteria) : [])],
    });

export const deleteFromRaw = <
    TableMap extends TableScheme,
    TableName extends keyof TableMap,
    ColumnName extends keyof TableMap[TableName],
>(
        keyspace: string,
        table: TableName,
        fields: '*' | ColumnName[],
        criteria: { [key in ColumnName]?: TableMap[TableName][key] | string },
        extra?: string,
    ): QueryBuild => ({
        query: `DELETE ${
            fields == '*' ? '' : fields.join(',')
        } ${keyspace}.${table} ${
            criteria && Object.keys(criteria).length > 0
                ? 'WHERE ' +
              Object.keys(criteria)
                  .map((crit) => crit + '=?')
                  .join(' AND ')
                : ''
        } ${extra || ''}`.trim(),
        args: [...(criteria ? Object.values(criteria) : [])],
    });

export type ColumnType = { type: keyof typeof types.dataTypes; test?: string };

export const createTableRaw = <
    TableMap extends TableScheme,
    F extends keyof TableMap,
>(
        keyspace: string,
        table: F,
        createIfNotExists: boolean,
        columns: { [key in keyof TableMap[F]]: ColumnType },
        partition: [keyof TableMap[F], keyof TableMap[F]] | keyof TableMap[F],
        clustering?: (keyof TableMap[F])[],
    ): QueryBuild => ({
        query: `CREATE TABLE${
            createIfNotExists ? ' IF NOT EXISTS' : ''
        } ${keyspace}.${table} (${(Object.keys(columns) as (keyof TableMap[F])[])
            .map((a) => a + ' ' + columns[a].type)
            .join(',')}, PRIMARY KEY (${
            partition instanceof Array ? '(' + partition.join(',') + ')' : partition
        }${clustering ? `, ${clustering.join(',')}` : ''}))`,
        args: [],
    });

export const createIndexRaw = <
    TableMap extends TableScheme,
    Table extends keyof TableMap,
    ColumnName extends keyof TableMap[Table],
>(
        keyspace: string,
        table: Table,
        materialized_name: string,
        column_to_index: ColumnName,
    ): QueryBuild => ({
        query: `CREATE INDEX IF NOT EXISTS ${materialized_name} ON ${keyspace}.${table} (${column_to_index})`,
        args: [],
    });

export const createLocalIndexRaw = <
    TableMap extends TableScheme,
    Table extends keyof TableMap,
    ColumnName extends keyof TableMap[Table],
>(
        keyspace: string,
        table: Table,
        materialized_name: string,
        primary_column: ColumnName,
        column_to_index: ColumnName,
    ): QueryBuild => ({
        query: `CREATE INDEX IF NOT EXISTS ${materialized_name} ON ${keyspace}.${table} ((${primary_column}), ${column_to_index})`,
        args: [],
    });
