import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientFormService } from '../../core/services/patient-form.service';
import { StepDniComponent } from './steps/step-dni.component';
import { StepPersonalComponent } from './steps/step-personal.component';
import { StepContactComponent } from './steps/step-contact.component';
import { StepInsuranceComponent } from './steps/step-insurance.component';
import { StepAddressComponent } from './steps/step-address.component';
import { StepReviewComponent } from './steps/step-review.component';
import { StepThankyouComponent } from './steps/step-thankyou.component';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    StepDniComponent,
    StepPersonalComponent,
    StepContactComponent,
    StepInsuranceComponent,
    StepAddressComponent,
    StepReviewComponent,
    StepThankyouComponent
  ],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent {
  patientFormService = inject(PatientFormService);
}
