const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  toogleDevTool: () => ipcRenderer.send('toogle-dev-tool'),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  refresh: () => ipcRenderer.send('refresh'),
  injectTranslatedContent: (translatedContent) => ipcRenderer.send('inject-translated-content', translatedContent),
  onAddressBarUpdate: (callback) => ipcRenderer.on('update-address-bar', callback),
  

  translateText: (text, targetLanguage) => ipcRenderer.invoke('translate-text', text, targetLanguage),
  getContent: () => ipcRenderer.invoke('get-page-content'),
  stockerObjet: (key, objet) => ipcRenderer.invoke('stocker-objet', key, objet),
  recupererObjet: (key) => ipcRenderer.invoke('recuperer-objet', key),

  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  goToPage: (url) => ipcRenderer.invoke('go-to-page', url),
  currentUrl: () => ipcRenderer.invoke('current-url')
})
