import { Component } from '@angular/core';

@Component({
  selector: 'app-print-preview',
  standalone: true,
  template: `
    <div class="print-preview">
      <h2>Vista Previa de Impresión</h2>
      <!-- TODO: Implementar vista previa con variables CSS -->
    </div>
  `,
  styles: [`
    .print-preview { padding: 2rem; }
  `]
})
export class PrintPreviewComponent {}
