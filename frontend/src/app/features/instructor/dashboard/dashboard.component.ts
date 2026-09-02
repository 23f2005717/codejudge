import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface DashboardStat {
  label: string;
  value: number;
  icon: string;
  description: string;
}

interface RecentProblem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  submissions: number;
  published: boolean;
}

interface SubmissionSummary {
  label: string;
  value: number;
  percentage: number;
}

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  /*
   * Temporary values for the UI.
   * These will be replaced with API data when
   * the instructor backend integration is added.
   */

  stats: DashboardStat[] = [
    {
      label: 'Total Problems',
      value: 24,
      icon: 'code',
      description: 'Problems created'
    },
    {
      label: 'Published Problems',
      value: 18,
      icon: 'public',
      description: 'Visible to students'
    },
    {
      label: 'Total Submissions',
      value: 486,
      icon: 'assignment',
      description: 'Student submissions'
    },
    {
      label: 'Accepted Submissions',
      value: 312,
      icon: 'check_circle',
      description: 'Successfully accepted'
    }
  ];

  recentProblems: RecentProblem[] = [
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      submissions: 86,
      published: true
    },
    {
      id: 2,
      title: 'Binary Search',
      difficulty: 'Easy',
      submissions: 64,
      published: true
    },
    {
      id: 3,
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      submissions: 52,
      published: true
    },
    {
      id: 4,
      title: 'Merge Intervals',
      difficulty: 'Medium',
      submissions: 41,
      published: true
    },
    {
      id: 5,
      title: 'Graph Shortest Path',
      difficulty: 'Hard',
      submissions: 27,
      published: false
    }
  ];

  submissionSummary: SubmissionSummary[] = [
    {
      label: 'Accepted',
      value: 312,
      percentage: 64
    },
    {
      label: 'Wrong Answer',
      value: 109,
      percentage: 22
    },
    {
      label: 'Runtime Error',
      value: 38,
      percentage: 8
    },
    {
      label: 'Time Limit',
      value: 27,
      percentage: 6
    }
  ];

  getDifficultyClass(
    difficulty: RecentProblem['difficulty']
  ): string {
    return difficulty.toLowerCase();
  }
}