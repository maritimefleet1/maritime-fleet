import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AddVesselComponent } from "../../components/add-vessel/add-vessel";
import { ApiService } from '../../services/api.service';
import { Vessel } from '../../models/vessel.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-fleet-overview',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIconModule, AddVesselComponent, MatButtonModule, RouterModule],
  templateUrl: './fleet-overview.html',
  styleUrls: ['./fleet-overview.css']
})
export class FleetOverviewComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['vesselName', 'type', 'imo', 'status', 'createdOn','actions'];
  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // State Management
  isAddVesselOpen = false;
  selectedVessel: Vessel | null = null; 
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  searchName = '';
  selectedStatus = ['Active'];

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router
  ) {}


  ngOnInit() {
    this.loadVessels();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // This method MUST match the (vesselAdded) event in your HTML
  onVesselAdded() {
    this.loadVessels();
  }

  loadVessels() {
    this.apiService.getVesselsPaged(this.pageIndex, this.pageSize, this.searchName, this.selectedStatus)
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data.content;
          this.totalElements = res.data.totalElements;
        },
        error: (err) => this.toastr.error(err.message || 'Failed to load vessels')
      });
  }

  handlePageEvent(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVessels();
  }

  onSearch(event: any) {
    this.searchName = event.target.value;
    this.pageIndex = 0;
    this.loadVessels();
  }

  onStatusFilterChange(event: any) {
    const val = event.target.value;
    if (val === 'ALL') {
      this.selectedStatus = ['Active', 'Deleted'];
    } else if (val === 'Active') {
      this.selectedStatus = ['Active'];
    } else {
      this.selectedStatus = [val];
    }
    this.pageIndex = 0;
    this.loadVessels();
  }

  onDelete(id: number) {
    if(confirm("Are you sure you want to archive this vessel?")) {
      this.apiService.softDelete(id).subscribe({
        next: () => {
          this.toastr.success("Vessel status updated to Deleted");
          this.loadVessels();
        },
        error: (err) => this.toastr.error(err.message)
      });
    }
  }

  openAddVesselDrawer() {
    this.selectedVessel = null;
    this.isAddVesselOpen = true;
  }

  openEditDrawer(vessel: any) {
    this.selectedVessel = vessel;
    this.isAddVesselOpen = true;
  }

  closeAddVesselDrawer() {
    this.isAddVesselOpen = false;
    this.selectedVessel = null;
  }

  /**
   * Navigate to the requirements page for a specific vessel.
   * The route is defined as `/fleet/:imo/requirements` in app.routes.ts.
   * We accept the vessel IMO here since the URL parameter is IMO.
   */
  viewVesselDetails(selectedVessel: Vessel) {
    const id = selectedVessel.id;
    // ensure we don't navigate with an empty value
    if (!id) {
      this.toastr.warning('Vessel ID is missing');
      return;
    }
    this.closeAddVesselDrawer();
    this.router.navigate(['/fleet', id, 'requirements'], {
      queryParams: {
      vesselName: selectedVessel.name,
      imo: selectedVessel.imo,
      status: selectedVessel.status      }
    });
  }
}