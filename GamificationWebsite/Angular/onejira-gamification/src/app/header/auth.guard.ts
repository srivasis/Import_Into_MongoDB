import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private _authService: AuthService) { }

  canActivate(): boolean {
    if (this._authService.loggedIn()) {
      return true;
    } else {
      return false;
    }
  }
}
