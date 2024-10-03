const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  toogleDevTool: () => ipcRenderer.send('toogle-dev-tool'),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  refresh: () => ipcRenderer.send('refresh'),

  onAddressBarUpdate: (callback) => ipcRenderer.on('update-address-bar', callback),
  onChampsConnexionTrouvé: (callback) => ipcRenderer.on('champs-connexion-trouves', callback),
  
  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  goToPage: (url) => ipcRenderer.invoke('go-to-page', url),
  currentUrl: () => ipcRenderer.invoke('current-url'),
  stockerObjet: (objet) => ipcRenderer.invoke('stocker-objet',key, objet),
  recupererObjet: (key) => ipcRenderer.invoke('recuperer-objet', key),
  recupererIdentifiantsSelonDomaine: () => ipcRenderer.invoke('recuperer-identifiants-domaine'),
  remplirFormulaire: (identifiant) => ipcRenderer.invoke('remplirFormulaire', identifiant),
  afficherFenetrePasswordsManager: () => ipcRenderer.invoke('afficher-fenetre-passwords-manager')
})
