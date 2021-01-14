import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthService implements CanActivate {
    private token = ''

    constructor( private http: HttpClient, private router: Router) {}

    login(email, password): Promise<boolean> {
        //call to the backend
        //examine the status code
        this.token = ''
        return this.http.post<any>('http://localhost:3000/login', 
        { email, password }, { observe: 'response' }
        ).toPromise()
        .then(res => {
            if( res.status == 200 ) {
                this.token = res.body.token
                console.info('res: ', res)
                return true
            }
            
        })
        .catch(err => {
            if (err.status == 401) {
                //handle error
            }
            console.info('err: ', err)
            return false
        })
    }

    isLogin() {
        return this.token != ''
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if ( this.isLogin() )
        return true
        return this.router.parseUrl('/login-error')
    }

}