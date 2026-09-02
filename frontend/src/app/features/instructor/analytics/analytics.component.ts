import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  AnalyticsResponse,
  AnalyticsService,
  ProblemPerformance,
  SubmissionStatus
} from '../../../core/services/analytics.service';

@Component({
  selector: 'app-instructor-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {

  totalSubmissions = 0;
  totalProblems = 0;
  publishedProblems = 0;
  activeStudents = 0;

  submissionStatuses: SubmissionStatus[] = [];

  difficultyCounts = {
    easy: 0,
    medium: 0,
    hard: 0
  };

  problemPerformance: ProblemPerformance[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.analyticsService.getInstructorAnalytics().subscribe({
      next: (response: AnalyticsResponse) => {
        this.applyAnalytics(response);

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: error => {
        console.error(
          'Instructor analytics API error:',
          error
        );

        this.resetAnalytics();

        this.isLoading = false;
        this.errorMessage =
          error?.error?.message ??
          'Unable to load analytics. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }

  private applyAnalytics(
    response: AnalyticsResponse
  ): void {
    this.totalSubmissions =
      response.totalSubmissions;

    this.totalProblems =
      response.totalProblems;

    this.publishedProblems =
      response.publishedProblems;

    this.activeStudents =
      response.activeStudents;

    this.submissionStatuses =
      response.submissionStatuses ?? [];

    this.difficultyCounts = {
      easy: response.difficultyCounts?.easy ?? 0,
      medium: response.difficultyCounts?.medium ?? 0,
      hard: response.difficultyCounts?.hard ?? 0
    };

    this.problemPerformance =
      response.problemPerformance ?? [];
  }

  private resetAnalytics(): void {
    this.totalSubmissions = 0;
    this.totalProblems = 0;
    this.publishedProblems = 0;
    this.activeStudents = 0;

    this.submissionStatuses = [];

    this.difficultyCounts = {
      easy: 0,
      medium: 0,
      hard: 0
    };

    this.problemPerformance = [];
  }

  get acceptedSubmissions(): number {
    return this.getSubmissionStatusCount('Accepted');
  }

  get wrongAnswerSubmissions(): number {
    return this.getSubmissionStatusCount(
      'Wrong Answer'
    );
  }

  get runtimeErrorSubmissions(): number {
    return this.getSubmissionStatusCount(
      'Runtime Error'
    );
  }

  get timeLimitSubmissions(): number {
    return this.getSubmissionStatusCount(
      'Time Limit'
    );
  }

  get acceptanceRate(): number {
    if (this.totalSubmissions === 0) {
      return 0;
    }

    return Math.round(
      (this.acceptedSubmissions /
        this.totalSubmissions) *
        100
    );
  }

  get totalDifficultyProblems(): number {
    return (
      this.difficultyCounts.easy +
      this.difficultyCounts.medium +
      this.difficultyCounts.hard
    );
  }

  getDifficultyPercentage(
    difficulty: 'easy' | 'medium' | 'hard'
  ): number {
    if (this.totalDifficultyProblems === 0) {
      return 0;
    }

    return Math.round(
      (this.difficultyCounts[difficulty] /
        this.totalDifficultyProblems) *
        100
    );
  }

  getStatusPercentage(status: string): number {
    const item =
      this.submissionStatuses.find(
        entry => entry.label === status
      );

    return item?.percentage ?? 0;
  }

  getStatusCount(status: string): number {
    return this.getSubmissionStatusCount(status);
  }

  getProblemAcceptanceRate(
    problem: ProblemPerformance
  ): number {
    return problem.acceptanceRate;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Accepted':
        return 'accepted';

      case 'Wrong Answer':
        return 'wrong-answer';

      case 'Runtime Error':
        return 'runtime-error';

      case 'Execution Error':
        return 'execution-error';

      case 'Time Limit':
        return 'time-limit';

      default:
        return '';
    }
  }

  getDifficultyClass(
    difficulty: string
  ): string {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'easy';

      case 'medium':
        return 'medium';

      case 'hard':
        return 'hard';

      default:
        return '';
    }
  }

  private getSubmissionStatusCount(
    status: string
  ): number {
    const item =
      this.submissionStatuses.find(
        entry => entry.label === status
      );

    return item?.count ?? 0;
  }
}