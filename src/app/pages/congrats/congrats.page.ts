import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { EventsService } from 'src/app/services/events.service';
import { Sponsor } from 'src/app/models/sponsor';
import { PrepService } from 'src/app/services/prep.service';

@Component({
  selector: 'app-congrats',
  templateUrl: './congrats.page.html',
  styleUrls: ['./congrats.page.scss'],
})
export class CongratsPage implements OnInit {

  data: any;
  sponsorLogo: string;
  sponsorQuote: string;
  preselectedSponsorId: string;
  selectedQuote: any;

  constructor(
    private prepSvc: PrepService,
    private eventsSvc: EventsService,
    public navParams: NavParams,
    public modalCtrl: ModalController
  ) {

      console.log('navParams: ', this.navParams.data);

      this.data = this.navParams.get('data'); // prepId
      const targetSponsor = this.prepSvc.getSponsor();
      this.sponsorLogo = environment.serverBaseUrl + targetSponsor.logo;
      this.sponsorQuote = targetSponsor.quote;
  }

  ngOnInit() {
    const sponsors = this.eventsSvc.getActiveEvent().sponsors;

  }

  close() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
