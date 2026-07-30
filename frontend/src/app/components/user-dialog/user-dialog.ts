import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateUser, UpdateUser, User } from '../../models/user.model';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

export type UserDialogResult = CreateUser | UpdateUser;

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
})
export class UserDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserDialog, UserDialogResult>);
  readonly data = inject<UserDialogData>(MAT_DIALOG_DATA);

  readonly isEditMode = this.data.mode === 'edit';
  readonly form = this.formBuilder.nonNullable.group({
    name: [this.data.user?.name ?? '', [Validators.required, Validators.minLength(2)]],
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.getRawValue();

    if (this.isEditMode) {
      this.dialogRef.close({ name, email });
      return;
    }

    this.dialogRef.close({ name, email, password });
  }
}
