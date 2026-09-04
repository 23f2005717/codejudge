import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import loader from '@monaco-editor/loader';

import { Subscription } from 'rxjs';

import {
  Problem,
  ProblemService
} from '../../../core/services/problem.service';

import {
  SubmissionService
} from '../../../core/services/submission.service';

interface ExecutionResult {
  status: string;
  score: number | null;
  totalTests: number | null;
  passedTests: number | null;
  runtime: number | null;
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
  implements OnInit, OnDestroy {

  @ViewChild('monacoEditor')
  private monacoEditorContainer?: ElementRef<HTMLDivElement>;

  problem: Problem | null = null;

  loading = true;

  errorMessage = '';

  code = `# Write your Python solution here
`;

  isRunning = false;

  isSubmitting = false;

  result: ExecutionResult | null = null;

  private problemId: number | null = null;

  private editor: any = null;

  private editorInitialized = false;

  private readonly subscriptions =
    new Subscription();

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

      this.cdr.detectChanges();

      return;
    }

    this.problemId = id;

    this.loadProblem(id);
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

        totalTests: 0,

        passedTests: 0,

        runtime: null,

        errorMessage: 'Code is required.'
      };

      this.cdr.detectChanges();

      return;
    }

    if (this.problemId === null) {

      this.result = {

        status: 'Invalid',

        score: null,

        totalTests: null,

        passedTests: null,

        runtime: null,

        errorMessage: 'Problem ID is not available.'
      };

      this.cdr.detectChanges();

      return;
    }

    this.isRunning = true;

    this.result = null;

    this.errorMessage = '';

    const request =
      this.submissionService.runCode(
        this.problemId,
        {
          code: this.code,
          language: 'python'
        }
      ).subscribe({

        next: (response) => {

          const runResult = response.result;

          this.result = {

            status: runResult.status,

            score: null,

            totalTests: runResult.total_tests,

            passedTests: runResult.passed_tests,

            runtime:
              runResult.execution_time !== null
                ? runResult.execution_time * 1000
                : null,

            errorMessage:
              runResult.error_message
          };

          this.isRunning = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'RUN CODE API ERROR:',
            error
          );

          this.isRunning = false;

          this.result = {

            status: 'Run Failed',

            score: null,

            totalTests: null,

            passedTests: null,

            runtime: null,

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

        errorMessage: 'Code is required.'
      };

      this.cdr.detectChanges();

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

            totalTests: submission.total_tests,

            passedTests: submission.passed_tests,

            runtime:
              submission.execution_time !== null
                ? submission.execution_time * 1000
                : null,

            errorMessage:
              submission.error_message
          };

          this.isSubmitting = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          this.isSubmitting = false;

          this.result = {

            status: 'Submission Failed',

            score: null,

            totalTests: null,

            passedTests: null,

            runtime: null,

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

          console.log(
            'EDITOR PROBLEM RESPONSE:',
            response
          );

          if (!response || !response.problem) {

            this.loading = false;

            this.errorMessage =
              'Problem data was not returned.';

            this.cdr.detectChanges();

            return;
          }

          this.problem = response.problem;

          this.loading = false;

          this.cdr.detectChanges();

          setTimeout(() => {

            void this.initializeEditor();

          });
        },

        error: (error) => {

          console.error(
            'EDITOR PROBLEM API ERROR:',
            error
          );

          this.loading = false;

          if (error?.status === 404) {

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

  private async initializeEditor(): Promise<void> {

    if (this.editorInitialized) {

      return;
    }

    const container =
      this.monacoEditorContainer?.nativeElement;

    if (!container) {

      return;
    }

    this.editorInitialized = true;

    try {

      const monaco = await loader.init();

      if (!this.monacoEditorContainer) {

        this.editorInitialized = false;

        return;
      }

      this.editor =
        monaco.editor.create(
          container,
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

            tabSize: 4,

            padding: {

              top: 12,

              bottom: 12
            }
          }
        );

      this.editor.onDidChangeModelContent(() => {

        if (this.editor) {

          this.code =
            this.editor.getValue();
        }
      });

    } catch (error) {

      console.error(
        'Monaco editor initialization failed:',
        error
      );

      this.editorInitialized = false;

      this.errorMessage =
        'Unable to load the code editor.';

      this.cdr.detectChanges();
    }
  }
}