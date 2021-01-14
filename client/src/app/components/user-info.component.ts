import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  form: FormGroup
  uploadImg: any
  @ViewChild('imageFile') imageFile: ElementRef;
  apiUrl = "http://localhost:3000";

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit() {
    this.form = this.fb.group({
      fullname: this.fb.control('', Validators.required),
      nric: this.fb.control('', Validators.required),
      'image-file': this.fb.control('', Validators.required),
    })
  }

  upload(){
    const formData = new FormData();
    formData.set('upload', this.imageFile.nativeElement.files[0]);
    this.http.post(`${this.apiUrl}/upload`, formData)
      .toPromise()
      .then((result) => {
        this.uploadImg = result['s3_file_key']
      }).catch((error) => {
        console.log(error)
      })
    }

    process() {
      console.info('form = ', this.form.value)
      const value = this.form.value
  
      //fill in the form (x-www-form-urlencoded)
      let params = new HttpParams()
      params = params.set('fullname', value['fullname'])
      params = params.set('nric', value['nric'])
  
      //set the HTTP header
      let headers = new HttpHeaders()
      headers = headers.set('Content-Type', 
      'application/x-www-form-urlencoded')
  
      //make the POST request
      this.http.post<any>('http://localhost:3000/user-info',
        params.toString(), { headers }) //must add toString()
        .toPromise()
        .then(res => {
          console.info('Response: ', res)
        })
        .catch(err => {
          console.error('ERROR: ', err)
        })
    }

}
export class NzDemoMenuHorizontalComponent {}