import { Component } from '@angular/core';

@Component({
  selector: 'app-dni-lookup',
  standalone: true,
  template: `
    <div class="dni-lookup">
      <h2>Ingreso de DNI</h2>
      <p>Por favor, ingrese su número de documento para comenzar.</p>
      <!-- TODO: Implementar formulario de búsqueda -->
    </div>
  `,
  styles: [`
    .dni-lookup { padding: 2rem; text-align: center; }
  `]
})
export class DniLookupComponent {}
