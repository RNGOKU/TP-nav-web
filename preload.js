const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld('electronAPI', {
  toogleDevTool: () => ipcRenderer.send('toogle-dev-tool'),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  refresh: () => ipcRenderer.send('refresh'),
  refreshPasswordManager: () => ipcRenderer.send('refresh-password-manager-page'),
  onAddressBarUpdate: (callback) => ipcRenderer.on('update-address-bar', callback),
  onChampsConnexionTrouve: (callback) => ipcRenderer.on('champs-connexion-trouves', callback),
  
  
  getContent: () => ipcRenderer.invoke('get-page-content'),
  translateText: (text, targetLanguage) => ipcRenderer.invoke('translate-text', text, targetLanguage),
  injectTranslatedContent: (translatedContent) => ipcRenderer.send('inject-translated-content', translatedContent),
  onStartTranslation: (callback) => ipcRenderer.on('start-translation', (event) => callback()),
  
  
  stockerObjet: (key, objet) => ipcRenderer.invoke('stocker-objet', key, objet),
  recupererObjet: (key) => ipcRenderer.invoke('recuperer-objet', key),

  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  goToPage: (url) => ipcRenderer.invoke('go-to-page', url),
  currentUrl: () => ipcRenderer.invoke('current-url'),
  supprimerObjet: () => ipcRenderer.invoke('supprimer-objet'),
  recupererIdentifiantsSelonDomaine: () => ipcRenderer.invoke('recuperer-identifiants-domaine'),
  enregistrerIdentifiants: (identifiants) => ipcRenderer.invoke('enregistrer-identifiants', identifiants),
  remplirFormulaire: (identifiant) => ipcRenderer.invoke('remplirFormulaire', identifiant),
  afficherFenetrePasswordsManager: () => ipcRenderer.invoke('afficher-fenetre-passwords-manager'),
  fermerFenetrePasswordsManager: () => ipcRenderer.invoke('fermer-fenetre-password-manager'),
  check404: () => ipcRenderer.send("check-404")
})
