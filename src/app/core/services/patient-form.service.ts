import { Injectable, computed, signal } from '@angular/core';
import { Patient } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientFormService {
  // Estado del paso actual (1 al 5)
  currentStep = signal<number>(1);
  
  // Datos acumulados del formulario
  formData = signal<Partial<Patient>>({});
  
  // Valores derivados
  totalSteps = computed(() => 5);
  isLastStep = computed(() => this.currentStep() === this.totalSteps());

  // Navegación
  nextStep() {
    if (this.currentStep() < this.totalSteps()) {
      this.currentStep.update(s => s + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  // Actualización de datos
  updateData(newData: Partial<Patient>) {
    this.formData.update(current => ({ ...current, ...newData }));
  }

  // Reseteo
  reset() {
    this.currentStep.set(1);
    this.formData.set({});
  }
}
