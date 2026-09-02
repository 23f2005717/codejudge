import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import loader from '@monaco-editor/loader';
import * as monaco from 'monaco-editor';

import { Subscription } from 'rxjs';

import {
  Problem,
  ProblemService
} from '../../../core/services/problem.service';

import {
  RunCodeResponse,
  SubmissionService
} from '../../../core/services/submission.service';

interface ExecutionResult {
  status: string;
  score: number | null;
  totalTests: number | null;
  passedTests: number | null;
  runtime: number | null;
  memory: number | null;
  errorMessage: string | null;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent
  implements OnInit, AfterViewInit, OnDestroy {

  problem: Problem | null = null;

  loading = true;
  errorMessage = '';

  code = `# Write your Python solution here

`;

  isRunning = false;
  isSubmitting = false;

  result: ExecutionResult | null = null;

  private problemId: number | null = null;

  private readonly subscriptions =
    new Subscription();

  private editor:
    monaco.editor.IStandaloneCodeEditor | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly problemService: ProblemService,
    private readonly submissionService: SubmissionService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!Number.isInteger(id) || id <= 0) {
      this.loading = false;
      this.errorMessage = 'Invalid problem ID.';
      return;
    }

    this.problemId = id;
    this.loadProblem(id);
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      await loader.init();

      const editorElement =
        document.getElementById('monaco-editor');

      if (!editorElement) {
        return;
      }

      this.editor = monaco.editor.create(
        editorElement,
        {
          value: this.code,
          language: 'python',
          theme: 'vs',
          automaticLayout: true,

          minimap: {
            enabled: false
          },

          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 4
        }
      );

      this.editor.onDidChangeModelContent(() => {
        this.code =
          this.editor?.getValue() ?? '';
      });

    } catch (error) {
      console.error(
        'Monaco editor initialization error:',
        error
      );

      this.errorMessage =
        'Unable to load the code editor.';

      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.editor?.dispose();
    this.subscriptions.unsubscribe();
  }

  runCode(): void {
    if (!this.code.trim()) {
      this.result = {
        status: 'Invalid',
        score: null,
        totalTests: null,
        passedTests: null,
        runtime: null,
        memory: null,
        errorMessage: 'Code is required.'
      };

      return;
    }

    if (this.problemId === null) {
      return;
    }

    this.isRunning = true;
    this.result = null;

    const request =
      this.submissionService.runCode(
        this.problemId,
        {
          code: this.code,
          language: 'python'
        }
      ).subscribe({

        next: (response: RunCodeResponse) => {
          const execution =
            response.result;

          this.result = {
            status: execution.status,
            score: null,
            totalTests:
              execution.total_tests,
            passedTests:
              execution.passed_tests,
            runtime:
              execution.execution_time !== null
                ? execution.execution_time * 1000
                : null,
            memory: null,
            errorMessage:
              execution.error_message
          };

          this.isRunning = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Run code API error:',
            error
          );

          this.isRunning = false;

          this.result = {
            status: 'Run Failed',
            score: null,
            totalTests: null,
            passedTests: null,
            runtime: null,
            memory: null,
            errorMessage:
              error?.error?.message ??
              'Unable to run the code.'
          };

          this.cdr.detectChanges();
        }

      });

    this.subscriptions.add(request);
  }

  submitCode(): void {
    if (!this.code.trim()) {
      this.result = {
        status: 'Invalid',
        score: null,
        totalTests: null,
        passedTests: null,
        runtime: null,
        memory: null,
        errorMessage: 'Code is required.'
      };

      return;
    }

    if (this.problemId === null) {
      return;
    }

    this.isSubmitting = true;
    this.result = null;

    const request =
      this.submissionService.submitCode(
        this.problemId,
        {
          code: this.code,
          language: 'python'
        }
      ).subscribe({

        next: (response) => {
          const submission =
            response.submission;

          this.result = {
            status: submission.status,
            score: submission.score,
            totalTests: null,
            passedTests: null,
            runtime:
              submission.execution_time !== null
                ? submission.execution_time * 1000
                : null,
            memory: null,
            errorMessage:
              submission.error_message
          };

          this.isSubmitting = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Submit code API error:',
            error
          );

          this.isSubmitting = false;

          this.result = {
            status: 'Submission Failed',
            score: null,
            totalTests: null,
            passedTests: null,
            runtime: null,
            memory: null,
            errorMessage:
              error?.error?.message ??
              'Unable to submit the code.'
          };

          this.cdr.detectChanges();
        }

      });

    this.subscriptions.add(request);
  }

  goBack(): void {
    this.router.navigate([
      '/student/problems'
    ]);
  }

  private loadProblem(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    const request =
      this.problemService.getProblem(id).subscribe({

        next: (response) => {
          this.problem = response.problem;
          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Problem details API error:',
            error
          );

          this.loading = false;

          if (error.status === 404) {
            this.errorMessage =
              'Problem not found.';
          } else {
            this.errorMessage =
              error?.error?.message ??
              'Unable to load this problem.';
          }

          this.cdr.detectChanges();
        }

      });

    this.subscriptions.add(request);
  }
}