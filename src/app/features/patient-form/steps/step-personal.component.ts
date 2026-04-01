import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../core/services/patient-form.service';

@Component({
  selector: 'app-step-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-personal.component.html',
  styleUrls: ['./step-personal.component.scss']
})
export class StepPersonalComponent {
  private fb = inject(FormBuilder);
  patientFormService = inject(PatientFormService);

  form = this.fb.group({
    apellido: [this.patientFormService.formData().apellido || '', [Validators.required, Validators.minLength(2)]],
    nombre: [this.patientFormService.formData().nombre || '', [Validators.required, Validators.minLength(2)]]
  });

  onPrevious() {
    this.patientFormService.previousStep();
  }

  onSubmit() {
    if (this.form.valid) {
      this.patientFormService.updateData({
        apellido: this.form.value.apellido!,
        nombre: this.form.value.nombre!
      });
      this.patientFormService.nextStep();
    }
  }
}
