import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddressComponent } from './address/address.component';
import { BackwardComponent } from './backward/backward.component';
import { DebugComponent } from './debug/debug.component';
import { ForwardComponent } from './forward/forward.component';
import { RefreshComponent } from './refresh/refresh.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HomeComponent } from "./home/home.component";
import { IdentifiantsPopupComponent } from './identifiants-popup-component/identifiants-popup-component.component';
import {Check404Component} from "./check404/check404.component";
import { TranslateComponent } from "./translate/translate.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, AddressComponent, BackwardComponent, DebugComponent, ForwardComponent, RefreshComponent, HomeComponent, IdentifiantsPopupComponent, Check404Component, TranslateComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'browser-template';
}
