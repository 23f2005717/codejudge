import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface SubmissionStatus {
  label: string;
  count: number;
  percentage: number;
}

export interface ProblemPerformance {
  id: number;
  title: string;
  difficulty: string;
  submissions: number;
  accepted: number;
  acceptanceRate: number;
}

export interface AnalyticsResponse {
  totalSubmissions: number;
  totalProblems: number;
  publishedProblems: number;
  activeStudents: number;
  submissionStatuses: SubmissionStatus[];
  difficultyCounts: {
    easy: number;
    medium: number;
    hard: number;
  };
  problemPerformance: ProblemPerformance[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private readonly analyticsUrl =
    `${environment.apiUrl}/instructor/analytics`;

  constructor(
    private readonly http: HttpClient
  ) {}

  getInstructorAnalytics(): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(
      this.analyticsUrl
    );
  }
}