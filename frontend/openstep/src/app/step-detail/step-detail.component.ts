import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {  DatePipe } from '@angular/common';

import { CarouselModule } from 'ngx-bootstrap/carousel';



@Component({
  selector: 'app-step-detail',
  standalone: true,
  imports: [CarouselModule, MatButtonModule, DatePipe,  MatIcon, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './step-detail.component.html',
  styleUrl: './step-detail.component.scss'
})
export class StepDetailComponent  {
  readonly dialogRef = inject(MatDialogRef<StepDetailComponent>);
  data = inject(MAT_DIALOG_DATA);
}
