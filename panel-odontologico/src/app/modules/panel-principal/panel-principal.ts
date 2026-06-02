import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardService }
from '../../core/services/dashboard';

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-principal.html',
  styleUrls: ['./panel-principal.css']
})
export class PanelPrincipal
implements OnInit {

  dashboard: any = {};
  loading = true;
  constructor(
    private dashboardService:
    DashboardService
  ) {}

  ngOnInit(): void {

    this.cargarDashboard();

  }

  cargarDashboard() {

    this.dashboardService
      .obtenerDashboard()
      .subscribe({

        next: (data: any) => {

          console.log(data);

          this.dashboard = data;
          this.loading = false;

        },

        error: (err: any) => {
          console.error(err);
          this.loading = false;
        }

      });

  }

}