import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface TestCase {
  id: number;
  input_data: string;
  expected_output: string;
  is_sample: boolean;
  problem_id: number;
}

export interface TestCasesResponse {
  problem_id: number;
  testcases: TestCase[];
  count: number;
}

export interface TestCaseResponse {
  message: string;
  testcase: TestCase;
}

export interface TestCasePayload {
  input_data: string;
  expected_output: string;
  is_sample: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TestCaseService {
  private readonly problemsUrl =
    `${environment.apiUrl}/problems`;

  private readonly testCasesUrl =
    `${environment.apiUrl}/testcases`;

  constructor(
    private readonly http: HttpClient
  ) {}

  getTestCases(
    problemId: number
  ): Observable<TestCasesResponse> {
    return this.http.get<TestCasesResponse>(
      `${this.problemsUrl}/${problemId}/testcases`
    );
  }

  createTestCase(
    problemId: number,
    payload: TestCasePayload
  ): Observable<TestCaseResponse> {
    return this.http.post<TestCaseResponse>(
      `${this.problemsUrl}/${problemId}/testcases`,
      payload
    );
  }

  updateTestCase(
    testCaseId: number,
    payload: Partial<TestCasePayload>
  ): Observable<TestCaseResponse> {
    return this.http.put<TestCaseResponse>(
      `${this.testCasesUrl}/${testCaseId}`,
      payload
    );
  }

  deleteTestCase(
    testCaseId: number
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.testCasesUrl}/${testCaseId}`
    );
  }
}