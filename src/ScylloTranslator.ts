
import { Long } from 'long';

export type ScylloSafeType = string | number | Long | boolean;
export type ValidDataType = string | number | boolean | Long | string[] | object;

export const toScyllo: (a: ValidDataType) => ScylloSafeType = (a) => {
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