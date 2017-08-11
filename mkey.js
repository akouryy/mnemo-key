//const Blocks = require('./block-configs.js');

const BlockTable = [
    ['wireI', 'wireL', 'wireT', 'wireX'],
    ['wireXdot', 'junctionR', 'junctionL', 'junctionT'],
    ['add','plus-1','plus-2','add-3'],
    ['sub','minus-1','minus-2'],
    ['mul','times-2','times-3','times-10'],
    ['div','div-2','div-3','div-10'],
    ['mod','sqrt'],
    ['pow','log','log2','log10'],
    ['const-0','const-1','const-2','const-3'],
    ['const-10','bitwise-and','bitwise-or','bitwise-xor'],
    ['bitshift-left','bitshift-right','equal','neq'],
    ['gt','geqq','lt','leqq'],
    ['and','nand','or','nor'],
    ['xor','not'],
    ['conditional','diode','c-contact','transistor']
];

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

BlockKeyMap = {};
for(const type in Blocks) {
    const block = Blocks[type];
    const preceding = block.preceding || 'default';
    if(!BlockKeyMap[block.key]) {
        BlockKeyMap[block.key] = {};
    }
    BlockKeyMap[block.key][preceding] = type;
}
console.log(BlockKeyMap);


/**
 * STAGE DATA: FROM https://github.com/tsg-ut/mnemo/tree/master/stages (MIT LICENSE)
 */

const Stages = [
    {name:"wire01",              width:3,  height:3,  title:"練習"},
    {name:"calc01",              width:3,  height:3,  title:"四則演算 -基本- 1"},
    {name:"calc02",              width:5,  height:5,  title:"四則演算 -基本- 2"},
    {name:"calc03",              width:5,  height:5,  title:"四則演算 -基本- 3"},
    {name:"calc04",              width:5,  height:5,  title:"四則演算 -基本- 4"},
    {name:"calc05",              width:5,  height:5,  title:"四則演算 -基本- 5"},
    {name:"calc06",              width:3,  height:2,  title:"四則演算 -基本- 6"},
    {name:"make-minus-one-easy", width:5,  height:5,  title:"-1を作ろう -easy-"},
    {name:"division-easy",       width:5,  height:5,  title:"割り算 -easy-"},
    {name:"sixth-power",         width:5,  height:5,  title:"6乗"},
    {name:"remainder",           width:5,  height:10, title:"余りの計算"},
    {name:"plus-32",             width:5,  height:8,  title:"32を足してみよう"},
    {name:"conditional01",       width:9,  height:7,  title:"条件分岐 -基本- 1"},
    {name:"conditional02",       width:11, height:11, title:"条件分岐 -基本- 2"},
    {name:"conditional03",       width:9,  height:9,  title:"条件分岐 -基本- 3"},
    {name:"factorial",           width:13, height:13, title:"階乗"},
    {name:"parity",              width:19, height:19, title:"パリティ"},
    {name:"fibonacci",           width:11, height:11, title:"フィボナッチ数"},
    {name:"bivariation01",       width:5,  height:5,  title:"2変数 -基本-"},
    {name:"power-easy",          width:9,  height:9,  title:"累乗 -easy-"},
    {name:"power-hard",          width:15, height:15, title:"累乗 -hard-"},
    {name:"division-hard",       width:5,  height:5,  title:"割り算 -hard-"},
    {name:"gcd",                 width:13, height:13, title:"最大公約数"},
    {name:"lcm",                 width:11, height:11, title:"最小公倍数"},
    {name:"make-minus-one-med",  width:5,  height:10, title:"-1を作ろう -med-"},
    {name:"make-minus-one-hard", width:7,  height:9,  title:"-1を作ろう -hard-"},
    {name:"sqrt-easy",           width:9,  height:9,  title:"平方根 -easy-"},
    {name:"sqrt-hard",           width:15, height:15, title:"平方根 -hard-"},
    {name:"complement-of-2",     width:7,  height:7,  title:"2の補数"},
    {name:"binarian-easy",       width:15, height:15, title:"バイナリアン -easy-"},
    {name:"perfect-number",      width:5,  height:5,  title:"完全数"},
    {name:"reversal",            width:15, height:15, title:"反転"},
    {name:"msd",                 width:15, height:15, title:"最上位の桁"},
    {name:"mod3-hard",           width:19, height:19, title:"mod3 -hard-"},
    {name:"seq01",               width:11, height:11, title:"配列 -基本- 1"},
    {name:"seq02",               width:11, height:11, title:"配列 -基本- 2"},
    {name:"max",                 width:11, height:11, title:"最大値"},
    {name:"the-fifth-max",       width:31, height:31, title:"中央値"},
    {name:"100",                 width:9,  height:8,  title:"100"},
    {name:"100-again",           width:5,  height:5,  title:"100再び"},
    {name:"1000",                width:5,  height:5,  title:"1000"},
    {name:"plus-32-hard",        width:3,  height:6,  title:"32を足してみよう-hard-"},
    {name:"xor",                 width:5,  height:5,  title:"XOR"},
    {name:"2017",                width:9,  height:9,  title:"2017"},
    {name:"repeat-self",         width:9,  height:9,  title:"自己反復"},
    {name:"fibonacci-hard",      width:13, height:13, title:"フィボナッチ数 -hard-"},
    {name:"factorization",       width:11, height:11, title:"因数分解"},
    {name:"spaceship",           width:7,  height:7,  title:"宇宙船"},
    {name:"addition-med",        width:7,  height:7,  title:"足し算 -med-"},
    {name:"10000th-digit",       width:13, height:13, title:"10000桁目"},
    {name:"8809",                width:13, height:13, title:"8809=6"},
];


const dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];


jQuery($ => {
    const $selectStage  = $('select[name=stage]');
    const $stageWidth   = $('#stage-width');
    const $stageHeight  = $('#stage-height');
    const $boardData    = $('input[name=board-data]')
    const $saveList     = $('#save-list');
    const $newSave      = $('#new-save').prop('disabled', true);
    const $newSaveList  = $('#new-save-list');
    const $newBoardData = $('input[name=new-board-data]');
    const $board        = $('#board');
    const $blockTable   = $('#block-table');
    let stage = Stages[0];
    let boardData = [], newData;
    let board$Td = null;
    let board = null;
    let boardX = 0, boardY = 0;

    for(const s of Stages) {
        $selectStage.append($(`<option value=${s.name}>${s.title}</option>`));
    }

    for(const row of BlockTable) {
        const $tr = $('<tr>').appendTo($blockTable);
        for(const cell of row) {
            const $td = $('<td>').appendTo($tr);
            $td.attr('title', `${cell} (${Blocks[cell].rawKey.toUpperCase()})`);
            const $img = $('<img>').appendTo($td);
            $img.attr('src', `https://mnemo.pro/image/${cell}.png`);
            $tr.append($(`<td><span>${Blocks[cell].rawKey.toUpperCase()}</span></td>`));
        }
    }

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

    function updateSaveList() {
        $saveList.html('');
        for(const d of boardData) {
            if(d.stageName == stage.name) {
                const $li = $('<li>');
                $li.text(new Date(d.timestamp).toLocaleString() + ` (${d.boardData.length} blocks)`);
                $li.click(() => {
                    $saveList.children().removeClass('focus');
                    $li.addClass('focus');
                    initBoard(d);
                });
                $saveList.append($li);
            }
        }
    }

    $boardData.change(fn = () => {
        $boardData.removeClass('error');
        try {
            boardData = JSON.parse($boardData.val());
            newData = boardData.slice();
            updateSaveList();
        } catch (err) {
            $boardData.addClass('error');
        }
    });
    fn();

    $newSave.click(() => {
        if(!board) return;
        const data = [];
        for(let y = 0; y < board.height; y++) {
            for(let x = 0; x < board.width; x++) {
                if(board[y][x].type !== null) {
                    data.push({x: x, y: y, type: board[y][x].type, rotate: board[y][x].rotate});
                }
            }
        }
        newData.push({stageName: board.stageName, timestamp: Date.now(), boardData: data});
        $newBoardData.val(JSON.stringify(newData));
        alert("新しいセーブデータを localStorage.boardData に保存する前に、必ず以前の localStorage.boardData のバックアップをとってください。");
    });


    function initBoard(data) {
        $newSave.prop('disabled', false);

        board = [];
        for(let i = 0; i < stage.height; i++) {
            board.push([]);
            for(let j = 0; j < stage.width; j++) {
                board[i].push({type: null, rotate: 0});
            }
        }
        for(const d of data.boardData) {
            board[d.y][d.x] = {type: d.type, rotate: d.rotate};
        }
        board.width  = stage.width;
        board.height = stage.height;
        board.stageName = stage.name;

        $board.html('');
        board$Td = [];
        for(const row of board) {
            const $tr = $('<tr>').appendTo($board);
            const row$Td = [];
            board$Td.push(row$Td);

            for(const cell of row) {
                const $td = $('<td>').appendTo($tr);
                $td.addClass(`rotate-${cell.rotate}`);
                row$Td.push($td);
                if(cell.type !== null) {
                    const $img = $('<img>').appendTo($td);
                    $img.attr('src', `https://mnemo.pro/image/${cell.type}.png`);
                }
            }
        }

        boardX = Math.floor(board.width / 2);
        boardY = 0;
        focusedBlock$Td().addClass('focus');
    }

    function focusedBlock() { return board[boardY][boardX]; }
    function focusedBlock$Td() { return board$Td[boardY][boardX]; }

    function changeBlockFocus(x, y) {
        if(!board) return;
        focusedBlock$Td().removeClass('focus');

        boardX = x;
        boardY = y;

        if(boardX < 0)             boardX = board.width - 1;
        if(boardX >= board.width)  boardX = 0;
        if(boardY < 0)             boardY = board.height - 1;
        if(boardY >= board.height) boardY = 0;

        focusedBlock$Td().addClass('focus');
    }

    function updateBlock({x = boardX, y = boardY, type = -1, rotate = -1}) {
        let oldRotate = board[y][x].rotate;
        if(type   === -1) type   = board[y][x].type;
        if(rotate === -1) rotate = type && Blocks[type].rotatable ? oldRotate : 0;

        board[y][x] = {type: type, rotate: rotate};

        const $td = board$Td[y][x];
        $td.html('');
        $td.removeClass(`rotate-${oldRotate}`);
        $td.addClass(`rotate-${rotate}`);
        if(type !== null) {
            const $img = $('<img>').appendTo($td);
            $img.attr('src', `https://mnemo.pro/image/${type}.png`);
        }
    }

    $(document).keydown($board, e => {
        switch(e.keyCode) {
        case 37: case 38: case 39: case 40: // ←↑→↓
            changeBlockFocus(boardX + dx[e.which - 37], boardY + dy[e.which - 37]);
            return false;

        case 33: // PageUp
            changeBlockFocus(boardX, 0); return false;    
        case 34: // PageDown
            changeBlockFocus(boardX, -1); return false;    
        case 35: // Home
            changeBlockFocus(-1, boardY); return false;    
        case 36: // End
            changeBlockFocus(0, boardY); return false;    

        case 32: // space
            if(focusedBlock().type && Blocks[focusedBlock().type].rotatable) {
                updateBlock({rotate: (focusedBlock().rotate + 1) % 4})
            }
            return false;

        case 8: case 46: // backspace, delete
            updateBlock({type: null});
            return false;
        }
    });

    $(document).keypress($board, e => {
        if(!e.ctrlKey) {
            const c = String.fromCharCode(e.which).toLowerCase();
            const m = BlockKeyMap[c];
            if(!m) return;
            const b = m[focusedBlock().type] || m.default;
            if(b) {
                updateBlock({type: b});
                return false;
            }
        }
    });
});
