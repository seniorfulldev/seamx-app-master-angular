import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InviteFriendPageRoutingModule } from './invite-friend-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { InviteFriendPage } from './invite-friend.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InviteFriendPageRoutingModule,
    TranslateModule
  ],
  declarations: [InviteFriendPage]
})
export class InviteFriendPageModule {}
