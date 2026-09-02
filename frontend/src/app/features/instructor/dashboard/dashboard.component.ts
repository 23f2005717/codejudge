import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { forkJoin } from 'rxjs';

import {
  AnalyticsResponse,
  AnalyticsService,
  ProblemPerformance
} from '../../../core/services/analytics.service';

import {
  Problem,
  ProblemService
} from '../../../core/services/problem.service';


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
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  stats: DashboardStat[] = [];

  recentProblems: RecentProblem[] = [];

  submissionSummary: SubmissionSummary[] = [];

  isLoading = false;

  errorMessage = '';


  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly problemService: ProblemService,
    private readonly cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.loadDashboard();
  }


  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      analytics: this.analyticsService.getInstructorAnalytics(),
      problems: this.problemService.getProblems()
    }).subscribe({

      next: response => {
        this.applyDashboardData(
          response.analytics,
          response.problems.problems
        );

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: error => {
        console.error(
          'Instructor dashboard API error:',
          error
        );

        this.resetDashboard();

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ??
          'Unable to load dashboard. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }


  private applyDashboardData(
    analytics: AnalyticsResponse,
    problems: Problem[]
  ): void {

    const acceptedCount =
      this.getStatusCount(
        analytics,
        'Accepted'
      );


    this.stats = [
      {
        label: 'Total Problems',
        value: analytics.totalProblems,
        icon: 'code',
        description: 'Problems created'
      },

      {
        label: 'Published Problems',
        value: analytics.publishedProblems,
        icon: 'public',
        description: 'Visible to students'
      },

      {
        label: 'Total Submissions',
        value: analytics.totalSubmissions,
        icon: 'assignment',
        description: 'Student submissions'
      },

      {
        label: 'Accepted Submissions',
        value: acceptedCount,
        icon: 'check_circle',
        description: 'Successfully accepted'
      }
    ];


    const performanceMap =
      new Map<number, ProblemPerformance>();


    for (
      const performance
      of analytics.problemPerformance
    ) {
      performanceMap.set(
        performance.id,
        performance
      );
    }


    this.recentProblems = problems
      .slice(0, 5)
      .map(problem => {

        const performance =
          performanceMap.get(problem.id);

        return {
          id: problem.id,
          title: problem.title,
          difficulty:
            this.formatDifficulty(
              problem.difficulty
            ),
          submissions:
            performance?.submissions ?? 0,
          published:
            problem.is_published
        };
      });


    this.submissionSummary =
      analytics.submissionStatuses.map(
        status => ({
          label: status.label,
          value: status.count,
          percentage: status.percentage
        })
      );
  }


  private resetDashboard(): void {
    this.stats = [];
    this.recentProblems = [];
    this.submissionSummary = [];
  }


  private getStatusCount(
    analytics: AnalyticsResponse,
    status: string
  ): number {

    const item =
      analytics.submissionStatuses.find(
        entry => entry.label === status
      );

    return item?.count ?? 0;
  }


  private formatDifficulty(
    difficulty: string
  ): 'Easy' | 'Medium' | 'Hard' {

    switch (difficulty.toLowerCase()) {

      case 'easy':
        return 'Easy';

      case 'medium':
        return 'Medium';

      case 'hard':
        return 'Hard';

      default:
        return 'Easy';
    }
  }


  getDifficultyClass(
    difficulty: RecentProblem['difficulty']
  ): string {

    return difficulty.toLowerCase();
  }
}