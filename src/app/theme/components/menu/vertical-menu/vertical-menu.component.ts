import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppSettings } from 'app/app.settings';
import { Settings } from 'app/app.settings.model';
import { MenuService } from '../menu.service';

import * as globalFunctions from 'app/global/globalFunctions';

@Component({
  selector: 'app-vertical-menu',
  templateUrl: './vertical-menu.component.html',
  styleUrls: ['./vertical-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ MenuService ]
})
export class VerticalMenuComponent implements OnInit {
  @Input('menuItems') menuItems;
  @Input('menuParentId') menuParentId;
  parentMenu:Array<any>;
  public settings: Settings;

  navItems = [];

  public userTypeId: number;

  constructor(
    public appSettings:AppSettings, 
    public menuService:MenuService, 
    public router:Router
  ) { 
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {

    let userProf = globalFunctions.getUserProf();
    this.userTypeId = userProf.userTypeId;

    this.parentMenu = this.menuItems.filter(item => item.parentId == this.menuParentId);  
    // this.navItems = this.menuService.getVerticalMenuItems();

    if (this.userTypeId == 5) {
      this.parentMenu.forEach(item => {
        if (item.routerLink == '/paymentHistory' || item.routerLink == '/cart') {
          if (userProf.optPayment == false) {
            item.show = false;
          }
        }
      });
    }
  }

  ngAfterViewInit(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if(this.settings.fixedHeader){
          let mainContent = document.getElementById('main-content');
          if(mainContent){
            mainContent.scrollTop = 0;
          }
        }
        else{
          // document.getElementsByClassName('mat-drawer-content')[0].scrollTop = 0;
        }
      }                
    });
  }

  onClick(menuId){
    this.menuService.toggleMenuItem(menuId);
    this.menuService.closeOtherSubMenus(this.menuItems, menuId);    
  }

}
