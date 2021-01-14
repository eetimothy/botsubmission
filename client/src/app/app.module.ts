import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NzFormTooltipIcon } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { LoginComponent } from './components/login.component';
import { MainComponent } from './components/main.component';
import { AuthService } from './auth.service';
import { NzLayoutModule} from 'ng-zorro-antd/layout';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { CanLeaveSerivce } from './can-leave.service';
import { LoginErrorComponent } from './components/login-error.component';
import { SignupComponent } from './components/signup.component';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { UserInfoComponent } from './components/user-info.component';

const ROUTES: Routes = [
  { path: '', component: LoginComponent },
  { 
    path: 'main', component: MainComponent, 
      //canActivate: [AuthService],
      //canDeactivate: [ CanLeaveSerivce ]
  },
  { path: 'login-error', component: LoginErrorComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'user-info', component: UserInfoComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }, 
  
]

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    LoginErrorComponent,
    SignupComponent,
    UserInfoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule, ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NzButtonModule, RouterModule.forRoot(ROUTES),
    NzIconModule, NzFormModule, NzLayoutModule,
    NzInputModule, NzImageModule, NzTypographyModule,
    NzMenuModule,
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }, AuthService, CanLeaveSerivce ],
  bootstrap: [AppComponent]
})
export class AppModule { }
