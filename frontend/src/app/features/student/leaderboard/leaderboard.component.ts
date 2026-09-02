import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import {
  LeaderboardEntry,
  LeaderboardService
} from '../../../core/services/leaderboard.service';

@Component({
  selector: 'app-student-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {
  leaderboard: LeaderboardEntry[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly leaderboardService: LeaderboardService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.leaderboardService.getLeaderboard().subscribe({
      next: (response) => {
        this.leaderboard = response.leaderboard;

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Leaderboard API error:', error);

        this.leaderboard = [];
        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ??
          'Unable to load the leaderboard. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }

  trackByRank(
    index: number,
    entry: LeaderboardEntry
  ): number {
    return entry.rank;
  }

  getRankIcon(rank: number): string {
    if (rank === 1) {
      return 'emoji_events';
    }

    if (rank === 2) {
      return 'workspace_premium';
    }

    if (rank === 3) {
      return 'military_tech';
    }

    return '';
  }
}