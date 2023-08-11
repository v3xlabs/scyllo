export type EqualityExpression<Op extends string> = {
    // type-script
    // .operation causes issues if op of e.g. 'contains' is assigned to 'in' because 'contains' contains 'in'
    __opName: Op;
    operation: `${string}${Op}${string}`;

    values: any[];
};

// clean this up at some point
export type NumberExpressions =
    | ReturnType<typeof eqLessThan>
    | ReturnType<typeof eqLessThanOrEqual>
    | ReturnType<typeof eqGreaterThan>
    | ReturnType<typeof eqGreaterThanOrEqual>
    | ReturnType<typeof eqIn>;

// TODO: support for more values for collection-like expressions
export type ExpressionByValue<Value> = Value extends (
    | string
    | number
    | bigint
)[]
    ? ReturnType<typeof eqContains>
    : Value extends number | bigint
    ? NumberExpressions
    : ReturnType<typeof eqIn>;

export const isEqualityExpression = (
    object: any
): object is EqualityExpression<any> =>
    typeof object === 'object' && object !== null && 'operation' in object;

// TODO: investigate how these things are compared and maybe add more types here
export const eqIn = <T extends (string | number | bigint)[]>(
    ...values: T
): EqualityExpression<'in'> => ({
    __opName: 'in',
    operation: ` in (${values.map((_) => '?').join(',')})`,
    values,
});

export const eqContains = <T extends string | number | bigint>(
    value: T
): EqualityExpression<'contains'> => ({
    __opName: 'contains',
    operation: ' contains ?',
    values: [value],
});

export const eqLessThan = <T extends number | bigint>(
    value: T
): EqualityExpression<'<'> => ({
    __opName: '<',
    operation: '<?',
    values: [value],
});

export const eqLessThanOrEqual = <T extends number | bigint>(
    value: T
): EqualityExpression<'<='> => ({
    __opName: '<=',
    operation: '<=?',
    values: [value],
});

export const eqGreaterThan = <T extends number | bigint>(
    value: T
): EqualityExpression<'>'> => ({
    __opName: '>',
    operation: '>?',
    values: [value],
});

export const eqGreaterThanOrEqual = <T extends number | bigint>(
    value: T
): EqualityExpression<'>='> => ({
    __opName: '>=',
    operation: '>=?',
    values: [value],
});
