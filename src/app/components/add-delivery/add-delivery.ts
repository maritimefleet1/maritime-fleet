import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="dialog-header">
      <div class="header-content">
        <div class="icon-box">
          <mat-icon>move_to_inbox</mat-icon>
        </div>
        <div>
          <h2 class="dialog-title">Record Delivery</h2>
          <p class="dialog-subtitle">Add received stock to your inventory</p>
        </div>
      </div>
      <button class="btn-close-modal" mat-dialog-close aria-label="Close modal">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-body">
      <div class="context-banner">
        <mat-icon class="context-icon">info</mat-icon>
        <span>Receiving stock for: <i class="fw-700">{{ data.name }}</i> </span>
      </div>

      <div class="form-group mb-16">
        <label class="form-label">Delivered Quantity <span class="text-danger">*</span></label>
        <div class="input-with-suffix">
          <input type="number" [(ngModel)]="logData.deliveredQty" class="form-control" placeholder="0" min="0.1" required>
          <span class="suffix-text">{{ data.unit }}</span>
        </div>
      </div>

      <div class="form-group mb-16">
        <label class="form-label">Delivery Date <span class="text-danger">*</span></label>
        <input type="date" [(ngModel)]="logData.deliveryDate" class="form-control" [max]="today" required>
      </div>

      <div class="form-group mb-16">
        <label class="form-label">Sanctioned By (Name/Vendor)</label>
        <input type="text" [(ngModel)]="logData.sanctionedBy" class="form-control" placeholder="e.g. Chief Engineer / FastShip Inc.">
      </div>
      
      <div class="form-group mb-8">
        <label class="form-label">Remarks</label>
        <input type="text" [(ngModel)]="logData.remarks" class="form-control" placeholder="Condition of goods, receipt number, etc.">
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-footer">
      <button class="btn btn-outline" mat-dialog-close>Cancel</button>
      <button class="btn btn-primary" (click)="submit()" [disabled]="!isValid()">
        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">check_circle</mat-icon> Confirm Receipt
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    /* Header Styling */
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 24px 20px 24px;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--surface-white);
    }
    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .icon-box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      background-color: #F0F9FF; /* Light blue tint matching your action button */
      color: var(--primary-color);
      border-radius: 10px;
      border: 1px solid #E0F2FE;
    }
    .dialog-title {
      margin: 0;
      font-size: 18px;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .dialog-subtitle {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .btn-close-modal {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: -4px;
      margin-right: -8px;
    }
    .btn-close-modal:hover {
      background-color: var(--bg-main);
      color: var(--text-primary);
    }

    /* Body Styling */
    .dialog-body {
      padding: 24px !important;
      overflow-y: auto;
    }
    .context-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background-color: var(--bg-main);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 14px;
      color: var(--text-secondary);
    }
    .context-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--text-tertiary);
    }
    .context-banner strong {
      color: var(--text-primary);
    }

    /* Form Utilities */
    .mb-16 { margin-bottom: 16px; }
    .mb-8 { margin-bottom: 8px; }
    .form-label {
      font-size: 13px;
      margin-bottom: 6px;
   
    }
    .input-with-suffix {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .suffix-text {
      color: var(--text-secondary);
      font-size: 14px;
      min-width: 40px;
    }
    .text-danger { color: #DC2626; }

    /* Footer Styling */
    .dialog-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      margin: 0;
    }
  `]
})
export class AddDeliveryComponent {
  today = new Date().toISOString().split('T')[0];
  
  logData = {
    deliveredQty: null,
    deliveryDate: this.today,
    sanctionedBy: '',
    remarks: ''
  };

  constructor(
    public dialogRef: MatDialogRef<AddDeliveryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  isValid(): boolean {
    return !!this.logData.deliveredQty && this.logData.deliveredQty > 0 && !!this.logData.deliveryDate;
  }

  submit() {
    if (this.isValid()) {
      this.dialogRef.close({ ...this.logData, itemId: this.data.id });
    }
  }
}