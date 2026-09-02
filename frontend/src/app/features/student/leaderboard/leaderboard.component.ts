import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

interface LeaderboardEntry {
  rank: number;
  name: string;
  solved: number;
  submissions: number;
  score: number;
}

@Component({
  selector: 'app-student-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  readonly leaderboard: LeaderboardEntry[] = [];
}