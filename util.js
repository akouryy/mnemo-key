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
    constructor(sizes, fn = () => {}) {
        if(!Array.isArray(sizes)) sizes = [sizes];
        super(sizes[0]);
        this.sizes = sizes.slice();
        this.dimension = sizes.length;
        if(this.dimension === 0) throw new Yun.ArgumentError(
            'new Yun.Array([size+], fn): no size given.'
        );
        if(this.dimension > 1)
            for(let i = 0; i < this.length; i++)
                this[i] = new Yun.Array(sizes.slice(1));
        this.map_d_bang((_, indexes) => fn(...indexes));
    }

    at(i, ...js) {
        if(js.length === 0) return this[i];
        else return this[i].at(...js);
    }

    map_d(fn) {
        return new Yun.Array(this.sizes, (_, is) => fn(this.at(...is), is));
    }

    map_d_bang(fn, indexes = []) {
        const s = this.sizes[0];
        if(this.dimension === 1) {
            for(let i = 0; i < this.length; i++) this[i] = fn(this[i], [...indexes, i]);
        } else {
            for(let i = 0; i < this.length; i++) this[i].map_d_bang(fn, [...indexes, i]);
        }
    }

    flat_map(fn, indexes = []) {
        const a = new Yun.Array(0);
        if(this.dimension === 1) {
            for(let i = 0; i < this.length; i++) a.push(...fn(this[i], [...indexes, i]));
        } else {
            for(let i = 0; i < this.length; i++) a.push(...this[i].flat_map(fn, [...indexes, i]));
        }
        return a;
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
