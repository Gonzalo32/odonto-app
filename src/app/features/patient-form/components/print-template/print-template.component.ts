import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../../core/services/patient-form.service';

@Component({
  selector: 'app-print-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './print-template.component.html',
  styleUrls: ['./print-template.component.scss']
})
export class PrintTemplateComponent {
  patientFormService = inject(PatientFormService);
  patient = computed(() => this.patientFormService.formData());

  fullName = computed(() => {
    const p = this.patient();
    if (!p.apellido && !p.nombre) return '';
    return `${(p.apellido || '').toUpperCase()}, ${p.nombre || ''}`;
  });

  age = computed(() => {
    const s = this.patient().fechaNacimiento;
    if (!s) return '';
    const bd = new Date(s), t = new Date();
    let a = t.getFullYear() - bd.getFullYear();
    const m = t.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < bd.getDate())) a--;
    return String(a);
  });

  afiliadoDigits = computed(() => {
    const num = (this.patient().numeroAfiliado || '').trim().toUpperCase();
    const digits = num.split('');
    if (digits.length <= 15) {
      const padded = new Array(15).fill('');
      digits.forEach((d, i) => { padded[15 - digits.length + i] = d; });
      return padded;
    }
    return digits; // more than 15 characters, show all (will shrink via CSS)
  });

  // Scale the affiliate block so that >15 characters fit within the fixed 5.2 cm width
  afiliadoScale = computed(() => {
    const raw = (this.patient().numeroAfiliado || '').trim();
    const len = raw.length;
    if (len <= 15) return 1;
    // Reduce horizontal size proportionally so that the block occupies the same start-end positions as 15 chars
    return 15 / len;
  });

  formattedBirthDate = computed(() => {
    const s = this.patient().fechaNacimiento;
    if (!s) return { d: '', m: '', a: '' };
    const parts = s.split('-');
    return { d: parts[2], m: parts[1], a: (parts[0] ?? '').slice(-2) };
  });

  // Mapping profesional → matrícula (fuente de verdad; no se guarda en la BD)
  private readonly profesionalMatricula: Record<string, number> = {
    'Beatriz Baleiron': 1789,
    'Kevin Anzoategui': 2198,
    'Eliana Lopez': 2039,
    'Lucas Garritano': 2164,
    'Julian Nicolini': 2046,
    'Amparo Suter': 2173,
    'Fabian Grispino': 665,
    "Gustavo D'archivio": 680,
    'Karla Useche': 2193,
    'Agustina Grispino': 2125,
    'Martin Chaparro': 2182,
    'Ignacio Faes': 2106,
    'Aldana Diaz': 2112,
    'Ana Diaz': 3590,
  };

  /** Matrícula derivada del nombre del profesional; funciona siempre, aunque el paciente venga de la BD */
  matricula = computed(() => {
    const prof = this.patient().profesional;
    if (!prof) return '';
    const mat = this.profesionalMatricula[prof];
    return mat != null ? String(mat) : '';
  });
}
