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

  constructor() {}
  currentLanguage: string = 'FR'; // Par exemple, le français est la langue par défaut

  
  async translatePage(language: string) {
    try {
      // Récupération de la structure HTML de la page
      const contentWithHtmlStructure = await (window as any).electronAPI.getContent();
      console.log('contentWithHtmlStructure', contentWithHtmlStructure);
      this.currentLanguage = language;

      const translatedHtmlStructure = await Promise.all(contentWithHtmlStructure.map(async (node: any) => {
        const translatedInnerHTML = await (window as any).electronAPI.translateText(node.textContent, language);
        return { ...node, textContent: translatedInnerHTML };
      }));
  
      
      console.log('translatedHtmlStructure', translatedHtmlStructure);
      (window as any).electronAPI.injectTranslatedContent(translatedHtmlStructure);
      console.log('test');
  
    } catch (error) {
      console.error('Erreur lors de la traduction de la page :', error);
    }
  }
}


