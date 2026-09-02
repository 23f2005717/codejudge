import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface SubmissionStatus {
  label: string;
  count: number;
  percentage: number;
}

interface ProblemPerformance {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  submissions: number;
  accepted: number;
  acceptanceRate: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  readonly totalSubmissions = 486;
  readonly totalProblems = 24;
  readonly publishedProblems = 18;
  readonly activeStudents = 86;

  readonly submissionStatuses: SubmissionStatus[] = [
    {
      label: 'Accepted',
      count: 312,
      percentage: 64
    },
    {
      label: 'Wrong Answer',
      count: 109,
      percentage: 22
    },
    {
      label: 'Runtime Error',
      count: 38,
      percentage: 8
    },
    {
      label: 'Time Limit',
      count: 27,
      percentage: 6
    }
  ];

  readonly problemPerformance: ProblemPerformance[] = [
    {
      title: 'Two Sum',
      difficulty: 'Easy',
      submissions: 128,
      accepted: 94,
      acceptanceRate: 73
    },
    {
      title: 'Binary Search',
      difficulty: 'Easy',
      submissions: 96,
      accepted: 71,
      acceptanceRate: 74
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      submissions: 82,
      accepted: 49,
      acceptanceRate: 60
    },
    {
      title: 'Merge Intervals',
      difficulty: 'Medium',
      submissions: 74,
      accepted: 41,
      acceptanceRate: 55
    },
    {
      title: 'Graph Shortest Path',
      difficulty: 'Hard',
      submissions: 63,
      accepted: 32,
      acceptanceRate: 51
    }
  ];

  getStatusClass(label: string): string {
    return label.toLowerCase().replace(' ', '-');
  }

  getDifficultyClass(difficulty: string): string {
    return difficulty.toLowerCase();
  }
}