import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationFormTsComponent } from './declaration-form-Ts.component';

describe('DeclarationFormTsComponent', () => {
  let component: DeclarationFormTsComponent;
  let fixture: ComponentFixture<DeclarationFormTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarationFormTsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeclarationFormTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
