import { Component } from '@angular/core';

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
export class TranslateComponent {
  currentLanguage: string= "FR"; // Pas d'initialisation ici

  constructor() {
    this.loadStoredLanguage(); // Appel pour charger la langue sauvegardée
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
        this.currentLanguage = storedLanguage;  // Mettre à jour la langue courante
        console.log('Langue récupérée :', storedLanguage);
        // Lancer la traduction de la page avec la langue sauvegardée
        await this.translatePage(storedLanguage);
      } else {
        // Si aucune langue n'est trouvée, définis une langue par défaut
        this.currentLanguage = 'FR'; // Définir le français comme langue par défaut
        console.log('Langue par défaut définie : FR');
        await this.translatePage(this.currentLanguage); // Traduire avec la langue par défaut
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la langue :', error);
      // Définir une langue par défaut en cas d'erreur
      this.currentLanguage = 'FR'; // Définir le français comme langue par défaut
      await this.translatePage(this.currentLanguage); // Traduire avec la langue par défaut
    }
  }
}
