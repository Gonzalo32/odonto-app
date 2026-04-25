import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../../../core/services/patient-form.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  constructor() {
    // Escuchar el disparo de impresión desde el servicio
    effect(() => {
      const trigger = this.patientFormService.triggerPrint();
      if (trigger > 0) {
        this.generatePDF();
      }
    });
  }

  async generatePDF() {
    await new Promise(resolve => setTimeout(resolve, 500));

    const data = document.getElementById('print-data');
    if (!data) return;

    const canvas = await html2canvas(data, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 1123,  // ~29.7cm a 96dpi
      height: 794,  // ~21cm a 96dpi
      windowWidth: 1200, // Forzar ventana virtual ancha
      windowHeight: 800
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Crear PDF: 'l' (landscape), 'cm' (centímetros), 'a4' (29.7 x 21.0)
    const pdf = new jsPDF('l', 'cm', 'a4');
    
    // Añadimos la imagen ajustada al tamaño total de A4
    pdf.addImage(imgData, 'PNG', 0, 0, 29.7, 21.0);

    // Abrir en nueva pestaña para previsualización
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    // Navegar a la pantalla de agradecimiento (que hará el reset después de 3 segundos)
    this.patientFormService.currentStep.set(7);
  }

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
