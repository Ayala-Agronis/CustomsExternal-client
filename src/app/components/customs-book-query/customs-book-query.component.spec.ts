import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomsBookQueryComponent } from './customs-book-query.component';

describe('CustomsBookQueryComponent', () => {
  let component: CustomsBookQueryComponent;
  let fixture: ComponentFixture<CustomsBookQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomsBookQueryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomsBookQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
