import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import {
  ProblemDifficulty,
  ProblemService
} from '../../../core/services/problem.service';

@Component({
  selector: 'app-create-edit-problem',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './create-edit-problem.component.html',
  styleUrl: './create-edit-problem.component.scss'
})
export class CreateEditProblemComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly problemService = inject(ProblemService);

  isEditMode = false;
  problemId: number | null = null;

  isLoading = false;
  isSaving = false;

  loadError = '';
  saveError = '';

  readonly difficulties = [
    'Easy',
    'Medium',
    'Hard'
  ] as const;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    difficulty: [
      'Easy' as 'Easy' | 'Medium' | 'Hard',
      Validators.required
    ],
    inputFormat: ['', Validators.required],
    outputFormat: ['', Validators.required],
    constraints: ['', Validators.required],
    published: [false]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    const problemId = Number(id);

    if (Number.isNaN(problemId)) {
      this.loadError = 'Invalid problem ID.';
      return;
    }

    this.isEditMode = true;
    this.problemId = problemId;

    this.loadProblem(problemId);
  }

  get pageTitle(): string {
    return this.isEditMode
      ? 'Edit Problem'
      : 'Create Problem';
  }

  get actionLabel(): string {
    if (this.isSaving) {
      return 'Saving...';
    }

    return this.isEditMode
      ? 'Save Changes'
      : 'Create Problem';
  }

  private loadProblem(id: number): void {
    this.isLoading = true;
    this.loadError = '';

    this.problemService.getProblem(id).subscribe({
      next: (response) => {
        const problem = response.problem;

        this.form.patchValue({
          title: problem.title,
          description: problem.description,
          difficulty: this.toDisplayDifficulty(
            problem.difficulty
          ),
          inputFormat: problem.input_format ?? '',
          outputFormat: problem.output_format ?? '',
          constraints: problem.constraints ?? '',
          published: problem.is_published
        });

        this.isLoading = false;
      },

      error: (error) => {
        console.error(
          'Failed to load problem:',
          error
        );

        this.loadError =
          'Unable to load the problem. Please try again.';

        this.isLoading = false;
      }
    });
  }

  saveProblem(): void {
    this.saveError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.saveError =
        'Please complete all required fields.';

      return;
    }

    const formValue = this.form.getRawValue();

    const payload = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      difficulty: this.toApiDifficulty(
        formValue.difficulty
      ),
      input_format: formValue.inputFormat.trim(),
      output_format: formValue.outputFormat.trim(),
      constraints: formValue.constraints.trim(),
      is_published: formValue.published
    };

    this.isSaving = true;

    if (
      this.isEditMode &&
      this.problemId !== null
    ) {
      this.updateProblem(
        this.problemId,
        payload
      );

      return;
    }

    this.createProblem(payload);
  }

  private createProblem(payload: {
    title: string;
    description: string;
    difficulty: ProblemDifficulty;
    input_format: string;
    output_format: string;
    constraints: string;
    is_published: boolean;
  }): void {
    this.problemService
      .createProblem(payload)
      .subscribe({
        next: () => {
          this.router.navigate([
            '/instructor/problems'
          ]);
        },

        error: (error) => {
          console.error(
            'Failed to create problem:',
            error
          );

          this.saveError =
            error?.error?.message ??
            'Unable to create the problem. Please try again.';

          this.isSaving = false;
        }
      });
  }

  private updateProblem(
    id: number,
    payload: {
      title: string;
      description: string;
      difficulty: ProblemDifficulty;
      input_format: string;
      output_format: string;
      constraints: string;
      is_published: boolean;
    }
  ): void {
    this.problemService
      .updateProblem(id, payload)
      .subscribe({
        next: () => {
          this.router.navigate([
            '/instructor/problems'
          ]);
        },

        error: (error) => {
          console.error(
            'Failed to update problem:',
            error
          );

          this.saveError =
            error?.error?.message ??
            'Unable to update the problem. Please try again.';

          this.isSaving = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate([
      '/instructor/problems'
    ]);
  }

  private toApiDifficulty(
    difficulty: 'Easy' | 'Medium' | 'Hard'
  ): ProblemDifficulty {
    return difficulty.toLowerCase() as ProblemDifficulty;
  }

  private toDisplayDifficulty(
    difficulty: string
  ): 'Easy' | 'Medium' | 'Hard' {
    switch (difficulty.toLowerCase()) {
      case 'medium':
        return 'Medium';

      case 'hard':
        return 'Hard';

      default:
        return 'Easy';
    }
  }
}