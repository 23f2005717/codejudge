import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface LeaderboardEntry {
  rank: number;
  student_id: number;
  name: string;
  solved: number;
  submissions: number;
  score: number;
}

export interface LeaderboardResponse {
  count: number;
  leaderboard: LeaderboardEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private readonly leaderboardUrl =
    `${environment.apiUrl}/leaderboard`;

  constructor(
    private readonly http: HttpClient
  ) {}

  getLeaderboard(): Observable<LeaderboardResponse> {
    return this.http.get<LeaderboardResponse>(
      this.leaderboardUrl
    );
  }
}