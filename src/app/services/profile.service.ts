import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  fromProfile: boolean;
  selectedNotifPeriod: string;
  navToggle = 'false';

  constructor(
    public authSvc: AuthService,
    private apiSvc: ApiService,
    private notificationSvc: NotificationService,
    private storage: Storage
  ) {
    // Default values
    this.fromProfile = false;
    this.selectedNotifPeriod = 'daily';
  }

  setSelectedNotifPeriod(notifPeriod: string) {
    this.selectedNotifPeriod = notifPeriod;
    console.log(notifPeriod);
    this.storage.get('tokenId').then((tokenId) => {
      if (tokenId) {
        const userId = this.authSvc.getUser().userId;
        const notifPeriod = this.selectedNotifPeriod;
        this.apiSvc.updateFCMToken(tokenId, userId, notifPeriod).subscribe();
      }
    });
  }

  getSelectedNotifPeriod(): string {
    return this.selectedNotifPeriod;
  }

  setFromProfile(isFrom: boolean) {

    this.fromProfile = isFrom;
  }

  getFromProfile(): boolean {
    return this.fromProfile;
  }
  setNavToggle(fromprofilepage) {
    this.navToggle = fromprofilepage;
  }

  getNavToggle() {
    return this.navToggle;
  }
}
