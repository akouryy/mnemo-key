const G = this;

const Yun = function Yun(arg) {
    if(Array.isArray(arg)) {
        if(arg.length === 1) {
            let r = new Yun.Array();
            r.push(arg[0]);
            return r;
        }
        return new Yun.Array(...arg);
    }
    throw new Yun.ArgumentError(
        `Yun(array): unknown type argument ${arg.constructor}.`
    );
}

Yun.ArgumentError = class ArgumentError extends Error {};

Yun.Array = class YunArray extends G.Array {
    static new_repeat(...args) {
        if(args.length < 2) throw new Yun.ArgumentError(
            `Yun.Array.new_repeat(size+, val): called with ${args.length} argument(s).`
        );
        const val = args.pop(), size = args.shift();
        const ret = new this(size);
        ret.dimension = args.length + 1;
        if(args.length == 0) {
            for(let i = 0; i < size; i++) ret[i] = val;
        } else {
            for(let i = 0; i < size; i++) ret[i] = this.new_repeat(...args, val);
        }
        return ret;
    }
    static new_repeat_fn(...args) {
        if(args.length < 2) throw new Yun.ArgumentError(
            `Yun.Array.new_repeat_fn(size+, fn): called with ${args.length} argument(s).`
        );
        const fn = args.pop(), size = args.shift();
        const ret = new this(size);
        ret.dimension = args.length + 1;
        if(args.length == 0) {
            for(let i = 0; i < size; i++) ret[i] = fn(i);
        } else {
            for(let i = 0; i < size; i++) ret[i] = this.new_repeat_fn(...args, (...a) => fn(i,...a));
        }
        return ret;
    }

    flat_map(f) {
        let g = Yun([]).concat(...this.map((...args)=>f(...args)));
        return g;
    }
};

Yun.Maybe = class Maybe {
    static new_u(val) { return val !== void 0 ? Yun.Some(val) : Yun.None; }
    static new_un(val) { return val !== void 0 && val !== null ? Yun.Some(val) : Yun.None; }
    static new_f(val) { return val ? Yun.Some(val) : Yun.None; }
    static new_if(cond, val) { return cond ? Yun.Some(val) : Yun.None; }
    static new_if_fn(cond, fn) { return cond ? Yun.Some(fn()) : Yun.None; }

    constructor(some, val) { this.some = some; if(some) this.val = val; }

    *[Symbol.iterator]() { if(this.some) yield this.val; }

    forEach(f) { if(this.some) f(this.val); }

    map(f) { return this.some ? Yun.Some(f(this.val)) : Yun.None; }

    flat_map(f) { return this.some ? f(this.val) : Yun.None; }

    filter(f) { return this.some && f(this.val) ? this : Yun.None; }

    fold   (if_none, f) { return this.some ? f(this.val) : if_none; }
    fold_fn(if_none, f) { return this.some ? f(this.val) : if_none(); }

    get_bang() {
        if(this.some) return this.value;
        throw new Yun.ArgumentError('Yun.Maybe.get!(): this is None.');
    }

    get_or   (if_none) { return this.some ? this.val : if_none; }
    get_or_fn(if_none) { return this.some ? this.val : if_none(); }
};

Yun.None = new Yun.Maybe(false);

Yun.Some = (val) => new Yun.Maybe(true, val);
