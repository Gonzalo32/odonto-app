import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../core/services/patient-form.service';

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-wrapper">
      <h2 class="step-title">Revisar Datos</h2>
      
      <div class="summary-container">
        <!-- Columna 1 -->
        <div class="summary-column">
          <div class="summary-item">
            <span class="label">DNI:</span>
            <span class="value">{{ patientFormService.formData().dni }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Apellido:</span>
            <span class="value">{{ patientFormService.formData().apellido }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Nombre:</span>
            <span class="value">{{ patientFormService.formData().nombre }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Teléfono:</span>
            <span class="value">{{ patientFormService.formData().telefono || 'No proporcionado' }}</span>
          </div>
        </div>

        <!-- Columna 2 -->
        <div class="summary-column">
          <div class="summary-item">
            <span class="label">Fecha Nac.:</span>
            <span class="value">{{ formatDate(patientFormService.formData().fechaNacimiento) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Obra Social:</span>
            <span class="value">{{ patientFormService.formData().obraSocial || 'Particular' }}</span>
          </div>
          <div class="summary-item" *ngIf="patientFormService.formData().numeroAfiliado">
            <span class="label">Afiliado:</span>
            <span class="value">{{ patientFormService.formData().numeroAfiliado }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Localidad:</span>
            <span class="value">{{ patientFormService.formData().localidad }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Domicilio:</span>
            <span class="value">{{ patientFormService.formData().domicilio }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="btn-secondary" (click)="onModificar()">Modificar</button>
        <button type="button" class="btn-primary" (click)="onConfirm()">Aceptar</button>
      </div>
    </div>
  `,
  styles: [`
    .summary-container {
      display: flex;
      flex-direction: row;
      gap: var(--spacing-lg);
      margin: var(--spacing-sm) 0;
      padding: var(--spacing-md);
      background: rgba(var(--primary-color-rgb, 125, 51, 106), 0.05);
      border-radius: var(--border-radius-base);
      border: 1px solid var(--border-color);
      width: 100%;
      justify-content: space-between;
    }
    .summary-column {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      flex: 1;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .label {
      font-size: clamp(0.7rem, 1.5vh, 0.9rem);
      color: var(--text-light);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .value {
      font-size: clamp(1rem, 2.5vh, 1.5rem);
      color: var(--text-color);
      font-weight: 600;
      line-height: 1.2;
    }
    .actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: var(--spacing-md);
      width: 100%;
      button { flex: 1; }
    }
  `]
})
export class StepReviewComponent {
  patientFormService = inject(PatientFormService);

  onModificar() {
    this.patientFormService.isEditing.set(true);
    this.patientFormService.currentStep.set(1);
  }

  onConfirm() {
    this.patientFormService.saveAndPrint();
  }

  formatDate(dateStr?: string): string {
    return this.patientFormService.toDdMmAaaa(dateStr) || 'No proporcionada';
  }
}
