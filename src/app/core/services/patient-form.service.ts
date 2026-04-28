import { Injectable, computed, inject, signal, EffectRef, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../models/patient.model';
import { environment } from '../../../environments/environment';
import { firstValueFrom, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PatientFormService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Estado del paso actual (1 al 6)
  currentStep = signal<number>(1);
  
  // Datos acumulados del formulario
  formData = signal<Partial<Patient>>({});
  
  // Pacientes pendientes de sincronizar (cola local)
  pendingPatients = signal<Patient[]>(this.loadPendingFromStorage());
  
  // Señal para disparar la generación de PDF
  triggerPrint = signal<number>(0);
  
  // Valores derivados
  totalSteps = computed(() => 6);
  isLastStep = computed(() => this.currentStep() === this.totalSteps());
  isOffline = signal<boolean>(false);
  isEditing = signal<boolean>(false);

  constructor() {
    // Iniciar el bucle de sincronización cada 30 segundos
    interval(30000).subscribe(() => this.syncPending());
  }

  private loadPendingFromStorage(): Patient[] {
    const saved = localStorage.getItem('pending_patients');
    return saved ? JSON.parse(saved) : [];
  }

  private savePendingToStorage(patients: Patient[]) {
    localStorage.setItem('pending_patients', JSON.stringify(patients));
    this.pendingPatients.set(patients);
  }

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

  // Búsqueda Híbrida: Local (Pendientes) + Remota (MongoDB)
  async lookupPatientByDni(dni: string): Promise<boolean> {
    // 1. Buscar en cola local
    const localMatch = this.pendingPatients().find(p => p.dni === dni);
    if (localMatch) {
      console.log('Paciente encontrado en cola de sincronización local');
      this.formData.set({ ...localMatch, fechaNacimiento: this.toHtmlDateInput(localMatch.fechaNacimiento) });
      return true;
    }

    // 2. Buscar en MongoDB a través del backend
    try {
      const patients = await firstValueFrom(this.http.get<Patient[]>(`${this.apiUrl}/patients`));
      const patient = patients.find(p => p.dni === dni);
      
      if (patient) {
        this.formData.set({ ...patient, fechaNacimiento: this.toHtmlDateInput(patient.fechaNacimiento) });
        this.isOffline.set(false);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error buscando en MongoDB (posible offline):', error);
      this.isOffline.set(true);
      return false;
    }
  }

  // Guarda el paciente en segundo plano (sin bloquear la UI ni imprimir)
  // La impresión y navegación la maneja step-review.component.ts directamente.
  savePatientBackground(data: Partial<Patient>) {
    const { _id, id, ...cleanData } = data as any;
    const patientToSave: Patient = {
      ...cleanData,
      apellido: cleanData.apellido ?? '',
      nombre: cleanData.nombre ?? '',
      dni: cleanData.dni ?? '',
      domicilio: cleanData.domicilio ?? '',
      localidad: cleanData.localidad ?? '',
      fechaNacimiento: this.toDdMmAaaa(cleanData.fechaNacimiento),
      actualizadoEn: new Date().toISOString()
    };
    this.executeSave(patientToSave);
  }

  private async executeSave(patient: Patient) {
    try {
      console.log('Intentando guardar en MongoDB (fondo)...');
      await firstValueFrom(this.http.post(`${this.apiUrl}/patients`, patient));
      console.log('Paciente guardado exitosamente');
      this.isOffline.set(false);
      this.isEditing.set(false);
    } catch (error) {
      console.error('Fallo de conexión al guardar (fondo). Guardando en cola local...', error);
      this.isOffline.set(true);
      
      const currentPending = this.pendingPatients();
      const existsInPending = currentPending.some(p => p.dni === patient.dni);
      
      if (!existsInPending) {
        this.savePendingToStorage([...currentPending, patient]);
      } else {
        const updatedPending = currentPending.map(p => p.dni === patient.dni ? patient : p);
        this.savePendingToStorage(updatedPending);
      }
    }
  }

  // ========================
  // HELPERS DE FECHAS
  // ========================

  /**
   * Convierte CUALQUIER formato de fecha a dd/mm/aaaa para almacenar y mostrar.
   * Maneja: ISO (2023-10-25T00:00:00.000Z), yyyy-mm-dd, dd-mm-aaaa, dd/mm/aaaa
   */
  toDdMmAaaa(dateStr: string | undefined | null): string {
    if (!dateStr) return '';

    // Caso ISO: "1993-10-25T00:00:00.000Z" o similar
    if (dateStr.includes('T') || (dateStr.includes('-') && dateStr.split('-')[0].length === 4)) {
      const isoDate = new Date(dateStr);
      if (!isNaN(isoDate.getTime())) {
        const day = String(isoDate.getUTCDate()).padStart(2, '0');
        const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0');
        const year = isoDate.getUTCFullYear();
        return `${day}/${month}/${year}`;
      }
    }

    // Caso dd-mm-aaaa (con guiones, registros previos)
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
    }

    // Caso dd/mm/aaaa: ya está correcto
    if (dateStr.includes('/')) {
      return dateStr;
    }

    return dateStr;
  }

  /**
   * Convierte dd/mm/aaaa (almacenada) a yyyy-mm-dd (requerido por input type="date").
   */
  toHtmlDateInput(dateStr: string | undefined | null): string {
    if (!dateStr) return '';

    // Caso ISO: ya está en yyyy-mm-dd o ISO
    if (dateStr.includes('T') || (dateStr.includes('-') && dateStr.split('-')[0].length === 4)) {
      const iso = new Date(dateStr);
      if (!isNaN(iso.getTime())) {
        const day = String(iso.getUTCDate()).padStart(2, '0');
        const month = String(iso.getUTCMonth() + 1).padStart(2, '0');
        return `${iso.getUTCFullYear()}-${month}-${day}`;
      }
    }

    // Caso dd/mm/aaaa
    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/');
      return `${y}-${m}-${d}`;
    }

    // Caso dd-mm-aaaa
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 2) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    return dateStr;
  }

  // Bucle de sincronización
  async syncPending() {
    const pending = this.pendingPatients();
    if (pending.length === 0) return;

    console.log(`Intentando sincronizar ${pending.length} pacientes pendientes...`);
    const successfulSyncs: string[] = [];

    for (const patient of pending) {
      try {
        await firstValueFrom(this.http.post(`${this.apiUrl}/patients`, patient));
        successfulSyncs.push(patient.dni);
        console.log(`Paciente ${patient.dni} sincronizado correctamente.`);
      } catch (error) {
        console.warn(`Fallo al sincronizar paciente ${patient.dni}. Se reintentará luego.`);
        this.isOffline.set(true);
        break; // Detener el bucle si sigue offline
      }
    }

    if (successfulSyncs.length > 0) {
      const remaining = pending.filter(p => !successfulSyncs.includes(p.dni));
      this.savePendingToStorage(remaining);
      if (remaining.length === 0) {
        this.isOffline.set(false);
      }
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
    this.isEditing.set(false);
  }
}
