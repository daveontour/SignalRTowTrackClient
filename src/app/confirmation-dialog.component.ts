import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
;
@Component({
    selector: 'confirmation-dialog',
    templateUrl: 'confirmation-dialog.html',
})
export class ConfirmationDialog {
    message = 'Login for edit access';
    confirmButtonText = 'Login';
    cancelButtonText = 'Cancel';
    id: string;
    token: string;
    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        public dialogRef: MatDialogRef<ConfirmationDialog>) {
        if (data) {
            this.message = data.message || this.message;
            if (data.buttonText) {
                this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
                this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
            }
        }
    }

    onConfirmClick(): void {
        this.dialogRef.close(true);
        const a = document.createElement('a');
        a.click();
        a.remove();
    }
}
