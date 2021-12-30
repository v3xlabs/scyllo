import { types } from 'cassandra-driver';
import Long from 'long';

export type ScylloSafeType = string | number | types.Long | boolean | ValidDataType;
export type ValidDataType =
    | string
    | number
    | boolean
    | types.Long
    | string[]
    | object;

export const toScyllo: (a: ValidDataType) => ScylloSafeType = (a) => {
    if (a instanceof types.Long) return a;

    if (Array.isArray(a)) {
        return JSON.stringify(a);
    }
    
    if (a instanceof Object) {
        let stringed = JSON.stringify(a);
        
        Object.entries(a).forEach(([key, value]) => {
            if (value instanceof Long) {
                stringed = stringed.replace(`"${key}":"${value.toString()}"`, `"${key}":${value.toString()}`);
            }
        });

        return stringed;
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
