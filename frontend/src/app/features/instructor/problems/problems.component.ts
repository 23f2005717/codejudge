import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  submissions: number;
  published: boolean;
  createdAt: string;
}

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
export class ProblemsComponent {

  searchTerm = '';
  selectedDifficulty = 'all';
  selectedStatus = 'all';

  problems: Problem[] = [
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      submissions: 86,
      published: true,
      createdAt: '28 Aug 2026'
    },
    {
      id: 2,
      title: 'Binary Search',
      difficulty: 'Easy',
      submissions: 64,
      published: true,
      createdAt: '27 Aug 2026'
    },
    {
      id: 3,
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      submissions: 52,
      published: true,
      createdAt: '25 Aug 2026'
    },
    {
      id: 4,
      title: 'Merge Intervals',
      difficulty: 'Medium',
      submissions: 41,
      published: true,
      createdAt: '23 Aug 2026'
    },
    {
      id: 5,
      title: 'Graph Shortest Path',
      difficulty: 'Hard',
      submissions: 27,
      published: false,
      createdAt: '21 Aug 2026'
    },
    {
      id: 6,
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      submissions: 91,
      published: true,
      createdAt: '19 Aug 2026'
    }
  ];

  get filteredProblems(): Problem[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.problems.filter(problem => {
      const matchesSearch =
        !search ||
        problem.title.toLowerCase().includes(search);

      const matchesDifficulty =
        this.selectedDifficulty === 'all' ||
        problem.difficulty.toLowerCase() === this.selectedDifficulty;

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'published' && problem.published) ||
        (this.selectedStatus === 'draft' && !problem.published);

      return matchesSearch &&
        matchesDifficulty &&
        matchesStatus;
    });
  }

  getDifficultyClass(
    difficulty: Problem['difficulty']
  ): string {
    return difficulty.toLowerCase();
  }

  togglePublished(problem: Problem): void {
    problem.published = !problem.published;
  }

  deleteProblem(problem: Problem): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${problem.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.problems = this.problems.filter(
      item => item.id !== problem.id
    );
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDifficulty = 'all';
    this.selectedStatus = 'all';
  }
}