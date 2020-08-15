import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgZone } from '@angular/core';

@Component({
    templateUrl: 'confirmation-dialog.html',
})
export class ConfirmationDialogComponent {
    message = 'Login for edit access';
    confirmButtonText = 'Login';
    cancelButtonText = 'Cancel';
    id: string;
    token: string;
    constructor(
        private zone: NgZone,
        @Inject(MAT_DIALOG_DATA) private data: any,
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
        if (data) {
            this.message = data.message || this.message;
            if (data.buttonText) {
                this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
                this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
            }
        }
    }

    onConfirmClick(): void {
        this.dialogRef.close();
        this.zone.run(() => { });
    }
}
