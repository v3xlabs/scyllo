import { types } from 'cassandra-driver';
import { inspect } from 'node:util';

import {
    createIndexRaw,
    createLocalIndexRaw,
    createTableRaw,
    Criteria,
    deleteFromRaw,
    insertIntoRaw,
    QueryBuild,
    ScylloClient,
    TableCreateLayout,
    TableScheme,
    updateRaw,
} from '.';

// implements all methods except the select ones, since batch selecting something doesn't really make sense

export class BatchBuilder<Tables extends TableScheme> {
    keyspace: string;
    queries: QueryBuild[] = [];

    constructor(public client: ScylloClient<Tables>) {
        this.keyspace = client.keyspace;
    }

    query(query: QueryBuild) {
        this.queries.push(query);

        return this;
    }

    insertInto<Table extends keyof Tables>(
        table: Table,
        object: Partial<Tables[Table]>,
        extra?: string
    ) {
        const query = insertIntoRaw<Tables, Table>(
            this.keyspace,
            table,
            object,
            extra
        );

        return this.query(query);
    }

    update<Table extends keyof Tables, ColumnName extends keyof Tables[Table]>(
        table: Table,
        object: Partial<Tables[Table]>,
        criteria: Criteria<Tables[Table]>,
        extra?: string
    ) {
        const query = updateRaw<Tables, Table, ColumnName>(
            this.keyspace,
            table,
            object,
            criteria,
            extra
        );

        return this.query(query);
    }

    deleteFrom<
        Table extends keyof Tables,
        ColumnName extends keyof Tables[Table],
        DeletedColumnName extends keyof Tables[Table]
    >(
        table: Table,
        fields: '*' | DeletedColumnName[],
        criteria: Criteria<Tables[Table]>,
        extra?: string
    ) {
        const query = deleteFromRaw<
            Tables,
            Table,
            ColumnName,
            DeletedColumnName
        >(this.keyspace, table, fields, criteria, extra);

        return this.query(query);
    }

    async execute(): Promise<types.ResultSet> {
        if (this.client.debug) {
            for (const { query, args } of this.queries) {
                if (this.client.log == console.log) {
                    this.client.log(
                        `[Scyllo][Debug][Batch] ${query}\n${inspect(args)}`
                    );
                } else {
                    this.client.log(query, args);
                }
            }
        }

        return await this.client.client.batch(
            this.queries.map(({ query, args }) => ({ query, params: args })),
            { prepare: this.client.prepare }
        );
    }
}
