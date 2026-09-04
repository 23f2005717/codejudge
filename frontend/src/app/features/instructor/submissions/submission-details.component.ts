import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  SubmissionService
} from '../../../core/services/submission.service';

@Component({
  selector: 'app-submission-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './submission-details.component.html',
  styleUrl: './submission-details.component.scss'
})
export class SubmissionDetailsComponent
  implements OnInit {

  submission: any = null;

  loading = true;

  errorMessage = '';

  private submissionId: number | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly submissionService: SubmissionService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!Number.isInteger(id) || id <= 0) {
      this.loading = false;
      this.errorMessage = 'Invalid submission ID.';
      this.cdr.detectChanges();
      return;
    }

    this.submissionId = id;

    this.loadSubmission(id);
  }

  goBack(): void {
    this.router.navigate([
      '/instructor/submissions'
    ]);
  }

  private loadSubmission(id: number): void {

    this.loading = true;
    this.errorMessage = '';

    this.submissionService
      .getInstructorSubmission(id)
      .subscribe({
        next: (response) => {

          if (
            !response ||
            !response.submission
          ) {
            this.loading = false;
            this.errorMessage =
              'Submission data was not returned.';
            this.cdr.detectChanges();
            return;
          }

          this.submission =
            response.submission;

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'INSTRUCTOR SUBMISSION DETAILS API ERROR:',
            error
          );

          this.loading = false;

          if (error?.status === 404) {
            this.errorMessage =
              'Submission not found.';
          } else {
            this.errorMessage =
              error?.error?.message ??
              'Unable to load this submission.';
          }

          this.cdr.detectChanges();
        }
      });
  }

}