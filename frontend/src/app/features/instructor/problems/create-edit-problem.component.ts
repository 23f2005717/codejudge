import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface ProblemFormData {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  published: boolean;
}

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

  isEditMode = false;
  problemId: number | null = null;
  loadError = false;
  saveError = '';

  readonly difficulties: ProblemFormData['difficulty'][] = [
    'Easy',
    'Medium',
    'Hard'
  ];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    difficulty: ['Easy' as ProblemFormData['difficulty'], Validators.required],
    inputFormat: ['', [Validators.required]],
    outputFormat: ['', [Validators.required]],
    constraints: ['', [Validators.required]],
    published: [false]
  });

  private readonly placeholderProblems: Record<number, ProblemFormData> = {
    1: {
      title: 'Two Sum',
      description:
        'Given an array of integers and a target value, find two numbers whose sum equals the target.',
      difficulty: 'Easy',
      inputFormat:
        'The first line contains n and target. The second line contains n integers.',
      outputFormat:
        'Print the indices of the two numbers whose sum equals the target.',
      constraints:
        '2 <= n <= 100000\n-10^9 <= values[i] <= 10^9',
      published: true
    },
    2: {
      title: 'Binary Search',
      description:
        'Given a sorted array of integers, find the position of a target value.',
      difficulty: 'Easy',
      inputFormat:
        'The first line contains n and target. The second line contains n sorted integers.',
      outputFormat:
        'Print the index of the target value, or -1 if it does not exist.',
      constraints:
        '1 <= n <= 100000\nArray elements are sorted in ascending order.',
      published: true
    },
    3: {
      title: 'Longest Substring Without Repeating Characters',
      description:
        'Find the length of the longest substring that contains no repeated characters.',
      difficulty: 'Medium',
      inputFormat: 'The input contains a single string.',
      outputFormat:
        'Print the length of the longest substring without repeated characters.',
      constraints:
        '1 <= length of string <= 100000',
      published: true
    }
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.problemId = Number(id);
      this.loadProblem();
    }
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Problem' : 'Create Problem';
  }

  get actionLabel(): string {
    return this.isEditMode ? 'Save Changes' : 'Create Problem';
  }

  private loadProblem(): void {
    if (!this.problemId || !this.placeholderProblems[this.problemId]) {
      this.loadError = true;
      return;
    }

    this.form.patchValue(this.placeholderProblems[this.problemId]);
  }

  saveProblem(): void {
    this.saveError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveError = 'Please complete all required fields.';
      return;
    }

    const problem = this.form.getRawValue();

    // Temporary frontend-only save.
    // This will be replaced with ProblemService API integration.
    console.log(
      this.isEditMode ? 'Updating problem:' : 'Creating problem:',
      problem
    );

    this.router.navigate(['/instructor/problems']);
  }

  cancel(): void {
    this.router.navigate(['/instructor/problems']);
  }
}