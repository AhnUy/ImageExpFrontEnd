import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { AppService } from '../app.service';
import { VigenereCipherService } from '../vigenere-cipher.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  hoveredPin = false;
  hoveredItem;
  listPic: any[];
  loading;
  user;
  userId;
  auth_token_key;
  verified_key;
  constructor(
    private service: AppService,
    private cookieService: CookieService,
    private vigenereCipherService: VigenereCipherService,
    private router: Router,
    private messageService: MessageService,
    private http: HttpClient
  ) {
    this.http
      .get('assets/config.json', { responseType: 'json' })
      .subscribe((data) => {
        this.verified_key = data[0].verifiedkey;
        this.auth_token_key = data[2].authtokenkey;
      });
  }

  async ngOnInit() {
    await this.delay(1000);
    this.getAllPosts();
    if (this.cookieService.check('auth-token')) {
      this.getInforUser();
    } else {
      this.router.navigate(['']);
    }
  }
  async getAllPosts() {
    var listId = await this.getAllPost();
    this.listPic = await this.getPicture(listId);
  }
  async getInforUser() {
    this.user = await this.getUserByEmail();
    this.userId = this.user.id;
  }
  async getUserByEmail() {
    var data = {
      'secret-key': this.verified_key,
      body: {
        email: this.vigenereCipherService.vigenereCipher(
          this.cookieService.get('auth-token'),
          this.auth_token_key,
          false
        ),
      },
    };
    var response = this.service.sendRequest('getuserbyemail', data);
    this.setLoading(response);
    var isSuccess = await response.then(
      (__zone_symbol__value) => __zone_symbol__value.body.success
    );
    if (isSuccess) {
      return await response.then(
        (__zone_symbol__value) => __zone_symbol__value.body.response
      );
    } else {
      this.cookieService.delete('auth-token');
      this.router.navigate(['']);
    }
  }
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  onMouseover(item) {
    this.hoveredItem = item;
  }
  onMouseleave() {
    this.hoveredItem = null;
  }
  async getAllPost() {
    var response = this.service.sendRequest('getallposts', '');
    this.setLoading(response);
    return await response.then(
      (__zone_symbol__value) => __zone_symbol__value.body
    );
  }
  async getPicture(listId) {
    var images = [];
    for (var id in listId) {
      var request = this.getPictureById(listId[id].picId);
      forkJoin([request]).subscribe((results) => {
        images.push(results[0]);
      });
    }
    await this.delay(1000);
    return images;
  }
  async getPictureById(picId) {
    var data = {
      'secret-key': this.verified_key,
      body: {
        id: picId,
      },
    };
    var response = this.service.sendRequest('getpicturebyid', data);
    this.setLoading(response);
    var isSuccess = await response.then(
      (__zone_symbol__value) => __zone_symbol__value.body.success
    );
    if (isSuccess) {
      return await response.then(
        (__zone_symbol__value) => __zone_symbol__value.body.response
      );
    } else {
      return null;
    }
  }
  setLoading(promise: Promise<any>) {
    this.loading = true;
    promise.then(() => (this.loading = false));
  }
  savePicture(ev) {
    if (ev === true) {
      this.messageService.add({
        key: 'smsg',
        severity: 'success',
        summary: 'Message',
        detail: 'Save image successfully',
      });
    } else {
      this.messageService.add({
        key: 'smsg',
        severity: 'success',
        summary: 'Message',
        detail: 'Save image unsuccessfully',
      });
    }
  }
}
