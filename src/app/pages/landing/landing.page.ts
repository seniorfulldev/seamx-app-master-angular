import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { NotificationService } from '../../services/notification.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {
  isgoogleLogin: boolean = false;
  isfacebookLogin: boolean = false;
  isLoggedUser = false;

  constructor(
    public nav: NavController,
    private authSvc: AuthService,
    private storage: Storage,
    private translate: TranslateService,
    private googlePlus: GooglePlus,
    private fb: Facebook,
    private notificationSvc: NotificationService,
    private apiSvc: ApiService

  ) {
    translate.setDefaultLang('en');

    this.storage.get('user').then((user) => {
      // this.user = user;
      if (user) {
        console.log('saved user', user);
        this.authSvc.setUser(user);
        this.nav.navigateForward('/welcome');
      } else {
        this.isLoggedUser = true;
        console.log('no saved user');
      }
    });
  }

  ngOnInit() {

  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  // Google signin
  doGoogleLogin() {
    this.isgoogleLogin = true;

    console.log("doGoogle Signin");
    this.apiSvc.show('Login now...');
    this.googlePlus.login({})
      .then(res => {
        console.log("login result ===>", res);
        console.log("success", res.email);
        this.loginwithsocial(res.email);

      })
      .catch(err => {
        this.apiSvc.showToast('Google login error', 'danger', 'bottom');
        this.isgoogleLogin = false;
        this.apiSvc.hide();

      });
  }

  // Facebook signin
  async doFacebookLogin() {
    console.log("do Facebook Signin");
    this.isfacebookLogin = true;
    this.apiSvc.show('Login now...');

    let permissions = new Array<string>();

    // Facebook App User Permissions
    permissions = ["public_profile", "email"];
    this.fb.login(permissions)
      .then(res => {
        console.log(res);
        let userId = res.authResponse.userID;
        this.fb.api("/me?fields=name,email", permissions)
          .then(user => {
            console.log("-------facebook data--------");
            console.log(user.email);
            console.log(user);
            this.loginwithsocial(user.email);

            // user.picture = "https://graph.facebook.com/" + userId + "/picture?type=large";
            // user.name, user.email and user.picture

          }).catch(err => {
            this.apiSvc.showToast('api error', 'danger', 'bottom');
            this.apiSvc.hide();
            this.isfacebookLogin = false;
          });
      }).catch(err => {
        console.log("error occured====>", err);
        this.apiSvc.showToast('Facebook login error', 'danger', 'bottom');
        this.apiSvc.hide();
        this.isfacebookLogin = false;
      });

  }

  loginwithsocial(email) {

    this.authSvc.doLoginwithsocial(email).subscribe(
      data => {
        console.log('User: ', data);
        if (data.status === 200) {
          this.authSvc.setUser(data.body[0]);
          if (this.notificationSvc.getAddToken() === true) {
            const tokenId = this.notificationSvc.getTokenId();
            const userId = data.body[0].userId;
            const notifPeriod = 'daily';
            this.apiSvc.updateFCMToken(tokenId, userId, notifPeriod).subscribe();
          }
          this.storage.set('user', data.body[0]).then(() => {
            console.log();
          });
          this.isgoogleLogin = false;
          this.isfacebookLogin = false;
          this.apiSvc.hide();

          this.nav.navigateForward('/welcome');
        } else {
          this.isgoogleLogin = false;
          this.isfacebookLogin = false;
          this.apiSvc.hide();

          this.apiSvc.showToast('Invalid login', 'danger', 'bottom');

        }
      });

  }


}
