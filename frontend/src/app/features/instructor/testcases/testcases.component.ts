import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

interface TestCase {
  id: number;
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
    MatMenuModule
  ],
  templateUrl: './testcases.component.html',
  styleUrl: './testcases.component.scss'
})
export class TestcasesComponent {
  searchTerm = '';

  testCases: TestCase[] = [
    {
      id: 1,
      problem: 'Two Sum',
      input: '4 9\n2 7 11 15',
      expectedOutput: '0 1',
      hidden: false,
      createdAt: 'Aug 28, 2026'
    },
    {
      id: 2,
      problem: 'Two Sum',
      input: '3 6\n3 2 4',
      expectedOutput: '1 2',
      hidden: true,
      createdAt: 'Aug 28, 2026'
    },
    {
      id: 3,
      problem: 'Binary Search',
      input: '5 7\n1 3 5 7 9',
      expectedOutput: '3',
      hidden: false,
      createdAt: 'Aug 27, 2026'
    },
    {
      id: 4,
      problem: 'Binary Search',
      input: '6 8\n1 2 4 5 7 9',
      expectedOutput: '-1',
      hidden: true,
      createdAt: 'Aug 27, 2026'
    },
    {
      id: 5,
      problem: 'Longest Substring Without Repeating Characters',
      input: 'abcabcbb',
      expectedOutput: '3',
      hidden: false,
      createdAt: 'Aug 25, 2026'
    },
    {
      id: 6,
      problem: 'Longest Substring Without Repeating Characters',
      input: 'pwwkew',
      expectedOutput: '3',
      hidden: true,
      createdAt: 'Aug 25, 2026'
    }
  ];

  get filteredTestCases(): TestCase[] {
    const query = this.searchTerm.trim().toLowerCase();

    if (!query) {
      return this.testCases;
    }

    return this.testCases.filter(testCase =>
      testCase.problem.toLowerCase().includes(query) ||
      testCase.input.toLowerCase().includes(query) ||
      testCase.expectedOutput.toLowerCase().includes(query)
    );
  }

  get visibleCount(): number {
    return this.testCases.filter(testCase => !testCase.hidden).length;
  }

  get hiddenCount(): number {
    return this.testCases.filter(testCase => testCase.hidden).length;
  }

  toggleVisibility(testCase: TestCase): void {
    testCase.hidden = !testCase.hidden;
  }

  deleteTestCase(testCase: TestCase): void {
    const confirmed = window.confirm(
      `Delete the test case for "${testCase.problem}"?`
    );

    if (!confirmed) {
      return;
    }

    this.testCases = this.testCases.filter(
      item => item.id !== testCase.id
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
  }
}