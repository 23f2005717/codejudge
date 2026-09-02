import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { AppShellComponent } from './shared/components/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],

    children: [

      // =====================================================
      // STUDENT
      // =====================================================

      {
        path: 'student/dashboard',
        loadComponent: () =>
          import('./features/student/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['student']
        }
      },

      {
        path: 'student/problems',
        loadComponent: () =>
          import('./features/student/problems/problems.component')
            .then(m => m.ProblemsComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['student']
        }
      },

      {
        path: 'student/problems/:id',
        loadComponent: () =>
          import('./features/student/editor/editor.component')
            .then(m => m.EditorComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['student']
        }
      },

      {
        path: 'student/submissions',
        loadComponent: () =>
          import('./features/student/submissions/submissions.component')
            .then(m => m.SubmissionsComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['student']
        }
      },

      {
        path: 'student/leaderboard',
        loadComponent: () =>
          import('./features/student/leaderboard/leaderboard.component')
            .then(m => m.LeaderboardComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['student']
        }
      },


      // =====================================================
      // INSTRUCTOR
      // =====================================================

      {
        path: 'instructor/dashboard',
        loadComponent: () =>
          import('./features/instructor/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['instructor']
        }
      },

      {
        path: 'instructor/problems',
        loadComponent: () =>
          import('./features/instructor/problems/problems.component')
            .then(m => m.ProblemsComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['instructor']
        }
      },

      // -----------------------------------------------------
      // CREATE PROBLEM
      // -----------------------------------------------------

      {
        path: 'instructor/problems/create',
        loadComponent: () =>
          import(
            './features/instructor/problems/create-edit-problem.component'
          ).then(m => m.CreateEditProblemComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['instructor']
        }
      },

      // -----------------------------------------------------
      // EDIT PROBLEM
      // -----------------------------------------------------

      {
        path: 'instructor/problems/:id/edit',
        loadComponent: () =>
          import(
            './features/instructor/problems/create-edit-problem.component'
          ).then(m => m.CreateEditProblemComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['instructor']
        }
      },

      // -----------------------------------------------------
      // TEST CASES
      // -----------------------------------------------------

      {
        path: 'instructor/testcases',
        loadComponent: () =>
          import('./features/instructor/testcases/testcases.component')
            .then(m => m.TestcasesComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['instructor']
        }
      },

      // -----------------------------------------------------
      // SUBMISSIONS
      // -----------------------------------------------------

      {
        path: 'instructor/submissions',
        loadComponent: () =>
          import('./features/instructor/submissions/submissions.component')
            .then(m => m.SubmissionsComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['instructor']
        }
      },

      // -----------------------------------------------------
      // ANALYTICS
      // -----------------------------------------------------

      {
        path: 'instructor/analytics',
        loadComponent: () =>
          import('./features/instructor/analytics/analytics.component')
            .then(m => m.AnalyticsComponent),

        canActivate: [roleGuard],

        data: {
          roles: ['instructor']
        }
      }
    ]
  },

  // =====================================================
  // FALLBACK
  // =====================================================

  {
    path: '**',
    redirectTo: 'login'
  }
];