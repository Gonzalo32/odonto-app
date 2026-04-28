import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../core/services/patient-form.service';

@Component({
  selector: 'app-step-insurance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-insurance.component.html'
})
export class StepInsuranceComponent {
  private fb = inject(FormBuilder);
  patientFormService = inject(PatientFormService);

  form = this.fb.group({
    obraSocial: [this.patientFormService.formData().obraSocial || '', [Validators.required]],
    numeroAfiliado: [this.patientFormService.formData().numeroAfiliado || '', [Validators.pattern('^[0-9]*$')]]
  });

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.form.patchValue({ numeroAfiliado: input.value });
  }

  onPrevious() {
    this.patientFormService.previousStep();
  }

  onSubmit() {
    if (this.form.valid) {
      this.patientFormService.updateData({
        obraSocial: this.form.value.obraSocial!,
        numeroAfiliado: this.form.value.numeroAfiliado || ''
      });
      this.patientFormService.nextStep();
    }
  }
}
