const { app, WebContentsView, BrowserWindow, ipcMain , safeStorage} = require('electron');
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
    win.webContents.send('update-address-bar', url);
  });

  // Always fit the web rendering with the electron windows
  function fitViewToWin() {
    const winSize = win.webContents.getOwnerBrowserWindow().getBounds();
    view.setBounds({ x: 0, y: 55, width: winSize.width, height: winSize.height });
  }

  win.webContents.openDevTools({ mode: 'detach' });

  // Register events handling from the toolbar
  ipcMain.on('toogle-dev-tool', () => {
    if (win.webContents.isDevToolsOpened()) {
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

  ipcMain.handle('stocker-objet', async (event, key, objet) => {
    try {
      const objetEnString = JSON.stringify(objet);
      await safeStorage.set(key, objetEnString);
      console.log("Objet stocké avec succès !");
    } catch (error) {
      console.error("Erreur lors du stockage de l'objet :", error);
      throw error;
    }
  });

  ipcMain.handle('recuperer-objet', async (event, key) => {
    try {
      const objetEnString = await safeStorage.get(key);
      if (objetEnString) {
        const objet = JSON.parse(objetEnString);
        return objet;
      } else {
        return null; // ou une valeur par défaut si la clé n'existe pas
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'objet :", error);
      throw error;
    }
  });

  view.webContents.on('did-finish-load', () => {
    view.webContents.executeJavaScript(`
      //const champsEmail = document.querySelector('input[type*="email"]');
      const champsMotDePasse = document.querySelector('[type*="password"]');
      // Retourner true si les champs sont trouvés, sinon false
      // !!champsEmail &&
       !!champsMotDePasse;
      `).then(champsTrouves => {
        // Gérer le résultat dans le processus de rendu Electron
        if (champsTrouves) {
          // Envoyer l'événement 'champs-connexion-trouves'
          win.webContents.send('champs-connexion-trouves'); 
        } else {
          // Envoyer l'événement 'champs-connexion-non-trouves'
          win.webContents.send('champs-connexion-non-trouves'); 
        }
      });
  });

  ipcMain.handle('recuperer-identifiants-domaine', async () => {
    try {
      const domaineActuel = win.webContents.getURL().split('/')[2];
      const identifiants = await safeStorage.get(domaineActuel);
      return identifiants;
    } catch (error) {
      console.error('Erreur lors de la récupération des identifiants :', error);
      return [];
    }
  });

  ipcMain.handle('remplirFormulaire', async (event, identifiant) =>{
    win.webContents.document.querySelector('input[type*="email"]').value = identifiant.user;
    win.webContents.document.querySelector('input[type*="password"]').value = identifiant.mdp;
  });

  ipcMain.handle('afficher-fenetre-passwords-manager', async (event) => {
    const viewPasswordManager = new WebContentsView({
      width: 300,
      height: 300
    });
    win.contentView.addChildView(viewPasswordManager);
    viewPasswordManager.webContents.loadFile('src/app/identifiants-popup-component/identifiants-popup-component.component.html');
    const winSize = win.webContents.getOwnerBrowserWindow().getBounds();
    viewPasswordManager.setBounds({ x: 0, y: 55, width: 300, height: 300 });
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


