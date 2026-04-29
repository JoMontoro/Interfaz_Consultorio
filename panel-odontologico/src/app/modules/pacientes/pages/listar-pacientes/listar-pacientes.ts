import { Component, OnInit } from '@angular/core';
import { PacienteService } from '../../../../module/pacientes/services/paciente';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listar-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-pacientes.html',
  styleUrls: ['./listar-pacientes.css'],
})
export class ListarPacientes implements OnInit {

  lista: any[] = [];

  constructor(private service: PacienteService) {}

  ngOnInit() {
    this.service.listar().subscribe({
      next: (data) => {
        console.log("DATA:", data);
        this.lista = data;
      },
      error: (err) => console.error(err)
    });
  }
}