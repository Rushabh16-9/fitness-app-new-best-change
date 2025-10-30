import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NavItem} from '../nav-item';
import { Settings } from 'app/app.settings.model';
import { AppSettings } from 'app/app.settings';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit {
  @Input() items: NavItem[];
  @ViewChild('childMenu', { static: true }) public childMenu;
  public settings: Settings;

  constructor(public appSettings:AppSettings, public router: Router) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
  }
}
