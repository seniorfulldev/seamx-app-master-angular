import { Component, OnInit, Output, Input, Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { User } from '../../models/user';
import { PrepService } from '../../services/prep.service';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { Storage } from "@ionic/storage";
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: User;
  openNotifSettings: boolean;
  selectedNotif = 'daily';
  user_avartar;
  // isImageTaken: boolean = false;
  static isImageTaken: boolean = false;
  constructor(
    public navCtrl: NavController,
    private prepSvc: PrepService,
    private apiSvc: ApiService,
    private profileSvc: ProfileService,
    private authSvc: AuthService,
    private storage: Storage,
  ) {
    // this.isImageTaken = ProfilePage.isImageTaken

    this.openNotifSettings = false;

    this.user = new User();
    this.user_avartar = 'assets/img/profile.jpg';
  }

  ngOnInit() {
    this.user = this.authSvc.getUser();
    this.storage.get('notification_period').then((np) => {
      if (np) {
        this.selectedNotif = np;
      }
    });

    this.selectedNotif = this.profileSvc.getSelectedNotifPeriod();
  }

  onNotifsClick() {
    this.openNotifSettings = !this.openNotifSettings;
  }

  onRadioChange(event) {
    this.selectedNotif = event.detail.value;
    this.storage.set('notification_period', this.selectedNotif);
    this.profileSvc.setSelectedNotifPeriod(event.detail.value);
  }

  goToQuestions() {
    this.navCtrl.navigateRoot('/tab-root/tabs/questions');
  }

  gotToInvite() {
    this.profileSvc.setFromProfile(true);
    this.navCtrl.navigateRoot('/invite-friend');
  }

  logout() {
    this.apiSvc.setallowEventList(false);
    this.storage.remove('user').then(() => {
    });
    this.profileSvc.setFromProfile(false);
    this.prepSvc.setFromPreps(false);
    this.profileSvc.setNavToggle('false');
    this.navCtrl.navigateRoot('/landing');
  }

  getAvatar() {
    
    if (this.user.image) {
      if (!this.user.image.startsWith('http')) {
        this.user_avartar = environment.baseUrl + this.user.image;
      }
    }
    return this.user_avartar;
  }

  isImage(e) {
    if (ProfilePage.isImageTaken) {
      if (e === 'avatar') {
        return 'centeralign';
      } else {
        return 'hide';
      }
    } else {
      return '';
    }
  }
}
