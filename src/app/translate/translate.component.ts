import { Component, OnInit } from '@angular/core';

interface HtmlNode {
  tagName: string;
  innerHTML: string;
}

@Component({
  selector: 'app-translate',
  standalone: true,
  imports: [],
  templateUrl: './translate.component.html',
  styleUrl: './translate.component.css',
})
export class TranslateComponent implements OnInit{
  currentLanguage: string= "FR"; 
  

  constructor() {
    this.loadStoredLanguage(); 
  }

  ngOnInit() {
     (window as any).electronAPI.onStartTranslation(async () => {
      const storedLanguage = await (window as any).electronAPI.recupererObjet('selectedLanguage');
      this.translatePage(storedLanguage); 
    });
  }

  async translatePage(language: string) {
    try {
      // Récupération de la structure HTML de la page
      const contentWithHtmlStructure = await (window as any).electronAPI.getContent();
      this.currentLanguage = language;

      const translatedHtmlStructure = await Promise.all(contentWithHtmlStructure.map(async (node: any) => {
        const translatedInnerHTML = await (window as any).electronAPI.translateText(node.textContent, language);
        return { ...node, textContent: translatedInnerHTML };
      }));

      (window as any).electronAPI.injectTranslatedContent(translatedHtmlStructure);
      await (window as any).electronAPI.stockerObjet('selectedLanguage', language);
      console.log('Langue stockée avec succès !');

    } catch (error) {
      console.error('Erreur lors de la traduction de la page :', error);
    }
  }

  async loadStoredLanguage() {
    // Récupérer la langue choisie lors du démarrage
    try {
      const storedLanguage = await (window as any).electronAPI.recupererObjet('selectedLanguage');
      if (storedLanguage) {
        this.currentLanguage = storedLanguage;  
        console.log('Langue récupérée :', storedLanguage);
        await this.translatePage(storedLanguage);
      } else {
        this.currentLanguage = 'FR'; // Définir le français comme langue par défaut
        console.log('Langue par défaut définie : FR');
        await this.translatePage(this.currentLanguage); 
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la langue :', error);
      this.currentLanguage = 'FR'; 
      await this.translatePage(this.currentLanguage);
    }
  }
}
