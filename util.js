const Yun = {};

Yun.ArgumentError = class ArgumentError extends Error {};

Yun.Arrays = class Arrays {
    static new_repeat(...args) {
        if(args.length < 2) throw new Yun.ArgumentError(
            `Yun.Array.new_repeat(size+, val): called with ${args.length} argument(s).`
        );
        const val = args.pop(), size = args.shift();
        const ret = new Array(size);
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
        const ret = new Array(size);
        if(args.length == 0) {
            for(let i = 0; i < size; i++) ret[i] = fn(i);
        } else {
            for(let i = 0; i < size; i++) ret[i] = this.new_repeat_fn(...args, (...a) => fn(i,...a));
        }
        return ret;
    }
};
