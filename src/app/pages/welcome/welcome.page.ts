import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SeamxEvent } from '../../models/seamxevent';
import { EventsService } from '../../services/events.service';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { PrepService } from '../../services/prep.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  registeredEvents: number;
  eventIds: any;
  userName: string;
  eventName: string;
  events: Array<SeamxEvent>;
  baseUrl: string;
  seamxEvent: SeamxEvent;
  isFirstLogin = false;
  isLoading = false;
  fromNotiTapping: any;
  // setedAe = false;
  // eventPagescontent: any;

  constructor(
    public navCtrl: NavController,
    private authSvc: AuthService,
    private eventsSvc: EventsService,
    private apiSvc: ApiService,
    private prepSvc: PrepService,

  ) {
    this.baseUrl = environment.serverBaseUrl;
    this.eventName = 'Sie Sou Marathon 2020';
    this.registeredEvents = 0;
    this.fromNotiTapping = this.apiSvc.getfromNotiTapping();
    console.log(this.fromNotiTapping);
  }

  ionViewDidEnter() {
    const user = this.authSvc.getUser();
    this.userName = user.firstname + ' ' + user.lastname;
    this.eventIds = user.events;
    this.registeredEvents = user.events.length;
    console.log('registeredEvents', this.registeredEvents);
    // this.apiSvc.show('Loading events...');
    // this.isLoading = false;
    setTimeout(() => {
      this.eventsSvc.fetchEvents(user.events).then((events: Array<SeamxEvent>) => {
        this.events = events;
        // console.log(this.events);
        if (events.length === 1) {
          this.eventName = events[0].name;
        }
        if (this.apiSvc.getallowEventList()) {
          this.isLoading = true;
        } else {
          this.allowEventList();
        }
      });
    }, 200);
  }

  ngOnInit() {
    // this.eventPagescontent = this.seamxEvent.pagescontent;
  }

  async goToGoal(event: SeamxEvent, e) {
    // if events length is one
    if (e == 'gogoal' && this.events) {
      this.apiSvc.show('Loading...');
      this.eventsSvc.setActiveEvent(this.events[0]);
      setTimeout(async () => {
        // this.apiSvc.hide();
        if (this.authSvc.getUser().personas) {
          await this.goNext();
        } else {
          this.apiSvc.hide();
          this.navCtrl.navigateForward('/goal');
        }
      }, 2000);

    } else if (e == 'ok' && this.events) {
      console.log('-------click event------');
      this.apiSvc.show('Loading...');
      this.eventsSvc.setActiveEvent(event);
      setTimeout(() => {
        // this.apiSvc.hide();
        if (this.authSvc.getUser().personas) {
          this.goNext();
        } else {
          this.apiSvc.hide();
          this.navCtrl.navigateForward('/goal');
        }
      }, 3000);
    }

  }


  async goNext() {
    // console.log('goNext', await this.eventsSvc.getsetedAe());
    if (await this.eventsSvc.getActiveEvent().preps) {
      console.log('is', this.eventsSvc.getActiveEvent().preps);
      this.apiSvc.hide();
      this.prepSvc.initialization();
      this.navCtrl.navigateRoot('/tab-root');
    } else {
      console.log('no', this.eventsSvc.getActiveEvent().preps);
      setTimeout(() => {
        this.goNext();
      }, 1000);
    }
  }

  allowEventList() {
    if (this.apiSvc.getallowEventList()) {
      this.isLoading = true;
    } else {
      setTimeout(() => {
        this.allowEventList();
      }, 1000);
    }
  }

}
