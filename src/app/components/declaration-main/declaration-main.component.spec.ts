import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationMainComponent } from './declaration-main.component';

describe('DeclarationMainComponent', () => {
  let component: DeclarationMainComponent;
  let fixture: ComponentFixture<DeclarationMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarationMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeclarationMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
