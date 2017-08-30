'use strict';

const KeyCodes = {
left: 37, up: 38, right: 39, down: 40,
pageup: 33, pagedown: 34, end: 35, home: 36,
space: 32, backspace: 8, delete: 46,
slash: 191, '/': 191,
};

for(let i = 65; i <= 90; i++) KeyCodes[String.fromCharCode(i).toLowerCase()] = i;


const KeyDownEvents = {};

function registerKeyDown(SCA, key, fn) {
    if(typeof key === 'string' || key instanceof String) {
        key = KeyCodes[key.toLowerCase()];
        if(!key) throw Yun.ArgumentError(
            `registerKeyDown({...}, key, fn): keyCode of '${key}' not found.`
        );
    }

    const shift = SCA.includes('s') ? [true] : SCA.includes('S') ? [true, false] : [false];
    const ctrl  = SCA.includes('c') ? [true] : SCA.includes('C') ? [true, false] : [false];
    const alt   = SCA.includes('a') ? [true] : SCA.includes('A') ? [true, false] : [false];

    for(const s of shift) for(const c of ctrl) for(const a of alt) {
        const k = [s, c, a, key];
        if(!KeyDownEvents[k]) KeyDownEvents[k] = [];
        KeyDownEvents[k].push(fn);
    }

}

jQuery($ => {
    $(document).keydown(ev => {
        const target = ev.target.tagName.toLowerCase();
        if(['form', 'input', 'select', 'option', 'button'].includes(target)) return;

        const events = KeyDownEvents[[ev.shiftKey, MCtrlKey(ev), ev.altKey, ev.which]];
        if(events) {
            for(const fn of events) {
                fn(ev);
            }
            return false;
        }
    });
});
