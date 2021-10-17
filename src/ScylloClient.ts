import { Client, DseClientOptions, types } from 'cassandra-driver';
import { deleteFromRaw, insertIntoRaw } from './';
import { selectFromRaw, selectOneFromRaw, ValidDataType } from './QueryBuilder';

export type DatabaseObject = {[key: string]: ValidDataType};
export type Tables = {[key: string]: DatabaseObject};

export type ScylloClientOptions = {
    client: DseClientOptions,
}

export class ScylloClient<TableMap extends Tables> {

    keyspace: string = 'scyllo';
    client: Client;

    constructor(options: ScylloClientOptions) {
        this.client = new Client(options.client);
        this.keyspace = options.client.keyspace ?? '';
    }

    async awaitConnection(): Promise<void> {
        return await this.client.connect();
    }

    async shutdown(): Promise<void> {
        return await this.client.shutdown();
    }

    async raw(cmd: string): Promise<types.ResultSet> {
        return await this.client.execute(cmd);
    }
    async rawWithParams(query: string, args: any[]): Promise<types.ResultSet> {
        return await this.client.execute(query, args);
    }

    async useKeyspace(keyspace: string) {
        this.keyspace = keyspace;
        return await this.raw(`USE ${keyspace};`);
    }

    async selectFrom<F extends keyof TableMap>(table: F, select: '*' | (keyof TableMap[F])[], criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }, extra?: string): Promise<TableMap[F][]> {
        const query = selectFromRaw<TableMap, F>(this.keyspace, table, select, criteria, extra);
        const result = await this.rawWithParams(query.query, query.args);
        return result.rows.map((row) => (Object.assign({}, ...row.keys().map(k => ({ [k]: row.get(k) }))))) as TableMap[F][];    
    }

    async selectOneFrom<F extends keyof TableMap>(table: F, select: '*' | (keyof TableMap[F])[], criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }, extra?: string): Promise<TableMap[F]> {
        const query = selectOneFromRaw<TableMap, F>(this.keyspace, table, select, criteria, extra);
        const result = await this.rawWithParams(query.query, query.args);
        return result.rows.slice(0,1).map((row) => (Object.assign({}, ...row.keys().map(k => ({ [k]: row.get(k) })))))[0] as TableMap[F];    
    }

    async insertInto<F extends keyof TableMap>(table: F, obj: Partial<TableMap[F]>): Promise<types.ResultSet> {
        const query = insertIntoRaw<TableMap, F>(this.keyspace, table, obj);
        const result = await this.rawWithParams(query.query, query.args);
        return result;
    }

    async deleteFrom<F extends keyof TableMap>(table: F, fields: '*' | (keyof TableMap[F])[], criteria: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }, extra?: string): Promise<types.ResultSet> {
        const query = deleteFromRaw<TableMap, F>(this.keyspace, table, fields, criteria, extra);
        const result = await this.rawWithParams(query.query, query.args);
        return result;
    }
}