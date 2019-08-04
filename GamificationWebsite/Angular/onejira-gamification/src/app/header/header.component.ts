import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';


export interface LoginData {
  loginAttempts: 0 | 1 | 2 | 3;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  loginAttempts = 0;

  constructor(public dialog: MatDialog, private _auth: AuthService) { }

  ngOnInit() {
    if (!this._auth.loggedIn()) {
      this.openDialog();
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(LoginDialog, {
      disableClose: true,
      height: '800px',
      width: '800px',
      data: {
        loginAttempts: '' + this.loginAttempts
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (!this._auth.loggedIn()) {
        this.loginAttempts += 1;
        this.openDialog();
      }
    });
  }

  logOut() {
    sessionStorage.removeItem('token');
    this.openDialog();
  }

}


@Component({
  selector: 'login-dialog',
  templateUrl: './login-dialog.html',
})
// tslint:disable-next-line: component-class-suffix
export class LoginDialog {

  email = new FormControl('', [Validators.required, Validators.email]);

  password: string;

  hide = true;

  constructor(public dialogRef: MatDialogRef<LoginDialog>,
              private _auth: AuthService,
              @Inject(MAT_DIALOG_DATA) public data: LoginData,
              private _router: Router) { }

  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a valid Transamerica email address' :
        this.email.hasError('email') ? 'Not a valid email' :
            '';
  }

  authenticate() {

    if (this.data.loginAttempts === 3) {
      console.log('Too many log in attempts!');
      sessionStorage.setItem('Locked out', new Date().toLocaleDateString());
    } else {

      this._auth.loginUser({userName: this.email.value, password: this.password
                          }).subscribe(
        res => {
          console.log(res);
          localStorage.setItem('token', res.token);
          sessionStorage.setItem('token', res.token);
          this.dialogRef.close('Congratulations! You are logged in!');
          this._router.navigate(['/']);
        },
        err => {
          console.log(err);
          this.dialogRef.close('Invalid Transamerica credentials.\nPlease try again.');

        }
      );
    }
  }

}
