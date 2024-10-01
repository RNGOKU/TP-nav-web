const { app, WebContentsView, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

app.whenReady().then(() => {

  // BrowserWindow initiate the rendering of the angular toolbar
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (app.isPackaged) {
    win.loadFile('dist/browser-template/browser/index.html');
  } else {
    win.loadURL('http://localhost:4200')
  }


  // WebContentsView initiate the rendering of a second view to browser the web
  const view = new WebContentsView();
  win.contentView.addChildView(view);

  // Écoute de l'événement 'did-start-navigation' sur la vue WebContents
  view.webContents.on('did-start-navigation', (event, url, isInPlace, isMainFrame) => {
    if(isMainFrame){
      win.webContents.send('update-address-bar', url);
    }
  });

  // Always fit the web rendering with the electron windows
  function fitViewToWin() {
    const winSize = win.webContents.getOwnerBrowserWindow().getBounds();
    view.setBounds({ x: 0, y: 55, width: winSize.width, height: winSize.height });
  }

  win.webContents.openDevTools({ mode: 'detach' });

  // Register events handling from the toolbar
  ipcMain.on('toogle-dev-tool', () => {
    if (winContent.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  ipcMain.on('go-back', () => {
    view.webContents.navigationHistory.goBack();
  });

  ipcMain.handle('can-go-back', () => {
    return view.webContents.navigationHistory.canGoBack();
  });

  ipcMain.on('go-forward', () => {
    view.webContents.navigationHistory.goForward();
  });

  ipcMain.handle('can-go-forward', () => {
    return view.webContents.navigationHistory.canGoForward();
  });

  ipcMain.on('refresh', () => {
    view.webContents.reload();
  });

  ipcMain.handle('go-to-page', async (event, url) => {
    let value = url.trim(); // Trim whitespace
    // Add http:// or https:// if not present
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      // Check if it might be a direct IP or a local file path
      if (!value.includes('.') && !value.startsWith('/')) {
        value = 'https://www.google.com/search?q=' + encodeURIComponent(value);
      } else {
        const httpsUrl = 'https://www.' + value;
        const response = await fetch(httpsUrl, { method: 'HEAD' }) // Use HEAD request to avoid downloading the whole page
       
        if (response.ok) {
          // HTTPS exists!
          url = httpsUrl;
        } else {
          // HTTPS failed, use http://
          url = 'http://www.' + value;
        }
      }
    }
    return view.webContents.loadURL(url);
  });


  ipcMain.handle('current-url', () => {
    return view.webContents.getURL();
  });

  //Register events handling from the main windows
  win.once('ready-to-show', () => {
    fitViewToWin();
    view.webContents.loadURL('https://amiens.unilasalle.fr');
  });

  win.on('resized', () => {
    fitViewToWin();
  });
})
