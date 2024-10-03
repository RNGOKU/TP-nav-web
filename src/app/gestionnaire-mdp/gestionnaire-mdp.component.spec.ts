import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionnaireMdpComponent } from './gestionnaire-mdp.component';

describe('GestionnaireMdpComponent', () => {
  let component: GestionnaireMdpComponent;
  let fixture: ComponentFixture<GestionnaireMdpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionnaireMdpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionnaireMdpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
