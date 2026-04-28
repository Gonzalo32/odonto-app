import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../models/patient.model';
import { environment } from '../../../environments/environment';
import { firstValueFrom, interval, timeout } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PatientFormService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  currentStep = signal<number>(1);
  formData = signal<Partial<Patient>>({});
  pendingPatients = signal<Patient[]>(this.loadPendingFromStorage());

  totalSteps = computed(() => 6);
  isLastStep = computed(() => this.currentStep() === this.totalSteps());
  isOffline = signal<boolean>(false);
  isEditing = signal<boolean>(false);

  constructor() {
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

  async lookupPatientByDni(dni: string): Promise<boolean> {
    const localMatch = this.pendingPatients().find(p => p.dni === dni);
    if (localMatch) {
      this.formData.set({ ...localMatch, fechaNacimiento: this.toHtmlDateInput(localMatch.fechaNacimiento) });
      return true;
    }

    try {
      // Busca directamente por DNI con timeout de 3 segundos
      const patient = await firstValueFrom(
        this.http.get<Patient>(`${this.apiUrl}/patients/dni/${dni}`).pipe(
          timeout(3000)
        )
      );

      if (patient) {
        this.formData.set({ ...patient, fechaNacimiento: this.toHtmlDateInput(patient.fechaNacimiento) });
        this.isOffline.set(false);
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.status === 404) {
        // No encontrado no es un error de red
        this.isOffline.set(false);
        return false;
      }
      console.warn('Error buscando en MongoDB (timeout o offline):', error);
      this.isOffline.set(true);
      return false; // Permite avanzar al siguiente paso si hay falla de conexión
    }
  }

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
      await firstValueFrom(this.http.post(`${this.apiUrl}/patients`, patient));
      this.isOffline.set(false);
      this.isEditing.set(false);
    } catch (error) {
      console.error('Fallo de conexión. Guardando en cola local...', error);
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

  /** Convierte cualquier formato de fecha a dd/mm/aaaa. Maneja: ISO, yyyy-mm-dd, dd-mm-aaaa, dd/mm/aaaa */
  toDdMmAaaa(dateStr: string | undefined | null): string {
    if (!dateStr) return '';

    if (dateStr.includes('T') || (dateStr.includes('-') && dateStr.split('-')[0].length === 4)) {
      const isoDate = new Date(dateStr);
      if (!isNaN(isoDate.getTime())) {
        const day = String(isoDate.getUTCDate()).padStart(2, '0');
        const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0');
        const year = isoDate.getUTCFullYear();
        return `${day}/${month}/${year}`;
      }
    }

    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
    }

    if (dateStr.includes('/')) {
      return dateStr;
    }

    return dateStr;
  }

  /** Convierte dd/mm/aaaa a yyyy-mm-dd (requerido por input type="date") */
  toHtmlDateInput(dateStr: string | undefined | null): string {
    if (!dateStr) return '';

    if (dateStr.includes('T') || (dateStr.includes('-') && dateStr.split('-')[0].length === 4)) {
      const iso = new Date(dateStr);
      if (!isNaN(iso.getTime())) {
        const day = String(iso.getUTCDate()).padStart(2, '0');
        const month = String(iso.getUTCMonth() + 1).padStart(2, '0');
        return `${iso.getUTCFullYear()}-${month}-${day}`;
      }
    }

    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/');
      return `${y}-${m}-${d}`;
    }

    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 2) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    return dateStr;
  }

  async syncPending() {
    const pending = this.pendingPatients();
    if (pending.length === 0) return;

    const successfulSyncs: string[] = [];

    for (const patient of pending) {
      try {
        await firstValueFrom(this.http.post(`${this.apiUrl}/patients`, patient));
        successfulSyncs.push(patient.dni);
      } catch (error) {
        this.isOffline.set(true);
        break;
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

  updateData(newData: Partial<Patient>) {
    this.formData.update(current => ({ ...current, ...newData }));
  }

  reset() {
    this.currentStep.set(1);
    this.formData.set({});
    this.isEditing.set(false);
  }
}
