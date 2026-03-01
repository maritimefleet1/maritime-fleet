import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormsModule } from '@angular/forms'; 
import { ApiService } from '../../services/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 
import { AddItemComponent } from '../../components/add-items/add-items';
import { AddDeliveryComponent } from '../../components/add-delivery/add-delivery';
import { MatDialog } from '@angular/material/dialog';

// ADDED THIS IMPORT FOR THE BULLETPROOF LOADER:
import { finalize } from 'rxjs/operators';

export interface DeliveryHistory {
  date: string; quantity: string; deliveredBy: string; role: string; receipt: string; initials: string; color: string;
}

export interface ItemRequirement {
  srNo: string; name: string; category?: string; id: string; icon?: string; iconBg?: string; iconColor?: string;
  unit: string; requested: number; delivered: number; pending: number; price: string; history: DeliveryHistory[];
}

export interface Sheet {
  id: number; name: string; data: ItemRequirement[];
}

@Component({
  selector: 'app-vessel-requirements',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatIconModule, MatButtonModule, FormsModule, MatSnackBarModule, AddItemComponent],
  templateUrl: './vessel-requirements.html',
  styleUrls: ['./vessel-requirements.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class VesselRequirementsComponent implements OnInit {
  vesselName = 'Loading...'; 
  voyageNumber = 'V-2401';
  vesselId!: number;
  vesselStatus = 'Active';
  displayedColumns: string[] = ['expand', 'srNo', 'itemName', 'deliveryDate','price', 'requested', 'unit',  'pending',  'actions',  'createdOn'];
  expandedElement: ItemRequirement | null = null;
  
  isLoadingItems = false; // Controls the spinner

  sheets: Sheet[] = [];
  activeSheet: Sheet = { id: 0, name: '', data: [] };
  pageSize = 10;
  currentPage = 0;
  totalItems = 0;
  totalPages = 0;
  pages: number[] = [];
  isSidebarOpen = false;
  today: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private sheetService: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.vesselId = Number(params.get('id'));
      if (this.vesselId) {
        this.loadSheets();
      }
    });

    this.route.queryParams.subscribe(params => {
      this.vesselName = params['vesselName'] || 'Loading...';
      this.voyageNumber = params['imo'] || '-';
      this.vesselStatus = params['status'] || 'Active';
    });
  }

  loadSheets() {
    this.sheetService.getSheets(this.vesselId).subscribe({
      next: (response: any) => {
        let sheetArray = [];
        // Strict Array Checking
        if (Array.isArray(response)) {
          sheetArray = response;
        } else if (response && Array.isArray(response.data)) {
          sheetArray = response.data;
        } else if (response && response.content && Array.isArray(response.content)) {
          sheetArray = response.content;
        }

        this.sheets = sheetArray.map((s: any) => ({
          id: s.id,
          name: s.sheetName || s.name || 'Unnamed Sheet', 
          data: [] 
        }));

        if (this.sheets.length > 0) {
          this.selectSheet(this.sheets[0]);
        } else {
          this.activeSheet = { id: 0, name: '', data: [] };
        }
        
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.showSnackbar('Failed to load sheets from server', 'Error');
      }
    });
  }

  selectSheet(sheet: Sheet) {
    this.activeSheet = sheet;
    this.currentPage = 0; 
    this.loadItems();
  }

  addSheet() {
    const name = prompt("Enter new sheet name:");
    if (!name || !name.trim()) return;

    const payload = { sheetName: name.trim() };

    this.sheetService.createSheet(this.vesselId, payload).subscribe({
      next: (response: any) => {
        const newObj = (response && response.data) ? response.data : response;

        if (newObj && newObj.id) {
          const newSheet: Sheet = {
            id: newObj.id,
            name: newObj.sheetName || newObj.name || name.trim(),
            data: []
          };
          
          this.sheets = [...this.sheets, newSheet];
          this.selectSheet(newSheet); 
          this.showSnackbar('Sheet created successfully', 'Success');
        } else {
          this.loadSheets(); 
          this.showSnackbar('Sheet saved. Refreshing list...', 'Ok');
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showSnackbar(err.error?.message || 'Error creating sheet', 'Error');
      }
    });
  }

  // ==========================================
  // 3. INDESTRUCTIBLE LOAD ITEMS
  // ==========================================
  loadItems() {
    if (!this.activeSheet || !this.activeSheet.id) {
      this.isLoadingItems = false;
      return;
    }

    this.isLoadingItems = true;
    this.cdr.detectChanges(); 

    this.apiService.getItemsBySheet(this.activeSheet.id, this.currentPage, this.pageSize)
      .pipe(
        // FINALIZE: This guarantees the loader turns off no matter what happens (success, error, or crash)
        finalize(() => {
          this.isLoadingItems = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          try {
            // EXTREMELY STRICT EXTRACTION: Ensures we only map if we actually have a Javascript Array
            let rawArray: any[] = [];
            
            if (response && Array.isArray(response.content)) {
              rawArray = response.content;
            } else if (response && response.data && Array.isArray(response.data.content)) {
              rawArray = response.data.content;
            } else if (response && Array.isArray(response.data)) {
              rawArray = response.data;
            } else if (Array.isArray(response)) {
              rawArray = response;
            }

            const mappedItems = rawArray.map((item: any, index: number) => ({
            id: item?.id,
            srNo: ((this.currentPage * this.pageSize) + index + 1).toString(), 
            name: item?.name || item?.itemName || 'Unknown Item',
            
            // ADD THESE TWO LINES TO SATISFY TYPESCRIPT:
            category: item?.category || 'General', 
            icon: item?.icon || 'inventory_2',     

            unit: item?.unit || '-',
            requested: item?.totalQty || item?.requested || 0,
            price: item?.price ? `₹${item.price}` : '-',
            remarks: item?.remarks || 'Uncategorized',
            createdOn : item?.createdOn || "-",
            deliveryDate : item?.deliveryDate || "-", 
            pending: item?.pendingQty || item?.totalQty || 0, 
            delivered: 0, 
            iconBg: '#E0F2FE',
            iconColor: '#0EA5E9',
            history: [] 
          }));

            // Create a brand new array reference to force the Angular Table to redraw
            this.activeSheet.data = [...mappedItems]; 
            
            // Extract pagination data safely
            const pageData = response?.content ? response : (response?.data || {});
            this.totalItems = pageData.totalElements || rawArray.length || 0;
            this.totalPages = pageData.totalPages || 1; 
            
            this.generatePageArray(); 

          } catch (error) {
            console.error('Data Mapping Error:', error);
            this.showSnackbar('Error parsing the data format', 'Close');
          }
        },
        error: (err) => {
          console.error('Failed to load items', err);
          this.showSnackbar('Server error while fetching items', 'Close');
        }
      });
  }

  onPageSizeChange() {
    this.currentPage = 0; 
    this.loadItems();
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadItems();
    }
  }

  generatePageArray() {
    this.pages = Array.from(Array(this.totalPages).keys());
  }

  addItem() {
    this.isSidebarOpen = true; 
  }

  openDeliveryModal(event: Event, item: any) {
    event.stopPropagation(); 
    
    const dialogRef = this.dialog.open(AddDeliveryComponent, {
      width: '450px',
      data: item 
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.apiService.addDelivery(result).subscribe({
          next: (res: any) => {
            this.showSnackbar('Delivery logged successfully!', 'Success');
            this.loadItems(); 
          },
          error: () => this.showSnackbar('Server error while logging delivery', 'Close')
        });
      }
    });
  }

  toggleRow(element: any) {
    if (this.expandedElement?.id === element.id) {
      this.expandedElement = null; 
      return;
    }

    this.expandedElement = element;

    this.apiService.getDeliveryHistory(element.id).subscribe({
      next: (response: any) => {
        let historyArray: any[] = [];
        if (Array.isArray(response)) {
          historyArray = response;
        } else if (response && Array.isArray(response.data)) {
          historyArray = response.data;
        }
        
        const totalDelivered = historyArray.reduce((sum: number, log: any) => sum + (log.deliveredQty || 0), 0);
        
        element.delivered = totalDelivered;
        element.pending = Math.max(0, element.requested - totalDelivered); 
        
        element.history = historyArray.map((log: any) => ({
          date: log.deliveryDate,
          quantity: `${log.deliveredQty} ${element.unit}`, 
          deliveredBy: log.sanctionedBy || 'Unknown Source',
          role: 'Authorized Signatory', 
          receipt: log.remarks || 'No remarks',
          initials: this.getInitials(log.sanctionedBy),
          color: this.getAvatarColor(log.sanctionedBy)
        }));
        
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Failed to fetch history', err)
    });
  }

  getProgressPercentage(delivered: number, requested: number): number {
    if (requested === 0) return 0;
    return (delivered / requested) * 100;
  }

  private showSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  getInitials(name: string): string {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    if (!name) return '#94A3B8'; 
    const colors = ['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  isPrinting = false;
  printData: any[] = []; 

  generatePrintReport() {
    if (!this.activeSheet || !this.activeSheet.id) return;

    this.isPrinting = true;
    this.showSnackbar('Preparing document for printing...', 'Wait');

    // REMOVED the `finalize()` block here so the UI doesn't vanish too early!
    this.apiService.getPrintData(this.activeSheet.id, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: any) => {
          let contentArray: any[] = [];
          
          if (response && Array.isArray(response.content)) {
            contentArray = response.content;
          } else if (response && response.data && Array.isArray(response.data.content)) {
            contentArray = response.data.content;
          } else if (response && Array.isArray(response.data)) {
            contentArray = response.data;
          } else if (Array.isArray(response)) {
            contentArray = response;
          }

          // Force map the variables so it works flawlessly no matter what the backend sends
          this.printData = contentArray.map(item => ({
            itemName: item.itemName || item.name || 'Unknown Item',
            requestedQty: item.requestedQty || item.totalQty || item.requested || 0,
            deliveredQty: item.deliveredQty || item.delivered || 0,
            pendingQty: item.pendingQty || 0,
            unit: item.unit || '-',
            remarks: item.remarks || '',
            history: item.history || []
          }));
          
          this.cdr.detectChanges(); 

          // Wait 300ms for Angular to draw the table on the screen, THEN print
          setTimeout(() => {
            window.print();
            
            // ONLY reset the view back to normal AFTER the print dialog is closed
            this.isPrinting = false; 
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('Print Error:', err);
          this.showSnackbar('Failed to generate print report', 'Close');
          
          // Reset view if the API fails
          this.isPrinting = false;
          this.cdr.detectChanges();
        }
      });
  }
}