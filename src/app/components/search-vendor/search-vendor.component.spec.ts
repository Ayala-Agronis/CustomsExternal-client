import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchVendorComponent } from './search-vendor.component';

describe('SearchVendorComponent', () => {
  let component: SearchVendorComponent;
  let fixture: ComponentFixture<SearchVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchVendorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
