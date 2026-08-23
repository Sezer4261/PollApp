import { Routes } from '@angular/router';
import { ProjectDetail } from './project-detail/project-detail.component';

export const appRoutes: Routes = [
    {path: '', component: ProjectDetail},
    {path: "detail/:id", component: ProjectDetail}
];