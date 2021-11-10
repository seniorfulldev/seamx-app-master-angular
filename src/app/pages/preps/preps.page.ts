import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { PrepService } from '../../services/prep.service';
import { EventsService } from '../../services/events.service';
import { Prep } from 'src/app/models/prep';
import { CongratsPage } from '../../pages/congrats/congrats.page';

@Component({
  selector: 'app-preps',
  templateUrl: './preps.page.html',
  styleUrls: ['./preps.page.scss'],
})
export class PrepsPage implements OnInit {

  userPreps: Array<Prep>;
  daysLeft: number;
  percentCompleted: number;
  totalPreps: number;
  completePreps: number;
  eventName: string;


  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    private prepSvc: PrepService,
    private eventSvc: EventsService
  ) {
    this.completePreps = 0;
    this.percentCompleted = 0;
  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.eventName = this.eventSvc.getActiveEvent().name;
    this.daysLeft = this.eventSvc.getActiveEvent().daysLeft;
    this.userPreps = this.prepSvc.getSelectedPreps();
    this.totalPreps = this.userPreps.length;
    this.completePreps = this.prepSvc.getCompletePrepsCount();
    // console.log('eventName: ', this.eventName);
    // console.log('userpreps: ', this.userPreps);
    console.log('completePreps: ', this.completePreps);
    // console.log('totalPreps: ', this.totalPreps);
    if (!this.totalPreps || this.totalPreps == 0) {
      this.percentCompleted = 0;
    } else {
      this.percentCompleted = this.completePreps / this.totalPreps;
    }
  }

  addNewPreps() {
    this.prepSvc.setFromPreps(true);
    this.navCtrl.navigateRoot('/prep-start');
  }

  removePrep(prep: Prep) {
    this.userPreps.splice(this.userPreps.indexOf(prep), 1);
    this.totalPreps = this.userPreps.length;
    this.completePreps = this.prepSvc.getCompletePrepsCount();
    this.percentCompleted = this.completePreps / this.totalPreps;
    this.prepSvc.addPrepBack(prep);
  }
  completePrep(prep: Prep) {
    prep.isComplete = true;
    this.completePreps = this.prepSvc.getCompletePrepsCount() + 1;
    this.prepSvc.addToComplete(prep, this.completePreps);
    this.percentCompleted = this.completePreps / this.totalPreps;
    this.prepSvc.addPrep(prep);
    this.presentModal(prep.prepId);
  }

  async presentModal(prepId) {
    const modal = await this.modalCtrl.create({
      component: CongratsPage,
      componentProps: {
        'data': {
          eventName: this.eventName,
          daysLeft: this.daysLeft,
          completePreps: this.completePreps,
          totalPreps: this.totalPreps,
          prepId: prepId
        }
      }

    });
    return await modal.present();
  }

}
