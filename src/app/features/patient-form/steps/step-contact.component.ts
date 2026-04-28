import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../core/services/patient-form.service';

@Component({
  selector: 'app-step-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-contact.component.html'
})
export class StepContactComponent {
  private fb = inject(FormBuilder);
  patientFormService = inject(PatientFormService);

  form = this.fb.group({
    telefono: [this.patientFormService.formData().telefono || '', [Validators.required, Validators.pattern('^[0-9]*$')]],
    fechaNacimiento: [this.patientFormService.formData().fechaNacimiento || '', [Validators.required]]
  });

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.form.patchValue({ telefono: input.value });
  }

  onPrevious() {
    this.patientFormService.previousStep();
  }

  onSubmit() {
    if (this.form.valid) {
      this.patientFormService.updateData({
        telefono: this.form.value.telefono!,
        fechaNacimiento: this.form.value.fechaNacimiento!
      });
      this.patientFormService.nextStep();
    }
  }
}
