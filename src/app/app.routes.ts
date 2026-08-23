/**
 * @fileoverview Route table for the dashboard and a single survey detail view.
 */
import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { SurveyDetail } from './pages/survey-detail/survey-detail';

/**
 * Application routes. The create-survey overlay is intentionally not a route.
 */
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'survey/:id', component: SurveyDetail },
  { path: '**', redirectTo: '' },
];
