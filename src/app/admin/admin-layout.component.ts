import { Component, OnInit, ViewChild, HostListener, ViewChildren, QueryList } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { Router, NavigationEnd } from '@angular/router';
import { PerfectScrollbarDirective, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AppSettings } from 'app/app.settings';
import { Settings } from 'app/app.settings.model';
import { MenuService } from 'app/theme/components/menu/menu.service';
import { AuthService } from 'app/auth/auth.service';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ChangeCourseDialogComponent } from 'app-shared-components/change-course-dialog/change-course-dialog.component';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import * as globalFunctions from 'app/global/globalFunctions';

@Component({
  selector: 'app-pages',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  providers: [ MenuService ]
})
export class AdminLayoutComponent implements OnInit {

  @ViewChild('sideNavContainer', { static: true }) private _sideNavContainer;

  @ViewChild('sidenav') sidenav:any;
  @ViewChild('backToTop') backToTop:any;  
  @ViewChildren(PerfectScrollbarDirective) pss: QueryList<PerfectScrollbarDirective>;

  public settings:Settings;
  public menus = ['vertical', 'horizontal'];
  public menuOption:string;
  public menuTypes = ['default', 'compact', 'mini'];
  public menuTypeOption:string;
  public isStickyMenu:boolean = false;
  public lastScrollTop:number = 0;
  public showBackToTop:boolean = false;
  public toggleSearchBar:boolean = false;
  private defaultMenu:string; //declared for return default menu when window resized 
  public scrolledContent:any;
  public helpline:string;
  public multiUsers = [];
  public showMultiUser:boolean = false;
  public academicYearList = [];
  public showAcademicYear:boolean = false;
  public userTypeId:number;

  rowsPerPageArray = [5, 10, 15, 20];
  academicYear = new UntypedFormControl();

  public showAtktChange:boolean = false;

  constructor(
    public dialog: MatDialog,     
    public appSettings:AppSettings, 
    public router:Router, 
    private allEventEmitters: AllEventEmitters,
    private authService: AuthService,     
    private menuService: MenuService
   ) {

    this.settings = this.appSettings.settings;
    this.helpline = globalFunctions.getUserProf('helpline');    
    this.multiUsers = globalFunctions.getUserProf('multiUsers');
    this.academicYearList = globalFunctions.getUserProf('academicYearList');
    this.userTypeId = globalFunctions.getUserProf('userTypeId');

    this.authService.setThemeColor();

    this.showMultiUser = false;
    if (this.multiUsers.length > 1) {
      this.showMultiUser = true;
    }

    this.showAcademicYear = false;
    if (this.academicYearList.length > 1) {
      this.showAcademicYear = true;
    }

    allEventEmitters.setMatSidenavContentSize.subscribe(
      (flag:boolean) => {
        if (flag) {
          this.setMatSidenavContentSize();
        }
      }
    );
  }
  
  ngOnInit() {

    this.allEventEmitters.showAtktChange.subscribe(
      (flag:boolean) => {
        this.showAtktChange = flag;
      }
    );
    
    if(window.innerWidth <= 768){
      this.settings.menu = 'vertical';
      this.settings.sidenavIsOpened = false;
      this.settings.sidenavIsPinned = false;
    }
    this.menuOption = this.settings.menu; 
    this.menuTypeOption = this.settings.menuType; 
    this.defaultMenu = this.settings.menu;

    this.academicYear.setValue(globalFunctions.getUserProf('filterAcademicYearId'));
  }

  ngAfterViewInit() {

    if (this.router.url != '/pendingFees') {
      setTimeout(() => { this.settings.loadingSpinner = false }, 300);
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) { 
        if(!this.settings.sidenavIsPinned){
          this.sidenav.close(); 
        }      
        if(window.innerWidth <= 768){
          this.sidenav.close(); 
        } 
      }                
    });
    if(this.settings.menu == "vertical") {
      this.menuService.expandActiveSubMenu(this.menuService.getVerticalMenuItems());
    }
  }

  public changeTheme(theme) {
    this.settings.theme = theme;
  }

  public chooseMenu() {
    this.settings.menu = this.menuOption;
    this.defaultMenu = this.menuOption;    
    this.router.navigate(['/']); 
  }

  public chooseMenuType(){
    this.settings.menuType = this.menuTypeOption;
  }

  public toggleSidenav(){
    this.sidenav.toggle();
  }

  public onPsScrollY(event) {
    (event.target.scrollTop > 300) ? this.backToTop.nativeElement.style.display = 'flex' : this.backToTop.nativeElement.style.display = 'none';
    if (this.settings.menu == 'horizontal') {
      if (this.settings.fixedHeader) {
        var currentScrollTop = (event.target.scrollTop > 56) ? event.target.scrollTop : 0;   
        (currentScrollTop > this.lastScrollTop) ? this.isStickyMenu = true : this.isStickyMenu = false;
        this.lastScrollTop = currentScrollTop; 
      } else {
        (event.target.scrollTop > 56) ? this.isStickyMenu = true : this.isStickyMenu = false;  
      }
    }
  }

  public scrollToTop() {
    this.pss.forEach(ps => {
      if(ps.elementRef.nativeElement.id == 'main' || ps.elementRef.nativeElement.id == 'main-content'){
        ps.scrollToTop(0,250);
      }
    });
  }
  
  @HostListener('window:resize')
  public onWindowResize():void {
    if(window.innerWidth <= 768){
      this.settings.sidenavIsOpened = false;
      this.settings.sidenavIsPinned = false;
      this.settings.menu = 'vertical'
    }
    else{
      (this.defaultMenu == 'horizontal') ? this.settings.menu = 'horizontal' : this.settings.menu = 'vertical'
      this.settings.sidenavIsOpened = true;
      this.settings.sidenavIsPinned = true;
    }
  }

  public closeSubMenus(){
    let menu = document.querySelector(".sidenav-menu-outer");
    if(menu){
      for (let i = 0; i < menu.children[0].children.length; i++) {
        let child = menu.children[0].children[i];
        if(child){
          if(child.children[0].classList.contains('expanded')){
              child.children[0].classList.remove('expanded');
              child.children[1].classList.remove('show');
          }
        }
      }
    }
  }

  public setMatSidenavContentSize() {
    setTimeout(() => {
      this._sideNavContainer._updateContentMargins();
      this._sideNavContainer._changeDetectorRef.markForCheck();
    }, 1);
  }

  changeOfRoutes() {
    let menusParsed = globalFunctions.getMenus();
    let index = menusParsed.findIndex(x => x.routerLink == this.router.url);
    if (this.router.url != '/settings' && this.router.url != '/profile' && this.router.url != '/afterLoginPage' && this.router.url != '/cart' && this.router.url != '/openCart') {
      if (index < 0) {
        // this.router.navigate(['/no-access']);
      }
    }
  }

  changeAcademicYear(academicYearId) {
    globalFunctions.setUserProf('filterAcademicYearId', academicYearId);
    window.location.reload();
  }

  openChangecourse() {
    let dialogRef = this.dialog.open(ChangeCourseDialogComponent, {
      height: 'auto',
      width: '500px',
      autoFocus: false
    });

    dialogRef.componentInstance.modalTitle = 'Change Course';
    dialogRef.componentInstance.dialogRef  = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'loadPage') {
        location.reload();
      }
    });
  }  

}