//const Blocks = require('./block-configs.js');
'use strict';

function D(...args) { console.log(...args); return args[args.length - 1]; }

function setBlockRawKey(type) {
    if(type === 'empty') return;
    const block = Blocks[type];
    if(block.rawKey) return;
    if(block.preceding) {
        setBlockRawKey(block.preceding);
        block.rawKey = Blocks[block.preceding].rawKey + block.key;
    } else {
        block.rawKey = block.key;
    }
}
for(const type in Blocks) setBlockRawKey(type);

const BlockKeyMap = {};
for(const type in Blocks) {
    const block = Blocks[type];
    const preceding = block.preceding || 'default';
    if(!BlockKeyMap[block.key]) {
        BlockKeyMap[block.key] = {};
    }
    BlockKeyMap[block.key][preceding] = type;
}


const dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];

class Layer {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.blocks = new Yun.Array([height, width], _ => Object.freeze({type: Yun.None, rotate: 0}));
        this.blockUpdated = () => {};
    }

    updateBlock(y, x, {type = this.blocks[y][x].type, rotate = -1, rotateDiff = 0}) {
        if(rotate !== -1 && rotateDiff !== 0) throw new Yun.ArgumentError(
            "Layer#updateBlock(y, x, {type?, rotate|rotateDiff?}): " +
            "called with both rotate and rotateDiff specified."
        );

        const before = this.blocks[y][x];

        if(rotate === -1) {
            rotate = type.filter(t => Blocks[t].rotatable)
                         .fold(0, _ =>(before.rotate + rotateDiff + 4) % 4);
        }

        this.blocks[y][x] = Object.freeze({type: type, rotate: rotate});

        const change = {before: before, after: this.blocks[y][x]};
        this.blockUpdated(y, x, change);
        return change;
    }

    fromBoardData(save) {
        for(const b of save) {
            this.updateBlock(b.y, b.x, {type: Yun.Some(b.type), rotate: b.rotate});
        }
        return this;
    }

    toBoardData() {
        return this.blocks.flat_map((d, [y, x]) =>
            d.type.fold([], t => [{x: x, y: y, type: t, rotate: d.rotate}])
        );
    }
}

class Command {
    constructor({layer, selection, cursor}) {
        this.layer = layer;
        this.selection = selection;
        this.cursor = cursor;
    }
}

class RotateCommand extends Command {
    constructor(env, rotateDiff) {
        super(env);
        this.rotateDiff = rotateDiff;
    }
    exec(rotateDiff = this.rotateDiff) {
        const {x1, x2, y1, y2} = this.selection;
        for(let y = y1; y <= y2; y++) for(let x = x1; x <= x2; x++) {
            this.layer.updateBlock(y, x, {rotateDiff: rotateDiff});
        }
    }
    undo() {
        this.exec(-this.rotateDiff);
    }
}

class RotateResetCommand extends Command {
    constructor(env) {
        super(env);
    }
    exec() {
        const {x1, x2, y1, y2} = this.selection;
        this.before = [];
        for(let y = y1; y <= y2; y++) for(let x = x1; x <= x2; x++) {
            const {before: {rotate}} =
                this.layer.updateBlock(y, x, {rotate: 0});
            this.before.push({y: y, x: x, rotate: rotate});
        }
    }
    undo() {
        for(const {y, x, rotate} of this.before) {
            this.layer.updateBlock(y, x, {rotate: rotate});
        }
    }
}

class PutBlockCommand extends Command {
    constructor(env, blockType) {
        super(env);
        this.blockType = blockType;
    }
    exec() {
        const {x1, x2, y1, y2} = this.selection;
        this.before = [];
        for(let y = y1; y <= y2; y++) for(let x = x1; x <= x2; x++) {
            const {before: {type}} =
                this.layer.updateBlock(y, x, {type: this.blockType});
            this.before.push({y: y, x: x, blockType: type});
        }
    }
    undo() {
        for(const {y, x, blockType} of this.before) {
            this.layer.updateBlock(y, x, {type: blockType});
        }
    }
}


jQuery($ => {
    const $selectStage  = $('select[name=stage]');
    const $stageWidth   = $('#stage-width');
    const $stageHeight  = $('#stage-height');
    const $boardData    = $('input[name=board-data]');
    const $saveList     = $('#save-list');
    const $newSave      = $('#new-save').prop('disabled', true);
    const $newSaveList  = $('#new-save-list');
    const $newBoardData = $('input[name=new-board-data]');
    const $board        = $('#board');
    const $keyTable     = $('#key-table');
    const $keyModal     = $('#key-modal');
    $keyModal.find('i.ctrl').text(MCtrl);
    let stage = Stages[0];
    let boardData = [], newData = [];
    let board$Td, board, selectionStart; // initialized in initBoard().
    let boardX = 0, boardY = 0;
    let clipBoard = [];

    for(const s of Stages) {
        $selectStage.append($(`<option value=${s.name}>${s.title}</option>`));
    }

    const $keyTableFooter = $keyTable.children().remove();
    for(const row of BlockTable) {
        const $tr = $('<tr>').appendTo($keyTable);
        for(const cell of row) {
            $('<td>')
                .attr('title', `${cell} (${Blocks[cell].rawKey.toUpperCase()})`)
                .append(
                    $('<img>').attr('src', `https://mnemo.pro/image/${cell}.png`)
                )
                .appendTo($tr);
            $('<td>')
                .append($('<span>').text(Blocks[cell].rawKey.toUpperCase()))
                .appendTo($tr);
        }
    }
    $keyTableFooter.appendTo($keyTable);

    let fn;

    $selectStage.change(fn = () => {
        const name = $selectStage.val();
        stage = Stages.find(s => s.name === name);
        $stageWidth .text(stage.width);
        $stageHeight.text(stage.height);
        updateSaveList();
        initBoard({stageName: name, timestamp: 0, boardData: []});
    });
    fn();

    function _Imp_updateSaveList($list, data, showDataCond, additionalHTML) {
        $list.html('');
        for(const d of data) {
            if(showDataCond(d)) {
                const $li = $('<li>');
                $li.text(new Date(d.timestamp).toLocaleString() + ` [${d.boardData.length}]`);
                additionalHTML(d, $li);
                $li.click(() => {
                    $saveList.children().removeClass('focus');
                    $newSaveList.children().removeClass('focus');
                    $li.addClass('focus');
                    initBoard(d);
                });
                $list.append($li);
            }
        }
    }

    function updateSaveList() {
        _Imp_updateSaveList($saveList, boardData, d => d.stageName == stage.name, () => {});
    }
    function updateNewSaveList() {
        _Imp_updateSaveList($newSaveList, newData, _ => true /*show all*/, (d, $li) => {
            $li.html($li.html() + '<br/>' + d.stageName);
            const $span = $('<span>').text('[delete]').addClass('delete');
            $span.click(e => {
                $li.click();
                if(confirm('本当に削除しますか?')) {
                    newData = newData.filter(x => x !== d);
                    $newBoardData.val(JSON.stringify(boardData.concat(newData)));
                    $li.remove();
                    $span.off('click');
                    return false;
                }
            });
            $li.append($span);
        });
    }

    $boardData.change(fn = () => {
        $boardData.removeClass('error');
        try {
            boardData = JSON.parse($boardData.val());
            updateSaveList();
        } catch (err) {
            $boardData.addClass('error');
        }
    });
    fn();

    $newSave.click(saveNew);

    function saveNew() {
        newData.push({
            stageName: board.stageName,
            timestamp: Date.now(),
            boardData: board.layer.toBoardData(),
        });
        $newBoardData.val(JSON.stringify(boardData.concat(newData)));
        updateNewSaveList();
        alert("新しいセーブデータを localStorage.boardData に保存する前に、必ず以前の localStorage.boardData のバックアップをとってください。");
    }

    function initBoard(data) {
        const stage = Stages.find(s => s.name === data.stageName);
        $newSave.prop('disabled', false);

        board = {
            height: stage.height,
            width: stage.width,
            stageName: stage.name,
        };
        board.layer = new Layer(board.height, board.width).fromBoardData(data.boardData);
        board.layer.blockUpdated = blockUpdated;

        $board.html('');
        board$Td = [];
        for(const [y, row] of board.layer.blocks.entries()) {
            const $tr = $('<tr>').appendTo($board);
            const row$Td = [];
            board$Td.push(row$Td);

            for(const [x, cell] of row.entries()) {
                const $td = $('<td>').appendTo($tr);
                $td.addClass(`rotate-${cell.rotate}`);
                row$Td.push($td);
                for(const t of cell.type) {
                    const $img = $('<img>').appendTo($td);
                    $img.attr('src', `https://mnemo.pro/image/${t}.png`);
                }

                $td.click(e => {
                    changeBlockFocus(e.shiftKey, x, y);
                    $board.focus();
                    return false;
                });

                $td.mousedown(_ => false);
            }
        }
        $board.focus();

        selectionStart = [boardX, boardY] = [Math.floor(board.width / 2), 0];
        focusedBlock$Td().addClass('focus');
    }

    function focusedBlock() { return board.layer.blocks[boardY][boardX]; }
    function focusedBlock$Td() { return board$Td[boardY][boardX]; }

    function selectionCoordinates() {
        let [x1, y1] = selectionStart, x2 = boardX, y2 = boardY;
        if(x1 > x2) [x1, x2] = [x2, x1];
        if(y1 > y2) [y1, y2] = [y2, y1];
        return [x1, y1, x2, y2];
    }
    function forEachSelection(fn1, fn2) {
        let rowFn, cellFn;
        if(fn2 === void 0) {
            rowFn = () => {};
            cellFn = fn1;
        } else {
            rowFn = fn1;
            cellFn = fn2;
        }
        const [x1, y1, x2, y2] = selectionCoordinates();
        for(let y = y1; y <= y2; y++) {
            rowFn(y);
            for(let x = x1; x <= x2; x++) {
                cellFn(x, y);
            }
        }
    }

    function changeBlockFocus(shiftKey, x, y) {
        boardX = x;
        boardY = y;
        if(boardX < 0)             boardX = board.width - 1;
        if(boardX >= board.width)  boardX = 0;
        if(boardY < 0)             boardY = board.height - 1;
        if(boardY >= board.height) boardY = 0;

        if(!shiftKey) {
            selectionStart = [boardX, boardY];
        }

        $board.find('td').removeClass('focus').removeClass('selection');
        focusedBlock$Td().addClass('focus');
        forEachSelection((x, y) => board$Td[y][x].addClass('selection'));
    }

    function blockUpdated(y, x, d) {
        const $td = board$Td[y][x];
        $td.html('');
        $td.removeClass(`rotate-${d.before.rotate}`);
        $td.addClass(`rotate-${d.after.rotate}`);
        for(const t of d.after.type) {
            const $img = $('<img>').appendTo($td);
            $img.attr('src', `https://mnemo.pro/image/${t}.png`);
        }
    }

    let commandHistory = Yun([]), commandIndex = -1;
    function execCommand(commandClass, ...args) {
        const [x1, y1, x2, y2] = selectionCoordinates();
        const command = new commandClass({
            layer: board.layer,
            selection: {x1: x1, y1: y1, x2: x2, y2: y2},
            cursor: {x: boardX, y: boardY}
        }, ...args);
        command.exec();
        commandIndex += 1;
        if(commandIndex !== commandHistory.length) {
            commandHistory = commandHistory.slice(0, commandIndex);
        }
        commandHistory.push(command);
    }
    function undoCommand() {
        if(commandIndex >= 0) {
            commandHistory[commandIndex].undo();
            commandIndex -= 1;
        }
    }
    function redoCommand() {
        if(commandIndex < commandHistory.length - 1) {
            commandIndex += 1;
            commandHistory[commandIndex].exec();
        }
    }

    function copy() {
        const data = [];
        const [x1, y1, x2, y2] = selectionCoordinates();
        forEachSelection(y => data.push([]), (x, y) => {
            data[y - y1].push(board.layer.blocks[y][x]);
        });
        clipBoard.push({
            stageName: board.stageName,
            timestamp: Date.now(),
            width: x2 - x1 + 1,
            height: y2 - y1 + 1,
            boardData: data,
        });
    }

    function paste() {
        const clip = clipBoard[clipBoard.length - 1], data = clip.boardData;
        const [x, y] = selectionStart = [
            Math.min(boardX + clip.width - 1, board.width - 1),
            Math.min(boardY + clip.height - 1, board.height - 1)
        ];
        forEachSelection((x, y) => {
            const c = data[y - boardY][x - boardX];
            board.layer.updateBlock(y, x, {type: c.type, rotate: c.rotate});
        });
        changeBlockFocus(true, boardX, boardY);
    }

    const isBoardFocus = () => !$keyModal.is(':visible') && $board.is(':focus');
    const keyDownB = (o, d, f) => registerKeyDown(o, d, e => { if(isBoardFocus()) f(e); });

    keyDownB('S', 'left',  e => changeBlockFocus(e.shiftKey, boardX - 1, boardY));
    keyDownB('S', 'right', e => changeBlockFocus(e.shiftKey, boardX + 1, boardY));
    keyDownB('S', 'up',    e => changeBlockFocus(e.shiftKey, boardX, boardY - 1));
    keyDownB('S', 'down',  e => changeBlockFocus(e.shiftKey, boardX, boardY + 1));
    keyDownB('S', 'pageup',   e => changeBlockFocus(e.shiftKey, boardX, 0));
    keyDownB('S', 'pagedown', e => changeBlockFocus(e.shiftKey, boardX, -1));
    keyDownB('S', 'home',     e => changeBlockFocus(e.shiftKey, 0, boardY));
    keyDownB('S', 'end',      e => changeBlockFocus(e.shiftKey, -1, boardY));
    keyDownB('',  'space', _ => execCommand(RotateCommand, +1));
    keyDownB('s', 'space', _ => execCommand(RotateCommand, -1));
    keyDownB('c', 'space', _ => execCommand(RotateResetCommand));
    keyDownB('', 'backspace', _ => execCommand(PutBlockCommand, Yun.None));
    keyDownB('', 'delete',    _ => execCommand(PutBlockCommand, Yun.None));
    keyDownB('c', 'a', _ => {
        selectionStart = [0, 0];
        changeBlockFocus(true, -1, -1);
    });
    keyDownB('c', 'c', _ => copy());
    keyDownB('c', 'x', _ => { copy(); execCommand(PutBlockCommand, Yun.None); });
    keyDownB('c', 'v', _ => paste());
    keyDownB('c', 's', _ => saveNew());
    keyDownB('c', 'y', _ => redoCommand());
    keyDownB('c', 'z', _ => undoCommand());
    keyDownB('s', '/', _ => { $keyModal.show(300); $keyModal.focus(); });


    $(document).keydown(e => {
        const target = e.target.tagName.toLowerCase();
        if(['form', 'input', 'select', 'option', 'button'].includes(target)) return;
        if($keyModal.is(':visible')) {
            return keydownOnKeyModal(e);
        }
    });


    $(document).keypress($board, e => {
        const target = e.target.tagName.toLowerCase();
        if(['form', 'input', 'select', 'option', 'button', 'side'].includes(target)) return;
        if($keyModal.is(':visible')) {
            return; // keydownOnKeyModal(e);
        }

        if(!e.ctrlKey) {
            if($board.is(':focus')) {
                const c = String.fromCharCode(e.which).toLowerCase();
                const m = BlockKeyMap[c];
                if(!m) return;
                const b = focusedBlock().type.flat_map(t => Yun.Maybe.new_u(m[t]))
                                             .get_or(m.default);
                if(b) {
                    execCommand(PutBlockCommand, Yun.Some(b));
                    return false;
                }
            }
        }
    });

    function keydownOnKeyModal(e) {
        switch(e.which) {
        case 191: // /?
            if(e.shiftKey) {
                $keyModal.hide(300);
                $board.focus();
                return false;
            }

        case 27: // Esc
            $keyModal.hide(300);
            $board.focus();
            return false;
        }
    }
});
