import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'; 
// Assurez-vous d'avoir installé Angular Material : 
// npm install --save @angular/material @angular/cdk @angular/animations

@Component({
  selector: 'app-identifiants-popup',
  standalone:true,
  templateUrl: './identifiants-popup-component.component.html',
  styleUrl: './identifiants-popup-component.component.css'
})
export class IdentifiantsPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<IdentifiantsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public identifiants: any[] // Données injectées
  ) {}

  choisirIdentifiant(identifiant: any) {
    this.dialogRef.close(identifiant); // Retourner l'identifiant choisi
  }

  fermer() {
    this.dialogRef.close();
  }
}