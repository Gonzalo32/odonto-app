import { Component, inject } from '@angular/core';
import { PatientFormService } from '../../../core/services/patient-form.service';

@Component({
  selector: 'app-cancel-button',
  standalone: true,
  template: `
    <button class="cancel-x" (click)="cancel()" title="Cancelar y volver al inicio" aria-label="Cancelar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `,
  styles: [`
    :host {
      position: absolute;
      top: var(--spacing-md);
      right: var(--spacing-md);
      z-index: 10;
    }

    .cancel-x {
      display: flex;
      align-items: center;
      justify-content: center;
      width: clamp(36px, 5vh, 52px);
      height: clamp(36px, 5vh, 52px);
      border: none;
      background: transparent;
      color: var(--primary-color);
      cursor: pointer;
      border-radius: 50%;
      transition: background 0.18s, transform 0.15s;
      opacity: 0.7;

      &:hover {
        background: var(--primary-light);
        opacity: 1;
        transform: scale(1.12);
      }

      &:active {
        transform: scale(0.95);
      }

      svg {
        width: 60%;
        height: 60%;
        stroke-width: 2.8;
      }
    }
  `]
})
export class CancelButtonComponent {
  private patientFormService = inject(PatientFormService);

  cancel() {
    this.patientFormService.reset();
  }
}
