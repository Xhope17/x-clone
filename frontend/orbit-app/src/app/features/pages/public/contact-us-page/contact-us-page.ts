import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface ContactMethod {
  icon: string;
  label: string;
  value: string;
  link?: string;
}

@Component({
  selector: 'app-contact-us-page',
  imports: [],
  templateUrl: './contact-us-page.html',
  styleUrl: './contact-us-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactUsPage {
  readonly contactMethods = signal<ContactMethod[]>([
    {
      icon: 'fa-regular fa-envelope',
      label: 'Correo electrónico',
      value: 'soporte@orbit.com',
    },
    {
      icon: 'fa-brands fa-twitter',
      label: 'Twitter / X',
      value: '@OrbitSupport',
      link: 'https://x.com/OrbitSupport',
    },
    {
      icon: 'fa-brands fa-github',
      label: 'GitHub',
      value: 'github.com/orbit-app',
      link: 'https://github.com/Xhope17/x-clone/tree/main/frontend/orbit-app',
    },
    {
      icon: 'fa-regular fa-clock',
      label: 'Horario de atención',
      value: 'Lun — Vie, 9:00 AM — 6:00 PM (CST)',
    },
    {
      icon: 'fa-solid fa-location-dot',
      label: 'Ubicación',
      value: 'Guayaquil, Ecuador',
    },
  ]);
}
