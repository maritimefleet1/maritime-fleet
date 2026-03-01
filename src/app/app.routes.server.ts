import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'fleet',
    renderMode: RenderMode.Server
  },
  {
    path: 'fleet/:id/requirements',
    renderMode: RenderMode.Server
  }
];