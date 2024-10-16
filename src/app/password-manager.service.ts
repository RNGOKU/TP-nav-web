import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';

export interface Identifiant {
  user: string;
  mdp: string;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordManagerService {

  // private identifiants : Identifiant[] = [];

  constructor() { }

  async getIdentifiants(): Promise<Identifiant[]> {

    const identifiants = await (window as any).electronAPI.recupererIdentifiantsSelonDomaine();

    return identifiants;
  }

  async supprIdentifiantsDeLaPage() {
    await (window as any).electronAPI.supprimerObjet();
    await (window as any).electronAPI.refreshPasswordManager();
  }

  async saveIdentifiants(identifiants :  Identifiant[]){
    const identifiantEnregistre = await this.getIdentifiants();
    if(identifiantEnregistre){
      identifiants.push(...identifiantEnregistre);
    }
    await (window as any).electronAPI.enregistrerIdentifiants(identifiants);
    await (window as any).electronAPI.refreshPasswordManager();
  }

  async remplirFromulaire(identifiant :  Identifiant){
    await (window as any).electronAPI.remplirFormulaire(identifiant);
  }

  fermer(){
    (window as any).electronAPI.fermerFenetrePasswordsManager();
    console.log("fermer service");
  }
}
