import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { User } from '../../models/user.model';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-home',
  imports: [MatTableModule, CdkDropList, CdkDrag],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly usersService = inject(UsersService);

  columns: string[] = ['id', 'name', 'email', 'active'];

  readonly dataSource = signal<User[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
     this.loading.set(true);
    this.errorMessage.set('');

    this.usersService.findAll().subscribe({
      next: (users) => {
        this.dataSource.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);

        this.errorMessage.set('Não foi possível carregar os usuários.');

        this.loading.set(false);
      },
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);

    // Cria uma nova referência para atualizar a tabela.
    this.columns = [...this.columns];
  }
}
