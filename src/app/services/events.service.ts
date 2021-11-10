import { Injectable } from '@angular/core';
import { SeamxEvent } from '../models/seamxevent';
import { AppEventsService } from '../services/app-events.service';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Sponsor } from '../models/sponsor';
import { Prep } from '../models/prep';
import { NotificationService } from './notification.service';
import { orderBy, uniqBy } from 'lodash';
import { PrepService } from '../services/prep.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  public events: Array<SeamxEvent>;
  public activeEvent: SeamxEvent;
  public activeSponsor: Sponsor;
  public setedAe = false;

  news: any = [];
  today: number = Date.now();
  activeCompletedPreps: any;

  constructor(
    private apiSvc: ApiService,
    private authSvc: AuthService,
    private appEvents: AppEventsService,
    private notiSvc: NotificationService,
  ) {
    this.events = [];
  }

  public setEventNews(eventId: any, news: any) {
    this.events.forEach((e: any) => {
      if (e.eventId === eventId) {
        var tmp_readlist = [];
        var tmp_unreadlist = [];

        news.forEach(item => {
          if (item.isread == 'isread') {
            tmp_readlist.push(item);
          } else {
            tmp_unreadlist.push(item);
          }

        });

        tmp_readlist = orderBy(tmp_readlist, 'time', 'desc');
        tmp_unreadlist = orderBy(tmp_unreadlist, 'time', 'desc');


        tmp_unreadlist = tmp_unreadlist.concat(tmp_readlist);


        e.news = tmp_unreadlist;
        console.log(e);
      }
    });
  }

  async refreshEvents() {
    setTimeout(() => {
      const prepsIdsArr = this.apiSvc.preps;
      console.log('prepsIdsArr', prepsIdsArr);
      this.events.forEach((event: any) => {
        event.preps = [];
        prepsIdsArr.forEach((pid: any, pi: number, array) => {
          this.apiSvc.getPreps(pid).subscribe(async (p: any) => {
            event.preps.push(p.body[0]);
          });
          if (pi == (array.length - 1) && event.eventId == this.getActiveEvent().eventId) {
            console.log('event', event);
            this.setActiveEvent(event);
          }
        });
      });
    }, 1000);
  }

  public getEvents(): Array<SeamxEvent> {
    return this.events;
  }

  public setEvents(events: Array<SeamxEvent>) {
    this.events = events;
  }

  public setActiveEvent(event: SeamxEvent) {
    this.activeEvent = event;
    console.log('eventsvc: ', this.activeEvent);
    console.log('eventsvc: ', this.activeEvent.preps);
    this.activeCompletedPreps = [];
    if (this.activeEvent.preps) {
      if (this.activeEvent.preps.length > 0) {
        this.activeEvent.preps.forEach((prep: Prep, i: number, array) => {
          if (prep.isComplete == true) {
            this.activeCompletedPreps.push(prep);
          }
        });
      }
    }
  }

  // public setsetedAe(f) {
  //   this.setedAe = f;
  // }
  // public getsetedAe() {
  //   return this.setedAe;
  // }
  public getActiveEvent() {
    return this.activeEvent;
  }

  public setActiveCompletedPreps(prep: any) {
    this.activeEvent.preps.forEach((p, i: number) => {
      if (p.prepId == prep.prepId) {
        p.isComplete = true;
      }
      if (i == this.activeEvent.preps.length - 1) {
        this.events.forEach((e) => {
          if (e.eventId == this.getActiveEvent().eventId) {
            e.preps = this.activeEvent.preps;
          }
        })
      }
    });
  }

  public getActiveCompletedPreps() {
    return this.activeCompletedPreps;
  }

  public getEventByIndex(index: number): SeamxEvent {
    this.setActiveEvent(this.events[index]);
    return this.events[index];
  }

  setActiveSponsor(sponsor: Sponsor) {
    this.activeSponsor = sponsor;
  }

  getActiveSponsor(): Sponsor {
    return this.activeSponsor;
  }

  public fetchEvents(eventIds: Array<string>) {
    return new Promise<any>((resolve, reject) => {
      this.apiSvc.getEvents(eventIds).then((events: Array<SeamxEvent>) => {
        console.log('Got events: ', events);
        this.events = events;

        // console.log(this.events.length);
        if (this.events.length > 0) {
          this.activeEvent = this.events[0];
          setTimeout(() => {
            this.events.forEach(async (event: SeamxEvent) => {
              // console.log(event);
              const nowSec = new Date().getTime() / 1000;
              const enddate = new Date(event.endDate).getTime() / 1000; // get enddate
              if (nowSec >= enddate) {
                event.daysLeft = 'Completed';
                event.hoursLeft = '';
                event.isComplete = true;

              } else {
                const hours = this.getHours(nowSec, enddate);
                event.daysLeft = Math.floor(hours / 24);
                if (0 < (hours % 24) && (hours % 24) < 10) {
                  event.hoursLeft = '0' + hours % 24;
                } else {
                  event.hoursLeft = hours % 24;
                }
                event.isComplete = false;
              }
              // await event.races.forEach((race: any) => {
              //   race.displayDate = new Date(race.createdAt);
              // });
              this.sendLeftDaysNews(nowSec, enddate, event.eventId);
            });

          }, 3000);
        }

        this.appEvents.publish('events:available');
        resolve(events);
      });
    });
  }

  getHours(nowSecs, dateSecs) {
    const diffSec = dateSecs - nowSecs;
    const hours = diffSec / (60 * 60);
    return Math.abs(Math.round(hours));
  }
  sendLeftDaysNews(nowSec, enddate, eventId) {
    const differenceSeconds = enddate - nowSec; // total diffentce seconds
    const daysByTen = Math.floor(differenceSeconds / 864000);
    // last one day left
    if (daysByTen === 0) {
      const modDaysSecs = differenceSeconds % 86400;
      if (modDaysSecs <= 59 && modDaysSecs >= 57) {
        const newstitle = 'Tomorrow`s the big day. You can find all information on the event page.';
        this.saveLeftDaysNews(newstitle, eventId);
      }
    }
    // every 10 days left
    if (daysByTen >= 1) {
      const modDaysSecs = differenceSeconds % 864000;
      if (modDaysSecs <= 59 && modDaysSecs >= 57) {
        const newstitle = daysByTen * 10 + ' days left for the event!';
        this.saveLeftDaysNews(newstitle, eventId);
      }
    }
  }
  saveLeftDaysNews(newstitle, eventId) {
    this.news.time = this.today;
    this.news.title = this.authSvc.getUser().firstname + ' ' + this.authSvc.getUser().lastname;
    this.news.image = this.authSvc.getUser().image;
    this.news.eventId = eventId;
    this.news.createdAt = '';
    this.news.updatedAt = '';
    this.news.description = newstitle;
    // store the news data to DB
    this.apiSvc.addNews(this.news).subscribe(res => {
      console.log(res);
    });
    // this.notiSvc.sendNotification(this.news);
  }
}

