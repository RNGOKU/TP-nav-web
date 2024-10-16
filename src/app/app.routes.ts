import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { IdentifiantsPopupComponent } from './identifiants-popup-component/identifiants-popup-component.component';

export const routes: Routes = [
    {path: '', component: AppComponent},
    {path: 'password-manager', component: IdentifiantsPopupComponent}
];
