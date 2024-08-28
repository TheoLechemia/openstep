import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
@Component({
  selector: 'app-infodialog',
  standalone: true,
  imports: [MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './infodialog.component.html',
  styleUrl: './infodialog.component.scss'
})
export class InfodialogComponent {

  readonly dialogRef = inject(MatDialogRef<InfodialogComponent>);


}
