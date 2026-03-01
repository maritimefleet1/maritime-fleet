import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { Vessel, ApiResponse } from '../../models/vessel.model';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-vessel',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './add-vessel.html',
  styleUrls: ['./add-vessel.css']
})
export class AddVesselComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() editData: Vessel | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() vesselSaved = new EventEmitter<void>();

  vesselName: string = '';
  imoNumber: string = '';
  vesselType: string = 'Container Ship';
  isSubmitting: boolean = false;

  constructor(private apiService: ApiService, private toastr: ToastrService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editData'] && this.editData) {
      this.vesselName = this.editData.name;
      this.imoNumber = this.editData.imo;
      this.vesselType = this.editData.type;
    } else if (changes['isOpen'] && this.isOpen && !this.editData) {
      this.resetForm();
    }
  }

  closeDrawer() {
    this.resetForm();
    this.close.emit();
  }

  resetForm() {
    this.vesselName = '';
    this.imoNumber = '';
    this.vesselType = 'Container Ship';
    this.isSubmitting = false;
  }

  saveVessel() {
    if (!this.vesselName || this.vesselName.trim() === '') {
      this.toastr.warning('Vessel Name is mandatory', 'Validation Error');
      return;
    }

    this.isSubmitting = true;
    const payload: Vessel = {
      name: this.vesselName,
      imo: this.imoNumber,
      type: this.vesselType,
      status: this.editData ? this.editData.status : 'Active'
    };

    let request$: Observable<ApiResponse<Vessel>>;

    if (this.editData && this.editData.id) {
      request$ = this.apiService.updateVessel(this.editData.id, payload);
    } else {
      request$ = this.apiService.addVessel(payload);
    }

    request$.subscribe({
      next: (res) => {
        const action = this.editData ? 'updated' : 'added';
        this.toastr.success(`Vessel ${this.vesselName} ${action} successfully!`);
        this.vesselSaved.emit();
        this.closeDrawer();
      },
      error: (err) => {
        this.toastr.error(err.message || 'Server error occurred');
        this.isSubmitting = false; 
      }
    });
  }
}