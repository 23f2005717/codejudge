import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Submission {
  id: number;
  problemId: number;
  problemTitle: string;
  status:
    | 'ACCEPTED'
    | 'WRONG_ANSWER'
    | 'TIME_LIMIT_EXCEEDED'
    | 'MEMORY_LIMIT_EXCEEDED'
    | 'RUNTIME_ERROR';
  score: number;
  passedTests: number;
  totalTests: number;
  runtime: number;
  memory: number;
  submittedAt: string;
}

@Component({
  selector: 'app-student-submissions',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './submissions.component.html',
  styleUrl: './submissions.component.scss'
})
export class SubmissionsComponent {
  readonly submissions: Submission[] = [];

  getStatusLabel(status: Submission['status']): string {
    return status.replaceAll('_', ' ');
  }

  getStatusClass(status: Submission['status']): string {
    switch (status) {
      case 'ACCEPTED':
        return 'accepted';

      case 'WRONG_ANSWER':
        return 'wrong-answer';

      case 'TIME_LIMIT_EXCEEDED':
        return 'time-limit';

      case 'MEMORY_LIMIT_EXCEEDED':
        return 'memory-limit';

      case 'RUNTIME_ERROR':
        return 'runtime-error';

      default:
        return '';
    }
  }
}