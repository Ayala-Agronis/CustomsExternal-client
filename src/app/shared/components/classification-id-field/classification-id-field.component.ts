import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-classification-id-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    AutoCompleteModule,
  ],
  templateUrl: './classification-id-field.component.html',
  styleUrl: './classification-id-field.component.scss',
})
export class ClassificationIdFieldComponent {
  @Input({ required: true }) control!: FormControl;
  @Input() disabled = false;

  @Output() searchClicked = new EventEmitter<void>();
  @Output() unknownClicked = new EventEmitter<void>();

  @Output() inputBlur = new EventEmitter<void>();

  @Input() suggestions: any[] = [];

  @Output() completeMethod = new EventEmitter<any>();
  @Output() optionSelected = new EventEmitter<any>();

  isUnknown = false;

  setUnknown(): void {
    this.isUnknown = true;

    this.control.setValue(null);
    this.control.markAsDirty();

    this.unknownClicked.emit();
  }

  onInputBlur(): void {
    console.log('blur from classification component');
    this.inputBlur.emit();
  }

  clearUnknownMode(): void {
    if (!this.isUnknown) return;

    this.isUnknown = false;
  }

  openSearch() {
    this.searchClicked.emit();
  }

  onComplete(event: any): void {
    this.completeMethod.emit(event);
  }

  onSelect(event: any): void {
    this.isUnknown = false;
    this.optionSelected.emit(event.value);
  }


}
