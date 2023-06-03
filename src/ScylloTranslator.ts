import { types } from 'cassandra-driver';

export type ScylloSafeType =
    | string
    | number
    | bigint
    | types.Long
    | boolean
    | object
    | null;
export type ValidDataType =
    | string
    | number
    | bigint
    | boolean
    | types.Long
    | string[]
    | object
    | null;

export const toScyllo: (a: ValidDataType) => ScylloSafeType = (a) => {
    if (a instanceof types.Long) return a;

    return a;
};

export const fromScyllo: (a: ScylloSafeType) => ValidDataType = (a) => {
    if (a instanceof String && /^[[\\{]/.test(a.toString())) {
        let result = '';

        try {
            return JSON.stringify(a.toString());
        } catch {
            result = '';
            console.error('Error parsing object', a);
        }

        return result.toString();
    }

    return a;
};
