const IsMac = /mac/i.test(navigator.platform);
const MCtrl = IsMac ? '⌘' : 'Ctrl';
const MCtrlKey = e => IsMac ? e.metaKey : e.ctrlKey
