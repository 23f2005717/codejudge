import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

import {
  Problem,
  ProblemService
} from '../../../core/services/problem.service';

import {
  TestCase,
  TestCasePayload,
  TestCaseService
} from '../../../core/services/testcase.service';

interface InstructorTestCase {
  id: number;
  problemId: number;
  problem: string;
  input: string;
  expectedOutput: string;
  hidden: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-testcases',
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
    MatMenuModule,
    MatSelectModule
  ],
  templateUrl: './testcases.component.html',
  styleUrl: './testcases.component.scss'
})
export class TestcasesComponent implements OnInit {
  searchTerm = '';

  problems: Problem[] = [];
  selectedProblemId: number | null = null;

  testCases: InstructorTestCase[] = [];

  isLoadingProblems = false;
  isLoadingTestCases = false;
  isSaving = false;

  showAddForm = false;

  errorMessage = '';
  successMessage = '';

  newInput = '';
  newExpectedOutput = '';
  newIsSample = true;

  constructor(
    private readonly problemService: ProblemService,
    private readonly testCaseService: TestCaseService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.isLoadingProblems = true;
    this.errorMessage = '';

    this.problemService.getProblems()
      .pipe(
        finalize(() => {
          this.isLoadingProblems = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.problems = response.problems ?? [];

          if (this.problems.length === 0) {
            this.selectedProblemId = null;
            this.testCases = [];
            return;
          }

          this.selectedProblemId = this.problems[0].id;
          this.loadTestCases();
        },

        error: (error) => {
          console.error('Failed to load problems:', error);

          this.problems = [];
          this.testCases = [];

          this.errorMessage =
            error?.error?.message ||
            'Unable to load problems. Please try again.';
        }
      });
  }

  onProblemChange(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.showAddForm = false;

    this.resetNewTestCase();

    if (this.selectedProblemId === null) {
      this.testCases = [];
      return;
    }

    this.loadTestCases();
  }

  loadTestCases(): void {
    if (this.selectedProblemId === null) {
      this.testCases = [];
      return;
    }

    const problemId = this.selectedProblemId;

    this.isLoadingTestCases = true;
    this.errorMessage = '';

    this.testCaseService.getTestCases(problemId)
      .pipe(
        finalize(() => {
          this.isLoadingTestCases = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          const problem = this.getSelectedProblem();

          this.testCases = (response.testcases ?? []).map(
            (testCase) => this.mapTestCase(
              testCase,
              problem?.title ?? 'Unknown Problem'
            )
          );
        },

        error: (error) => {
          console.error('Failed to load test cases:', error);

          this.testCases = [];

          this.errorMessage =
            error?.error?.message ||
            'Unable to load test cases. Please try again.';
        }
      });
  }

  toggleAddForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.showAddForm = !this.showAddForm;

    if (!this.showAddForm) {
      this.resetNewTestCase();
    }
  }

  createTestCase(): void {
    if (this.selectedProblemId === null) {
      this.errorMessage = 'Please select a problem first.';
      return;
    }

    if (!this.newInput.trim()) {
      this.errorMessage = 'Input data is required.';
      return;
    }

    if (!this.newExpectedOutput.trim()) {
      this.errorMessage = 'Expected output is required.';
      return;
    }

    const payload: TestCasePayload = {
      input_data: this.newInput,
      expected_output: this.newExpectedOutput,
      is_sample: this.newIsSample
    };

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.testCaseService
      .createTestCase(this.selectedProblemId, payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          const problem = this.getSelectedProblem();

          this.testCases = [
            ...this.testCases,
            this.mapTestCase(
              response.testcase,
              problem?.title ?? 'Unknown Problem'
            )
          ];

          this.successMessage =
            response.message || 'Test case created successfully.';

          this.resetNewTestCase();
          this.showAddForm = false;
        },

        error: (error) => {
          console.error('Failed to create test case:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to create the test case. Please try again.';
        }
      });
  }

  toggleVisibility(testCase: InstructorTestCase): void {
    const nextIsSample = !testCase.hidden;

    this.errorMessage = '';
    this.successMessage = '';

    this.testCaseService.updateTestCase(testCase.id, {
      is_sample: nextIsSample
    }).subscribe({
      next: () => {
        testCase.hidden = !nextIsSample;

        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {
        console.error(
          'Failed to update test case visibility:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to update test case visibility. Please try again.';
      }
    });
  }

  deleteTestCase(testCase: InstructorTestCase): void {
    const confirmed = window.confirm(
      `Delete the test case for "${testCase.problem}"?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.testCaseService.deleteTestCase(testCase.id)
      .subscribe({
        next: (response) => {
          this.testCases = this.testCases.filter(
            item => item.id !== testCase.id
          );

          this.successMessage =
            response.message || 'Test case deleted successfully.';

          this.changeDetectorRef.detectChanges();
        },

        error: (error) => {
          console.error(
            'Failed to delete test case:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to delete the test case. Please try again.';
        }
      });
  }

  get filteredTestCases(): InstructorTestCase[] {
    const query = this.searchTerm.trim().toLowerCase();

    if (!query) {
      return this.testCases;
    }

    return this.testCases.filter((testCase) =>
      testCase.problem.toLowerCase().includes(query) ||
      testCase.input.toLowerCase().includes(query) ||
      testCase.expectedOutput.toLowerCase().includes(query)
    );
  }

  get visibleCount(): number {
    return this.testCases.filter(
      testCase => !testCase.hidden
    ).length;
  }

  get hiddenCount(): number {
    return this.testCases.filter(
      testCase => testCase.hidden
    ).length;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  private getSelectedProblem(): Problem | undefined {
    return this.problems.find(
      problem => problem.id === this.selectedProblemId
    );
  }

  private mapTestCase(
    testCase: TestCase,
    problemTitle: string
  ): InstructorTestCase {
    return {
      id: testCase.id,
      problemId: testCase.problem_id,
      problem: problemTitle,
      input: testCase.input_data,
      expectedOutput: testCase.expected_output,
      hidden: !testCase.is_sample,
      createdAt: '—'
    };
  }

  private resetNewTestCase(): void {
    this.newInput = '';
    this.newExpectedOutput = '';
    this.newIsSample = true;
  }
}