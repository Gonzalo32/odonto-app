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

  // Búsqueda de Paciente
  lookupPatientByDni(dni: string): boolean {
    const patients = JSON.parse(localStorage.getItem('patients_db') || '[]');
    const patient = patients.find((p: any) => p.dni === dni);
    
    if (patient) {
      this.formData.set({ ...patient });
      return true;
    }
    return false;
  }

  // Guardado y Simulación de Impresión (UPSERT)
  saveAndPrint() {
    const data = this.formData();
    console.log('Guardando datos en JSON simulado:', JSON.stringify(data, null, 2));
    
    // Almacenamiento persistente en localStorage para simular DB
    let currentPatients = JSON.parse(localStorage.getItem('patients_db') || '[]');
    
    // Buscar si ya existe por DNI para actualizar (UPSERT)
    const existingIndex = currentPatients.findIndex((p: any) => p.dni === data.dni);
    
    const patientToSave: Patient = { 
      ...data, 
      apellido: data.apellido!, // Aseguramos campos requeridos por la interfaz
      nombre: data.nombre!,
      dni: data.dni!,
      domicilio: data.domicilio!,
      localidad: data.localidad!,
      fechaNacimiento: data.fechaNacimiento!,
      id: data.id || Date.now(), 
      actualizadoEn: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      // Actualizar paciente existente
      currentPatients[existingIndex] = { ...currentPatients[existingIndex], ...patientToSave };
      console.log('Paciente actualizado en DB simulada.');
    } else {
      // Crear nuevo paciente
      patientToSave.creadoEn = new Date().toISOString();
      currentPatients.push(patientToSave);
      console.log('Nuevo paciente creado en DB simulada.');
    }

    localStorage.setItem('patients_db', JSON.stringify(currentPatients));

    // TODO: Implementar la conexión real con el backend Node.js + MongoDB.
    // TODO: El ID debería ser gestionado por MongoDB (_id).
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
