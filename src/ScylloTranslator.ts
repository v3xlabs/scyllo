import { types } from 'cassandra-driver';

export type ScylloSafeType = string | number | types.Long | boolean;
export type ValidDataType =
    | string
    | number
    | boolean
    | types.Long
    | string[]
    | object;

export const toScyllo: (a: ValidDataType) => ScylloSafeType = (a) => {
    if (a instanceof types.Long) return a;

    if (Array.isArray(a) || a instanceof Object) {
        return JSON.stringify(a);
    }

    return a;
};

export const fromScyllo: (a: ScylloSafeType) => ValidDataType = (a) => {
    if (a instanceof String && a.toString().match(/^[\\{\\[]/)) {
        let result = '';

        try {
            return JSON.stringify(a.toString());
        } catch (e) {
            result = '';
            console.error('Error parsing object', a);
        }

        return result.toString();
    }

    return a;
};
