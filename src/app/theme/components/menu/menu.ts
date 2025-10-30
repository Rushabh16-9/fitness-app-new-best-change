import { Menu } from './menu.model';
import * as globalFunctions from 'app/global/globalFunctions';
let menus = globalFunctions.getLocalStorage('menus');
let menusParsed = [];
try {
  menusParsed = JSON.parse(menus);
} catch(err) {
  menusParsed = [];
}

export const navItems = menusParsed;

export const navItems2 = [
  {
    menuId: 1,      
    title: 'Dashboard',
    icon: 'dashboard',
    faIcon: null,
    routerLink: '/dashboard',
    href: null,
    target: null,
    hasSubMenu: false,
    parentId: 0
  },  
  {
    menuId: 2,      
    title: 'Schedules',
    icon: 'schedule',
    faIcon: null,      
    routerLink: '/schedules',
    href: null,
    target: null,
    hasSubMenu: false,
    parentId: 0
  },  
  {
    menuId: 3,      
    title: 'Lectures',
    icon: 'developer_board',
    faIcon: null,      
    routerLink: '/lectures', 
    href: null,
    target: null,        
    hasSubMenu: false, 
    parentId: 0
  },  
  {
    menuId: 4,      
    title: 'Admission',
    icon: 'format_list_bulleted',
    faIcon: null,      
    routerLink: null, 
    href: null,
    target: null, 
    hasSubMenu: true, 
    parentId: 0
  },  
  {
    menuId: 5,      
    title: 'Admission Forms',
    icon: 'assignment',
    faIcon: null,      
    routerLink: '/admission/admissionForms', 
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 4
  },  
  {
    menuId: 6,
    title: 'Assign Fees',
    icon: 'card_membership',
    faIcon: null,      
    routerLink: '/admission/assignFees', 
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 4
  },  
  {
    menuId: 7,
    title: 'Assigned Fees',
    icon: 'insert_chart',
    faIcon: null,      
    routerLink: '/admission/assignedFees', 
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 4
  },  
  {
    menuId: 8,
    title: 'Fees',
    icon: null,
    faIcon: 'fa-inr',
    routerLink: null, 
    href: null,
    target: null, 
    hasSubMenu: true, 
    parentId: 0
  },
  {
    menuId: 9,
    title: 'All Fees',
    routerLink: '/fees/listFees',      
    icon: 'keyboard',
    faIcon: null,
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 8
  },
  {
    menuId: 10,
    title: 'Invoices',
    routerLink: '/fees/createInvoice',      
    icon: 'card_membership',
    faIcon: null,
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 8
  },
  {
    menuId: 11,
    title: 'Collect Fees',
    routerLink: '/fees/collectFees',      
    icon: 'credit_card',
    faIcon: null,
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 8
  },
  {
    menuId: 12,
    title: 'Students',
    icon: 'people',
    faIcon: null,
    routerLink: null, 
    href: null,
    target: null, 
    hasSubMenu: true, 
    parentId: 0
  },
  {
    menuId: 13,
    title: 'Add Students',
    routerLink: '/students/addStudents',      
    icon: 'group_add',
    faIcon: null,
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 12
  },
  {
    menuId: 14,
    title: 'Daily Attendance',
    routerLink: '/students/dailyAttendance',      
    icon: 'insert_chart',
    faIcon: null,
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 12
  },
  {
    menuId: 15,
    title: 'Lecture-Wise Attend.',
    routerLink: '/students/lectureWiseAttendance',      
    icon: 'insert_chart',
    faIcon: null,
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 12
  },
  {
    menuId: 16,      
    title: 'Institute Setup',
    icon: 'settings',
    faIcon: null,      
    routerLink: null, 
    href: null,
    target: null, 
    hasSubMenu: true, 
    parentId: 0
  },
  {
    menuId: 17,
    title: 'Masters',
    routerLink: '/setup/adminSettings',      
    icon: 'settings_applications',
    faIcon: null,
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 16
  },
  {
    menuId: 18,
    title: 'Employees',
    routerLink: '/setup/employees',      
    icon: 'people',
    faIcon: null,
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 16
  },
  {
    menuId: 19,
    title: 'Access Control',
    routerLink: '/setup/accessControl',      
    icon: 'touch_app',
    faIcon: null,
    href: null,
    target: null, 
    hasSubMenu: false, 
    parentId: 16
  },
  // {
  //   menuId: 18,  
  //   title: 'Test',
  //   routerLink: null,         
  //   icon: 'group',
  //   faIcon: null,
  //   href: null,
  //   target: null, 
  //   hasSubMenu: true, 
  //   parentId: 0
  // },
  // {
  //   menuId: 19,
  //   title: '1',
  //   routerLink: null,         
  //   icon: 'group',
  //   faIcon: null,
  //   href: null,
  //   target: null, 
  //   hasSubMenu: true, 
  //   parentId: 18
  // },
  // {
  //   menuId: 20,
  //   title: '2',
  //   routerLink: null,         
  //   icon: 'group',
  //   faIcon: null,
  //   href: null,
  //   target: null, 
  //   hasSubMenu: true, 
  //   parentId: 19
  // },
  // {
  //   menuId: 21,
  //   title: '3',
  //   routerLink: 'dashboard',         
  //   icon: 'group',
  //   faIcon: null,
  //   href: null,
  //   target: null, 
  //   hasSubMenu: false, 
  //   parentId: 20
  // }
];
