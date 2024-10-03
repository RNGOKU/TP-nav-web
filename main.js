const { app, WebContentsView, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

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

app.whenReady().then(() => {
  // BrowserWindow initiate the rendering of the angular toolbar
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (app.isPackaged) {
    win.loadFile("dist/browser-template/browser/index.html");
  } else {
    win.loadURL("http://localhost:4200");
  }

  // WebContentsView initiate the rendering of a second view to browser the web
  const view = new WebContentsView();
  win.contentView.addChildView(view);

  // Écoute de l'événement 'did-start-navigation' sur la vue WebContents
  view.webContents.on(
    "did-start-navigation",
    (event, url, isInPlace, isMainFrame) => {
      win.webContents.send("update-address-bar", url);
      view.webContents.openDevTools({ mode: "detach" });
    }
  );

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
      height: winSize.height,
    });
  }

  win.webContents.openDevTools({ mode: "detach" });

  // Register events handling from the toolbar
  ipcMain.on("toogle-dev-tool", () => {
    if (winContent.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools({ mode: "detach" });
    }
  });

  ipcMain.on("go-back", () => {
    view.webContents.navigationHistory.goBack();
  });

  ipcMain.handle("can-go-back", () => {
    return view.webContents.navigationHistory.canGoBack();
  });

  ipcMain.on("go-forward", () => {
    view.webContents.navigationHistory.goForward();
  });

  ipcMain.handle("can-go-forward", () => {
    return view.webContents.navigationHistory.canGoForward();
  });

  ipcMain.on("refresh", () => {
    view.webContents.reload();
  });

  ipcMain.handle("go-to-page", (event, url) => {
    return view.webContents.loadURL(url);
  });

  ipcMain.handle("current-url", () => {
    return view.webContents.getURL();
  });

  //Register events handling from the main windows
  win.once("ready-to-show", () => {
    fitViewToWin();
    view.webContents.loadURL("https://amiens.unilasalle.fr");
  });

  win.on("resized", () => {
    fitViewToWin();
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
  
});
