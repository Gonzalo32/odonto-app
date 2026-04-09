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

  // Formateo de Nombre Completo: APELLIDO, Nombre
  fullName = computed(() => {
    const p = this.patient();
    if (!p.apellido && !p.nombre) return '';
    return `${(p.apellido || '').toUpperCase()}, ${p.nombre || ''}`;
  });

  // Cálculo de Edad
  age = computed(() => {
    const birthDateStr = this.patient().fechaNacimiento;
    if (!birthDateStr) return '';
    
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  });

  // Segmentación de número de afiliado (15 celdas, alineado a la derecha)
  afiliadoDigits = computed(() => {
    const num = (this.patient().numeroAfiliado || '').replace(/\D/g, ''); // Solo números
    const digits = num.split('').slice(-15); // Tomamos los últimos 15 si es muy largo
    
    // Rellenamos con vacíos a la IZQUIERDA para que el número quede a la DERECHA
    const padded = new Array(15).fill('');
    const startIdx = 15 - digits.length;
    
    digits.forEach((digit, index) => {
      padded[startIdx + index] = digit;
    });
    
    return padded;
  });

  // Formato de fecha de nacimiento DD / MM / AA
  formattedBirthDate = computed(() => {
    const dateStr = this.patient().fechaNacimiento;
    if (!dateStr) return { d: '', m: '', a: '' };
    const parts = dateStr.split('-'); // YYYY-MM-DD
    return {
      d: parts[2],
      m: parts[1],
      a: parts[0].slice(-2) // Solo los últimos dos dígitos del año
    };
  });
}
