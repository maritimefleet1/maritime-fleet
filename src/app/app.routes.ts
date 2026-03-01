import { Routes } from '@angular/router';
import { FleetOverviewComponent } from './pages/fleet-overview/fleet-overview';
import { VesselRequirementsComponent } from './pages/vessel-requirements/vessel-requirements';

export const routes: Routes = [
  { path: '', redirectTo: 'fleet', pathMatch: 'full' }, 
  
  { path: 'fleet', component: FleetOverviewComponent },
  
  { path: 'fleet/:id/requirements', component: VesselRequirementsComponent },
];