'use strict'

import { app,protocol, BrowserWindow, ipcMain, dialog, OpenDialogOptions, SaveDialogOptions } from 'electron'
import * as path from 'path'
import getPort from 'get-port';
import { format as formatUrl } from 'url'
import settings from '../../settings/globals.json';
import makeServe, { Serve, ServeOverrides } from './serve';

const isDevelopment = process.env.NODE_ENV !== 'production'


// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow:BrowserWindow|null;
let splashWindow:BrowserWindow|null;
let serve:Serve|null;

async function createSplashWindow(){
  const splash = new BrowserWindow({
    frame: false,
    show: false,
    width: 640, height: 360,
    title:'Card Designer',
    darkTheme: true,
    backgroundColor: '#2C2828',
    resizable: false,
    webPreferences: {
        
    }
  })

  const url = path.join(app.getAppPath(),'/splash.html')
  await splash.loadURL(url)
  //splash.webContents.openDevTools();
  splash.show();
  return splash;
}

function createMainWindow() {
  const window = new BrowserWindow({
    frame: false,
    show: false,
    width: 1280, height: 768,
    title:'Card Designer',
    darkTheme: true,
    backgroundColor: '#2C2828',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    }
  })

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
    app.quit()
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

  splashWindow = await createSplashWindow();
  
  protocol.registerStringProtocol(settings.customScheme, function(request:any,callback:any) {
    // do nothing : just force Windows to associate the scheme with this app
  })
  const port = await getPort();

  global.sharedVars = {
    servePort: port
  }

  serve = await makeServe(port);
  mainWindow = createMainWindow();
  mainWindow.webContents.once('did-finish-load',() => {
    splashWindow?.close();
    mainWindow?.show();
  })

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

  ipcMain.handle('show-open-dialog',(event,options:OpenDialogOptions) => {
    if(mainWindow){
       return dialog.showOpenDialog(mainWindow,options);
    }
    return null;
  })

  ipcMain.handle('show-save-dialog',(event,options:SaveDialogOptions) => {
    if(mainWindow){
       return dialog.showSaveDialog(mainWindow,options);
    }
    return null;
  })
 
})
