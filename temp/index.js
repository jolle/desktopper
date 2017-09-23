const electron = require('electron');
const path = require('path');
const url = require('url');

const { app, BrowserWindow } = electron;

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({width: 800, height: 600});

    mainWindow.loadURL('https://quizlet.com');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
