import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import * as globalFunctions from 'app/global/globalFunctions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: []
})
export class LoginComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {

    let currentPage = globalFunctions.getCurrentPageInfo();
    let newUrl = location.origin + '/admissionLogin' + location.search;
    window.location.href = newUrl;
  }

}
