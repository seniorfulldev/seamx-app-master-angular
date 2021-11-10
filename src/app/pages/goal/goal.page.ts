import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { EventsService } from 'src/app/services/events.service';
import {Storage} from "@ionic/storage";

@Component({
  selector: 'app-goal',
  templateUrl: './goal.page.html',
  styleUrls: ['./goal.page.scss'],
})
export class GoalPage implements OnInit {

  // personas = [
  //   'Challenge yourself or compete',
  //   'Be social and have fun',
  //   'Improve your fitness and well-being',
  //   'Not really sure',
  // ]
  personas: any = [];

  user: any;

  constructor(
    private authSvc: AuthService,
    private apiSvc: ApiService,
    private eventsSvc: EventsService,
    public navCtrl: NavController,
    private storage: Storage
  ) {

    this.user = this.authSvc.getUser();
    // if (this.user.personas) {
    //   this.navCtrl.navigateRoot('/tab-root');
    // } else {
    // const profile = this.user.profile;
    this.apiSvc.getAllPersonas().subscribe((personas: any) => {
      this.personas = personas.body;
      console.log(this.personas);
    })
    // this.apiSvc.getAllPersonas().subscribe( (personas: any) => {
    //   personas.body.forEach(p => {
    //     const target = p.target;
    //     switch (target) {
    //       case 'Any':
    //         this.personas.push(p);
    //         break;
    //         case 'Gender':
    //           if(p.gender == profile.gender) {
    //             this.personas.push(p);
    //         }
    //         break;
    //       case 'Age':
    //         const fromAge = p.fromAge;
    //         const toAge = p.toAge;
    //         // calculate age
    //         const bdate = new Date(profile.dateOfBirth);
    //         let timeDiff = Math.abs(Date.now() - bdate.getTime());
    //         let userAge = Math.floor((timeDiff / (1000 * 3600 * 24))/365.25);
    //         if( fromAge <= userAge && userAge <= toAge) {
    //           this.personas.push(p);
    //         }
    //         break;
    //       case 'Location':
    //         console.log(p.location);
    //         console.log(profile.city);
    //         break;
    //       default:
    //     }
    //   })
    // })
    // }
  }

  ionViewDidEnter() { }

  ngOnInit() { }

  addPersona(persona) {
    const personas: any = {
      userId: this.user.userId,
      personaId: persona.personaId,
      personaFullname: this.user.firstname + ' ' + this.user.lastname,
      personaEmail: this.user.emailAddress,
      createdAt: '',
      updatedAt: ''
    };
    this.apiSvc.addPersonaToHIstory(personas).subscribe((res: any) => {
      this.apiSvc.setPreps(persona.personaId, false);
      this.eventsSvc.refreshEvents();

      this.user.personas = {'personaId':persona.personaId};
      this.authSvc.setUser(this.user);
      this.storage.set('user', this.user).then(() => {
        console.log('persona saved.');
      });
    });
    setTimeout(() => {
      // this.apiSvc.hide();
      // setTimeout(() => {
      this.navCtrl.navigateRoot('/camera');
      // }, 100);
    }, 1000);
  }

}
