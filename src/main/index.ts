'use strict'

import { app,protocol, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import getPort from 'get-port';
import { format as formatUrl } from 'url'
import settings from '../../settings/globals.json';
import makeServe, { Serve, ServeOverrides } from './serve';

const isDevelopment = process.env.NODE_ENV !== 'production'


// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow:BrowserWindow|null;
let serve:Serve|null;

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1280, height: 768,
    title:'Cardmaker Studio',
    darkTheme: true,
    backgroundColor: '#2C2828',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    }
  })

  /*
  const menuTemplate:Electron.MenuItemConstructorOptions[] = [
    { 
      role: 'help',
      submenu: [
        {
          label: 'Open Dev Tools',
          click: () => {
            window.webContents.openDevTools()
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(menuTemplate);

  window.setMenu(menu);*/

  window.setMenu(null);

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`).then(() => {
      window.webContents.openDevTools()
    })

  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    })) 
  }

  window.on('closed', () => {
    serve?.close();
    serve = null;
    mainWindow = null;
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
app.on('ready', async () => {
  
  protocol.registerStringProtocol(settings.customScheme, function(request:any,callback:any) {
    // do nothing : just force Windows to associate the scheme with this app
  })
  const port = await getPort();

  global.sharedVars = {
    servePort: port
  }

  serve = await makeServe(port);
  mainWindow = createMainWindow();

  ipcMain.handle('html-to-pdf', async (event, html: string, base: string,overrides?:ServeOverrides) => {
    return await serve?.convertToPdf(html,base,overrides)
  })

  ipcMain.handle('serve', (event, id: string, html: string, base: string,overrides?:ServeOverrides) => {
    return serve?.serve(id,html,base,overrides)
  })

  ipcMain.handle('unserve', (event, id: string) => {
    return serve?.unserve(id)
  })

  ipcMain.handle('open-dev-tools', () => {
    if(mainWindow){
      mainWindow.webContents.openDevTools();
    }
  })
 
})
