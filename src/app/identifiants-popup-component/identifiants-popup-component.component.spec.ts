import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifiantsPopupComponent } from "./identifiants-popup-component.component";

describe('IdentifiantsPopupComponent', () => {
  let component: IdentifiantsPopupComponent;
  let fixture: ComponentFixture<IdentifiantsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentifiantsPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentifiantsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
