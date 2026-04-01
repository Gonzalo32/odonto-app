import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../core/services/patient-form.service';

@Component({
  selector: 'app-step-dni',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-dni.component.html',
  styleUrls: ['./step-dni.component.scss']
})
export class StepDniComponent {
  private fb = inject(FormBuilder);
  private patientFormService = inject(PatientFormService);

  form = this.fb.group({
    dni: [this.patientFormService.formData().dni || '', [Validators.required, Validators.minLength(7), Validators.maxLength(8), Validators.pattern('^[0-9]*$')]]
  });

  onSubmit() {
    if (this.form.valid) {
      this.patientFormService.updateData({ dni: this.form.value.dni! });
      this.patientFormService.nextStep();
    }
  }
}
