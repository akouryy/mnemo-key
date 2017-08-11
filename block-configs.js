/**
 * FORKED FROM https://github.com/tsg-ut/mnemo/blob/master/lib/block-configs.js (MIT LICENSE)
 */

//const util = require('./util');

Blocks = {
    empty: {
        type: 'empty',
        io: {},
    },
    wireI: {
        type: 'wire',
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 1,
        rotatable: true,
        key: 'i',
    },
    wireL: {
        type: 'wire',
        io: {
            plugs: ['top', 'right'],
        },
        weight: 1,
        rotatable: true,
        key: 'l',
    },
    wireT: {
        type: 'wire',
        io: {
            plugs: ['right', 'top', 'left'],
        },
        weight: 1,
        rotatable: true,
        key: 't',
    },
    wireXdot: {
        type: 'wire',
        io: {
            plugs: ['right', 'top', 'left', 'bottom'],
        },
        weight: 1,
        rotatable: false,
        key: 'x',
    },
    wireX: {
        type: 'wireF',
        io: {
            flow: {
                top: ['bottom'],
                bottom: ['top'],
                left: ['right'],
                right: ['left'],
            },
        },
        weight: 1,
        key: 'x', preceding: 'wireXdot',
    },
    junctionR: {
        type: 'wireF',
        io: {
            flow: {
                top: ['right'],
                left: ['right'],
                right: ['top', 'left'],
            },
        },
        weight: 2,
        rotatable: true,
        key: 'j',
    },
    junctionL: {
        type: 'wireF',
        io: {
            flow: {
                top: ['left'],
                right: ['left'],
                left: ['top', 'right'],
            },
        },
        weight: 2,
        rotatable: true,
        key: 'j', preceding: 'junctionR',
    },
    junctionT: {
        type: 'wireF',
        io: {
            flow: {
                top: ['left', 'right'],
                right: ['top'],
                left: ['top'],
            },
        },
        weight: 2,
        rotatable: true,
        key: 't', preceding: 'junctionR',
    },
    'times-2': {
        type: 'calc',
        func: (n) => n * 2,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '2', preceding: 'mul',
    },
    'times-3': {
        type: 'calc',
        func: (n) => n * 3,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '3', preceding: 'mul',
    },
    'times-10': {
        type: 'calc',
        func: (n) => n * 10,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '1', preceding: 'mul',
    },
    'add-3': {
        type: 'calc',
        func: (n) => n + 3,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '3', preceding: 'add',
    },
    'plus-1': {
        type: 'calc',
        func: (n) => n + 1,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '1', preceding: 'add',
    },
    'plus-2': {
        type: 'calc',
        func: (n) => n + 2,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '2', preceding: 'add',
    },
    'minus-1': {
        type: 'calc',
        func: (n) => n - 1,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '1', preceding: 'sub',
    },
    'div-2': {
        type: 'calc',
        func: (n) => Math.round((n - n % 2) / 2),

        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '2', preceding: 'div',
    },
    'div-3': {
        type: 'calc',
        func: (n) => Math.round((n - n % 3) / 3),
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '3', preceding: 'div',
    },
    'div-10': {
        type: 'calc',
        func: (n) => Math.round((n - n % 10) / 10),
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '1', preceding: 'div',
    },
    'minus-2': {
        type: 'calc',
        func: (n) => n - 2,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '2', preceding: 'sub',
    },
    log10: {
        type: 'calc',
        func: (n) => n === 0 ? -Infinity : util.log(10, Math.abs(n)),
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '1', preceding: 'log',
    },
    log2: {
        type: 'calc',
        func: (n) => n === 0 ? -Infinity : util.log(2, Math.abs(n)),
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '2', preceding: 'log',
    },
    'const-0': {
        type: 'calc',
        func: () => 0,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '0',
    },
    'const-1': {
        type: 'calc',
        func: () => 1,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '1',
    },
    'const-2': {
        type: 'calc',
        func: () => 2,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '2',
    },
    'const-3': {
        type: 'calc',
        func: () => 3,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '3',
    },
    'const-10': {
        type: 'calc',
        func: () => 10,
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: '0', preceding: 'const-1',
    },
    add: {
        type: 'calc2',
        func: (a, b) => a + b,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '+',
    },
    sub: {
        type: 'calc2',
        func: (a, b) => a - b,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '-',
    },
    mul: {
        type: 'calc2',
        func: (a, b) => a * b,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '*',
    },
    div: {
        type: 'calc2',
        func: (a, b) => {
            if (b === 0) {
                return a / b;
            }
            return Math.round((a - a % b) / b);
        },
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '/',
    },
    mod: {
        type: 'calc2',
        func: (a, b) => a % b,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '%',
    },
    pow: {
        type: 'calc2',
        func: (a, b) => {
            if (a === 1 && (b === Infinity || b === -Infinity)) {
                return 1;
            }
            return util.floorTowardsZero(Math.pow(a, b));
        },
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '*', preceding: 'mul',
    },
    log: {
        type: 'calc2',
        func: (a, b) => b === 0 ? -Infinity : util.log(Math.abs(a), Math.abs(b)),
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: 'o', preceding: 'wireL',
    },
    sqrt: {
        type: 'calc',
        func: (n) => n < 0 ? 0 : Math.floor(Math.sqrt(n)),
        io: {
            plugs: ['top', 'bottom'],
        },
        weight: 2,
        rotatable: true,
        onRotatableWire: true,
        key: 'r',
    },
    'bitshift-left': {
        type: 'calc2',
        func: (a, b) => a << b,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '<', preceding: 'lt',
    },
    'bitshift-right': {
        type: 'calc2',
        func: (a, b) => a >> b,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '>', preceding: 'gt',
    },
    'bitwise-and': {
        type: 'calc2',
        func: (a, b) => a & b,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '&',
    },
    'bitwise-or': {
        type: 'calc2',
        func: (a, b) => a | b,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '|',
    },
    'bitwise-xor': {
        type: 'calc2',
        func: (a, b) => a ^ b,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '^',
    },
    equal: {
        type: 'calc2',
        func: (a, b) => a === b ? 1 : 0,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '=',
    },
    neq: {
        type: 'calc2',
        // eslint-disable-next-line no-negated-condition
        func: (a, b) => a !== b ? 1 : 0,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '=', preceding: 'not',
    },
    gt: {
        type: 'calc2',
        func: (a, b) => a > b ? 1 : 0,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '>',
    },
    geqq: {
        type: 'calc2',
        func: (a, b) => a >= b ? 1 : 0,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '=', preceding: 'gt',
    },
    lt: {
        type: 'calc2',
        func: (a, b) => a < b ? 1 : 0,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '<',
    },
    leqq: {
        type: 'calc2',
        func: (a, b) => a <= b ? 1 : 0,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '=', preceding: 'lt'
    },
    conditional: {
        type: 'calc2',
        func: (a, b, c) => a ? b : c,
        io: {
            in: ['top', 'left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '?',
    },
    diode: {
        type: 'calc2',
        func: (a) => a,
        io: {
            in: ['right'],
            out: 'left',
        },
        weight: 3,
        rotatable: true,
        key: 'd',
    },
    'c-contact': {
        type: 'calc-switch',
        func: (a) => ({
            directionIndex: a ? 1 : 0,
            value: 1,
        }),
        io: {
            in: ['top'],
            out: ['left', 'right'],
        },
        weight: 3,
        rotatable: true,
        key: 'c',
    },
    transistor: {
        type: 'calc-switch',
        func: (a, b) => ({
            directionIndex: a ? 1 : 0,
            value: b,
        }),
        io: {
            in: ['top', 'left'],
            out: ['bottom', 'right'],
        },
        weight: 3,
        rotatable: true,
        key: 't', preceding: 'wireT'
    },
    and: {
        type: 'calc2',
        func: (a, b) => (a !== 0 && b !== 0) ? 1 : 0,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '&', preceding: 'bitwise-and',
    },
    or: {
        type: 'calc2',
        func: (a, b) => (a !== 0 || b !== 0) ? 1 : 0,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '|', preceding: 'bitwise-or',
    },
    nand: {
        type: 'calc2',
        func: (a, b) => (a !== 0 && b !== 0) ? 0 : 1,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '&', preceding: 'not',
    },
    nor: {
        type: 'calc2',
        func: (a, b) => (a !== 0 || b !== 0) ? 0 : 1,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '|', preceding: 'not',
    },
    not: {
        type: 'calc2',
        func: (a) => a === 0 ? 1 : 0,
        io: {
            in: ['top'],
            out: 'bottom',
        },
        weight: 3,
        rotatable: true,
        onRotatableWire: true,
        key: '!',
    },
    xor: {
        type: 'calc2',
        func: (a, b) => (a !== 0 ^ b !== 0) ? 1 : 0,
        io: {
            in: ['left', 'right'],
            out: 'bottom',
        },
        weight: 3,
        key: '^', preceding: 'bitwise-xor',
    },
};
