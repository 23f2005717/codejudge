import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type ProblemDifficulty = 'easy' | 'medium' | 'hard';

export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  input_format: string | null;
  output_format: string | null;
  constraints: string | null;
  is_published: boolean;
  instructor_id?: number;
}

export interface ProblemsResponse {
  problems: Problem[];
  count: number;
}

export interface ProblemResponse {
  problem: Problem;
}

export interface ProblemPayload {
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  input_format?: string | null;
  output_format?: string | null;
  constraints?: string | null;
  is_published?: boolean;
}

export interface ProblemMutationResponse {
  message: string;
  problem?: Problem;
}

@Injectable({
  providedIn: 'root'
})
export class ProblemService {
  private readonly problemsUrl = `${environment.apiUrl}/problems`;

  constructor(private readonly http: HttpClient) {}

  getProblems(): Observable<ProblemsResponse> {
    return this.http.get<ProblemsResponse>(this.problemsUrl);
  }

  getProblem(id: number): Observable<ProblemResponse> {
    return this.http.get<ProblemResponse>(
      `${this.problemsUrl}/${id}`
    );
  }

  createProblem(
    payload: ProblemPayload
  ): Observable<ProblemMutationResponse> {
    return this.http.post<ProblemMutationResponse>(
      this.problemsUrl,
      payload
    );
  }

  updateProblem(
    id: number,
    payload: Partial<ProblemPayload>
  ): Observable<ProblemMutationResponse> {
    return this.http.put<ProblemMutationResponse>(
      `${this.problemsUrl}/${id}`,
      payload
    );
  }

  deleteProblem(id: number): Observable<ProblemMutationResponse> {
    return this.http.delete<ProblemMutationResponse>(
      `${this.problemsUrl}/${id}`
    );
  }
}