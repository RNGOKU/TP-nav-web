import { Component, inject } from '@angular/core';
import { BrowserService } from '../browser.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-check404',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './check404.component.html',
  styleUrl: './check404.component.css',
})
export class Check404Component {
  public browserService = inject(BrowserService);

  constructor() {}

  async check404() {
    const test = (window as any).electronAPI.check404();
  }
}
