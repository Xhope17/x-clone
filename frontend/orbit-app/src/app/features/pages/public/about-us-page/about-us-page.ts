import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface TeamMember {
  name: string;
  role: string;
  description: string;
}

@Component({
  selector: 'app-about-us-page',
  imports: [],
  templateUrl: './about-us-page.html',
  styleUrl: './about-us-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutUsPage {
  readonly team = signal<TeamMember[]>([
    {
      name: 'David Cabanilla',
      role: 'Backend Developer',
      description:
        'Arquitectura del backend, APIs REST, SignalR WebSockets, bases de datos y despliegue.',
    },
    {
      name: 'Bryan Mora',
      role: 'Frontend Developer',
      description:
        'Interfaz de usuario, componentes Angular, diseño responsivo, integración con APIs y experiencia de usuario.',
    },
  ]);

  readonly technologies = signal([
    'Angular 21',
    '.NET 9',
    'SignalR',
    'SQL Server',
    'Redis',
    'Cloudinary',
    'Tailwind CSS',
  ]);
}
