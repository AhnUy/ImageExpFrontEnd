import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest,HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  postID : any;
  data: any;
  constructor(private http: HttpClient) { }
  getResponse() {
    const request = new HttpRequest(
      "POST", "http://localhost:8000/updateuser", {},
       {reportProgress: true});
    console.warn("request",this.http.request(request).subscribe(event => console.log("ev", event)));

    var data1 = this.http.post<any>('http://localhost:8000/updateuser', { "success": "false" }).subscribe(data => {
    this.postID = data;
    console.warn("postID", data);
    });

    return this.http.post<any>('http://localhost:8000/updateuser', this.data);



  }
  async updateUser(data) {

    const httpOptions: { headers; observe; } = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      observe: 'response'
    };

    var respo = null;
    var res = await this.http.post('http://localhost:8000/updateuser', data, httpOptions);
    setTimeout( () => {  }, 500 );
    await res.toPromise().then(response =>{
      console.log("response", response);
      respo = response;
    } );
    return respo;

  }
}
