import { Routes } from '@angular/router';
import { ROUTES } from './app.routes.names';

export const routes: Routes = [
  { path: '', redirectTo: ROUTES.PATIENT_FORM, pathMatch: 'full' },
  {
    path: ROUTES.PATIENT_FORM,
    loadComponent: () => import('./features/patient-form/patient-form.component')
      .then(m => m.PatientFormComponent)
  }
];
