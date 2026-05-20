import { Component, inject, signal, ElementRef, ViewChild, OnInit } from '@angular/core';
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
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .clear-btn {
      position: absolute;
      right: 15px;
      background: none;
      border: none;
      color: var(--text-light);
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      transition: color 0.2s;
    }
    .clear-btn:hover {
      color: var(--error-color);
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
    .option-item:hover, .option-item.active {
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
export class StepInsuranceComponent implements OnInit {
  private fb = inject(FormBuilder);
  patientFormService = inject(PatientFormService);

  @ViewChild('optionsList') optionsList?: ElementRef;
  @ViewChild('profOptionsList') profOptionsList?: ElementRef;

  obrasSociales = [
    "Particular",
    ...[
      "O.S.PE.PRI", "FORN", "ARSALUD S.A.", "SanCorSalud", "Unión Obrera Metalúrgica", 
      "CORA", "Avalian", "Caja Forense", "CEO-MDP", "Consulmed", "OSDOP", "DAS", "Galeno", 
      "Gerdanna Salud", "SANIDAD", "Osfatun", "Jerárquicos Salud", "La Segunda", "OSFALYF", 
      "MCA", "MEDICUS","ISSN", "Medifé", "Federada Salud", "TV SALUD", "OSPJN", "O.S.P.E.S", "OSDE", 
      "Prevención Salud", "MEOPP", "Sanitas", "SOSUNC", "Swiss MEDICAL", "OSAPM", "OSPSIP", 
      "OSPESGA salud", "SaludTotal", "SOCDUS SA", "OSTPCPH y ARA-", "UTEPLIMSALUD", 
      "OPSA OSPPCyQ", "OSDIPP", "OSPE", "Obra Social Ferroviaria", "Integral compromiso médico", 
      "Servicio Penitenciario Federal"
    ].sort()
  ];

  profesionales = [
    "Kevin Anzoategui",
    "Beatriz Baleiron",
    "Martin Chaparro",
    "Gustavo D'archivio",
    "Aldana Diaz",
    "Ana Diaz Pantoja",
    "Ignacio Faes",
    "Lucas Garritano",
    "Agustina Grispino",
    "Fabian Grispino",
    "Eliana Lopez",
    "Julian Nicolini",
    "Amparo Suter",
    "Karla Useche"
  ];

  filteredObras = signal<string[]>([...this.obrasSociales]);
  showDropdown = signal(false);
  activeIndex = signal<number>(-1);

  filteredProfesionales = signal<string[]>([...this.profesionales]);
  showProfDropdown = signal(false);
  activeProfIndex = signal<number>(-1);

  form = this.fb.group({
    obraSocial: [this.patientFormService.formData().obraSocial || '', [Validators.required]],
    numeroAfiliado: [this.patientFormService.formData().numeroAfiliado || ''],
    profesional: [this.patientFormService.formData().profesional || '', [Validators.required]]
  });

  ngOnInit() {
    this.form.get('obraSocial')?.valueChanges.subscribe(value => {
      this.updateAfiliadoValidation(value);
    });
    this.updateAfiliadoValidation(this.form.get('obraSocial')?.value);
  }

  private updateAfiliadoValidation(obraSocialValue: string | null | undefined) {
    const afiliadoControl = this.form.get('numeroAfiliado');
    if (obraSocialValue && obraSocialValue !== 'Particular') {
      afiliadoControl?.setValidators([Validators.required]);
    } else {
      afiliadoControl?.clearValidators();
    }
    afiliadoControl?.updateValueAndValidity();
  }

  filterObras() {
    const val = this.form.get('obraSocial')?.value?.toLowerCase() || '';
    const filtered = this.obrasSociales.filter(o => o.toLowerCase().includes(val));
    this.filteredObras.set(filtered);
    this.activeIndex.set(-1);
    if (!this.showDropdown()) this.showDropdown.set(true);
  }

  selectObra(obra: string) {
    this.form.patchValue({ obraSocial: obra });
    if (obra === 'Particular') {
      this.form.patchValue({ numeroAfiliado: '' });
    }
    this.showDropdown.set(false);
    this.activeIndex.set(-1);
  }

  clearSelection() {
    this.form.patchValue({ obraSocial: '' });
    this.filterObras();
    this.showDropdown.set(true);
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.showDropdown()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        this.showDropdown.set(true);
        this.filterObras();
      }
      return;
    }

    const list = this.filteredObras();
    if (list.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(i => (i + 1) % list.length);
        this.scrollToActive();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => (i - 1 + list.length) % list.length);
        this.scrollToActive();
        break;
      case 'Enter':
        if (this.activeIndex() >= 0) {
          event.preventDefault();
          this.selectObra(list[this.activeIndex()]);
        }
        break;
      case 'Escape':
        this.showDropdown.set(false);
        break;
    }
  }

  private scrollToActive() {
    setTimeout(() => {
      const activeEl = this.optionsList?.nativeElement.querySelector('.option-item.active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  filterProfesionales() {
    const val = this.form.get('profesional')?.value?.toLowerCase() || '';
    const filtered = this.profesionales.filter(p => p.toLowerCase().includes(val));
    this.filteredProfesionales.set(filtered);
    this.activeProfIndex.set(-1);
    if (!this.showProfDropdown()) this.showProfDropdown.set(true);
  }

  selectProfesional(prof: string) {
    this.form.patchValue({ profesional: prof });
    this.showProfDropdown.set(false);
    this.activeProfIndex.set(-1);
  }

  clearProfSelection() {
    this.form.patchValue({ profesional: '' });
    this.filterProfesionales();
    this.showProfDropdown.set(true);
  }

  onProfKeyDown(event: KeyboardEvent) {
    if (!this.showProfDropdown()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        this.showProfDropdown.set(true);
        this.filterProfesionales();
      }
      return;
    }

    const list = this.filteredProfesionales();
    if (list.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeProfIndex.update(i => (i + 1) % list.length);
        this.scrollProfToActive();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeProfIndex.update(i => (i - 1 + list.length) % list.length);
        this.scrollProfToActive();
        break;
      case 'Enter':
        if (this.activeProfIndex() >= 0) {
          event.preventDefault();
          this.selectProfesional(list[this.activeProfIndex()]);
        }
        break;
      case 'Escape':
        this.showProfDropdown.set(false);
        break;
    }
  }

  private scrollProfToActive() {
    setTimeout(() => {
      const activeEl = this.profOptionsList?.nativeElement.querySelector('.option-item.active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  hideDropdown() {
    // Delay to allow item click to register before dropdown is removed from DOM
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  hideProfDropdown() {
    // Delay to allow item click to register before dropdown is removed from DOM
    setTimeout(() => this.showProfDropdown.set(false), 200);
  }

  onPrevious() {
    this.patientFormService.previousStep();
  }

  onSubmit() {
    if (this.form.valid) {
      this.patientFormService.updateData({
        obraSocial: this.form.value.obraSocial!,
        numeroAfiliado: this.form.value.numeroAfiliado || '',
        profesional: this.form.value.profesional || ''
      });
      this.patientFormService.nextStep();
    }
  }
}
