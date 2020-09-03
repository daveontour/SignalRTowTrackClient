import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgZone } from '@angular/core';
;
@Component({
    templateUrl: 'proceed-dialog.html',
})
export class ProceedDialogComponent {

    constructor(
        private zone: NgZone,
        private dialogRef: MatDialogRef<ProceedDialogComponent>) {
    }

    onConfirmClick(): void {
        this.dialogRef.close({ confirmed: true });
        this.zone.run(() => { });
    }
    onCancelClick(): void {
        this.dialogRef.close();
        this.zone.run(() => { });
    }

}
