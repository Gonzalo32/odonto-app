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
    const num = (this.patient().numeroAfiliado || '').replace(/\D/g, '');
    const digits = num.split('').slice(-15);
    const padded = new Array(15).fill('');
    digits.forEach((d, i) => { padded[15 - digits.length + i] = d; });
    return padded;
  });

  formattedBirthDate = computed(() => {
    const s = this.patient().fechaNacimiento;
    if (!s) return { d: '', m: '', a: '' };
    const parts = s.split('-');
    return { d: parts[2], m: parts[1], a: (parts[0] ?? '').slice(-2) };
  });
}
