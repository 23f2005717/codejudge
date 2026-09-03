import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';

import { MatMenuModule } from '@angular/material/menu';

import { MatSelectModule } from '@angular/material/select';

import { ProblemService } from '../../../core/services/problem.service';

interface InstructorProblem {

  id: number;

  title: string;

  difficulty: 'Easy' | 'Medium' | 'Hard';

  submissions: number;

  published: boolean;

  createdAt: string;

}

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

type StatusFilter = 'all' | 'published' | 'draft';

@Component({

  selector: 'app-instructor-problems',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    RouterModule,

    MatButtonModule,

    MatFormFieldModule,

    MatIconModule,

    MatInputModule,

    MatMenuModule,

    MatSelectModule

  ],

  templateUrl: './problems.component.html',

  styleUrl: './problems.component.scss'

})

export class ProblemsComponent implements OnInit {

  searchTerm = '';

  selectedDifficulty: DifficultyFilter = 'all';

  selectedStatus: StatusFilter = 'all';

  problems: InstructorProblem[] = [];

  filteredProblems: InstructorProblem[] = [];

  isLoading = false;

  errorMessage = '';

  constructor(

    private readonly problemService: ProblemService,

    private readonly changeDetectorRef: ChangeDetectorRef

  ) {}

  ngOnInit(): void {

    this.loadProblems();

  }

  loadProblems(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.changeDetectorRef.detectChanges();

    this.problemService.getProblems().subscribe({

      next: (response) => {

        console.log('Problems API response:', response);

        const apiProblems = Array.isArray(response?.problems)

          ? response.problems

          : [];

        this.problems = apiProblems.map((problem) => ({

          id: problem.id,

          title: problem.title,

          difficulty: this.formatDifficulty(problem.difficulty),

          submissions: 0,

          published: problem.is_published,

          createdAt: problem.created_at

            ? new Date(problem.created_at).toLocaleString()

            : '—'

        }));

        this.applyFilters();

        this.isLoading = false;

        this.changeDetectorRef.detectChanges();

      },

      error: (error) => {

        console.error('Failed to load problems:', error);

        this.problems = [];

        this.filteredProblems = [];

        this.errorMessage =

          error?.error?.message ||

          'Unable to load problems. Please try again.';

        this.isLoading = false;

        this.changeDetectorRef.detectChanges();

      }

    });

  }

  applyFilters(): void {

    const search = this.searchTerm.trim().toLowerCase();

    this.filteredProblems = this.problems.filter((problem) => {

      const matchesSearch =

        !search ||

        problem.title.toLowerCase().includes(search);

      const matchesDifficulty =

        this.selectedDifficulty === 'all' ||

        problem.difficulty.toLowerCase() === this.selectedDifficulty;

      const matchesStatus =

        this.selectedStatus === 'all' ||

        (

          this.selectedStatus === 'published' &&

          problem.published

        ) ||

        (

          this.selectedStatus === 'draft' &&

          !problem.published

        );

      return (

        matchesSearch &&

        matchesDifficulty &&

        matchesStatus

      );

    });

  }

  onSearchChange(): void {

    this.applyFilters();

  }

  onDifficultyChange(): void {

    this.applyFilters();

  }

  onStatusChange(): void {

    this.applyFilters();

  }

  clearSearch(): void {

    this.searchTerm = '';

    this.applyFilters();

  }

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedDifficulty = 'all';

    this.selectedStatus = 'all';

    this.applyFilters();

  }

  getDifficultyClass(

    difficulty: InstructorProblem['difficulty']

  ): string {

    return difficulty.toLowerCase();

  }

  togglePublished(problem: InstructorProblem): void {

    const nextPublished = !problem.published;

    this.problemService.updateProblem(problem.id, {

      is_published: nextPublished

    }).subscribe({

      next: () => {

        problem.published = nextPublished;

        this.applyFilters();

        this.changeDetectorRef.detectChanges();

      },

      error: (error) => {

        console.error(

          'Failed to update problem status:',

          error

        );

        this.errorMessage =

          error?.error?.message ||

          'Unable to update the problem status. Please try again.';

        this.changeDetectorRef.detectChanges();

      }

    });

  }

  deleteProblem(problem: InstructorProblem): void {

    const confirmed = window.confirm(

      `Are you sure you want to delete "${problem.title}"?`

    );

    if (!confirmed) {

      return;

    }

    this.problemService.deleteProblem(problem.id).subscribe({

      next: () => {

        this.problems = this.problems.filter(

          (item) => item.id !== problem.id

        );

        this.applyFilters();

        this.changeDetectorRef.detectChanges();

      },

      error: (error) => {

        console.error(

          'Failed to delete problem:',

          error

        );

        this.errorMessage =

          error?.error?.message ||

          'Unable to delete the problem. Please try again.';

        this.changeDetectorRef.detectChanges();

      }

    });

  }

  private formatDifficulty(

    difficulty: string

  ): InstructorProblem['difficulty'] {

    switch (difficulty.toLowerCase()) {

      case 'medium':

        return 'Medium';

      case 'hard':

        return 'Hard';

      case 'easy':

      default:

        return 'Easy';

    }

  }

}