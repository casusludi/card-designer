'use strict'

import { app,protocol, BrowserWindow } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import settings from '../../settings/globals.json';

const isDevelopment = process.env.NODE_ENV !== 'production'
const INTERNAL_STATIC_PROTOCOL = 'cardmaker-internal';


protocol.registerSchemesAsPrivileged([
  { scheme: INTERNAL_STATIC_PROTOCOL, privileges: { standard: true, secure: true  } }
])

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow:BrowserWindow|null;

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1280, height: 768,
    title:'Cardmaker Studio',
    darkTheme: true,
    backgroundColor: '#2C2828',
    webPreferences: {
      nodeIntegration: true
    }
  })

  window.setMenu(null);

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  
  protocol.registerStringProtocol(settings.customScheme, function(request:any,callback:any) {
    // do nothing : just force Windows to associate the scheme with this app
  })
  // fix crash of Electron when convert html to pdf : https://github.com/electron/electron/issues/20700
  protocol.registerFileProtocol(INTERNAL_STATIC_PROTOCOL, (request, callback) => {
    const url = request.url.substr(INTERNAL_STATIC_PROTOCOL.length+2);
    //@ts-ignore
    const file = { path: path.normalize(`${__static}/${url}`) }
    callback(file)
  })
  

  mainWindow = createMainWindow()
 
})
