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

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.form.patchValue({ dni: input.value });
  }

  async onSubmit() {
    if (this.form.valid) {
      const dni = this.form.value.dni!;
      this.patientFormService.updateData({ dni });
      
      // Buscamos si existe para cargar los datos
      const exists = await this.patientFormService.lookupPatientByDni(dni);
      
      if (exists && !this.patientFormService.isEditing()) {
        // Si existe y NO estamos modificando desde el botón "Modificar", saltamos al resumen
        this.patientFormService.currentStep.set(6);
      } else {
        // Si no existe o estamos en flujo de modificación, vamos paso a paso
        this.patientFormService.nextStep();
      }
    }
  }
}
