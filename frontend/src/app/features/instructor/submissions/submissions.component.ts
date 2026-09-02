import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  InstructorSubmission,
  SubmissionService
} from '../../../core/services/submission.service';

interface Submission {
  id: number;
  student: string;
  email: string;
  problem: string;
  language: string;
  status: string;
  executionTime: string;
  submittedAt: string;
}

@Component({
  selector: 'app-instructor-submissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './submissions.component.html',
  styleUrl: './submissions.component.scss'
})
export class SubmissionsComponent implements OnInit {

  submissions: Submission[] = [];

  searchTerm = '';
  selectedStatus = 'All';
  selectedLanguage = 'All';

  isLoading = false;
  errorMessage = '';

  readonly statuses = [
    'All',
    'Accepted',
    'Wrong Answer',
    'Runtime Error',
    'Execution Error',
    'Time Limit'
  ];

  readonly languages = [
    'All',
    'Python'
  ];

  constructor(
    private readonly submissionService: SubmissionService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.submissionService.getInstructorSubmissions().subscribe({
      next: response => {
        this.submissions = response.submissions.map(
          submission => this.mapSubmission(submission)
        );

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: error => {
        console.error(
          'Instructor submissions API error:',
          error
        );

        this.submissions = [];
        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ??
          'Unable to load submissions. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }

  private mapSubmission(
    submission: InstructorSubmission
  ): Submission {
    return {
      id: submission.id,
      student: submission.student,
      email: submission.email,
      problem: submission.problem,
      language: this.formatLanguage(
        submission.language
      ),
      status: this.formatStatus(
        submission.status
      ),
      executionTime: this.formatExecutionTime(
        submission.execution_time
      ),
      submittedAt: this.formatDate(
        submission.created_at
      )
    };
  }

  private formatLanguage(language: string): string {
    if (!language) {
      return '—';
    }

    return (
      language.charAt(0).toUpperCase() +
      language.slice(1).toLowerCase()
    );
  }

  private formatStatus(status: string): string {
    if (status === 'Time Limit Exceeded') {
      return 'Time Limit';
    }

    return status || '—';
  }

  private formatExecutionTime(
    executionTime: number | null
  ): string {
    if (
      executionTime === null ||
      executionTime === undefined
    ) {
      return '—';
    }

    return `${(executionTime * 1000).toFixed(2)} ms`;
  }

  private formatDate(
    createdAt: string | null
  ): string {
    if (!createdAt) {
      return '—';
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleString();
  }

  get filteredSubmissions(): Submission[] {
    const search =
      this.searchTerm.trim().toLowerCase();

    return this.submissions.filter(submission => {
      const matchesSearch =
        !search ||
        submission.student
          .toLowerCase()
          .includes(search) ||
        submission.email
          .toLowerCase()
          .includes(search) ||
        submission.problem
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        submission.status === this.selectedStatus;

      const matchesLanguage =
        this.selectedLanguage === 'All' ||
        submission.language === this.selectedLanguage;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLanguage
      );
    });
  }

  get totalCount(): number {
    return this.submissions.length;
  }

  get acceptedCount(): number {
    return this.submissions.filter(
      submission =>
        submission.status === 'Accepted'
    ).length;
  }

  get failedCount(): number {
    return this.submissions.filter(
      submission =>
        submission.status !== 'Accepted'
    ).length;
  }

  get acceptanceRate(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return Math.round(
      (this.acceptedCount / this.totalCount) * 100
    );
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

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    this.selectedLanguage = 'All';
  }
}