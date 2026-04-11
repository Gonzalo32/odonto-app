import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-confirm',
  standalone: true,
  template: `
    <div class="patient-confirm">
      <h2>Confirmar Datos</h2>
      <p>Verifique que sus datos sean correctos.</p>
      <!-- TODO: Implementar vista de confirmación -->
    </div>
  `,
  styles: [`
    .patient-confirm { padding: 2rem; }
  `]
})
export class PatientConfirmComponent {}
