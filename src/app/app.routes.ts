import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'schedule', loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent) },
  { path: 'standings', loadComponent: () => import('./features/standings/standings.component').then(m => m.StandingsComponent) },
  { path: 'players', loadComponent: () => import('./features/players/players.component').then(m => m.PlayersComponent) },
  { path: '**', redirectTo: '' },
];
