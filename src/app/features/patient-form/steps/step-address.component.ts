import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../core/services/patient-form.service';

@Component({
  selector: 'app-step-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-address.component.html',
  styleUrls: ['./step-address.component.scss']
})
export class StepAddressComponent {
  private fb = inject(FormBuilder);
  patientFormService = inject(PatientFormService);

  form = this.fb.group({
    localidad: [this.patientFormService.formData().localidad || '', [Validators.required]],
    domicilio: [this.patientFormService.formData().domicilio || '', [Validators.required]]
  });

  onPrevious() {
    this.patientFormService.previousStep();
  }

  onSubmit() {
    if (this.form.valid) {
      this.patientFormService.updateData({
        localidad: this.form.value.localidad!,
        domicilio: this.form.value.domicilio!
      });
      this.patientFormService.nextStep();
    }
  }
}
