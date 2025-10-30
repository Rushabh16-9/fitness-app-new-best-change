'use strict';

declare namespace hasOwnProperty {
  function call(obj, key): any;
}

export function checkIfAllzero(val) {

    if (val.trim().match(/^[0]+$/)) {
        return true;
    } else {
        return false;
    }
}

export function isEmpty(obj) {

    if (typeof obj == "string") {

        obj = obj.trim();

        if (obj === '0')  return true;
        if (obj === 'undefined')  return true;
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;
    }

    // null and undefined are "empty"
    if (obj == null) return true;
    if (obj == 0) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    // if (obj.length > 0)    return false;
    // if (obj.length === 0)  return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    // if (typeof obj !== "object") return true;

    if (typeof obj == "number") {
        if (obj.toString() == 'NaN') return true;
        if (obj.toString() === '0')  return true;        
        if (obj.toString().length > 0) return false;        
        if (obj.toString().length === 0) return true;
    }

    if (typeof obj == "object") {

        if (obj.length > 0) return false;
        if (obj.length === 0) return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }
    }

    return true;
}

export function onlyNumberKey(e) {
    return (e.charCode == 8 || e.charCode == 0) ? null : (e.charCode >= 48 && e.charCode <= 57) || e.charCode == 13;
}

export function onlyPercentage(event) {
    if ( ( (event.which != 46 || (event.which == 46 && event.target.value == '') ) || event.target.value.indexOf('.') != -1) && (event.which < 48 || event.which > 57) ) {
        event.preventDefault();
    }
}

export function base64Decode(val) {
    var c1 = 0;
    var c2 = 0;
    var c3: any;
    var decodedString = '';

    if (!isEmpty(val)) {

        var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

        try {
            decodedString = Base64.decode(val);
        } catch(err) {
            decodedString = '';
        }
    }
    
    return decodedString;
}

export function base64Encode(val) {
    var c1 = 0;
    var c2 = 0;
    var c3: any;
    var encodedString = '';

    if (!isEmpty(val)) {

        var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

        try {
            encodedString = Base64.encode(val);            
        } catch(err) {
            encodedString = '';
        }
    }

    return encodedString;
}

export function getUserId(userId) {
    return parseInt(base64Decode(userId));
}

export function generateUuid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

export function setLocalStorage(localStorageName, values) {
    let encryptedVal = base64Encode(JSON.stringify(values));
    localStorage.setItem(localStorageName, encryptedVal);
}

export function getLocalStorage(localStorageName, mode = '') {
    let values = localStorage.getItem(localStorageName);
    let decryptedVal = base64Decode(values);
    
    if (mode == 'JsonParse') {
        try {
          decryptedVal = JSON.parse(decryptedVal);
        } catch(err) {
          decryptedVal = '';
        }
    }

    return decryptedVal;
}

export function setMenus(values) {
    setLocalStorage('menus', values);
}

export function setFeaturesList(values) {
    setLocalStorage('featuresList', values);
}

export function getMenus() {
    let menus = getLocalStorage('menus');
    let menusParsed = [];
    try {
      menusParsed = JSON.parse(menus);
    } catch(err) {
      menusParsed = [];
    }
    return menusParsed;
}

export function getFeaturesList() {
    let featuresList = getLocalStorage('featuresList');
    let featuresListParsed = [];
    try {
      featuresListParsed = JSON.parse(featuresList);
    } catch(err) {
      featuresListParsed = [];
    }
    return featuresListParsed;
}

export function getBrowserProf(key = '') {

    let parsed = {
        "uuId": "",
        "deviceId" : "",
    };

    let browserProf = getLocalStorage('browserProf');
    try {
      parsed = JSON.parse(browserProf);
    } catch(err) {
    }

    if (!isEmpty(key)) {
        if (parsed.hasOwnProperty(key)) {
          parsed = parsed[key];
        }
    }

    return parsed;
}

export function setBrowserProf(key, value) {

    let browserProf = getLocalStorage('browserProf');

    let parsed = {};
    try {
      parsed = JSON.parse(browserProf);
    } catch(err) {
      parsed = {};
    }

    parsed[key] = value;

    setLocalStorage('browserProf', parsed);
}

export function getUserProf(key = '') {

    let userProfParsed:any = {
        "uuId": "",
        "deviceId" : "",
        "userId": "",
        "authCode": "",
        "instituteId": "",
        "instituteName": "",
        "instituteShortName": "",
        "fullName": "",
        "email": "",
        "profilePic": "",
        "mobileNo": "",
        "memberSince": "",
        "headerImage": "",
        "formPolicyId": "",
        "formType": "",
        'documentsUpload': false,
        'showPaymentHistory': false,
        'showDownloadForms': false,
        "inHouse": false, 
        "optAdmissionSubCategories": "",
        "afterLoginPage": "",
        "studentConfId": "",
        "studentId": "",
        "adminUserId": "",
        "admissionId": "",
        "helpline": "",
        "userTypeId": 0,
        "multiUsers": [],
        "selectedMultiUserId": 0, 
        "academicYearList": [],
        "filterAcademicYearId": 0, 
        "instituteLogo": "", 
        "themeColor": "", 
    
        "showAtktChange": "",
        "atktFormId": "",
        "termExamId": "",
        "subjectGroupId": "",
        "confId": "",
        "optPayment": true,
        'prePayment': false,
        'courseSelection': false,
        "formStatus": "",
        "applicantId": "",
        "downloadForm": "",
        "showFormB": "",
        "showScheduleInterview": "",
    };

    let userProf = getLocalStorage('userProf');
    try {
      userProfParsed = JSON.parse(userProf);
    } catch(err) {
        // 'getUserProfError====>';
        // key;
        // err;
    }

    if (!isEmpty(key)) {
        if (userProfParsed.hasOwnProperty(key)) {
          userProfParsed = userProfParsed[key];
        } else {
            userProfParsed = '';
        }
    }

    return userProfParsed;
}

export function setUserProf(key, value) {

    let userProf = getLocalStorage('userProf');

    let userProfParsed = {};
    try {
      userProfParsed = JSON.parse(userProf);
    } catch(err) {
      userProfParsed = {};
    }

    userProfParsed[key] = value;

    setLocalStorage('userProf', userProfParsed);
}

export function setUserProfInfo(data): void {

    setUserProf('userId', data.userId);
    setUserProf('authCode', data.authCode);
    setUserProf('instituteId', data.instituteId);
    setUserProf('instituteName', data.instituteName);
    setUserProf('instituteShortName', data.instituteShortName);
    setUserProf('fullName', data.fullName);
    setUserProf('email', data.email);
    setUserProf('profilePic', data.profilePic);
    setUserProf('mobileNo', data.mobileNo);
    setUserProf('memberSince', data.memberSince);
    setUserProf('studentId', data.studentId);
    setUserProf('studentConfId', data.studentConfId);
    setUserProf('adminUserId', data.adminUserId);

    setUserProf('admissionId', data.admissionId);
    setUserProf('optPayment', data.optPayment);
    setUserProf('prePayment', data.prePayment);
    setUserProf('courseSelection', data.courseSelection);
    setUserProf('documentsUpload', data.documentsUpload);
    setUserProf('showDownloadForms', data.showDownloadForms);
    setUserProf('showPaymentHistory', data.showPaymentHistory);
    setUserProf('formStatus', data.formStatus);
    setUserProf('showAtktChange', data.showAtktChange);
    setUserProf('atktFormId', data.atktFormId);
    setUserProf('termExamId', data.termExamId);
    setUserProf('confId', data.confId);
    setUserProf('inHouse', data.inHouse);
    setUserProf('optAdmissionSubCategories', data.optAdmissionSubCategories);
    setUserProf('headerImage', data.headerImage);
    setUserProf('downloadForm', data.downloadForm);
    setUserProf('showFormB', data.showFormB);
    setUserProf('showScheduleInterview', data.showScheduleInterview);

    setUserProf('applicantId', data.applicantId);
    setUserProf('subjectGroupId', data.subjectGroupId);
    setUserProf('atktApplicantId', data.atktApplicantId);
    setUserProf('formPolicyId', data.formPolicyId);    
    setUserProf('formType', data.formType);
    setUserProf('userTypeId', data.userTypeId);
    setUserProf('afterLoginPage', data.landingPage);
    setUserProf('multiUsers', data.multiUsers);
    setUserProf('selectedMultiUserId', data.selectedMultiUserId);
    setUserProf('academicYearList', data.academicYearList);
    setUserProf('filterAcademicYearId', data.filterAcademicYearId);
    setUserProf('instituteLogo', data.instituteLogo);    
    setUserProf('themeColor', data.themeColor);
    setUserProf('helpline', data.helpline);
}

export function getCommonPostValues(key = '') {

    let parsed = {
        "uuId": "",
        "deviceId": '0',
        "userId": '',
        "instituteId": '',
        "studentConfId": '',
        "studentId": '',
        "applicantId": '',
        "adminUserId": '',
        "admissionId": '',
        "formPolicyId": '',
        "filterAcademicYearId": '',
        "inHouse": '',
        "atktFormId": '',
        "atktApplicantId": '',        
    };

    let browserProf = getLocalStorage('browserProf');
    try {
      parsed = JSON.parse(browserProf);
    } catch(err) {
    }

    if (!isEmpty(key)) {
        if (parsed.hasOwnProperty(key)) {
          parsed = parsed[key];
        }
    }

    let userProf = getUserProf();
    parsed.userId = userProf.userId
    parsed.instituteId = userProf.instituteId;
    parsed.studentId = userProf.studentId;
    parsed.studentConfId = userProf.studentConfId;
    parsed.applicantId = userProf.applicantId;
    parsed.adminUserId = userProf.adminUserId;
    parsed.admissionId = userProf.admissionId;
    parsed.formPolicyId = userProf.formPolicyId;
    parsed.filterAcademicYearId = userProf.filterAcademicYearId;

    parsed.atktFormId = userProf.atktFormId;
    parsed.atktApplicantId = userProf.atktApplicantId;

    return parsed;
}

export function getSearchPostValues(page, dateRange, filter = '') {

    let postData = {
      pageSize: page.limit,
      pageNumber: page.offset,
      sortProp: page.sortProp,
      sortOrder: page.sortOrder,
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate, 
      search: filter
    }

    return postData;
}

export function calculate_age(dob) {

    // dob format: (year/month/day) 1985/12/11 
    let returnVal = {
        "status": 0,
        "message": "",
        "years": 0,
        "months": 0,
        "days": 0,
    };

    let mdate = dob;
    let yearThen = parseInt(mdate.substring(0,4), 10);
    let monthThen = parseInt(mdate.substring(5,7), 10);
    let dayThen = parseInt(mdate.substring(8,10), 10);

    let today = new Date();
    let birthday = new Date(yearThen, monthThen-1, dayThen);

    let differenceInMilisecond = today.valueOf() - birthday.valueOf();
    
    let year_age = Math.floor(differenceInMilisecond / 31536000000);
    let day_age = Math.floor((differenceInMilisecond % 31536000000) / 86400000);

    if ((today.getMonth() == birthday.getMonth()) && (today.getDate() == birthday.getDate())) {
        returnVal.status = 1;            
        returnVal.message = "Happy B'day!!!";
    }

    let month_age = Math.floor(day_age/30);
    day_age = day_age % 30;
    
    if (isNaN(year_age) || isNaN(month_age) || isNaN(day_age)) {

        returnVal.status = 0;
        returnVal.message = 'Invalid birthday date';

    } else {

        returnVal.status = 1;
        returnVal.message = 'success';
        returnVal.years = year_age;
        returnVal.months = month_age;
        returnVal.days = day_age;
    }

    return returnVal;
}

export function format(date: Date, displayFormat: Object): string {
    if (displayFormat == "input") {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        if ( (day) && (month) && (year) ) {
            return year + '-' + _to2digit(month) + '-' + _to2digit(day);
        } else {
            return null;
        }
    } else {
        return date.toDateString();
    }
}

export function _to2digit(n: number) {
    return ('00' + n).slice(-2);
}

export function calculatePercentage(pEarned, total) {
    total = parseInt(total); 
    pEarned = parseInt(pEarned);
    let perc = '';
    if (!isEmpty(pEarned) && !isEmpty(total)) {
        if (isNaN(total) || isNaN(pEarned)) {
            perc = '';
        } else {
            perc = ((pEarned/total) * 100).toFixed(2);
        }
    }
    return perc;
}

export function isValidFileExtension(file, fileExt) {

    let extensions = (fileExt.split(',')).map(function (x) { return x.toLowerCase().trim() });
    let ext = file.name.toLowerCase().split('.').pop() || file.name;
    let exists = extensions.includes(ext);

    if (!exists) {
        return false;
    } else {
        return true;
    }
}

export function isValidFileSize(file, maxSize) {
    let fileSizeinMB = file.size / (1024 * 1000);
    let size = Math.round(fileSizeinMB * 100) / 100;
    if (size > maxSize) {
        return false;
    } else {
        return true;
    }
}

export function daysBetween( date1, date2 ) {
  //Get 1 day in milliseconds
  var one_day=1000*60*60*24;

  date1 = new Date(date1);
  date2 = new Date(date2);

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;

  // Convert back to days and return
  return Math.round(difference_ms/one_day);
}

export function yearsDiff(d1, d2) {
    let date1 = new Date(d1);
    let date2 = new Date(d2);
    let yearsDiff =  date2.getFullYear() - date1.getFullYear();
    return yearsDiff;
}

export function monthsDiff(d1, d2) {
  let date1 = new Date(d1);
  let date2 = new Date(d2);
  let years = yearsDiff(d1, d2);
  let months =(years * 12) + (date2.getMonth() - date1.getMonth()) ;
  return months;
}

export function updateFilter(event, tableData, tempData, columnsData, table:any = '', expandAllRows:boolean = true) {

    if (event.target.value != undefined) {

        const val = event.target.value.toLowerCase().trim();

        let columns = [];
        if (isEmpty(columnsData) && !isEmpty(tableData)) {
            columns = Object.keys(tableData[0]);
            columnsData = columns;
        } else {
            columns = columnsData;
        }
        let keysLength = columns.length;

        tableData = tempData.filter(function(item) {
            for (let i=0; i<keysLength; i++) {
                if (!isEmpty(item[columns[i]])) {
                    let searchStr = item[columns[i]].toString();
                    if (typeof item[columns[i]] == 'object') {
                        var tst = Object.keys(item[columns[i]]).some(function(objectKey, index) {
                            var value = item[columns[i]][objectKey];
                            for (var prop in value) {
                                if (!isEmpty(value[prop])) {
                                    if (value[prop].toString().toLowerCase().indexOf(val) !== -1 || !val) {
                                        return true;
                                    }
                                }
                            }
                        });
                        if (tst) {
                            return true;
                        }
                    }
                    if (searchStr.toLowerCase().indexOf(val) !== -1 || !val) {
                        return true;
                    }
                }
            }
        });

        if (!isEmpty(table)) {
            table.offset = 0;
        }
    }

    if (expandAllRows) {
        setTimeout(() => { table.rowDetail.expandAllRows(); }, 2);
    }

    let returnVal = {
        "tableData": tableData,
        "tempData": tempData,
        "columnsData": columnsData,
        "table": table,
    };

    return returnVal;
}

export function updateColumnFilter(event, tableData, tempData, table, columnName, searchType = '') {

    if (event.target.value != undefined) {

        const val = event.target.value.toLowerCase().trim();

        tableData = tempData.filter(function(item) {
            
            // if ( !isEmpty( item[columnName] ) ) {

                let searchStr = item[columnName].toString();

                if (typeof item[columnName] == 'object') {
                    var tst = Object.keys(item[columnName]).some(function(objectKey, index) {
                        var value = item[columnName][objectKey];
                        for (var prop in value) {
                            if (!isEmpty(value[prop])) {
                                if ( searchType == 'specfic-search' && value[prop].toString().toLowerCase() == val ) {
                                    return true;
                                } else if ( value[prop].toString().toLowerCase().indexOf(val) !== -1 || !val ) {
                                    return true;
                                }
                            }
                        }
                    });
                    if (tst) {
                        return true;
                    }
                }

                if ( searchType == 'specfic-search' ) {
                    if (searchStr.toLowerCase().indexOf(val) !== -1 || !val) {                    
                    // if (searchStr.toLowerCase() == val )  {
                        return true;
                    }
                } else if ( searchStr.toLowerCase().indexOf(val) !== -1 || !val ) {
                    return true;
                }
            // }
        });
        table.offset = 0;
    }

    let returnVal = {
        "tableData": tableData,
        "tempData": tempData,
        "table": table,
    };

    return returnVal;
}

export function timeoutSeconds() {
    return 60000;
}

export function downloadFile(blob, downloadName, excelLink, allEventEmitters) {
    const url = window.URL.createObjectURL(blob);
    const link = excelLink.nativeElement;
    link.href = url;
    link.download = downloadName;
    link.click();
    window.URL.revokeObjectURL(url);
    allEventEmitters.showLoader.emit(false);    
}

export function getCurrentPageInfo() {
    let full = window.location.host;
    let parts = full.split('.');
    let subDomain = parts[0];
    let domain = parts[1];
    let type = parts[2];
    //'subdomain', 'domain', type is 'com'
    // let newUrl = 'http://' + domain + '.' + type + '/your/other/path/' + subDomain;

    let returnVal = {
        "subDomain": subDomain,
        "domain": domain,
        "type": type,
    };

    return returnVal;    
}

export function getSubDomainInfo() {
    
    let currentPage = getCurrentPageInfo();

    let subDomain = 'institute';
    if (currentPage.subDomain == 'admission' || currentPage.subDomain == 'admissionbeta' || currentPage.subDomain == 'admissiondemo') {
        subDomain = 'admission';
    } else if (currentPage.subDomain == 'student' || currentPage.subDomain == 'studentbeta' || currentPage.subDomain == 'studentdemo') {
        subDomain = 'student';
    } else if (currentPage.subDomain == 'institute' || currentPage.subDomain == 'institutebeta' || currentPage.subDomain == 'institutedemo') {
        subDomain = 'institute';
    } else if (currentPage.subDomain == 'admin' || currentPage.subDomain == 'adminbeta' || currentPage.subDomain == 'admindemo') {
        subDomain = 'admin';
    }

    return subDomain;
}

export function integratedThemes() {

    let themes = [
        'brand-color',
        'onfees-color',
        'edfly-color',        
        'indigo-light',
        'teal-light',
        'red-light',
        'blue-light',
        'blue-dark',
        'green-light',
        'green-dark',
        'pink-dark',
        'maroon-grey'
    ];

    return themes;
}

export function getYearListTillCurrent(fromYear) {

    let currentYear = (new Date()).getFullYear();

    let yearList = [];
    for (let i = fromYear; i <= currentYear; i++) {
      yearList.push(i);
    }

    return yearList;
}

export function getFutureYearListTill(till:number = 0) {

    let currentYear = (new Date()).getFullYear();
    let yearList = [];
    for (let i = currentYear; i < currentYear + till; i++) {
      yearList.push(i);   
    }

    return yearList;
}

export function base64ToFile(base64, filename, mimeType) {
    return (fetch(base64)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], filename, {type:mimeType});})
    );
}