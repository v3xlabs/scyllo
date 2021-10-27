import { Client, DseClientOptions, types } from 'cassandra-driver';
import { createTableRaw, deleteFromRaw, insertIntoRaw, QueryBuild } from './';
import { selectFromRaw, selectOneFromRaw, ValidDataType } from './QueryBuilder';

export type DatabaseObject = { [key: string]: ValidDataType };
export type Tables = { [key: string]: DatabaseObject };

export type ScylloClientOptions = {
    client: DseClientOptions,
    debug?: boolean
}

export class ScylloClient<TableMap extends Tables> {

    keyspace: string = 'scyllo';
    client: Client;
    debug: boolean;

    constructor(options: ScylloClientOptions) {
        this.client = new Client(options.client);
        this.keyspace = options.client.keyspace ?? '';
        this.debug = options.debug || false;
    }

    async awaitConnection(): Promise<void> {
        return await this.client.connect();
    }

    async shutdown(): Promise<void> {
        return await this.client.shutdown();
    }

    async raw(query: string): Promise<types.ResultSet> {
        if (this.debug)
            console.log(`[Scyllo][Debug]\t${query}`);
        return await this.client.execute(query);
    }

    async rawWithParams(query: string, args: any[]): Promise<types.ResultSet> {
        if (this.debug)
            console.log(`[Scyllo][Debug]\t${query}\n${args.reduce((a, b) => a + ' ' + b)}`);
        return await this.client.execute(query, args);
    }

    async query(query: QueryBuild): Promise<types.ResultSet> {
        return await this.rawWithParams(query.query, query.args);
    }

    async useKeyspace(keyspace: string) {
        this.keyspace = keyspace;
        return await this.raw(`USE ${keyspace};`);
    }

    async selectFrom<F extends keyof TableMap>(table: F, select: '*' | (keyof TableMap[F])[], criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }, extra?: string): Promise<TableMap[F][]> {
        const query = selectFromRaw<TableMap, F>(this.keyspace, table, select, criteria, extra);
        const result = await this.query(query);
        return result.rows.map((row) => (Object.assign({}, ...row.keys().map(k => ({ [k]: row.get(k) }))))) as TableMap[F][];
    }

    async selectOneFrom<F extends keyof TableMap>(table: F, select: '*' | (keyof TableMap[F])[], criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }, extra?: string): Promise<TableMap[F]> {
        const query = selectOneFromRaw<TableMap, F>(this.keyspace, table, select, criteria, extra);
        const result = await this.query(query);
        return result.rows.slice(0, 1).map((row) => (Object.assign({}, ...row.keys().map(k => ({ [k]: row.get(k) })))))[0] as TableMap[F];
    }

    async insertInto<F extends keyof TableMap>(table: F, obj: Partial<TableMap[F]>): Promise<types.ResultSet> {
        const query = insertIntoRaw<TableMap, F>(this.keyspace, table, obj);
        const result = await this.query(query);
        return result;
    }

    async deleteFrom<F extends keyof TableMap>(table: F, fields: '*' | (keyof TableMap[F])[], criteria: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }, extra?: string): Promise<types.ResultSet> {
        const query = deleteFromRaw<TableMap, F>(this.keyspace, table, fields, criteria, extra);
        const result = await this.query(query);
        return result;
    }

    async truncateTable<F extends keyof TableMap>(table: F): Promise<types.ResultSet> {
        return await this.rawWithParams('TRUNCATE ?', [table]);
    }

    async dropTable<F extends keyof TableMap>(table: F): Promise<types.ResultSet> {
        return await this.rawWithParams('DROP TABLE ?', [table]);
    }

    async createTable<F extends keyof TableMap>(table: F, createIfNotExists: boolean, columns: { [key in keyof TableMap[F]]: { type: keyof typeof types.dataTypes } }, partition: [keyof TableMap[F], keyof TableMap[F]] | keyof TableMap[F], clustering?: (keyof TableMap[F])[]): Promise<types.ResultSet> {
        const query = createTableRaw(this.keyspace, table, createIfNotExists, columns, partition, clustering);
        const result = await this.query(query);
        return result;
    }
}