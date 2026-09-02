import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

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
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  sidebarOpen = false;

  readonly studentNavigation: NavigationItem[] = [
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

  readonly instructorNavigation: NavigationItem[] = [
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
      label: 'Submissions',
      icon: 'assignment',
      route: '/instructor/submissions'
    },
    {
      label: 'Statistics',
      icon: 'bar_chart',
      route: '/instructor/analytics'
    }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get user() {
    return this.authService.getUser();
  }

  get navigationItems(): NavigationItem[] {
    if (this.user?.role === 'instructor') {
      return this.instructorNavigation;
    }

    return this.studentNavigation;
  }

  get roleLabel(): string {
    return this.user?.role === 'instructor' ? 'Instructor' : 'Student';
  }

  get userInitial(): string {
    const name = this.user?.name?.trim();

    if (!name) {
      return 'U';
    }

    return name.charAt(0).toUpperCase();
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
}