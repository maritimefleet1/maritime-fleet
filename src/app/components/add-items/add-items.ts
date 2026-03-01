import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon],
  templateUrl: './add-items.html',
  styleUrls: ['./add-items.css']
})
export class AddItemComponent {
  @Input() isOpen = false;
  @Input() vesselId!: number;
  @Input() activeSheet!: any;
  @Output() close = new EventEmitter<void>();
  @Output() itemAdded = new EventEmitter<void>();

  isSubmitting = false; // Prevents double-clicks

  itemData = {
    name: '',
    unit: '',
    totalQty: null as number | null, // Better for placeholder display
    price: null as number | null,
    icon: 'inventory',
    remarks:'',
    deliveryDate: '',
  };
minDate = new Date().toISOString().split('T')[0]
  constructor(private api: ApiService, private snack: MatSnackBar) {}

  // Basic validation check
 isFormValid(): boolean {
    return !!this.itemData.name && 
           !!this.itemData.unit && 
           !!this.itemData.deliveryDate && // <-- Form is invalid if date is empty
           this.itemData.totalQty !== null && this.itemData.totalQty > 0;
  }
  saveItem() {
    if (!this.isFormValid()) return;

    this.isSubmitting = true;

    const payload = {
      ...this.itemData,
      sheetId: this.activeSheet?.id
    };

    this.api.addItem(payload).subscribe({
      next: (response: any) => {
        // Check the custom status flag from your ApiResponse DTO
        if (response.status === 1) {
          // Use the dynamic message sent from Spring Boot!
          this.snack.open(response.message, 'Success', { duration: 3000 });
          this.itemAdded.emit();
          this.closeSidebar();
        } else {
          // Handle cases where the HTTP call succeeds, but your business logic fails
          this.snack.open(response.message || 'Error saving item', 'Close', { duration: 4000 });
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        // This catches actual HTTP network errors (500, 404, etc.)
        const errorMessage = err.error?.message || 'Server connection failed';
        this.snack.open(errorMessage, 'Close', { duration: 4000 });
        this.isSubmitting = false;
      }
    });
  }

  closeSidebar() {
    this.isOpen = false;
    this.close.emit();
    // Optional: reset form when closing so it's fresh next time
    setTimeout(() => this.resetForm(), 300); 
  }

  resetForm() {
    this.itemData = {
      name: '',  unit: '', totalQty: null, price: null, icon: 'inventory', remarks: '',deliveryDate: ''
    };
    this.isSubmitting = false;
  }
}