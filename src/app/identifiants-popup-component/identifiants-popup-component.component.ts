import { Component, Inject } from '@angular/core';
import { PasswordManagerService } from '../password-manager.service';
import { Identifiant } from '../password-manager.service'
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-identifiants-popup',
  standalone:true,
  templateUrl: './identifiants-popup-component.component.html',
  styleUrl: './identifiants-popup-component.component.css',
  imports: [FormsModule]
})
export class IdentifiantsPopupComponent {
  listeIdentifiants : Identifiant[] = [];
  nouvelIdentifiant : Identifiant = {user: '', mdp: ''};

  identifiantTest: Identifiant = {
    user : "ad",
    mdp : "cc"
  }

  constructor( public passwordManagerService: PasswordManagerService) {}

  ngOnInit() {
    (async () => { 
      try {
        this.listeIdentifiants = await this.passwordManagerService.getIdentifiants();
      } catch (error) {
        console.error('Erreur lors de la récupération des identifiants :', error);
        // ... (gère l'erreur si nécessaire)
      }
    })(); 
  }

  // choisirIdentifiant(identifiant: any) {
  //   this.dialogRef.close(identifiant); // Retourner l'identifiant choisi
  // }

  // fermer() {
  //   this.dialogRef.close();
  // }
  

}