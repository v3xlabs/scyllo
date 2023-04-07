import { LogMethodInput } from '@lvksh/logger';
import {
    Client,
    ClientOptions,
    DseClientOptions as CassandraConfig,
    types,
} from 'cassandra-driver';
import { inspect } from 'node:util';

import {
    ColumnType,
    createIndexRaw,
    createLocalIndexRaw,
    createTableRaw,
    Criteria,
    deleteFromRaw,
    insertIntoRaw,
    QueryBuild,
    updateRaw,
} from './';
import { BatchBuilder } from './BatchBuilder';
import { Migration, runMigrations } from './MigrationHandler';
import { selectFromRaw, selectOneFromRaw } from './QueryBuilder';
import { fromScyllo, ValidDataType } from './ScylloTranslator';

export type DatabaseObject = { [key: string]: ValidDataType } | typeof Object;
export type TableScheme = { [key: string]: DatabaseObject };

export type LogMethod = (...input: LogMethodInput[]) => unknown;

export type TableCreateLayout<F> = {
    [key in keyof F]: ColumnType;
};

export type ScylloClientOptions = {
    /**
     * Cassandra-Driver config
     * Empty Object = `localhost:9042`
     */
    client: CassandraConfig & {
        /**
         * Name of the keyspace you would like to use
         * -scyllo was here
         */
        keyspace: string;
        /**
         * Name of the datacenter you would like to use,
         * This can be completely arbitrary and is used for routing.
         * -scyllo was here
         */
        localDataCenter: string;
    };
    /**
     * Whether to prepare inputed args for query
     * @default true
     * @example false
     */
    prepare?: boolean;
    /**
     * Custom log method
     * @default `console.log`
     */
    log?: LogMethod;
    /**
     * Verbose,
     * Whether or not to output verbose information on each request.
     */
    debug?: boolean;
};

const fromObjectScyllo = (
    row: types.Row,
    encodingOptions: ClientOptions['encoding'],
    columns: types.ResultSet['columns']
) =>
    Object.assign(
        {},
        ...row.keys().map((item: any) => ({
            [item]: ensureExistingCollections(
                fromScyllo(row.get(item)),
                encodingOptions,
                // could maybe use the index here, but not sure if they're ordered the same
                columns.find((it) => it.name === item)!.type.code
            ),
        }))
    );

const ensureExistingCollections = (
    value: unknown,
    encodingOptions: ClientOptions['encoding'],
    columnType: types.dataTypes
) => {
    if (value !== null) return value;

    if (columnType === types.dataTypes.list) return [];

    if (columnType === types.dataTypes.set) {
        if (encodingOptions?.set?.prototype === Set.prototype) return new Set();

        return [];
    }

    if (columnType === types.dataTypes.map) {
        if (encodingOptions?.map?.prototype === Map.prototype) return new Map();

        return {};
    }

    return value;
};

export class ScylloClient<Tables extends TableScheme> {
    keyspace: string;
    client: Client;
    debug: boolean;
    log: LogMethod;
    prepare: boolean;
    encodingOptions: ClientOptions['encoding'];

    constructor(options: ScylloClientOptions) {
        this.client = new Client(options.client);
        this.encodingOptions = options.client.encoding;
        this.keyspace = options.client.keyspace;
        this.debug = options.debug || false;
        this.log = options.log || console.log;
        this.prepare = options.prepare ?? true;
    }
    /**
     * Await the connection
     * to the client.
     */
    async awaitConnection(): Promise<void> {
        return await this.client.connect();
    }
    /**
     * Shutdown a
     * client instance
     */
    async shutdown(): Promise<void> {
        return await this.client.shutdown();
    }

    async migrate(
        migrations: Migration<Tables>[],
        logProgress = false
    ): Promise<void> {
        return await runMigrations(this, migrations, logProgress);
    }

    async raw(query: string): Promise<types.ResultSet> {
        if (this.debug) {
            if (this.log == console.log) {
                this.log(`[Scyllo][Debug] ${query}`);
            } else {
                this.log(query);
            }
        }

        return await this.client.execute(query);
    }

    async rawWithParams(
        query: string,
        arguments_: any[]
    ): Promise<types.ResultSet> {
        if (this.debug) {
            if (this.log == console.log) {
                this.log(`[Scyllo][Debug] ${query}\n${inspect(arguments_)}`);
            } else {
                this.log(query, arguments_);
            }
        }

        return await this.client.execute(query, arguments_, {
            prepare: this.prepare,
        });
    }

    async query(query: QueryBuild): Promise<types.ResultSet> {
        return await this.rawWithParams(query.query, query.args);
    }

    async useKeyspace(keyspace: string, createIfNotExists = false) {
        if (createIfNotExists) await this.createKeyspace(keyspace);

        this.keyspace = keyspace;

        return await this.raw(`USE ${keyspace};`);
    }

    /**
     * @param {string} keyspace - The name of the keyspace to drop.
     * @param {boolean} [ifExists=true] - Whether to throw an error if the keyspace does not exist.
     */
    async dropKeyspace(keyspace: string, ifExists: boolean = true) {
        return await this.raw(
            `DROP KEYSPACE${ifExists ? ' IF EXISTS' : ''} ${keyspace};`
        );
    }
    /**
     * Select from
     * a table and return based on criteria.
     */
    async selectFrom<
        TableName extends keyof Tables,
        ColumnName extends keyof Tables[TableName]
    >(
        table: TableName,
        select: '*' | ColumnName[],
        criteria?: Criteria<Tables[TableName]>,
        extra?: string
    ): Promise<Pick<Tables[TableName], ColumnName>[]> {
        const query = selectFromRaw<Tables, TableName>(
            this.keyspace,
            table,
            select,
            criteria,
            extra
        );
        const result = await this.query(query);

        return result.rows.map((row) =>
            fromObjectScyllo(row, this.encodingOptions, result.columns)
        ) as Pick<Tables[TableName], ColumnName>[];
    }
    /**
     * Select one from
     * a table and return based on criteria.
     */
    async selectOneFrom<
        Table extends keyof Tables,
        ColumnName extends keyof Tables[Table]
    >(
        table: Table,
        select: '*' | ColumnName[],
        criteria?: Criteria<Tables[Table]>,
        extra?: string
    ): Promise<Pick<Tables[Table], ColumnName> | undefined> {
        const query = selectOneFromRaw<Tables, Table>(
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
                fromObjectScyllo(row, this.encodingOptions, result.columns)
            )
            .at(0) as Pick<Tables[Table], ColumnName>;
    }
    /**
     * Insert an object into
     * a table.
     */
    async insertInto<Table extends keyof Tables>(
        table: Table,
        object: Partial<Tables[Table]>,
        extra?: string
    ): Promise<types.ResultSet> {
        const query = insertIntoRaw<Tables, Table>(
            this.keyspace,
            table,
            object,
            extra
        );

        return await this.query(query);
    }
    /**
     * Update an entry in
     * a table.
     */
    async update<
        Table extends keyof Tables,
        ColumnName extends keyof Tables[Table]
    >(
        table: Table,
        object: Partial<Tables[Table]>,
        criteria: Criteria<Tables[Table]>,
        extra?: string
    ): Promise<types.ResultSet> {
        const query = updateRaw<Tables, Table, ColumnName>(
            this.keyspace,
            table,
            object,
            criteria,
            extra
        );

        return await this.query(query);
    }
    /**
     * Delete from
     * a table based on criteria.
     */
    async deleteFrom<
        Table extends keyof Tables,
        ColumnName extends keyof Tables[Table],
        DeletedColumnName extends keyof Tables[Table]
    >(
        table: Table,
        fields: '*' | DeletedColumnName[],
        criteria: Criteria<Tables[Table]>,
        extra?: string
    ): Promise<types.ResultSet> {
        const query = deleteFromRaw<
            Tables,
            Table,
            ColumnName,
            DeletedColumnName
        >(this.keyspace, table, fields, criteria, extra);

        return await this.query(query);
    }
    /**
     * Truncate
     * a certain table.
     */
    async truncateTable<Table extends keyof Tables>(
        table: Table
    ): Promise<types.ResultSet> {
        return await this.rawWithParams('TRUNCATE ?', [table]);
    }
    /**
     * Delete
     * a table.
     */
    async dropTable<Table extends keyof Tables>(
        table: Table
    ): Promise<types.ResultSet> {
        return await this.raw('DROP TABLE ' + table);
    }
    /**
     * Create
     * a table.
     */
    async createTable<
        Table extends keyof Tables,
        ColumnName extends keyof Tables[Table]
    >(
        table: Table,
        createIfNotExists: boolean,
        columns: TableCreateLayout<Tables[Table]>,
        partition: [ColumnName, ColumnName] | ColumnName,
        clustering?: ColumnName[]
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
    /**
     * Create
     * a keyspace.
     */
    async createKeyspace(
        keyspace: string,
        replicationClass = 'SimpleStrategy',
        replicationFactor = 3
    ) {
        return await this.raw(
            `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH replication = {'class':'${replicationClass}', 'replication_factor' : ${replicationFactor}};`
        );
    }

    /**
     * Create a Global Secondary Index
     *
     * https://docs.scylladb.com/using-scylla/secondary-indexes/
     */
    async createIndex<
        Table extends keyof Tables,
        ColumnName extends keyof Tables[Table]
    >(
        table: Table,
        materialized_name: string,
        column_to_index: ColumnName
    ): Promise<types.ResultSet> {
        const query = createIndexRaw<Tables, Table, ColumnName>(
            this.keyspace,
            table,
            materialized_name,
            column_to_index
        );

        return await this.query(query);
    }

    /**
     * Create a Local Secondary Index
     *
     * https://docs.scylladb.com/using-scylla/local-secondary-indexes/
     */
    async createLocalIndex<
        Table extends keyof Tables,
        ColumnName extends keyof Tables[Table]
    >(
        table: Table,
        materialized_name: string,
        primary_column: ColumnName,
        column_to_index: ColumnName
    ): Promise<types.ResultSet> {
        const query = createLocalIndexRaw<Tables, Table, ColumnName>(
            this.keyspace,
            table,
            materialized_name,
            primary_column,
            column_to_index
        );

        return await this.query(query);
    }

    batch(): BatchBuilder<Tables> {
        return new BatchBuilder(this);
    }
}
