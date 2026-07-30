import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { UserDialog, UserDialogResult } from '../../components/user-dialog/user-dialog';
import { UsersService } from '../../core/services/users.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatDialogModule, MatTableModule, CdkDropList, CdkDrag],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly usersService = inject(UsersService);
  private readonly dialog = inject(MatDialog);

  columns: string[] = ['id', 'name', 'email', 'active', 'actions'];

  readonly dataSource = signal<User[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly actionErrorMessage = signal('');
  readonly updatingUserId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.actionErrorMessage.set('');

    this.usersService.findAll().subscribe({
      next: (users) => {
        this.dataSource.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar usuarios:', error);
        this.errorMessage.set('Nao foi possivel carregar os usuarios.');
        this.loading.set(false);
      },
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserDialog, {
      data: { mode: 'create' },
      width: '460px',
    });

    dialogRef.afterClosed().subscribe((result?: UserDialogResult) => {
      if (!result || !('password' in result)) {
        return;
      }

      this.actionErrorMessage.set('');

      this.usersService.create(result).subscribe({
        next: (user) => {
          this.dataSource.update((users) => [...users, user]);
        },
        error: (error) => {
          console.error('Erro ao criar usuario:', error);
          this.actionErrorMessage.set('Nao foi possivel criar o usuario.');
        },
      });
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDialog, {
      data: { mode: 'edit', user },
      width: '460px',
    });

    dialogRef.afterClosed().subscribe((result?: UserDialogResult) => {
      if (!result || 'password' in result) {
        return;
      }

      this.actionErrorMessage.set('');

      this.usersService.update(user.id, result).subscribe({
        next: (updatedUser) => {
          this.updateUserInTable(updatedUser);
        },
        error: (error) => {
          console.error('Erro ao editar usuario:', error);
          this.actionErrorMessage.set('Nao foi possivel editar o usuario.');
        },
      });
    });
  }

  toggleActive(user: User): void {
    const nextActive = !user.active;

    if (nextActive) {
      this.updateActiveStatus(user, nextActive);
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desativar usuario',
        message: `Tem certeza que deseja desativar ${user.name}?`,
        confirmLabel: 'Desativar',
      },
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.updateActiveStatus(user, nextActive);
      }
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);

    // Cria uma nova referencia para atualizar a tabela.
    this.columns = [...this.columns];
  }

  private updateActiveStatus(user: User, active: boolean): void {
    this.actionErrorMessage.set('');
    this.updatingUserId.set(user.id);

    this.usersService.inactivate(user.id, active).subscribe({
      next: (updatedUser) => {
        this.updateUserInTable(updatedUser);
        this.updatingUserId.set(null);
      },
      error: (error) => {
        console.error('Erro ao atualizar status do usuario:', error);
        this.actionErrorMessage.set('Nao foi possivel atualizar o status do usuario.');
        this.updatingUserId.set(null);
      },
    });
  }

  private updateUserInTable(updatedUser: User): void {
    this.dataSource.update((users) =>
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
  }
}
