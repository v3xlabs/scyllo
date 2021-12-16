import { LogMethod } from '@lvksh/logger';
import { Client, DseClientOptions, types } from 'cassandra-driver';

import {
    createTableRaw,
    deleteFromRaw,
    insertIntoRaw,
    QueryBuild,
    updateRaw,
} from './';
import { selectFromRaw, selectOneFromRaw } from './QueryBuilder';
import { fromScyllo, ValidDataType } from './ScylloTranslator';

export type DatabaseObject = { [key: string]: ValidDataType } | typeof Object;
export type Tables = { [key: string]: DatabaseObject };

export type ScylloClientOptions = {
    client: DseClientOptions;
    /**
     * Custom log method
     * @default `console.log`
     */
    log?: LogMethod;
    /**
     * Verbose,
     * Wether or not to output verbose information on each request.
     */
    debug?: boolean;
};

export class ScylloClient<TableMap extends Tables> {
    keyspace: string = 'scyllo';
    client: Client;
    debug: boolean;
    log: LogMethod;

    constructor(options: ScylloClientOptions) {
        this.client = new Client(options.client);
        this.keyspace = options.client.keyspace ?? '';
        this.debug = options.debug || false;
        this.log = options.log || console.log;
    }

    async awaitConnection(): Promise<void> {
        return await this.client.connect();
    }

    async shutdown(): Promise<void> {
        return await this.client.shutdown();
    }

    async raw(query: string): Promise<types.ResultSet> {
        if (this.debug) this.log(`[Scyllo][Debug]\t${query}`);

        return await this.client.execute(query);
    }

    async rawWithParams(query: string, args: any[]): Promise<types.ResultSet> {
        if (this.debug)
            this.log(`[Scyllo][Debug]\t${query}\n${args.join(' ')}`);

        return await this.client.execute(query, args);
    }

    async query(query: QueryBuild): Promise<types.ResultSet> {
        return await this.rawWithParams(query.query, query.args);
    }

    async useKeyspace(keyspace: string, createIfNotExists = false) {
        if (createIfNotExists) await this.createKeyspace(keyspace);

        this.keyspace = keyspace;

        return await this.raw(`USE ${keyspace};`);
    }

    async selectFrom<F extends keyof TableMap, C extends keyof TableMap[F]>(
        table: F,
        select: '*' | C[],
        criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string },
        extra?: string
    ): Promise<Pick<TableMap[F], C>[]> {
        const query = selectFromRaw<TableMap, F>(
            this.keyspace,
            table,
            select,
            criteria,
            extra
        );
        const result = await this.query(query);

        return result.rows.map((row) =>
            Object.assign(
                {},
                ...row.keys().map((k) => ({ [k]: fromScyllo(row.get(k)) }))
            )
        ) as Pick<TableMap[F], C>[];
    }

    async selectOneFrom<F extends keyof TableMap, C extends keyof TableMap[F]>(
        table: F,
        select: '*' | C[],
        criteria?: { [key in keyof TableMap[F]]?: TableMap[F][key] | string },
        extra?: string
    ): Promise<Pick<TableMap[F], C>> {
        const query = selectOneFromRaw<TableMap, F>(
            this.keyspace,
            table,
            select,
            criteria,
            extra
        );
        const result = await this.query(query);

        return result.rows
            .slice(0, 1)
            .map((row) =>
                Object.assign(
                    {},
                    ...row.keys().map((k) => ({ [k]: fromScyllo(row.get(k)) }))
                )
            )[0] as Pick<TableMap[F], C>;
    }

    async insertInto<F extends keyof TableMap>(
        table: F,
        obj: Partial<TableMap[F]>
    ): Promise<types.ResultSet> {
        const query = insertIntoRaw<TableMap, F>(this.keyspace, table, obj);

        return await this.query(query);
    }

    async update<F extends keyof TableMap>(
        table: F,
        obj: Partial<TableMap[F]>,
        criteria: { [key in keyof TableMap[F]]?: TableMap[F][key] | string }
    ): Promise<types.ResultSet> {
        const query = updateRaw<TableMap, F>(
            this.keyspace,
            table,
            obj,
            criteria
        );

        return await this.query(query);
    }

    async deleteFrom<F extends keyof TableMap>(
        table: F,
        fields: '*' | (keyof TableMap[F])[],
        criteria: { [key in keyof TableMap[F]]?: TableMap[F][key] | string },
        extra?: string
    ): Promise<types.ResultSet> {
        const query = deleteFromRaw<TableMap, F>(
            this.keyspace,
            table,
            fields,
            criteria,
            extra
        );

        return await this.query(query);
    }

    async truncateTable<F extends keyof TableMap>(
        table: F
    ): Promise<types.ResultSet> {
        return await this.rawWithParams('TRUNCATE ?', [table]);
    }

    async dropTable<F extends keyof TableMap>(
        table: F
    ): Promise<types.ResultSet> {
        return await this.rawWithParams('DROP TABLE ?', [table]);
    }

    async createTable<F extends keyof TableMap>(
        table: F,
        createIfNotExists: boolean,
        columns: {
            [key in keyof TableMap[F]]: { type: keyof typeof types.dataTypes };
        },
        partition: [keyof TableMap[F], keyof TableMap[F]] | keyof TableMap[F],
        clustering?: (keyof TableMap[F])[]
    ): Promise<types.ResultSet> {
        const query = createTableRaw(
            this.keyspace,
            table,
            createIfNotExists,
            columns,
            partition,
            clustering
        );

        return await this.query(query);
    }

    async createKeyspace(
        keyspace: string,
        replicationClass = 'SimpleStrategy',
        replicationFactor = 3
    ) {
        return await this.raw(
            `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH replication = {'class':'${replicationClass}', 'replication_factor' : ${replicationFactor}};`
        );
    }
}
