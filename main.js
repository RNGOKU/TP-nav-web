const {
  app,
  WebContentsView,
  BrowserWindow,
  ipcMain,
  safeStorage
} = require('electron');
const path = require('node:path');
const { log } = require('node:console');
const { Translate } = require('@google-cloud/translate').v2;  // Import de l'API Google Cloud Translat
const fs = require('fs');

const storageFilePath = path.join(app.getPath('userData'), 'storage.json');


const translate = new Translate({
  key: 'AIzaSyDAnZeF6oK-sYaDSG4xGbezrp-n8bcDTk4', // Remplace par ta clé API Google
});
app.whenReady().then(() => {

// BrowserWindow initiate the rendering of the angular toolbar
const win = new BrowserWindow({
  width: 1200,
  height: 1000,
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
  }});

// Always fit the web rendering with the electron windows
function fitViewToWin() {
  const winSize = win.webContents.getOwnerBrowserWindow().getBounds();
  view.setBounds({
    x: 0,
    y: 55,
    width: winSize.width,
    height: winSize.height
  });
}

win.webContents.openDevTools({
  mode: 'detach'
});

view.webContents.openDevTools({
  mode: 'detach'
});

// Register events handling from the toolbar
ipcMain.on('toogle-dev-tool', () => {
  if (winContent.isDevToolsOpened()) {
    win.webContents.closeDevTools();
  } else {
    win.webContents.openDevTools({
      mode: 'detach'
    });
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

ipcMain.handle('get-page-content', async () => {
  try {

    const content = await view.webContents.executeJavaScript(`
      (() => {
        const elements = Array.from(document.body.getElementsByTagName('*'));
        const tagsToKeep = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV','SPAN', 'A', 'TABLE', 'TD', 'TH'];
        return elements
          .filter(el => {
            const hasTitleClass = el.tagName === 'DIV' && (el.className.includes('title')||el.className.includes('titre')); 
            return (
              tagsToKeep.includes(el.tagName) && 
              el.textContent.trim() !== '' && 
              !(el.tagName === 'DIV' && !hasTitleClass)  // N'inclut pas les DIV sans la classe 'title'
            );
          })

          .map(el => ({
            tagName: el.tagName,
            innerHTML: el.innerHTML,
            textContent: el.textContent.trim()
          }));
      })();
    `);
    return content;
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu de la page :', error);
    throw error;
  }
});

// Gestion de la traduction via Google Cloud
ipcMain.handle('translate-text', async (event, text, targetLanguage) => {
  try {
    const [translation] = await translate.translate(text, targetLanguage);
    return translation; 
  } catch (error) {
    console.error('Erreur lors de la traduction avec Google Translate :', error);
    throw error;
  }
});


// Gestionnaire pour injecter le contenu traduit
ipcMain.on('inject-translated-content', (event, translatedHtmlStructure) => {
  const translatedHtmlString = JSON.stringify(translatedHtmlStructure);  // Sérialise le tableau en JSON
  view.webContents.executeJavaScript(`
      (function() {
      const elements = Array.from(document.body.getElementsByTagName('*'));

      const translatedHtml = ${translatedHtmlString};

      elements.forEach(subEl => {
        translatedHtml.forEach(translatedNode => {
          if (subEl.tagName === translatedNode.tagName && subEl.innerHTML === translatedNode.innerHTML) {
            if(subEl.tagName === 'A'  && /<[^>]+>/.test(subEl.innerHTML)){
              return
            }
            subEl.innerHTML = translatedNode.textContent; 
          }
        });
      });
    })();
  `).catch(err => console.error('Erreur lors de l\'injection du contenu traduit :', err));
});


// Gestion du stockage d'un objet
ipcMain.handle('stocker-objet', async (event, key, objet) => {
  try {
    // Lire le contenu actuel du fichier
    let storage = {};
    if (fs.existsSync(storageFilePath)) {
      const data = fs.readFileSync(storageFilePath);
      storage = JSON.parse(data);
    }

    // Mettre à jour la langue choisie
    storage[key] = objet;
    fs.writeFileSync(storageFilePath, JSON.stringify(storage));
    console.log("Objet stocké avec succès !");
  } catch (error) {
    console.error("Erreur lors du stockage de l'objet :", error);
    throw error;
  }
});

// Gestion de la récupération d'un objet
ipcMain.handle('recuperer-objet', async (event, key) => {
  try {
    if (fs.existsSync(storageFilePath)) {
      const data = fs.readFileSync(storageFilePath);
      const storage = JSON.parse(data);
      return storage[key] || null; // Récupère la valeur ou null si pas trouvée
    }
    return null; // Fichier de stockage non trouvé
  } catch (error) {
    console.error("Erreur lors de la récupération de l'objet :", error);
    throw error;
  }
});

})

