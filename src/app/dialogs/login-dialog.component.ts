import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgZone } from '@angular/core';
;
@Component({
    templateUrl: 'login-dialog.html',
})
export class LoginDialogComponent {
    message = 'Login for edit access';
    confirmButtonText = 'Login';
    cancelButtonText = 'Cancel';
    id: string;
    token: string;
    constructor(
        private zone: NgZone,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<LoginDialogComponent>) {
        if (data) {
            this.message = data.message || this.message;
            if (data.buttonText) {
                this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
                this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
            }
        }
    }

    onConfirmClick(): void {
        this.dialogRef.close({ id: this.id, token: this.token, confirmed: true });
        this.zone.run(() => { });
    }
    onCancelClick(): void {
        this.dialogRef.close();
        this.zone.run(() => { });
    }

}
