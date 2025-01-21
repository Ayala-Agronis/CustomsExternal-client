import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationQueryComponent } from './declaration-query.component';

describe('DeclarationQueryComponent', () => {
  let component: DeclarationQueryComponent;
  let fixture: ComponentFixture<DeclarationQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarationQueryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeclarationQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
