import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDocumentsComponent } from './add-documents.component';

describe('AddDocumentsComponent', () => {
  let component: AddDocumentsComponent;
  let fixture: ComponentFixture<AddDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDocumentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
