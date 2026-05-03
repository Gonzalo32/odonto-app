import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../core/services/patient-form.service';

const PRINT_CSS = `
@page { size: A4 landscape; margin: 0; }
body { margin: 0; padding: 0; }
.print-container {
  --off-x: 10.2cm;
  --off-y: 4.5cm;
  width: 29.7cm;
  height: 21.0cm;
  position: relative;
  background-color: white;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11pt;
  color: #000;
}
.field {
  position: absolute;
  white-space: nowrap;
}
.name-field {
  top: calc(1.7cm + var(--off-y));
  left: calc(5.9cm + var(--off-x));
  font-weight: bold;
  font-size: 10pt;
}
.afiliado-container {
  position: absolute;
  top: calc(1.7cm + var(--off-y));
  left: calc(13.1cm + var(--off-x));
  display: flex;
  gap: 1mm;
}
.afiliado-container .digit {
  width: 0.3cm;
  text-align: center;
  display: inline-block;
}
.domicilio-field {
  top: calc(2.35cm + var(--off-y));
  left: calc(3.0cm + var(--off-x));
}
.localidad-field {
  top: calc(2.35cm + var(--off-y));
  left: calc(12.1cm + var(--off-x));
}
.tel-field {
  top: calc(2.35cm + var(--off-y));
  left: calc(16.6cm + var(--off-x));
}
.dni-field {
  top: calc(3.0cm + var(--off-y));
  left: calc(2.7cm + var(--off-x));
}
.fecha-nac-container {
  position: absolute;
  top: calc(3.0cm + var(--off-y));
  left: calc(9.1cm + var(--off-x));
  font-size: 9pt;
}
.fecha-nac-container span {
  position: absolute;
  text-align: center;
}
.fecha-nac-container .day   { left: 0;      width: 0.4cm; }
.fecha-nac-container .month { left: 0.6cm;  width: 0.4cm; }
.fecha-nac-container .year  { left: 1.2cm;  width: 0.4cm; }
.edad-field {
  top: calc(3.0cm + var(--off-y));
  left: calc(11.8cm + var(--off-x));
}
.obra-social-field {
  top: calc(3.0cm + var(--off-y));
  left: calc(14.5cm + var(--off-x));
}
`;

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="imprimiendo" style="
      position:fixed;top:0;left:0;width:100vw;height:100vh;
      background:rgba(0,0,0,0.85);display:flex;align-items:center;
      justify-content:center;z-index:9999;flex-direction:column;gap:20px;">
      <div style="width:60px;height:60px;border:6px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      <p style="color:#fff;font-size:2rem;font-family:sans-serif;">Imprimiendo...</p>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>

    <div class="step-wrapper">
      <h2 class="step-title">Revisar Datos</h2>

      <div class="summary-container">
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
  imprimiendo = false;

  onModificar() {
    this.patientFormService.isEditing.set(true);
    this.patientFormService.currentStep.set(1);
  }

  onConfirm() {
    const patient = this.patientFormService.formData();
    this.imprimiendo = true;
    this.patientFormService.savePatientBackground(patient);

    setTimeout(() => {
      this.printViaIframe();
      setTimeout(() => {
        this.imprimiendo = false;
        this.patientFormService.currentStep.set(7);
      }, 1500);
    }, 300);
  }

  private printViaIframe() {
    const printData = document.getElementById('print-data');
    if (!printData) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:297mm;height:210mm;border:none;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const cleanup = () => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };

    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>${PRINT_CSS}</style></head><body>${printData.outerHTML}</body></html>`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(cleanup, 2000);
    }, 100);
  }

  formatDate(dateStr?: string): string {
    return this.patientFormService.toDdMmAaaa(dateStr) || 'No proporcionada';
  }
}
