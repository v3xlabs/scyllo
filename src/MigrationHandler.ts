import { ScylloClient, TableScheme } from './ScylloClient';

export type Migration<T extends TableScheme> = (
    database: ScylloClient<T>,
    log: (_: string) => void
) => Promise<void>;

export type MigrationTable = {
    table_key: number;
    current_version: number;
};

const MIGRATION_TABLE_NAME = 'lib_scyllo_migrations' as const;

export const runMigrations = async <T extends TableScheme>(
    _client: ScylloClient<T>,
    migrations: Migration<T>[],
    logProgress: boolean
): Promise<void> => {
    // we do this because we want users to be able to pass any scyllo client,
    // but we still want type completion for this
    const client = _client as ScylloClient<{
        [MIGRATION_TABLE_NAME]: MigrationTable;
    }>;

    const logFunction = (message: string) =>
        logProgress && client.log(`[Scyllo][Migrations] ${message}`);

    // assume user will not deliberately create a table called lib_scyllo_migrations with wrong columns
    // validating that would be a pain, maybe later
    await client.createTable(
        MIGRATION_TABLE_NAME,
        true,
        {
            table_key: { type: 'tinyint' },
            current_version: { type: 'int' },
        },
        'table_key'
    );

    const { current_version } = (await client.selectOneFrom(
        MIGRATION_TABLE_NAME,
        ['current_version'],
        { table_key: 1 }
    )) ?? {
        current_version: -1,
    };

    let index = current_version + 1;

    const needToRun = migrations.length - index;

    if (needToRun > 0)
        logFunction(
            index === 0
                ? 'Database empty, initializing...'
                : `Database at #${index}`
        );

    try {
        while (index < migrations.length) {
            logFunction(`Running #${index + 1}`);

            await migrations[index](client, (message) =>
                logFunction(`#${index + 1} ${message}`)
            );
            index++;
        }
    } catch (error) {
        logFunction(`! Migration #${index + 1} failed: ` + error);
        throw error;
    } finally {
        await client.insertInto(MIGRATION_TABLE_NAME, {
            table_key: 1,
            current_version: index - 1,
        });
    }

    if (current_version >= migrations.length) {
        logFunction(
            `! Migration mismatch: database version (${current_version}) >= number of migrations (${migrations.length})`
        );

        return;
    }

    if (needToRun === 0) {
        logFunction('Up-to-date, nothing to do!');

        return;
    }

    logFunction(`Updated! ${needToRun} migration(s) ran`);
};
