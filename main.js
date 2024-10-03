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

// Fonction injectée dans le JS qui permet de récup tous les liens pour le fetch 
const functionGetAllLinks = `
	function getAllLinks () {
  		let liens = document.querySelectorAll('a');
  		let liensTab = [];
  
  		liens.forEach(lien => {
			if(lien.href != "") {
    			liensTab.push(lien.href);
			}
	  	});
  
    // Liens qui 404 à coup sur (pour les tests) 
    liensTab.push("https://www.google.com/test404");
		liensTab.push("https://www.google.com/test404_2");

		return liensTab;
	}

  	liensTabReturn = getAllLinks();
  	liensTabReturn;
`;

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


  view.webContents.on("did-finish-load", () => {
    funcCheck404();
  });

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

//recupère le contenue de la page en fonction des différent filtre
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
  const translatedHtmlString = JSON.stringify(translatedHtmlStructure); 
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
    let storage = {};
    if (fs.existsSync(storageFilePath)) {
      const data = fs.readFileSync(storageFilePath);
      storage = JSON.parse(data);
    }

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
      return storage[key] || null; 
    }
    return null; 
  } catch (error) {
    console.error("Erreur lors de la récupération de l'objet :", error);
    throw error;
  }
});


ipcMain.on('check-404', (event) => {

  funcCheck404();
});

/*
  FONCTION CHECK 404
*/

async function fetchURLs(links) {
  // Verif de tous les liens, si lien fonctionnel on l'enlève du tableau
  const fetchPromises = links.map((link) => {
    return fetch(link)
      .then((response) => {
        if (response.status != 404) {
          var index = links.indexOf(link);
          links.splice(index, 1);
        }
      })
  });

  // Attente que tous les fetchs soient OK pour continuer
  await Promise.all(fetchPromises);
  return links;
}

async function funcCheck404 () {
  // On execute la fonction JS qui récup tous les liens dans le view
  view.webContents
  .executeJavaScript(functionGetAllLinks)
  .then(async (links) => {

    // Fetchs de tous les liens
    var links404 = await fetchURLs(links);
    var links404String = links404.join(' - ');

    // Envoi des liens 404 dans le rendu pour afficher une alerte
    view.webContents.executeJavaScript(`
      var links404String = "${links404String}";

      if(links404String != "") {
        alert("Liens 404 : " + links404String);
      } else {
        alert("Pas de lien 404 dans cette page !"); 
      }
    `)
  })
  .catch((error) => {
    console.error("Erreur lors de l'exécution du script :", error);
  });
}


})

