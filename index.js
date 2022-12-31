const path = require('path');
const package = require('./package.json')
const fetch = require('node-fetch')
const fs = require('fs')

var exec = require('child_process').execSync;
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const isDev = require('electron-is-dev');
const HTTP_URL = "https://api.drawlife.eu"

if (require('electron-squirrel-startup')) app.quit();

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
    `file://${path.join(__dirname, './build/index.html')}`
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

async function getVersionOfficial() {
  const response = await fetch(HTTP_URL + "/Assets/launcher/version/launcher")
  if (response.status !== 200)
    return undefined
  return response.text()
}

const URL = 'https://api.drawlife.eu/Assets/launcher/download/launcher.exe'

async function downloadExe() {
  const res = await fetch(URL);
  const fileStream = fs.createWriteStream("./tmp/update.exe");
  const contentLengthHeader = res.headers.get('Content-Length')
  const resourceSize = parseInt(contentLengthHeader, 10)
  var recievedLength = 0
  await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on("error", reject);
      res.body.on('readable', () => {
          var chunk
          
          while (null !== (chunk = res.body.read())) {
              recievedLength = recievedLength + chunk.length
              console.log("Download percentage:", Math.floor((recievedLength / resourceSize) * 100), "%")
          }
      })
      fileStream.on("finish", resolve);
  });
}

app.on('ready', async () => {
  var versionNow = package.version
  var versionOfficial = await getVersionOfficial();

  console.log(versionNow, versionOfficial)
  if (versionNow === versionOfficial) return;

  await downloadExe()
  const dialogOpts = {
		type: 'info',
		buttons: ['Relancer'],
		title: 'Mise à jour Drawlife',
		message: versionOfficial,
		detail: 'Une nouvelle version du launcher est disponible'
	};
	dialog.showMessageBox(dialogOpts).then((returnValue) => {
    exec("update.bat", [], (error, stdout, stderr) => {
      if (error) {
        console.log(error)
      }
      console.log(stderr);
      console.log(stdout);
    })
    app.quit()
	})
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("quit", () => {
  app.quit()
})

Menu.setApplicationMenu(false)