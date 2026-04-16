import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../core/services/patient-form.service';

@Component({
  selector: 'app-step-thankyou',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="thankyou-wrapper">
      <div class="checkmark-circle">
        <svg viewBox="0 0 52 52" class="checkmark-svg">
          <circle class="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-tick" fill="none" d="M14.5 27l7.5 7.5 16-16"/>
        </svg>
      </div>

      <h1 class="thankyou-title">¡Gracias!</h1>
      <p class="thankyou-message">Sus datos fueron registrados correctamente.</p>
      <p class="thankyou-sub">Diríjase a la recepción.</p>

      <div class="countdown-bar">
        <div class="countdown-fill" [style.animation-duration]="'3s'"></div>
      </div>
    </div>
  `,
  styles: [`
    .thankyou-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: var(--spacing-lg);
      animation: fadeIn 0.5s ease-out;
      gap: var(--spacing-md);
    }

    .checkmark-circle {
      width: clamp(80px, 15vw, 140px);
      height: clamp(80px, 15vw, 140px);
      animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
    }

    .checkmark-svg {
      width: 100%;
      height: 100%;
    }

    .checkmark-circle-bg {
      stroke: var(--primary-light);
      stroke-width: 2;
    }

    .checkmark-tick {
      stroke: var(--primary-color);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 50;
      stroke-dashoffset: 50;
      animation: drawTick 0.5s ease-out 0.4s forwards;
    }

    .thankyou-title {
      font-family: var(--font-family-title);
      font-size: clamp(2.5rem, 8vw, 5rem);
      color: var(--primary-color);
      margin: 0;
      animation: fadeInUp 0.5s ease-out 0.3s both;
    }

    .thankyou-message {
      font-size: clamp(1rem, 3vw, 1.8rem);
      color: var(--text-color);
      text-align: center;
      animation: fadeInUp 0.5s ease-out 0.4s both;
    }

    .thankyou-sub {
      font-size: clamp(0.9rem, 2.5vw, 1.4rem);
      color: var(--primary-color);
      font-weight: 600;
      text-align: center;
      animation: fadeInUp 0.5s ease-out 0.5s both;
    }

    .countdown-bar {
      width: 200px;
      height: 4px;
      background: var(--primary-light);
      border-radius: 2px;
      overflow: hidden;
      margin-top: var(--spacing-md);
      animation: fadeInUp 0.5s ease-out 0.6s both;
    }

    .countdown-fill {
      height: 100%;
      width: 100%;
      background: var(--primary-color);
      transform-origin: left;
      animation: shrink linear forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    @keyframes drawTick {
      to { stroke-dashoffset: 0; }
    }

    @keyframes shrink {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
  `]
})
export class StepThankyouComponent implements OnInit {
  private patientFormService = inject(PatientFormService);

  ngOnInit() {
    // Esperar 3 segundos y luego resetear al inicio
    setTimeout(() => {
      this.patientFormService.reset();
    }, 3000);
  }
}
