const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld('electronAPI', {
  toogleDevTool: () => ipcRenderer.send('toogle-dev-tool'),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  refresh: () => ipcRenderer.send('refresh'),
  onAddressBarUpdate: (callback) => ipcRenderer.on('update-address-bar', callback),
  
  
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
  check404: () => ipcRenderer.send("check-404")
})
