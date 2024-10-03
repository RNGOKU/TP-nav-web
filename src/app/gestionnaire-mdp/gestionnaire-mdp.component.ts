import { Component, inject, OnInit } from '@angular/core';
import { ipcRenderer } from 'electron';
import { MatDialog } from '@angular/material/dialog';
import { IdentifiantsPopupComponent } from "../identifiants-popup-component/identifiants-popup-component.component";

interface Identifiant {
  user: string;
  mdp: string;
}

@Component({
  selector: 'app-gestionnaire-mdp',
  standalone: true,
  imports: [],
  templateUrl: './gestionnaire-mdp.component.html',
  styleUrl: './gestionnaire-mdp.component.css'
})
export class GestionnaireMdpComponent {

  constructor(private dialog: MatDialog) {
    (window as any).electronAPI.onChampsConnexionTrouvé((event: any) => {
      this.afficherPopupIdentifiants();
    })
  }

  async afficherPopupIdentifiants() {

    // const identifiants = await (window as any).electronAPI.recupererIdentifiantsSelonDomaine();

    (window as any).electronAPI.afficherFenetrePasswordsManager();
    // // Ouvrir la popup avec MatDialog
    // const dialogRef = this.dialog.open(IdentifiantsPopupComponent, {
    //   width: '300px',
    //   data: identifiants // Injecter les identifiants dans la popup
    // });

    // Gérer la sélection d'un identifiant
    // dialogRef.afterClosed().subscribe(identifiantChoisi => {
    //   if (identifiantChoisi) {
    //     (window as any).electronAPI.remplirFormulaire(identifiantChoisi); // Remplir le formulaire
    //   }
    // });
  }

  async stockerObjet(key: string, objet: Identifiant): Promise<void> {
    try {
      await (window as any).electronAPI.stockerObjet(key, objet);
      console.log("Objet stocké avec succès depuis Angular !");
    } catch (error) {
      console.error("Erreur lors du stockage de l'objet depuis Angular :", error);
    }
  }

  async recupererObjet(key: string): Promise<Identifiant | null> {
    try {
      const objet = await (window as any).electronAPI.recupererObjet(key);
      console.log("Objet récupéré depuis Angular :", objet);
      return objet;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'objet depuis Angular :", error);
      return null;
    }
  }


}
