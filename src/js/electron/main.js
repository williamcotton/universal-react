'use strict'

var electron = require('electron')
var app = electron.app // Module to control application life.
var BrowserWindow = electron.BrowserWindow // Module to create native browser window.

require('electron-reload')(__dirname) // Autoreload

// electron.crashReporter.start()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

console.log(app.getPath('userData'))

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 768, height: 480, titleBarStyle: 'hidden', minWidth: 768, frame: false})

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '../../../../app/index.html')
  mainWindow.setAutoHideMenuBar(true)
  mainWindow.setMenuBarVisibility(false)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
})
