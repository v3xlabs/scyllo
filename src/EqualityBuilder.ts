export type EqualityExpression<T, Op extends string> = {
    operation: `${string}${Op}${string}`;

    values: any[];
};

// clean this up at some point
export type AllExpressions =
    | ReturnType<typeof eqLessThan>
    | ReturnType<typeof eqLessThanOrEqual>
    | ReturnType<typeof eqGreaterThan>
    | ReturnType<typeof eqGreaterThanOrEqual>
    | ReturnType<typeof eqIn>;

export type ExpressionByValue<Value> = Value extends number | bigint
    ? AllExpressions
    : ReturnType<typeof eqIn>;

export const isEqualityExpression = (
    object: any
): object is EqualityExpression<any, any> =>
    typeof object === 'object' && object !== null && 'operation' in object;

// TODO: investigate how these things are compared and maybe add more types here
export const eqIn = <T extends (string | number | bigint)[]>(
    ...values: T
): EqualityExpression<T, 'in'> => ({
    operation: ` in (${values.map((_) => '?').join(',')})`,
    values,
});

export const eqLessThan = <T extends number | bigint>(
    value: T
): EqualityExpression<T, '<'> => ({
    operation: '<?',
    values: [value],
});

export const eqLessThanOrEqual = <T extends number | bigint>(
    value: T
): EqualityExpression<T, '<='> => ({
    operation: '<=?',
    values: [value],
});

export const eqGreaterThan = <T extends number | bigint>(
    value: T
): EqualityExpression<T, '>'> => ({
    operation: '>?',
    values: [value],
});

export const eqGreaterThanOrEqual = <T extends number | bigint>(
    value: T
): EqualityExpression<T, '>='> => ({
    operation: '>=?',
    values: [value],
});
