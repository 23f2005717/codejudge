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
import { MatSelectModule } from '@angular/material/select';

interface Submission {
  id: number;
  student: string;
  email: string;
  problem: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit';
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
    MatMenuModule,
    MatSelectModule
  ],
  templateUrl: './submissions.component.html',
  styleUrl: './submissions.component.scss'
})
export class SubmissionsComponent {
  searchTerm = '';
  selectedStatus = 'All';
  selectedLanguage = 'All';

  readonly statuses = [
    'All',
    'Accepted',
    'Wrong Answer',
    'Runtime Error',
    'Time Limit'
  ];

  readonly languages = [
    'All',
    'Python',
    'Java',
    'C++',
    'JavaScript'
  ];

  submissions: Submission[] = [
    {
      id: 1001,
      student: 'Arun Kumar',
      email: 'arun@example.com',
      problem: 'Two Sum',
      language: 'Python',
      status: 'Accepted',
      executionTime: '42 ms',
      submittedAt: 'Sep 2, 2026 10:32 AM'
    },
    {
      id: 1002,
      student: 'Priya Sharma',
      email: 'priya@example.com',
      problem: 'Binary Search',
      language: 'Java',
      status: 'Accepted',
      executionTime: '31 ms',
      submittedAt: 'Sep 2, 2026 10:18 AM'
    },
    {
      id: 1003,
      student: 'Rahul Verma',
      email: 'rahul@example.com',
      problem: 'Two Sum',
      language: 'C++',
      status: 'Wrong Answer',
      executionTime: '28 ms',
      submittedAt: 'Sep 2, 2026 09:54 AM'
    },
    {
      id: 1004,
      student: 'Sneha Patel',
      email: 'sneha@example.com',
      problem: 'Longest Substring Without Repeating Characters',
      language: 'Python',
      status: 'Accepted',
      executionTime: '67 ms',
      submittedAt: 'Sep 2, 2026 09:41 AM'
    },
    {
      id: 1005,
      student: 'Vikram Singh',
      email: 'vikram@example.com',
      problem: 'Merge Intervals',
      language: 'JavaScript',
      status: 'Runtime Error',
      executionTime: '19 ms',
      submittedAt: 'Sep 2, 2026 09:27 AM'
    },
    {
      id: 1006,
      student: 'Ananya Rao',
      email: 'ananya@example.com',
      problem: 'Binary Search',
      language: 'C++',
      status: 'Accepted',
      executionTime: '24 ms',
      submittedAt: 'Sep 2, 2026 09:12 AM'
    },
    {
      id: 1007,
      student: 'Karan Mehta',
      email: 'karan@example.com',
      problem: 'Graph Shortest Path',
      language: 'Java',
      status: 'Time Limit',
      executionTime: '2001 ms',
      submittedAt: 'Sep 2, 2026 08:56 AM'
    },
    {
      id: 1008,
      student: 'Meera Nair',
      email: 'meera@example.com',
      problem: 'Valid Parentheses',
      language: 'Python',
      status: 'Accepted',
      executionTime: '35 ms',
      submittedAt: 'Sep 2, 2026 08:43 AM'
    }
  ];

  get filteredSubmissions(): Submission[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.submissions.filter(submission => {
      const matchesSearch =
        !query ||
        submission.student.toLowerCase().includes(query) ||
        submission.email.toLowerCase().includes(query) ||
        submission.problem.toLowerCase().includes(query);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        submission.status === this.selectedStatus;

      const matchesLanguage =
        this.selectedLanguage === 'All' ||
        submission.language === this.selectedLanguage;

      return matchesSearch && matchesStatus && matchesLanguage;
    });
  }

  get acceptedCount(): number {
    return this.submissions.filter(
      submission => submission.status === 'Accepted'
    ).length;
  }

  get failedCount(): number {
    return this.submissions.filter(
      submission => submission.status !== 'Accepted'
    ).length;
  }

  get acceptanceRate(): number {
    if (this.submissions.length === 0) {
      return 0;
    }

    return Math.round(
      (this.acceptedCount / this.submissions.length) * 100
    );
  }

  getStatusClass(status: Submission['status']): string {
    switch (status) {
      case 'Accepted':
        return 'accepted';

      case 'Wrong Answer':
        return 'wrong-answer';

      case 'Runtime Error':
        return 'runtime-error';

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