import { Injectable } from '@angular/core';
import { Prep } from '../models/prep';
import { EventsService } from '../services/events.service';
import { AuthService } from '../services/auth.service';
import { News } from '../models/news';
import { DatePipe } from '@angular/common'
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { environment } from 'src/environments/environment';
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class PrepService {

  fromPreps: boolean;
  selectedPreps: Array<Prep> = [];
  completedPreps: any = [];
  userPrepsHistory: Array<Prep>;
  totalPreps: number;
  news: any = [];
  today: number = Date.now();
  quotesCounter = 0;
  sponsorCounter = 0;
  selectedSponsor: any;
  selectedQuote: string;
  sponsors: any;


  constructor(
    private eventSvc: EventsService,
    private authSvc: AuthService,
    public datepipe: DatePipe,
    private apiSvc: ApiService,
    private notiSvc: NotificationService,
  ) {
    this.initialization();
  }

  initialization() {
    this.fromPreps = false;
    this.selectedPreps = [];
    if (this.eventSvc.getActiveEvent()) {

      this.eventSvc.getActiveEvent().preps.forEach((prep: any) => {
        if (prep.isComplete == true) {
          this.selectedPreps.push(prep);
        }
      });
      // console.log('here is prep.service');
      this.completedPreps = [];
      // this.completedPreps = this.apiSvc.getCompletedPreps();
      this.completedPreps = this.eventSvc.getActiveCompletedPreps(); // get completed preps of current event
      console.log(this.completedPreps);
      // if (!this.completedPreps) {
      //   this.completedPreps = [];
      // }
      this.sponsors = this.eventSvc.getActiveEvent().sponsors;
    }
  }

  addToComplete(prep: Prep, completedPreps) {
    this.completedPreps.push(prep);
    this.eventSvc.setActiveCompletedPreps(prep);
    this.publishNews(prep, completedPreps);
  }

  getCompletePrepsCount() {
    // console.log("-------------completedPreps-------------");
    // console.log(this.completedPreps);
    return this.completedPreps.length;
  }

  setTotalPreps(totalPreps: number) {
    this.totalPreps = totalPreps;
  }

  getTotoalPreps() {
    return this.totalPreps;
  }

  /////////////////////////////////////////////
  // quote
  setSelectedQuote(selectedQuote: string) {
    this.selectedQuote = selectedQuote;
  }

  getsponsorLogo() {
    this.quotesCounter += 1;
    if (this.sponsors.length == 0) {
      return this.selectedSponsor.logo;
    }
  }

  getsponsorQuote() {
    return this.selectedQuote;
  }

  getSponsor() {
    let targetSponsor = {
      logo: '',
      quote: ''
    };
    if (this.sponsors.length == 0) {
      targetSponsor.logo = '';
      targetSponsor.quote = '';
      return targetSponsor;
    } else if (this.sponsors.length == 1) {
      console.log('s1: ', this.sponsorCounter + '|' + this.quotesCounter);
      targetSponsor.logo = this.sponsors[0].logo;
      if (this.sponsors[0].sponsorquotes.length == 1) {
        // this.quotesCounter == 0
        targetSponsor.quote = this.sponsors[0].sponsorquotes[this.quotesCounter].quote;
      } else {
        // this.quotesCounter >= 0
        targetSponsor.quote = this.sponsors[0].sponsorquotes[this.quotesCounter].quote;
        this.quotesCounter += 1;
        if (this.quotesCounter == this.sponsors[0].sponsorquotes.length) {
          this.quotesCounter = 0;
          // this.sponsorCounter += 1;
        }
      }
      return targetSponsor;
    } else {
      console.log('s2+: ', this.sponsorCounter + '|' + this.quotesCounter);
      targetSponsor.logo = this.sponsors[this.sponsorCounter].logo;
      if (this.sponsors[0].sponsorquotes.length == 1) {
        // this.quotesCounter == 0
        targetSponsor.quote = this.sponsors[this.sponsorCounter].sponsorquotes[this.quotesCounter].quote;
      } else {
        // this.quotesCounter >= 0
        targetSponsor.quote = this.sponsors[this.sponsorCounter].sponsorquotes[this.quotesCounter].quote;
        this.quotesCounter += 1;
        if (this.quotesCounter == this.sponsors[this.sponsorCounter].sponsorquotes.length) {
          this.quotesCounter = 0;
          this.sponsorCounter += 1;
          if (this.sponsorCounter == this.sponsors.length) {
            this.sponsorCounter = 0;
          }
        }
      }
      return targetSponsor;
    }
  }
  /////////////////////////////////////////////////

  getSelectedPrepCount() {
    return this.selectedPreps.length;
  }

  setSelectedPreps(preps: Array<Prep>) {
    this.selectedPreps = preps;
  }

  getSelectedPreps(): Array<Prep> {
    return this.selectedPreps;
  }

  setFromPreps(isFrom: boolean) {
    this.fromPreps = isFrom;
  }

  addPrepBack(prep: Prep) {
    const event = this.eventSvc.getActiveEvent();
    event.preps.push(prep);
    event.preps.sort((a: Prep, b: Prep) => {
      return a.number - b.number;
    });
  }

  addPrep(completeprep) {
    const userId = this.authSvc.getUser().userId;
    const eventId = this.eventSvc.getActiveEvent().eventId;
    const prep: any = {
      title: '',
      eventId,
      prepcreatedAt: '',
      prepupdatedAt: '',
      createdAt: '',
      updatedAt: ''
    };
    prep.title = completeprep.prepId;
    prep.eventId = eventId;
    prep.prepcreatedAt = completeprep.createdAt.replace(/T/, ' ').replace(/\..+/, '');;
    prep.prepupdatedAt = completeprep.updatedAt.replace(/T/, ' ').replace(/\..+/, '');;
    this.apiSvc.addPrepHistory(userId, prep).subscribe();
  }

  publishNews(prep, completePreps) {
    console.log('publish news', completePreps);
    const event = this.eventSvc.getActiveEvent();
    const time = new Date();
    this.news.time = this.today.toString();
    const username = this.authSvc.getUser().firstname + ' ' + this.authSvc.getUser().lastname;
    this.news.title = username;
    // if(this.authSvc.getUser().image){
    //   this.news.image = this.authSvc.getUser().image.replace(environment.baseUrl, '');
    // }else {
    //   this.news.image = '';
    // }
    this.news.image = this.authSvc.getUser().userId;
    this.news.eventId = event.eventId;
    this.news.createdAt = '';
    this.news.updatedAt = '';
    if (completePreps == 1) {
      this.news.description = username + ' is warming up';
      this.apiSvc.addNews(this.news).subscribe(async res => {
        console.log(res);
        this.displayNews();
        //  await this.notiSvc.sendNotification(this.news);
      });
    } else if (completePreps == 3) {
      this.news.description = username + ' is getting serious';
      this.apiSvc.addNews(this.news).subscribe(async res => {
        console.log(res);
        this.displayNews();
        // await this.notiSvc.sendNotification(this.news);
      });
    } else if (completePreps == 5) {
      this.news.description = username + ' is leveling up';
      this.apiSvc.addNews(this.news).subscribe(async res => {
        console.log(res);
        this.displayNews();
        // await this.notiSvc.sendNotification(this.news);
      });
    } else if (completePreps == 10) {
      this.news.description = username + ' is crushing it!';
      this.apiSvc.addNews(this.news).subscribe(async res => {
        console.log(res);
        this.displayNews();
        // await this.notiSvc.sendNotification(this.news);
      });
    }
  }

  displayNews() {
    const event = this.eventSvc.getActiveEvent();
    this.apiSvc.getNews(this.news.eventId).subscribe(
      data => {
        event.news = [];
        this.news = data.body;
        event.news = this.news;
        this.eventSvc.setActiveEvent(event);
      }
    );
  }
}
