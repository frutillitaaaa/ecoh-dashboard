import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: 'Gestión de Causas',
    icon: 'folder',
    subItems: [
      {
        title: 'Causas',
        href: '/dashboard/causas',
        icon: 'briefcase',
        label: 'causas'
      },
      {
        title: 'Actividades',
        href: '/dashboard/actividades',
        icon: 'check'
      },
      {
        title: 'Tablero',
        href: '/dashboard/kanban',
        icon: 'kanban'
      }
    ]
  },

  {
    title: 'Imputados o Sujetos de interés',
    href: '/dashboard/imputado',
    icon: 'Mask',
    label: 'profile'
  },

  {
    title: 'Víctimas',
    href: '/dashboard/victima',
    icon: 'UserRound',
    label: 'victima'
  },

  {
    title: 'Mapas Delitos',
    href: '/dashboard/geo',
    icon: 'map',
    label: 'Mapas'
  },
  
  {
    title: 'Registro Organizaciones',
    icon: 'Net',
    subItems: [
      {
        title: 'Gestión organizaciones',
        href: '/dashboard/organizacion',
        icon: 'page'
      },
      {
        title: 'Network',
        href: '/dashboard/oc-networkgraph',
        icon: 'Share'
      }
    ]
  },
  {
    title: 'Telefonos',
    href: '/dashboard/telefonos',
    icon: 'Smartphone',
    label: 'login'
  },
  {
    title: 'Login',
    href: '/',
    icon: 'login',
    label: 'login'
  }
];
