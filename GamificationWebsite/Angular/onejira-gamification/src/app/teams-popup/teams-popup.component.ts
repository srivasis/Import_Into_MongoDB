import { Component} from '@angular/core';
import { MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { TeamsPopupDataService } from '../teams-popup-data.service';

@Component({
  selector: 'app-teams-popup',
  templateUrl: './teams-popup.component.html',
  styleUrls: ['./teams-popup.component.css']
})
export class TeamsPopupComponent {
  data = [];
  teamMemberName = '';
  nameForPopup = '';
  constructor(private bottomSheetRef: MatBottomSheetRef<TeamsPopupComponent>, private popupService: TeamsPopupDataService) {
    this.data = popupService.getTeamsForMember();
    this.teamMemberName = popupService.getTeamMemberName();
    this.nameForPopup = this.adjustName();
  }

  adjustName(): string{
    if(this.teamMemberName.includes("-")){
      return this.teamMemberName.split(" - ")[0].split(", ")[1];
    }else if(this.teamMemberName.includes(",")){
      return this.teamMemberName.split(", ")[1];
    }
    return this.teamMemberName;
  }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
