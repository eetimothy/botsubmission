import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule} from 'ng-zorro-antd/layout';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormTooltipIcon } from 'ng-zorro-antd/form';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  captchaTooltipIcon: NzFormTooltipIcon = {
    type: 'info-circle',
    theme: 'twotone'
  };

  processSignup(): void {
    for (const i in this.signupForm.controls) {
      this.signupForm.controls[i].markAsDirty()
      this.signupForm.controls[i].updateValueAndValidity()
    }
    console.info('sign up form: ', this.signupForm.value)
    const value = this.signupForm.value

    //fill in the form (x-www-form-urlencoded)
    let params = new HttpParams()
    params = params.set('username', value['username'])
    params = params.set('password', value['password'])
    params = params.set('email', value['email'])
    params = params.set('mobile', value['mobile'])

    //set the http header
    let headers = new HttpHeaders()
    headers = headers.set('Content-TYpe', 'application/x-www-form-urlencoded')

    //make the POST request
    this.http.post<any>('http://localhost:3000/signup',
    params.toString(), { headers }) //must add toString()
    .toPromise()
    .then(res => {
      console.info('Response: ', res)
    })
    .catch(err => {
      console.error('ERROR: ', err)
    })
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.signupForm.controls.checkPassword.updateValueAndValidity())
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean} => {
    if (!control.value) {
      return {required: true}
    } else if (control.value !== this.signupForm.controls.password.value) {
      return { confirm: true, error: true }
    }
    return {}
  }
  constructor(private fb: FormBuilder, private http: HttpClient) { }


  ngOnInit(): void {
    this.signupForm = this.fb.group({
      username: [null, [Validators.required]],
      email: [null, [Validators.email, Validators.required]],
      mobile: [null, [Validators.required]],
      password: [null, [Validators.required]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]],
      //agree: [false]
    });
  }

}
