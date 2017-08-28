//const Blocks = require('./block-configs.js');
'use strict';

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
        this.data = Yun.Array.new_repeat(
            height, width, Object.freeze({type: null, rotate: 0})
        );
        Object.freeze(this.data);
    }

    updateBlock(y, x, {type = this.data[y][x].type, rotate = -1, rotateDiff = 0}) {
        if(rotate !== -1 && rotateDiff !== 0) throw new Yun.ArgumentError(
            "Layer#updateBlock(y, x, {type?, rotate|rotateDiff?}): " +
            "called with both rotate and rotateDiff specified."
        );

        const before = this.data[y][x];

        if(rotate === -1) {
            rotate = type && Blocks[type].rotatable ? (before.rotate + rotateDiff + 4) % 4 : 0;
        }

        this.data[y][x] = Object.freeze({type: type, rotate: rotate});

        return {before: before, after: this.data[y][x]};
    }

    fromBoardData(save) {
        for(const b of save) {
            this.updateBlock(b.y, b.x, {type: b.type, rotate: b.rotate});
        }
        return this;
    }

    toBoardData() {
        return this.data.flat_map((dy, y) => dy.flat_map((d, x) =>
            d.type !== null ? [{x: x, y: y, type: d.type, rotate: d.rotate}] : []
        ));
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
    let stage = Stages[0];
    let boardData = [], newData = [];
    let board$Td = null;
    let board = null;
    let boardX = 0, boardY = 0;
    let selectionStart = null;
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
        if(!board) return;
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

        $board.html('');
        board$Td = [];
        for(const [y, row] of board.layer.data.entries()) {
            const $tr = $('<tr>').appendTo($board);
            const row$Td = [];
            board$Td.push(row$Td);

            for(const [x, cell] of row.entries()) {
                const $td = $('<td>').appendTo($tr);
                $td.addClass(`rotate-${cell.rotate}`);
                row$Td.push($td);
                if(cell.type !== null) {
                    const $img = $('<img>').appendTo($td);
                    $img.attr('src', `https://mnemo.pro/image/${cell.type}.png`);
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

    function focusedBlock() { return board.layer.data[boardY][boardX]; }
    function focusedBlock$Td() { return board$Td[boardY][boardX]; }

    function selectionCoordinates() {
        let [x1, y1] = selectionStart, x2 = boardX, y2 = boardY;
        if(x1 > x2) [x1, x2] = [x2, x1];
        if(y1 > y2) [y1, y2] = [y2, y1];
        return [x1, y1, x2, y2];
    }
    function forEachSelection(fn1, fn2 = null) {
        let rowFn, cellFn;
        if(fn2 === null) {
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
        if(!board) return;

        if(shiftKey && selectionStart === null) {
            selectionStart = [boardX, boardY];
        }

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

    function updateBlock({x = boardX, y = boardY, type, rotate, rotateDiff}) {
        const d = board.layer.updateBlock(y, x, {type: type, rotate: rotate, rotateDiff: rotateDiff});

        const $td = board$Td[y][x];
        $td.html('');
        $td.removeClass(`rotate-${d.before.rotate}`);
        $td.addClass(`rotate-${d.after.rotate}`);
        if(d.after.type !== null) {
            const $img = $('<img>').appendTo($td);
            $img.attr('src', `https://mnemo.pro/image/${d.after.type}.png`);
        }
    }

    function updateBlockSelection({type, rotate, rotateDiff}) {
        forEachSelection((x, y) =>
            updateBlock({x: x, y: y, type: type, rotate: rotate, rotateDiff: rotateDiff})
        );
    }

    $(document).keydown(e => {
        const target = e.target.tagName.toLowerCase();
        if(['form', 'input', 'select', 'option', 'button'].includes(target)) return;
        if($keyModal.is(':visible')) {
            return keydownOnKeyModal(e);
        }

        if($board.is(':focus')) {
            switch(e.keyCode) {
            case 37: case 38: case 39: case 40: // ←↑→↓
                changeBlockFocus(e.shiftKey, boardX + dx[e.which - 37], boardY + dy[e.which - 37]);
                return false;

            case 33: // PageUp
                changeBlockFocus(e.shiftKey, boardX, 0); return false;
            case 34: // PageDown
                changeBlockFocus(e.shiftKey, boardX, -1); return false;
            case 35: // Home
                changeBlockFocus(e.shiftKey, -1, boardY); return false;
            case 36: // End
                changeBlockFocus(e.shiftKey, 0, boardY); return false;

            case 32: // space
                if(e.ctrlKey) {
                    updateBlockSelection({rotate: 0});
                } else {
                    if(e.shiftKey) {
                        updateBlockSelection({rotateDiff: -1});
                    } else {
                        updateBlockSelection({rotateDiff: +1});
                    }
                }
                return false;

            case 8: case 46: // backspace, delete
                updateBlockSelection({type: null});
                return false;

            case 65: // a
                if(e.ctrlKey) {
                    selectionStart = [0, 0];
                    changeBlockFocus(true, -1, -1);
                    return false;
                }

            case 67: case 88: // cx
                if(e.ctrlKey) {
                    const data = [];
                    const [x1, y1, x2, y2] = selectionCoordinates();
                    forEachSelection(y => data.push([]), (x, y) => {
                        data[y - y1].push(board.layer.data[y][x]);
                    });
                    if(e.which == 88) updateBlockSelection({type: null});
                    clipBoard.push({
                        stageName: board.stageName,
                        timestamp: Date.now(),
                        width: x2 - x1 + 1,
                        height: y2 - y1 + 1,
                        boardData: data,
                    });
                    return false;
                }

            case 86: // v
                if(e.ctrlKey) {
                    const clip = clipBoard[clipBoard.length - 1], data = clip.boardData;
                    const [x, y] = selectionStart = [
                        Math.min(boardX + clip.width - 1, board.width - 1),
                        Math.min(boardY + clip.height - 1, board.height - 1)
                    ];
                    forEachSelection((x, y) => {
                        const c = data[y - boardY][x - boardX];
                        updateBlock({x: x, y: y, type: c.type, rotate: c.rotate});
                    });
                    changeBlockFocus(true, boardX, boardY);
                    return false;
                }

            case 83: // s
                if(e.ctrlKey) {
                    saveNew();
                    return false;
                }

            case 191: // /?
                if(e.shiftKey) {
                    $keyModal.show(300);
                    $keyModal.focus();
                    return false;
                }
            }
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
                const b = m[focusedBlock().type] || m.default;
                if(b) {
                    updateBlockSelection({type: b});
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
