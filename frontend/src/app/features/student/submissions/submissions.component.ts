import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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

interface SubmissionRow {
  id: number;
  problemId: number;
  problemTitle: string;
  language: string;
  status: string;
  score: number;
  executionTime: number | null;
  errorMessage: string | null;
  submittedAt: string | null;
}

@Component({
  selector: 'app-student-submissions',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './submissions.component.html',
  styleUrl: './submissions.component.scss'
})
export class SubmissionsComponent implements OnInit {

  submissions: SubmissionRow[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly submissionService: SubmissionService,
    private readonly problemService: ProblemService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      submissions:
        this.submissionService.getMySubmissions(),
      problems:
        this.problemService.getProblems()
    }).subscribe({

      next: response => {
        this.applySubmissions(
          response.submissions.submissions,
          response.problems.problems
        );

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: error => {
        console.error(
          'Student submissions API error:',
          error
        );

        this.submissions = [];
        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ??
          'Unable to load submission history. Please try again.';

        this.cdr.detectChanges();
      }

    });
  }

  private applySubmissions(
    submissions: Submission[],
    problems: Problem[]
  ): void {

    const problemMap =
      new Map<number, string>();

    for (const problem of problems) {
      problemMap.set(
        problem.id,
        problem.title
      );
    }

    this.submissions = submissions.map(
      submission => ({
        id: submission.id,
        problemId: submission.problem_id,
        problemTitle:
          problemMap.get(submission.problem_id) ??
          `Problem #${submission.problem_id}`,
        language: submission.language,
        status: submission.status,
        score: submission.score,
        executionTime:
          submission.execution_time,
        errorMessage:
          submission.error_message,
        submittedAt:
          submission.created_at
      })
    );
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

  formatRuntime(
    executionTime: number | null
  ): string {

    if (executionTime === null) {
      return '—';
    }

    return `${executionTime.toFixed(3)}s`;
  }

  formatDate(
    createdAt: string | null
  ): string {

    if (!createdAt) {
      return '—';
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return createdAt;
    }

    return date.toLocaleString();
  }
}