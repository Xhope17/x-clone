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
      value: 'soporte@orbitsocial.com',
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
      value: 'github.com/orbitsocial',
      link: 'https://github.com/orbitsocial',
    },
    {
      icon: 'fa-regular fa-clock',
      label: 'Horario de atención',
      value: 'Lun — Vie, 9:00 AM — 6:00 PM (CST)',
    },
    {
      icon: 'fa-solid fa-location-dot',
      label: 'Ubicación',
      value: 'San José, Costa Rica',
    },
  ]);
}
