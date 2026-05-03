import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../core/services/patient-form.service';

@Component({
  selector: 'app-step-insurance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-insurance.component.html',
  styles: [`
    .autocomplete-container {
      position: relative;
      width: 100%;
    }
    .options-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-base);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      max-height: 250px;
      overflow-y: auto;
      margin-top: 5px;
    }
    .option-item {
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s;
      color: var(--text-color);
      font-size: 1.1rem;
    }
    .option-item:hover {
      background: var(--primary-light);
      color: var(--primary-color);
    }
    .no-results {
      padding: 12px 16px;
      color: var(--text-light);
      font-style: italic;
    }
  `]
})
export class StepInsuranceComponent {
  private fb = inject(FormBuilder);
  patientFormService = inject(PatientFormService);

  obrasSociales = [
    "Particular",
    ...[
      "O.S.PE.PRI", "FORN", "ARSALUD S.A.", "SanCorSalud", "Unión Obrera Metalúrgica", 
      "CORA", "Avalian", "Caja Forense", "CEO-MDP", "Consulmed", "OSDOP", "DAS", "Galeno", 
      "Gerdanna Salud", "SANIDAD", "Osfatun", "Jerárquicos Salud", "La Segunda", "OSFALYF", 
      "MCA", "MEDICUS", "Medifé", "Federada Salud", "TV SALUD", "OSPJN", "O.S.P.E.S", "OSDE", 
      "Prevención Salud", "MEOPP", "Sanitas", "SOSUNC", "Swiss MEDICAL", "OSAPM", "OSPSIP", 
      "OSPESGA salud", "SaludTotal", "SOCDUS SA", "OSTPCPH y ARA-", "UTEPLIMSALUD", 
      "OPSA OSPPCyQ", "OSDIPP", "OSPE", "Obra Social Ferroviaria", "Integral compromiso médico", 
      "Servicio Penitenciario Federal"
    ].sort()
  ];

  filteredObras = signal<string[]>([...this.obrasSociales]);
  showDropdown = signal(false);

  form = this.fb.group({
    obraSocial: [this.patientFormService.formData().obraSocial || '', [Validators.required]],
    numeroAfiliado: [this.patientFormService.formData().numeroAfiliado || '', [Validators.pattern('^[0-9]*$')]]
  });

  filterObras() {
    const val = this.form.get('obraSocial')?.value?.toLowerCase() || '';
    this.filteredObras.set(
      this.obrasSociales.filter(o => o.toLowerCase().includes(val))
    );
  }

  selectObra(obra: string) {
    this.form.patchValue({ obraSocial: obra });
    if (obra === 'Particular') {
      this.form.patchValue({ numeroAfiliado: '' });
    }
    this.showDropdown.set(false);
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.form.patchValue({ numeroAfiliado: input.value });
  }

  onPrevious() {
    this.patientFormService.previousStep();
  }

  onSubmit() {
    if (this.form.valid) {
      this.patientFormService.updateData({
        obraSocial: this.form.value.obraSocial!,
        numeroAfiliado: this.form.value.numeroAfiliado || ''
      });
      this.patientFormService.nextStep();
    }
  }

  hideDropdown() {
    // Delay to allow item click to register before dropdown is removed from DOM
    setTimeout(() => this.showDropdown.set(false), 200);
  }
}
