import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  Problem,
  ProblemDifficulty,
  ProblemService
} from '../../../core/services/problem.service';

@Component({
  selector: 'app-student-problems',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './problems.component.html',
  styleUrl: './problems.component.scss'
})
export class ProblemsComponent implements OnInit {
  problems: Problem[] = [];

  searchTerm = '';
  selectedDifficulty: ProblemDifficulty | 'all' = 'all';

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly problemService: ProblemService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.problemService.getProblems().subscribe({
      next: response => {
        console.log('Student Problems API response:', response);

        this.problems = response.problems.filter(
          problem => problem.is_published
        );

        this.isLoading = false;

        // Angular 22 change-detection fix.
        this.cdr.detectChanges();
      },

      error: error => {
        console.error('Student Problems API error:', error);

        this.isLoading = false;
        this.errorMessage =
          error?.error?.message ??
          'Unable to load problems. Please try again.';

        // Angular 22 change-detection fix.
        this.cdr.detectChanges();
      }
    });
  }

  get filteredProblems(): Problem[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.problems.filter(problem => {
      const matchesSearch =
        !search ||
        problem.title.toLowerCase().includes(search);

      const matchesDifficulty =
        this.selectedDifficulty === 'all' ||
        problem.difficulty === this.selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDifficulty = 'all';
  }

  getDifficultyLabel(
    difficulty: ProblemDifficulty
  ): string {
    return (
      difficulty.charAt(0).toUpperCase() +
      difficulty.slice(1)
    );
  }
}