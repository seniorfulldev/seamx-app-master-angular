import { Component, OnInit, Input } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { EventsService } from '../../services/events.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-invite-friend',
  templateUrl: './invite-friend.page.html',
  styleUrls: ['./invite-friend.page.scss'],
})
export class InviteFriendPage implements OnInit {

  // showMore: boolean;
  isFromProfile: boolean;
  inEmail0: string;
  inEmail1: string;
  inEmail2: string;
  inEmail3: string;
  inEmail4: string;
  isSending: boolean = false;
  emailId: number;
  // @Input()
  // static inEmail: string;

  constructor(
    private profileSvc: ProfileService,  
    public navCtrl: NavController,  
    public authSvc: AuthService,  
    public apiSvc: ApiService,
    private eventsSvc: EventsService,
    // private translate: TranslateService
    ) { 
    // this.showMore = false;
  }

  ngOnInit() {
    this.emailId = 0;
    // this.showMore = false;
    this.isFromProfile = this.profileSvc.getFromProfile();
  }

  ionViewDidEnter(){
    // this.showMore = false;
    this.isFromProfile = this.profileSvc.getFromProfile();
  }

  sendInvites() { 
    let userName = this.authSvc.user.firstname + ' ' + this.authSvc.user.lastname;
    let eventId = this.eventsSvc.getActiveEvent().eventId;
    let eventName = this.eventsSvc.getActiveEvent().name;
    let sendEmails = '';
    let emails = [
      this.inEmail0,
      this.inEmail1,
      this.inEmail2,
      this.inEmail3,
      this.inEmail4,
    ]
    emails.forEach(e => {
      if (e) {
        if (sendEmails) {
          sendEmails = sendEmails + ',' + e;
        } else {
          sendEmails = e
        }
      }
    });
    console.log(sendEmails);
    // console.log(
    //   'eventIds: '+userName + '  ' +
    //   'eventIds: '+eventId + '  ' +
    //   'eventIds: '+eventName + '  ' +
    //   'emails; '+ emails);
      this.isSending = true;
    this.apiSvc.sendInvitation(userName, eventId, eventName, sendEmails).subscribe(
      data => {
        console.log(data.body);
        console.log('Sent Invitation to your friend Successfully');
      });
    setTimeout(() => {
      this.isSending = false;
      if(this.isFromProfile){
        this.navCtrl.navigateRoot('/tab-root/tabs/profile'); 
      } else {
        console.log('going to allset page.');
        this.navCtrl.navigateForward('/allset');
      }
    }, 2000);
  }

  getEmail0(e: any) {
    this.inEmail0 = e.target.value;
  }
  getEmail1(e: any) {
    this.inEmail1 = e.target.value;
  }
  getEmail2(e: any) {
    this.inEmail2 = e.target.value;
  }
  getEmail3(e: any) {
    this.inEmail3 = e.target.value;
  }
  getEmail4(e: any) {
    this.inEmail4 = e.target.value;
  }

  public addMore(){
    this.emailId += 1;
    if (this.emailId < 5) {
      let nextInputTag = document.getElementById('email-id-' + this.emailId).parentElement;
      nextInputTag.className = nextInputTag.className.replace('hide ', '');
      console.log(nextInputTag.className);
    }
  }

  // public addMore(){
    // this.showMore = true;
  //   let lastInputTag = document.getElementById('email-id-' + this.emailId);
  //   if (this.emailId < 4) {
  //     let row = document.createElement('ion-row');
  //     row.className = 'ion-justify-content-center';
  //     row.style.margin = '3% auto';
  //     row.style.width = '90vw';
      
  //     this.emailId += 1;
  //     let input = document.createElement('ion-input');
  //     input.id = 'email-id-' + this.emailId;
  //     input.type = 'email';
  //     input.style.border = '1px solid #DFDFDF';
  //     input.style.borderRadius = '10px';
  //     input.style.textTransform = 'none';
  //     input.style.color = ' #030952';
  //     input.style.fontSize = '1.5rem';
  //     input.style.height = '4rem';
  //     let translation = "";
  //     this.translate.get('INVITE-FRIEND.EMAIL').subscribe(cliente =>{
  //         translation = cliente;
  //         console.log(translation);
  //         input.placeholder = translation;
  //     });
  
  //     row.appendChild(input);
  //     document.querySelector('.added_email_box').appendChild(row);
  //   }
  // }

}
