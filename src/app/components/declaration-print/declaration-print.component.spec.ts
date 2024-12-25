import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationPrintComponent } from './declaration-print.component';

describe('DeclarationPrintComponent', () => {
  let component: DeclarationPrintComponent;
  let fixture: ComponentFixture<DeclarationPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarationPrintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeclarationPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
