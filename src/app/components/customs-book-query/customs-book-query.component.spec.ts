import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomsBookQuery1Component } from './customs-book-query.component';

describe('CustomsBookQuery1Component', () => {
  let component: CustomsBookQuery1Component;
  let fixture: ComponentFixture<CustomsBookQuery1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomsBookQuery1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomsBookQuery1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
