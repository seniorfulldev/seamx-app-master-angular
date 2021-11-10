import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { Storage } from "@ionic/storage";
import { NotificationService } from '../../services/notification.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public user: User;
  public isError: boolean;
  private loading: any;

  constructor(
    public nav: NavController,
    private loadingCtrl: LoadingController,
    private apiSvc: ApiService,
    public authSvc: AuthService,
    private notificationSvc: NotificationService,
    private storage: Storage
  ) {
    this.isError = false;
    this.user = new User();
  }

  ngOnInit() { }

  login(): void {

    if (!this.user.emailAddress || this.user.emailAddress === '' || !this.user.password || this.user.password === '') {
      this.isError = true;
      return;
    }

    this.isError = false;

    this.presentLoading().then(() => {
      this.authSvc.doLogin(this.user).subscribe(
        data => {
          console.log('User: ', data);
          if (data.status === 200) {
            this.authSvc.setUser(data.body[0]);
            this.storage.get('tokenId').then((tokenId) => {
              if (tokenId) {
                // const tokenId = this.notificationSvc.getTokenId();
                const userId = data.body[0].userId;
                const notifPeriod = 'daily';
                this.apiSvc.updateFCMToken(tokenId, userId, notifPeriod).subscribe();
              }
            });
            this.storage.set('user', data.body[0]).then(() => {
              console.log();
            });
            this.loading.dismiss();
            // this.authSvc.updateAuthStatus(true);
            this.nav.navigateForward('/welcome');
          }
        }, error => { this.isError = true; });
    });
  }

  onEmailChange() {
    this.isError = false;
  }

  onPWChange() {
    this.isError = false;
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Login...',
      duration: 2000
    });
    this.loading.present();
  }

}
