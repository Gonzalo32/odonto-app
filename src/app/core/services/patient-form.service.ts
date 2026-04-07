import { Injectable, computed, signal } from '@angular/core';
import { Patient } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientFormService {
  // Estado del paso actual (1 al 5)
  currentStep = signal<number>(1);
  
  // Datos acumulados del formulario
  formData = signal<Partial<Patient>>({});
  
  // Valores derivados
  totalSteps = computed(() => 6);
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

  // Guardado y Simulación de Impresión
  saveAndPrint() {
    const data = this.formData();
    console.log('Guardando datos en JSON simulado:', JSON.stringify(data, null, 2));
    
    // Almacenamiento persistente en localStorage para simular DB
    const currentPatients = JSON.parse(localStorage.getItem('patients_db') || '[]');
    currentPatients.push({ 
      ...data, 
      id: Date.now(), 
      createdAt: new Date().toISOString() 
    });
    localStorage.setItem('patients_db', JSON.stringify(currentPatients));

    // TODO: Implementar la conexión real con el backend Node.js + MongoDB.
    // TODO: Diseñar la planilla de impresión física y mapear los campos posicionales.
    
    alert('Datos guardados correctamente. Iniciando impresión...');
    this.reset();
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
