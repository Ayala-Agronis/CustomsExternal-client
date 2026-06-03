import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationIdFieldComponent } from './classification-id-field.component';

describe('ClassificationIdFieldComponent', () => {
  let component: ClassificationIdFieldComponent;
  let fixture: ComponentFixture<ClassificationIdFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassificationIdFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassificationIdFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
