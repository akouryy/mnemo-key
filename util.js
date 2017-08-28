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
