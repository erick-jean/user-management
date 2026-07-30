import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { UserDialog } from './user-dialog';

describe('UserDialog', () => {
  let component: UserDialog;
  let fixture: ComponentFixture<UserDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDialog],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'create',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
