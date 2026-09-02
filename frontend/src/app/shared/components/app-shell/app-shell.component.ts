import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  RouterModule
} from '@angular/router';

import {
  AuthService,
  User
} from '../../../core/services/auth.service';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent implements OnInit {
  user: User | null = null;

  sidebarOpen = false;

  navigationItems: NavigationItem[] = [];

  constructor(
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();

    this.setNavigationItems();
  }

  get userInitial(): string {
    if (!this.user?.name) {
      return '?';
    }

    return this.user.name
      .charAt(0)
      .toUpperCase();
  }

  get roleLabel(): string {
    if (this.user?.role === 'instructor') {
      return 'Instructor';
    }

    return 'Student';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }

  private setNavigationItems(): void {
    if (this.user?.role === 'instructor') {
      this.navigationItems = [
        {
          label: 'Dashboard',
          icon: 'dashboard',
          route: '/instructor/dashboard'
        },
        {
          label: 'Problems',
          icon: 'code',
          route: '/instructor/problems'
        },
        {
          label: 'Test Cases',
          icon: 'fact_check',
          route: '/instructor/testcases'
        },
        {
          label: 'Submissions',
          icon: 'assignment',
          route: '/instructor/submissions'
        },
        {
          label: 'Analytics',
          icon: 'analytics',
          route: '/instructor/analytics'
        }
      ];

      return;
    }

    this.navigationItems = [
      {
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/student/dashboard'
      },
      {
        label: 'Problems',
        icon: 'code',
        route: '/student/problems'
      },
      {
        label: 'Submissions',
        icon: 'assignment',
        route: '/student/submissions'
      },
      {
        label: 'Leaderboard',
        icon: 'leaderboard',
        route: '/student/leaderboard'
      }
    ];
  }
}