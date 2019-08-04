import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule, MatCheckboxModule } from '@angular/material';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';

import { ChartsModule } from 'ng2-charts';

import { MatDialogModule } from '@angular/material/dialog';

import { NgModule } from '@angular/core';

@NgModule ({
  imports: [MatTableModule,
            MatCardModule,
            MatToolbarModule,
            MatButtonModule, MatCheckboxModule,
            MatDividerModule,
            MatListModule,
            MatAutocompleteModule,
            MatFormFieldModule,
            MatInputModule,
            MatBottomSheetModule,
            FormsModule, ReactiveFormsModule,
            MatTabsModule,
            MatGridListModule,
            MatIconModule,
            MatSidenavModule,
            ChartsModule,
            MatDialogModule,
  ],
  exports: [MatTableModule,
            MatCardModule,
            MatToolbarModule,
            MatButtonModule, MatCheckboxModule,
            MatDividerModule,
            MatListModule,
            MatAutocompleteModule,
            MatFormFieldModule,
            MatInputModule,
            MatBottomSheetModule,
            FormsModule, ReactiveFormsModule,
            MatTabsModule,
            MatGridListModule,
            MatIconModule,
            MatSidenavModule,
            ChartsModule,
            MatDialogModule
  ]
})

export class MaterialModule { }
