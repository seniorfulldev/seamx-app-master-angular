import { Component } from '@angular/core';
import { Platform, MenuController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { SeamxEvent } from './models/seamxevent';
import { EventsService } from './services/events.service';
import { AppEventsService } from './services/app-events.service';

import { FCM } from '@ionic-native/fcm/ngx';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { environment } from 'src/environments/environment';
import { NotificationService } from './services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { PrepService } from './services/prep.service';
import {Storage} from "@ionic/storage";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  public events: Array<SeamxEvent>;
  activeEvent: SeamxEvent;
  token: string;
  baseUrl: string;
  notification: any;
  allowGoEvent: boolean = false;

  constructor(
    private apiSvc: ApiService,
    private platform: Platform,
    private menuCtrl: MenuController,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private eventsSvc: EventsService,
    private prepSvc: PrepService,
    private notificationSvc: NotificationService,
    public appEvents: AppEventsService,
    private navCtrl: NavController,
    private translate: TranslateService,
    private router: Router,
    private fcm: FCM,
    private storage: Storage
  ) {
    this.events = [];
    this.baseUrl = environment.serverBaseUrl;
    this.initializeApp();
    translate.setDefaultLang('gr');
  }

  initializeApp() {
    this.platform.ready().then(() => {

      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
          console.log('hello');
        }, false);
      });
      this.statusBar.styleDefault();

      this.splashScreen.hide();
      console.log('platform is ready.');

      this.fcm.subscribeToTopic('marketing');

      this.fcm.getToken().then(token => {
        console.log(token);
        this.apiSvc.sendFCMToken(token).subscribe((res) => {
          if (res.body.toString().split(':').length > 1) {
            const tokenId = res.body.toString().replace('tokenId:', '');
            this.notificationSvc.setTokenId(tokenId);
            this.storage.set('tokenId', tokenId).then(() => {
              console.log();
            });
          }
        });
      });


      this.fcm.onNotification().subscribe(data => {
        console.log('notification data: ', data);

        if (data.wasTapped) {
          console.log('Received in Background', JSON.stringify(data));
          this.notification = data;
          if (data.eventId) {
            this.apiSvc.setfromNotiTapping('true');
            this.allowEventList('isEventId');
          } else {
            this.allowEventList('');
          }
        } else {
          // when app is opened
          console.log('Received in foregrounnd', data);
          this.notification = data;
          this.allowGoEvent = true;
        }
      });

      this.fcm.onTokenRefresh().subscribe(token => {
        console.log(token);
      });

      // this.fcm.subscribeToTopic('all');
      this.fcm.unsubscribeFromTopic('marketing');

      this.appEvents.subscribe('events:available', () => {
        this.events = this.eventsSvc.getEvents();
      });
    });
    const allNewsItems = document.querySelectorAll('.news-item');
    allNewsItems.forEach((newsitem) => {
      if (newsitem.shadowRoot.children[0]) {
        newsitem.shadowRoot.children[0].setAttribute('style', 'background-color:transparent !important');
      }
    });
  }

  async alarmTab() {
    if (this.notification.eventId) {
      if (this.eventsSvc.getActiveEvent().eventId == this.notification.eventId) {
        this.notification = undefined;
      } else {
        console.log(this.apiSvc.getfromNotiTapping());
        this.apiSvc.show('Loading...');
        this.eventsSvc.getEvents().forEach((event: any, i: number) => {
          if (event.eventId == this.notification.eventId) {
            this.eventsSvc.setActiveEvent(event);
            console.log('Background set event', event);
            setTimeout(async () => {
              await this.goNext(i);
            }, 2000);
          }
          if (i == this.eventsSvc.getEvents().length - 1) {
            this.notification = undefined;
          }
        });
      }
    } else {
      this.notification = undefined;
    }
  }

  dismiss() {
    this.notification = undefined;
  }

  allowEventList(e: string) {
    if (e == 'isEventId') {

      if (this.apiSvc.getallowEventList()) {
        // this.apiSvc.show('Loading...');
        this.eventsSvc.getEvents().forEach((event: any, i: number) => {
          if (event.eventId == this.notification.eventId) {
            this.eventsSvc.setActiveEvent(event);
            console.log('Background set event', event);
            setTimeout(async () => {
              setTimeout(async () => {
                this.allowGoEvent = true;
              }, 2000);
              await this.goNext(i);
            }, 2000);
          }
        });

      } else {
        setTimeout(() => {
          this.allowEventList('isEventId');
        }, 1000);
      }
    } else {
      if (this.apiSvc.getallowEventList()) {
        this.allowGoEvent = true;
      } else {
        setTimeout(() => {
          this.allowEventList('');
        }, 1000);
      }
    }
  }

  async goNext(i) {
    if (await this.eventsSvc.getActiveEvent().preps) {
      console.log('is', this.eventsSvc.getActiveEvent().preps);
      this.apiSvc.hide();
      this.prepSvc.initialization();
      setTimeout(() => {
        this.navCtrl.navigateRoot('/tab-root');
        this.appEvents.publish('open:event', { idx: i });
      }, 1000);
    } else {
      console.log('no activated preps');
      setTimeout(() => {
        this.goNext(i);
      }, 1000);
    }
  }

  openEvent(index: number) {

    this.menuCtrl.toggle();
    this.appEvents.publish('open:event', { idx: index });
  }
}
