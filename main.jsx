'use strict';
const path = require('path');
const fs = require('fs-extra');
const electron = require("electron");
const ipcMain = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

/* BrowserWindow */
var mainWindow = null;
var consoleWindow = null;

/*  */
var info_path = path.join(app.getPath("userData"), "bounds-info.json");

/* この関数から始まる */
Initialize();

function Initialize() {
	/* Applicaton Events */
	app.on('window-all-closed', AppEvent_Quit);
	app.on('ready',             AppEvent_Ready);

	ipcMain.on('debug-log', IpcEvent_DebugLog );

	/* ----デバッグ用---- */
	ipcMain.on('debugMessage', (event, message)=>{
		event.sender.send('debugMessage', process.argv[2]);
	});
	/* ------------------ */
}

/* Application : window-all-closed */
function AppEvent_Quit() {
	if (process.platform != 'darwin') app.quit();
}

/* Application : ready */
function AppEvent_Ready() {
	if (mainWindow === null) CreateMainWindow();
}

function IpcEvent_DebugLog( event, message ){
	console.log( message );
}

/* メイン画面を作成 */
function CreateMainWindow() {
	var bounds_info;
	try {
		bounds_info = JSON.parse(fs.readFileSync(info_path, 'utf8'));
	}catch(e) {
		bounds_info = {width: 800, height: 1000};
	}

	mainWindow = new BrowserWindow({
		width	: bounds_info.width,
		height	: bounds_info.height,
		x		: bounds_info.x,
		y		: bounds_info.y
	});
	SetMainWindowMenu(mainWindow);

	mainWindow.loadURL('file://' + __dirname + '/index.html');

	/* デバッグ用のビューを表示させる */
	if(process.argv[2] === "--debug"){
		mainWindow.openDevTools();
	}

	mainWindow.on('close', function(){
		fs.writeFileSync(info_path, JSON.stringify(mainWindow.getBounds()));
	});
	mainWindow.on('closed', function(){
		mainWindow = null;
		Quit();
	});
}

/* メニューバー */
function SetMainWindowMenu(window) {
	var template =
		[
			{
				label: 'ファイル',
				submenu: [
					{
						label: '新規作成',
						accelerator: 'CmdOrCtrl+T',
						role: 'new'
					},
					{
						label: '開く',
						accelerator: 'CmdOrCtrl+O',
						click: function(item, focusedWindow) {
							if (focusedWindow){
								focusedWindow.webContents.send("message-ctrl", {ctrl : "OPEN"} );
							}
						}
					},
					{
						label: '上書き保存',
						accelerator: 'CmdOrCtrl+S',
						click: function(item, focusedWindow) {
							if (focusedWindow){
								focusedWindow.webContents.send("message-ctrl", {ctrl : "SAVE"} );
							}
						}
					},
					{
						label: '名前を付けて保存',
						accelerator: 'CmdOrCtrl+Shift+S',
						click: function(item, focusedWindow) {
							if (focusedWindow){
								focusedWindow.webContents.send("message-ctrl", {ctrl : "SAVE_NEWFILE"} );
							}
						}
					},
					{
						type: 'separator'
					},
					{
						label: '終了',
						accelerator: 'CmdOrCtrl+Q',
						role: 'close'
					},

				]
			},
			{
				label: '編集',
				submenu: [
					{
						label: '元に戻す',
						accelerator: 'CmdOrCtrl+Z',
						role: 'undo'
					},
					{
						label: 'やりなおす',
						accelerator: 'CmdOrCtrl+Y',
						role: 'redo'
					},
					{
						type: 'separator'
					},
					{
						label: '切り取り',
						accelerator: 'CmdOrCtrl+X',
						role: 'cut'
					},
					{
						label: 'コピー',
						accelerator: 'CmdOrCtrl+C',
						role: 'copy'
					},
					{
						label: '貼り付け',
						accelerator: 'CmdOrCtrl+V',
						role: 'paste'
					},
					{
						label: '全てを選択',
						accelerator: 'CmdOrCtrl+A',
						role: 'selectall'
					},
					{
						type: 'separator'
					},
					{
						label: '再読み込み',
						accelerator: 'CmdOrCtrl+Shift+R',
						click: function(item, focusedWindow) {
							if (focusedWindow){
								focusedWindow.webContents.send("message-ctrl", {ctrl : "RELOAD"} );
							}
						}
					},
					{
						type: 'separator'
					},
					{
						label: '定義へジャンプ',
						accelerator: 'F12',
						click: function(item, focusedWindow) {
							if (focusedWindow){
								focusedWindow.webContents.send("message-ctrl", {ctrl : "GO_TO_DEFINE"} );
							}
						}
					},
					{
						label: '次へ',
						accelerator: 'F11',
						click: function(item, focusedWindow) {
						if (focusedWindow){
								focusedWindow.webContents.send("message-ctrl", {ctrl : "GO_TO_NEXT"} );
							}
						}
					},
					{
						label: '前へ',
						accelerator: 'F10',
						click: function(item, focusedWindow) {
							if (focusedWindow){
								focusedWindow.webContents.send("message-ctrl", {ctrl : "GO_TO_PREVIOUS"} );
							}
						}
					},
				]
			},
			{
				label: '表示',
				submenu: [
					{
						label: 'Toggle Developer Tools',
						accelerator: (function() {
							if (process.platform == 'darwin')
								return 'Alt+Command+I';
							else
								return 'Ctrl+Shift+I';
						})(),
						click: function(item, focusedWindow) {
							if (focusedWindow)
								focusedWindow.toggleDevTools();
						}
					},
					]
			},
		];

	var menu = Menu.buildFromTemplate(template);
	window.setMenu(menu);
	window.setMenuBarVisibility(true);
}
