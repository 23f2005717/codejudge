import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface SubmitCodeRequest {
  code: string;
  language: string;
}

export interface Submission {
  id: number;
  problem_id: number;
  language: string;
  status: string;
  score: number;
  execution_time: number | null;
  error_message: string | null;
  created_at: string;
}

export interface SubmitCodeResponse {
  message: string;
  submission: {
    id: number;
    status: string;
    score: number;
    execution_time: number | null;
    error_message: string | null;
  };
}

export interface SubmissionsResponse {
  count: number;
  submissions: Submission[];
}

export interface SubmissionResponse {
  submission: Submission;
}

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {

  private readonly submissionsUrl =
    `${environment.apiUrl}/submissions`;

  constructor(
    private readonly http: HttpClient
  ) {}

  submitCode(
    problemId: number,
    data: SubmitCodeRequest
  ): Observable<SubmitCodeResponse> {
    return this.http.post<SubmitCodeResponse>(
      `${environment.apiUrl}/problems/${problemId}/submit`,
      data
    );
  }

  getMySubmissions(): Observable<SubmissionsResponse> {
    return this.http.get<SubmissionsResponse>(
      this.submissionsUrl
    );
  }

  getSubmission(
    id: number
  ): Observable<SubmissionResponse> {
    return this.http.get<SubmissionResponse>(
      `${this.submissionsUrl}/${id}`
    );
  }
}