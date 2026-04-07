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
        <div class="summary-item">
          <span class="label">DNI:</span>
          <span class="value">{{ patientFormService.formData().dni }}</span>
        </div>
        
        <div class="summary-row">
          <div class="summary-item">
            <span class="label">Apellido:</span>
            <span class="value">{{ patientFormService.formData().apellido }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Nombre:</span>
            <span class="value">{{ patientFormService.formData().nombre }}</span>
          </div>
        </div>

        <div class="summary-row">
          <div class="summary-item">
            <span class="label">Teléfono:</span>
            <span class="value">{{ patientFormService.formData().telefono || 'No proporcionado' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Fecha Nac.:</span>
            <span class="value">{{ formatDate(patientFormService.formData().fechaNacimiento) }}</span>
          </div>
        </div>

        <div class="summary-item">
          <span class="label">Obra Social:</span>
          <span class="value">
            {{ patientFormService.formData().obraSocial || 'Particular' }}
            <ng-container *ngIf="patientFormService.formData().numeroAfiliado">
              <br>
              <span class="affiliate-label">Afiliado: {{ patientFormService.formData().numeroAfiliado }}:</span>
            </ng-container>
          </span>
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

      <div class="actions">
        <button type="button" class="btn-secondary" (click)="onPrevious()">Atrás</button>
        <button type="button" class="btn-primary" (click)="onConfirm()">Imprimir</button>
      </div>
    </div>
  `,
  styles: [`
    .summary-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin: 1rem 0;
      padding: 1.5rem;
      background: rgba(var(--primary-color-rgb, 0, 86, 179), 0.05);
      border-radius: var(--border-radius-base);
      border: 1px solid var(--border-color);
    }
    .summary-row {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
      min-width: 200px;
    }
    .label {
      font-size: 1.1rem;
      color: var(--text-light);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .value {
      font-size: 1.8rem;
      color: var(--text-color);
      font-weight: 600;
      line-height: 1.2;
    }
    .affiliate-label {
      font-size: 1.2rem;
      color: var(--primary-color);
      font-weight: 500;
      background: rgba(var(--primary-color-rgb, 0, 86, 179), 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      display: inline-block;
      margin-top: 0.4rem;
    }
    .actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: 2rem;
      button { flex: 1; }
    }
  `]
})
export class StepReviewComponent {
  patientFormService = inject(PatientFormService);

  onPrevious() {
    this.patientFormService.previousStep();
  }

  onConfirm() {
    this.patientFormService.saveAndPrint();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'No proporcionada';
    // Asumimos formato YYYY-MM-DD del input date
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
}
