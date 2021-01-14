import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule} from 'ng-zorro-antd/layout';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  //errorMessage = ''
  validateForm!: FormGroup


  constructor( private fb: FormBuilder, private router: Router,
    private http: HttpClient, private authSvc: AuthService ) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: this.fb.control('', Validators.required),
      password: this.fb.control('', Validators.required),
      
    })
  }

  processLogin() {
    console.info('> values: ', this.validateForm.value)
    this.authSvc.login(this.validateForm.get('email').value, this.validateForm.get('password').value)
    .then(result => {
      console.info('>>> result: ', result)
      this.router.navigate([ '/user-info' ])
    })
  }
}
