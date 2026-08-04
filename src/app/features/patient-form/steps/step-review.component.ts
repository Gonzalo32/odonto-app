import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientFormService } from '../../../core/services/patient-form.service';
import { CancelButtonComponent } from '../../../shared/components/cancel-button/cancel-button.component';

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
  text-transform: uppercase;
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
  left: calc(13.25cm + var(--off-x));
  display: flex;
  gap: 0.9mm;
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
  left: calc(9.3cm + var(--off-x));
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
  top: calc(2.92cm + var(--off-y));
  left: calc(14.5cm + var(--off-x));
}
.profesional-field {
  position: absolute;
  top: calc(3.75cm + var(--off-y));
  left: calc(13.6cm + var(--off-x));
  font-weight: bold;
}
.matricula-field {
  position: absolute;
  top: calc(4.44cm + var(--off-y));
  left: calc(18cm + var(--off-x));
  font-weight: normal;
}
.ciudad-field {
  position: absolute;
  top: calc(5.15cm + var(--off-y));  /* 1cm debajo de matrícula */
  left: calc(15.6cm + var(--off-x));   /* mismo left que matrícula */
  font-weight: normal;
}
`;

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [CommonModule, CancelButtonComponent, FormsModule],
  template: `
    <div *ngIf="imprimiendo" style="
      position:fixed;top:0;left:0;width:100vw;height:100vh;
      background:rgba(0,0,0,0.85);display:flex;align-items:center;
      justify-content:center;z-index:9999;flex-direction:column;gap:20px;">
      <div style="width:60px;height:60px;border:6px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      <p style="color:#fff;font-size:2rem;font-family:sans-serif;">Imprimiendo...</p>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>

    <!-- POPUP CAMBIAR PROFESIONAL -->
    <div class="modal-backdrop" *ngIf="showProfModal" (click)="cerrarModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <h3 class="modal-title">Seleccionar Profesional</h3>

        <input
          class="modal-search"
          type="text"
          placeholder="Buscar profesional..."
          [(ngModel)]="profSearch"
          (ngModelChange)="filtrarProfesionales($event)"
          autocomplete="off"
        >

        <div class="prof-list">
          <div
            class="prof-item"
            *ngFor="let prof of profesionalesFiltrados"
            [class.selected]="prof === profSeleccionado"
            (click)="seleccionarProfesional(prof)"
          >
            {{ prof }}
          </div>
          <div class="no-results" *ngIf="profesionalesFiltrados.length === 0">
            Sin resultados
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" (click)="cerrarModal()">Cancelar</button>
          <button class="btn-primary" [disabled]="!profSeleccionado" (click)="confirmarProfesional()">Confirmar</button>
        </div>
      </div>
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
          <div class="summary-item" *ngIf="patientFormService.formData().profesional">
            <span class="label">Profesional:</span>
            <span class="value">{{ patientFormService.formData().profesional }}</span>
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
        <button
          *ngIf="patientFormService.isExistingPatient()"
          type="button"
          class="btn-prof"
          (click)="onCambiarProfesional()">
          Cambiar Profesional
        </button>
        <app-cancel-button></app-cancel-button>
      </div>
    </div>
  `,
  styles: [`
    /* ── Modal ─────────────────────────────────── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.18s ease;
    }
    .modal-card {
      background: var(--bg-color);
      border-radius: var(--border-radius-large);
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      padding: var(--spacing-lg);
      width: min(500px, 90vw);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      animation: slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
    }
    .modal-title {
      font-family: var(--font-family-title);
      font-size: clamp(1.2rem, 3vh, 1.8rem);
      color: var(--primary-color);
      text-align: center;
      margin: 0;
    }
    .modal-search {
      width: 100%;
      padding: var(--spacing-md);
      font-size: var(--font-size-base);
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius-base);
      outline: none;
      background: var(--bg-color);
      color: var(--text-color);
      text-transform: uppercase;
      &:focus { border-color: var(--primary-color); }
      &::placeholder { text-transform: none; }
    }
    .prof-list {
      max-height: clamp(180px, 30vh, 320px);
      overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-base);
      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-thumb { background: var(--primary-light); border-radius: 10px; }
    }
    .prof-item {
      padding: clamp(10px, 1.5vh, 18px) var(--spacing-md);
      cursor: pointer;
      font-size: var(--font-size-base);
      color: var(--text-color);
      transition: background 0.15s;
      text-transform: uppercase;
      &:hover { background: var(--primary-light); color: var(--primary-color); }
      &.selected {
        background: var(--primary-color);
        color: white;
        font-weight: 600;
      }
    }
    .no-results {
      padding: var(--spacing-md);
      color: var(--text-light);
      font-style: italic;
      text-align: center;
    }
    .modal-actions {
      display: flex;
      gap: var(--spacing-md);
      button { flex: 1; }
    }

    /* ── Summary ────────────────────────────────── */
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
      font-family: var(--font-family-title);
      font-size: clamp(0.7rem, 1.5vh, 0.9rem);
      color: var(--text-light);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .value {
      font-size: clamp(1rem, 2.5vh, 1.5rem);
      color: var(--text-color);
      font-weight: 600;
      line-height: 1.2;
      text-transform: uppercase;
    }
    .actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: var(--spacing-md);
      width: 100%;
      button { flex: 1; }
    }
    .btn-prof {
      flex: 1;
      width: 100%;
      padding: var(--spacing-md);
      font-size: var(--font-size-large);
      font-weight: 600;
      background-color: transparent;
      color: var(--secondary-color);
      border: 2px solid var(--secondary-color);
      border-radius: var(--border-radius-base);
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
      &:hover { background-color: rgba(157, 77, 138, 0.08); }
      &:active { transform: scale(0.98); }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
  `]
})
export class StepReviewComponent {
  patientFormService = inject(PatientFormService);
  imprimiendo = false;

  /* ── Modal state ─────────────────────────────── */
  showProfModal = false;
  profSearch = '';
  profSeleccionado = '';

  readonly profesionales = [
    "Kevin Anzoategui", "Beatriz Baleiron", "Martin Chaparro",
    "Gustavo D'archivio", "Aldana Diaz", "Ana Diaz Pantoja",
    "Ignacio Faes", "Lucas Garritano", "Agustina Grispino",
    "Fabian Grispino", "Eliana Lopez", "Julian Nicolini",
    "Amparo Suter", "Karla Useche"
  ];

  readonly profesionalMatricula: Record<string, number> = {
    "Beatriz Baleiron": 1789, "Kevin Anzoategui": 2198,
    "Eliana Lopez": 2039,    "Lucas Garritano": 2164,
    "Julian Nicolini": 2046, "Amparo Suter": 2173,
    "Fabian Grispino": 665,  "Gustavo D'archivio": 680,
    "Karla Useche": 2193,    "Agustina Grispino": 2125,
    "Martin Chaparro": 2182, "Ignacio Faes": 2106,
    "Aldana Diaz": 2112,     "Ana Diaz Pantoja": 3590
  };

  profesionalesFiltrados: string[] = [...this.profesionales];

  onCambiarProfesional() {
    this.profSearch = '';
    this.profSeleccionado = this.patientFormService.formData().profesional || '';
    this.profesionalesFiltrados = [...this.profesionales];
    this.showProfModal = true;
  }

  filtrarProfesionales(query: string) {
    const q = query.toLowerCase();
    this.profesionalesFiltrados = this.profesionales.filter(p => p.toLowerCase().includes(q));
  }

  seleccionarProfesional(prof: string) {
    this.profSeleccionado = prof;
  }

  confirmarProfesional() {
    if (!this.profSeleccionado) return;
    const matricula = this.profesionalMatricula[this.profSeleccionado] ?? null;
    this.patientFormService.updateData({
      profesional: this.profSeleccionado,
      ...(matricula !== null ? { matricula: String(matricula) } : {})
    });
    this.showProfModal = false;
  }

  cerrarModal() {
    this.showProfModal = false;
  }

  /* ── Review actions ──────────────────────────── */
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

