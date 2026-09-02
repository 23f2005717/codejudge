import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  hidePassword = true;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  submit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    /*
     * Read the requested page before starting login.
     */
    const requestedUrl =
      this.route.snapshot.queryParamMap.get('returnUrl');

    const returnUrl =
      requestedUrl &&
      requestedUrl.startsWith('/') &&
      !requestedUrl.startsWith('//')
        ? requestedUrl
        : null;

    const { email, password, rememberMe } =
      this.loginForm.getRawValue();

    this.isSubmitting = true;

    this.authService
      .login(
        {
          email: email.trim(),
          password
        },
        rememberMe
      )
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: response => {
          /*
           * If the user originally requested a protected page,
           * go back to that page after authentication.
           */
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
            return;
          }

          /*
           * Normal login without a return URL.
           */
          if (response.user.role === 'instructor') {
            this.router.navigate(['/instructor/dashboard']);
            return;
          }

          this.router.navigate(['/student/dashboard']);
        },

        error: error => {
          this.errorMessage =
            error?.error?.message ??
            'Unable to log in. Please check your details and try again.';
        }
      });
  }
}