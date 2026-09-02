import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface DashboardStat {
  label: string;
  value: number | string;
  icon: string;
}

interface RecentSubmission {
  problem: string;
  status: string;
  score: number;
  submittedAt: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  readonly stats: DashboardStat[] = [
    {
      label: 'Problems Solved',
      value: 0,
      icon: 'check_circle'
    },
    {
      label: 'Total Submissions',
      value: 0,
      icon: 'assignment'
    },
    {
      label: 'Success Rate',
      value: '0%',
      icon: 'trending_up'
    }
  ];

  readonly recentSubmissions: RecentSubmission[] = [];

  trackByLabel(index: number, stat: DashboardStat): string {
    return stat.label;
  }

  trackBySubmission(
    index: number,
    submission: RecentSubmission
  ): string {
    return `${submission.problem}-${submission.submittedAt}`;
  }
}