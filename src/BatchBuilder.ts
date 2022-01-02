import { LogMethod } from '@lvksh/logger';
import { Client, types } from 'cassandra-driver';
import { inspect } from 'util';

import { createIndexRaw, createLocalIndexRaw, createTableRaw, deleteFromRaw, insertIntoRaw, QueryBuild, ScylloClientOptions, TableCreateLayout, TableScheme, updateRaw } from '.';

type BuilderOptions = Omit<ScylloClientOptions, 'client'> & { client: Client, keyspace: string }

// implements all methods except the select ones, since batch selecting something doesn't really make sense
export class BatchBuilder<Tables extends TableScheme> {
    client: Client;
    keyspace: string;
    debug:  boolean;
    log: LogMethod;
    prepare: boolean;

    private queries: QueryBuild[] = [];

    constructor(opts: BuilderOptions) {
        this.client = opts.client;
        this.keyspace = opts.keyspace;
        this.debug = !!opts.debug;
        this.log = opts.log || console.log;
        this.prepare = opts.prepare ?? true;
    }

    query(query: QueryBuild) {
        this.queries.push(query);

        return this;
    }

    raw(query: string) {
        return this.query({ query, args: [] });
    }

    rawWithParams(query: string, args: any[]) {
        return this.query({ query, args });
    }

    useKeyspace(keyspace: string, createIfNotExists = false) {
        if(createIfNotExists) this.createKeyspace(keyspace);

        this.keyspace = keyspace;

        return this.raw(`USE ${keyspace}`);
    }

    dropKeyspace(keyspace: string, ifExists = true) {
        return this.raw(`DROP KEYSPACE${ifExists ? 'IF EXISTS' : ''} ${keyspace}`);
    }

    insertInto<Table extends keyof Tables>(
        table: Table,
        obj: Partial<Tables[Table]>,
        extra?: string
    ) {
        const query = insertIntoRaw<Tables, Table>(this.keyspace, table, obj, extra);

        return this.query(query);
    }

    update<Table extends keyof Tables, ColumnName extends keyof Tables[Table]>(
        table: Table,
        obj: Partial<Tables[Table]>,
        criteria: { [key in ColumnName]?: Tables[Table][key] | string },
        extra?: string
    ) {
        const query = updateRaw<Tables, Table, ColumnName>(
            this.keyspace,
            table,
            obj,
            criteria,
            extra
        );

        return this.query(query);
    }

    deleteFrom<Table extends keyof Tables, ColumnName extends keyof Tables[Table]>(
        table: Table,
        fields: '*' | ColumnName[],
        criteria: { [key in ColumnName]?: Tables[Table][key] | string },
        extra?: string
    ) {
        const query = deleteFromRaw<Tables, Table, ColumnName>(
            this.keyspace,
            table,
            fields,
            criteria,
            extra
        );

        return this.query(query);
    }

    truncateTable<Table extends keyof Tables>(table: Table) {
        return this.rawWithParams('TRUNCATE ?', [table]);
    }

    dropTable<Table extends keyof Tables>(table: Table) {
        return this.raw('DROP TABLE ' + table);
    }

    createTable<Table extends keyof Tables, ColumnName extends keyof Tables[Table]>(
        table: Table,
        createIfNotExists: boolean,
        columns: TableCreateLayout<Tables[Table]>,
        partition: [ColumnName, ColumnName] | ColumnName,
        clustering?: ColumnName[]
    ) {
        const query = createTableRaw(
            this.keyspace,
            table,
            createIfNotExists,
            columns,
            partition,
            clustering
        );

        return this.query(query);
    }

    createKeyspace(
        keyspace: string,
        replicationClass = 'SimpleStrategy',
        replicationFactor = 3
    ) {
        return this.raw(
            `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH replication = {'class':'${replicationClass}', 'replication_factor' : ${replicationFactor}};`
        );
    }

    createIndex<Table extends keyof Tables, ColumnName extends keyof Tables[Table]>(
        table: Table,
        materialized_name: string,
        column_to_index: ColumnName
    ) {
        const query = createIndexRaw<Tables, Table, ColumnName>(this.keyspace, table, materialized_name, column_to_index);

        return this.query(query);
    }

    createLocalIndex<Table extends keyof Tables, ColumnName extends keyof Tables[Table]>(
        table: Table,
        materialized_name: string,
        primary_column: ColumnName,
        column_to_index: ColumnName
    ) {
        const query = createLocalIndexRaw<Tables, Table, ColumnName>(this.keyspace, table, materialized_name, primary_column, column_to_index);

        return this.query(query);
    }

    async execute(): Promise<types.ResultSet> {
        if(this.debug) {
            for(const { query, args } of this.queries) {
                if(this.log == console.log) {
                    this.log(`[Scyllo][Debug][Batch] ${query}\n${inspect(args)}`);
                } else {
                    this.log(query, args);
                }
            }
        }

        return await this.client.batch(this.queries.map(({ query, args }) => ({ query, params: args })), { prepare: this.prepare });
    }

}