import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { forkJoin } from 'rxjs';

import {
  Problem,
  ProblemService
} from '../../../core/services/problem.service';

import {
  Submission,
  SubmissionService
} from '../../../core/services/submission.service';

interface DashboardStat {
  label: string;
  value: number | string;
  icon: string;
}

interface RecentSubmission {
  id: number;
  problemId: number;
  problem: string;
  status: string;
  score: number;
  submittedAt: string | null;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStat[] = [
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

  recentSubmissions: RecentSubmission[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly submissionService: SubmissionService,
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
      submissions: this.submissionService.getMySubmissions(),
      problems: this.problemService.getProblems()
    }).subscribe({
      next: (response) => {
        this.buildDashboard(
          response.submissions.submissions,
          response.problems.problems
        );

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Student dashboard API error:', error);

        this.isLoading = false;
        this.errorMessage =
          error?.error?.message ??
          'Unable to load your dashboard. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }

  private buildDashboard(
    submissions: Submission[],
    problems: Problem[]
  ): void {
    const problemMap = new Map<number, string>();

    for (const problem of problems) {
      problemMap.set(problem.id, problem.title);
    }

    const acceptedSubmissions = submissions.filter(
      submission => submission.status === 'Accepted'
    );

    const solvedProblemIds = new Set<number>();

    for (const submission of acceptedSubmissions) {
      solvedProblemIds.add(submission.problem_id);
    }

    const successRate = submissions.length
      ? Math.round((acceptedSubmissions.length / submissions.length) * 100)
      : 0;

    this.stats = [
      {
        label: 'Problems Solved',
        value: solvedProblemIds.size,
        icon: 'check_circle'
      },
      {
        label: 'Total Submissions',
        value: submissions.length,
        icon: 'assignment'
      },
      {
        label: 'Success Rate',
        value: `${successRate}%`,
        icon: 'trending_up'
      }
    ];

    this.recentSubmissions = submissions
      .slice(0, 5)
      .map(submission => ({
        id: submission.id,
        problemId: submission.problem_id,
        problem:
          problemMap.get(submission.problem_id) ??
          `Problem #${submission.problem_id}`,
        status: submission.status,
        score: submission.score,
        submittedAt: this.formatDate(submission.created_at)
      }));
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

      case 'Time Limit Exceeded':
        return 'time-limit';

      case 'No Test Cases':
        return 'no-test-cases';

      case 'pending':
        return 'pending';

      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Accepted':
        return 'Accepted';

      case 'Wrong Answer':
        return 'Wrong Answer';

      case 'Runtime Error':
        return 'Runtime Error';

      case 'Execution Error':
        return 'Execution Error';

      case 'Time Limit Exceeded':
        return 'Time Limit Exceeded';

      case 'No Test Cases':
        return 'No Test Cases';

      case 'pending':
        return 'Pending';

      default:
        return status;
    }
  }

  formatDate(createdAt: string | null): string {
    if (!createdAt) {
      return '—';
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return createdAt;
    }

    return date.toLocaleString();
  }

  trackByLabel(index: number, stat: DashboardStat): string {
    return stat.label;
  }

  trackBySubmission(
    index: number,
    submission: RecentSubmission
  ): number {
    return submission.id;
  }
}