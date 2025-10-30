import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Menu } from './menu.model';
import { navItems } from './menu';

import * as globalFunctions from 'app/global/globalFunctions';
import { AllEventEmitters } from 'app/global/all-event-emitters';

@Injectable()
export class MenuService {

  public userTypeId: number;
  formType: string = '';
  formPolicyIdCheck: number = 0;

  constructor(
    private location:Location,
    private router:Router,
    private allEventEmitters: AllEventEmitters    
  ) { } 

  public getVerticalMenuItems():Array<any> {

    let userProf = globalFunctions.getUserProf();
    this.userTypeId = userProf.userTypeId;

    if (this.userTypeId == 5) {
      return this.getAdmissionMenuItems();
      
    } else {
      return globalFunctions.getMenus();
    }

    // return navItems;
  }

  public getAdmissionMenuItems():Array<Menu> {

    this.formType = globalFunctions.getUserProf('formType');
    let showPaymentHistory = globalFunctions.getUserProf('showPaymentHistory');
    let showDownloadForms = globalFunctions.getUserProf('showDownloadForms');
    let documentsUpload = globalFunctions.getUserProf('documentsUpload');
    let courseSelection = globalFunctions.getUserProf('courseSelection');
    let optPayment = globalFunctions.getUserProf('optPayment');
    let showFormB = globalFunctions.getUserProf('showFormB');
    let showScheduleInterview = globalFunctions.getUserProf('showScheduleInterview');
    let formPolicyId = 0;
    let courseSelctionLable = 'Course Selection';
    if (!globalFunctions.isEmpty(globalFunctions.getUserProf('formPolicyId'))) {
      formPolicyId = globalFunctions.getUserProf('formPolicyId');
      if(formPolicyId == 237){
        courseSelctionLable = 'Membership Selection';
      }else if(formPolicyId == 429 || formPolicyId == 434){
        courseSelctionLable = 'Mode';
      }
    }
    let menus = [];

    if (this.formType == 'atkt') {
      setTimeout(() => { this.allEventEmitters.showAtktChange.emit(true); }, 1);
      menus.push(
        new Menu (3, 'ATKT Form', '/atktForm', null, 'assignment ind', null, null, false, 0)
      );
    } else if (this.formType == 'preReg') {
      menus.push(
        new Menu (1, 'Admission Form', '/admissionForm', null, 'assignment ind', null, null, false, 0)
      );
    } else if (this.formType == 'exam') {
      menus.push(
        new Menu (1, 'Exam Form', '/examForm', null, 'assignment ind', null, null, false, 0)
      );
    }

    if (this.formType != 'preReg' && this.formType != 'atkt' && this.formType != 'exam') {
      menus.push(
        new Menu (1, 'Application Form', '/admissionForm', null, 'assignment ind', null, null, false, 0)
      );
    }

    if (showFormB) {
      menus.push(
        new Menu (1, 'Form B', '/admissionFormB', null, 'assignment ind', null, null, false, 0)
      );
    }

    if (documentsUpload) {
      menus.push(
        new Menu (2, 'Upload Documents', '/uploadDocuments', null, 'touch_app', null, null, false, 0)
      );
    }

    if (courseSelection) {
      menus.push(
        new Menu (2, courseSelctionLable, '/courseSelection', null, 'touch_app', null, null, false, 0)
      );
    }

    // if (this.formType != 'preReg' && this.formType != 'atkt') {
    if (optPayment && this.formType != 'preReg') {
      menus.push(
        new Menu (4, 'Payment Summary', '/cart', null, 'description', null, null, false, 0)
      );
    }

    if (showScheduleInterview) {
      menus.push(
        new Menu (7, 'Schedule Interview', '/scheduleInterview', null, 'description', null, null, false, 0)
      );
    }

    if (showPaymentHistory) {
      menus.push(
        new Menu (5, 'Payment History', '/paymentHistory', null, 'format_list_bulleted', null, null, false, 0)
      ); 
    }

    if (showDownloadForms) {
      menus.push(
        new Menu (6, 'Download Forms', '/downloadForms', null, 'assignment_returned', null, null, false, 0)
      );
    }

    return menus;
  }

  public getHorizontalMenuItems():Array<any> {

    return globalFunctions.getMenus();
    // return navItems;
  }

  public expandActiveSubMenu(menu:Array<Menu>){
    let url = this.location.path();
    let routerLink = url; // url.substring(1, url.length);
    let activeMenuItem = menu.filter(item => item.routerLink === routerLink);
    if(activeMenuItem[0]){
      let menuItem = activeMenuItem[0];
      while (menuItem.parentId != 0){  
        let parentMenuItem = menu.filter(item => item.menuId == menuItem.parentId)[0];
        menuItem = parentMenuItem;
        this.toggleMenuItem(menuItem.menuId);
      }
    }
  }

  public toggleMenuItem(menuId){
    let menuItem = document.getElementById('menu-item-'+menuId);
    let subMenu = document.getElementById('sub-menu-'+menuId);  
    if (subMenu) {
      if (subMenu.classList.contains('show')) {
        subMenu.classList.remove('show');
        menuItem.classList.remove('expanded');
      } else {
        subMenu.classList.add('show');
        menuItem.classList.add('expanded');
      }      
    }
  }

  public closeOtherSubMenus(menu:Array<Menu>, menuId){
    let currentMenuItem = menu.filter(item => item.menuId == menuId)[0]; 
    if(currentMenuItem.parentId == 0 && !currentMenuItem.target){
      menu.forEach(item => {
        if(item.menuId != menuId){
          let subMenu = document.getElementById('sub-menu-'+item.menuId);
          let menuItem = document.getElementById('menu-item-'+item.menuId);
          if(subMenu){
            if(subMenu.classList.contains('show')){
              subMenu.classList.remove('show');
              menuItem.classList.remove('expanded');
            }              
          } 
        }
      });
    }
  }

}
