import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { BrowserService } from '../browser.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [MatIconModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css'
})
export class AddressComponent {
  @ViewChild('search') searchElement: ElementRef = new ElementRef({});

  public browserService = inject(BrowserService);

  onKeyDownEvent(e: any) {
    if (e.key === 'Escape') {
      e.currentTarget.blur();
      this.browserService.setToCurrentUrl();
    } else if (e.key === 'Enter') {
      let value = e.currentTarget.value;
      value = e.currentTarget.value.trim(); // Trim whitespace
      // Add http:// or https:// if not present
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        // Check if it might be a direct IP or a local file path
        if (!value.includes('.') && !value.startsWith('/')) {
          value = 'https://www.google.com/search?q=' + encodeURIComponent(value); 
        } else {
          value = 'http://' + value;
        }
      }
      e.currentTarget.blur();
      this.goToPage(value);
    }
  }

  onMouseDown(e: any) {
    this.searchElement.nativeElement.select();
  };

  goToPage(url: string) {
    this.browserService.goToPage(url);
  }
}
