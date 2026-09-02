import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SubmitCodeRequest {
  code: string;
  language: string;
}

export interface RunCodeResponse {
  message: string;
  result: {
    status: string;
    passed_tests: number;
    total_tests: number;
    execution_time: number;
    error_message: string | null;
  };
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

export interface InstructorSubmission {
  id: number;
  student: string;
  email: string;
  problem: string;
  language: string;
  status: string;
  score: number;
  execution_time: number | null;
  created_at: string | null;
}

export interface InstructorSubmissionsResponse {
  count: number;
  submissions: InstructorSubmission[];
}

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {

  private readonly problemsUrl =
    `${environment.apiUrl}/problems`;

  private readonly submissionsUrl =
    `${environment.apiUrl}/submissions`;

  private readonly instructorSubmissionsUrl =
    `${environment.apiUrl}/instructor/submissions`;

  constructor(
    private readonly http: HttpClient
  ) {}

  runCode(
    problemId: number,
    data: SubmitCodeRequest
  ): Observable<RunCodeResponse> {
    return this.http.post<RunCodeResponse>(
      `${this.problemsUrl}/${problemId}/run`,
      data
    );
  }

  submitCode(
    problemId: number,
    data: SubmitCodeRequest
  ): Observable<SubmitCodeResponse> {
    return this.http.post<SubmitCodeResponse>(
      `${this.problemsUrl}/${problemId}/submit`,
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

  getInstructorSubmissions(): Observable<InstructorSubmissionsResponse> {
    return this.http.get<InstructorSubmissionsResponse>(
      this.instructorSubmissionsUrl
    );
  }
}