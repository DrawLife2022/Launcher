const path = require('path');
require('update-electron-app')({
  repo: 'DrawLife2022/Launcher'
})

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const isDev = require('electron-is-dev');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1281,
    show: false,
    height: 720,
    frame: false,
    backgroundColor: 'rgba(24, 27, 28, 1)',
    titleBarStyle: 'hidden',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  win.setResizable(false)
  // Open the DevTools.
  //if (isDev) {
  win.webContents.openDevTools({ mode: 'detach' });
  //}

  ipcMain.handle("minimize", () => {
    win.isMinimized() ? win.restore() : win.minimize()
  })

  ipcMain.on("openPage", (event, arg) => {
    event.returnValue = 'true'
    shell.openExternal(arg)
  })

  win.once('ready-to-show', () => {
    console.log("je passe")
    win.show()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("quit", () => {
  app.quit()
})

Menu.setApplicationMenu(false)