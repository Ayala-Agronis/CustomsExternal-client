import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndependentPaymentComponent } from './independent-payment.component';

describe('IndependentPaymentComponent', () => {
  let component: IndependentPaymentComponent;
  let fixture: ComponentFixture<IndependentPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndependentPaymentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndependentPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
