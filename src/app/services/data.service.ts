import { Injectable, TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as global from '../globels';
import { UrlService } from './url.service';
import { Route, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  toasts: any[] = [];
  public subject = new Subject<boolean>()
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private menusDataSubject: BehaviorSubject<any>;
  public menusData: Observable<any>;
  constructor(private httpClient: HttpClient, private urlService: UrlService, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(sessionStorage.getItem('userDetails') as string)
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.menusDataSubject = new BehaviorSubject<any>(
      JSON.parse(sessionStorage.getItem('menus') as string)
    );
    this.menusData = this.menusDataSubject.asObservable();
  }

  updateMenuJson(data: any) {
    this.menusDataSubject.next(data);
    sessionStorage.setItem('menus', JSON.stringify(data));
  }

  public get getMenuJson() {
    return this.menusDataSubject.value;
  }

  userValue(userDetails: any) {
    this.currentUserSubject.next(userDetails);
  }

  public notification = new BehaviorSubject([]);  // set notification data from header component
  notificationData$ = this.notification.asObservable();
  setNotificationData(value: any) {
    this.notification.next(value);
  }

  getNotificationData() {
    return this.notification;

  }
  public loginDataSource = new BehaviorSubject(null);
  logindataString$ = this.loginDataSource.asObservable();

  saveUserData(value: any) {
    this.loginDataSource.next(value);
  }

  passValue(isShow) {
    this.subject.next(isShow)
  }

  isLoggedInnUser() {
    return this.getToken() == null;
  }
  getToken() {
    let loginaccessToken: any = JSON.parse(sessionStorage.getItem('userDetails') as string);
    return loginaccessToken?.accessToken

  }
  logout() {
    
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("menus");
    sessionStorage.removeItem("userDetails");
    this.router.navigate(['./login']);
  }

  login(username: any, password: any) {
    var input = {
      "password": password,
      "username": username,
    };
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_USERLOGINS, input, options);
  }

  getMenuAndPermissions(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_GETMENUPERMISSIONS, data, options);
  }

  sendotp(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_SENDOTP, data, options);
  }

  otpVerify(data) {
    var input = {
      "email": data.email,
      "otp": data.otp
    };
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_VALIDATEOTP, input, options);
  }

  resetpassword(data: any) {
    var input = {
      "email": data.email,
      "resetPassword": data.password,
      "confirmPassword": data.confirmPassword
    }

    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_USERRESETPASSWORD, input, options);
  }


  addRoleMaster(data: any) {
    var input = {
      "loggedInUserId": data.loggedInUserId,
      "name": data.rolename,
      "code": data.code,
      "status": data.status
    }
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDROLEMASTER, input, options);
  }
  addRoleMasterView() {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDROLEMASTER_VIEWROLE, options);
  }

  addRoleMasterUpdateRole(data: any) {
    var input = {
      "id": data.id,
      "name": data.rolename,
      "code": data.code,
      "status": data.status,
      "loggedInUserId": data.loggedInUserId
    }
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDROLEMASTERUPDATEROLE, input, options);
  }

  addRoleMasterDeleteRole(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDROLEMASTERDELETEROLE, data, options);
  }

  addRoleMasterManageMenu(data: any) {
    var input = {
      "roleid": data.id,
      "rolecode": data.code
    }
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDROLEMASTERMANAGEMENU, input, options);
  }

  addRoleMasterAssignMenu(data: any) {
    // var input = {
    //   "jsonUrl": data.jsonUrldata,
    //   "linkIds": data.linkIds,
    //   "roleid": data.roleId,
    //   "loggedInUserId": data.loggedInUserId
    // }
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDROLEMASTER_ASSIGNMENU, data, options);
  }

  addInstanceMaster(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPIONT_INSTANCEMASTER, data, options);
  }

  instanceMasterview(data: any) {
    let httpHeaders: HttpHeaders = new HttpHeaders({
      'content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_INSTANCEMASTER_VIEWINSTANCE, data, options)
  }

  instanceMasterUpdate(data: any) {
    let httpHeaders: HttpHeaders = new HttpHeaders({
      'content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    }; return this.httpClient.post(this.urlService.API_ENDPOINT_INSTANCEMASTER_UPDATEINSTANCE, data, options)
  }

  instanceDelete(data: any) {
    let httpHeaders: HttpHeaders = new HttpHeaders({
      'content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    }; return this.httpClient.post(this.urlService.API_ENDPIONT_INSTANCEMASTER_DELETEINSTANCE, data, options)
  }

  addLevelMasterViewLevel(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDLEVELMASTER_VIEWLEVEL, data, options);
  }

  addCreateLevelMaster(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDLEVELMASTER_CREATELEVEL, data, options);
  }

  addDeleteLevelMaster(data: any) {
    var input = {
      "id": data.id,
      "loggedInUserId": data.loggedInUserId
    }
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDLEVELMASTER_DELETELEVEL, input, options);
  }

  schoolmasterView() {
    let httpheaders = new HttpHeaders({
      'content-Type': 'application/json'
    });
    let options = {
      headers: httpheaders
    };
    return this.httpClient.post(this.urlService.API_ENDPIONT_ADDSCHOOLMASTER_VIEWSCHOOL, options)
  }
  viewblocklevelInstance(data) {
    let httpheaders = new HttpHeaders({
      'content-Type': 'application/json'
    });
    let options = {
      headers: httpheaders
    };
    return this.httpClient.post(this.urlService.API_ENDPIONT_ADDSCHOOLMASTER_VIEWBLOCKLEVELINSTANCES, data, options)
  }

  createschoolMaster(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDSCHOOLMASTER_CREATESCHOOLMASTER, data, options)
  }

  deleteschoolMaster(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDSCHOOLMASTER_DELETESCHOOLMASTER, data, options)
  }

  addManageDomainViewLevel() {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDMANAGEDOMAIN_VIEWLEVEL, options);
  }

  viewUser(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_VIEWUSER, data, options);
  }

  createUser(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_CREATEUSER, data, options);
  }

  updateUser(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_UPDATEUSER, data, options);
  }

  deleteUser(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_DELETEUSER, data, options);
  }

  instanceUserAssignLevel(data) {
    let httpHeaders: HttpHeaders = new HttpHeaders({
      'content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_CHILD_LEVEL, data, options)
  }


  addCreateManageDomain(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDMANAGEDOMAIN_CREATELEVEL, data, options);
  }

  addDeleteManageDomain(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDMANAGEDOMAIN_DELETELEVEL, data, options);
  }

  addManageSubDomainViewLevel() {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDMANAGESUBDOMAIN_VIEWLEVEL, options);
  }

  addCreateManageSubDomain(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDMANAGESUBDOMAIN_CREATELEVEL, data, options);
  }

  addDeleteManageSubDomain(data: any) {
    var input = {
      "id": data.id,
      "loggedInUserId": data.loggedInUserId
    }
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDMANAGESUBDOMAIN_DELETELEVEL, input, options);
  }

  addDataSourceViewLevel() {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_VIEWLEVEL, options);
  }

  addCreateDataSource(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_CREATELEVEL, data, options);
  }

  addDeleteDataSource(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_DELETELEVEL, data, options);
  }

  viewQuestion(request: any) {

    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_VIEW_QUESTION, request);
  }

  questionType(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_VIEW_QUESTIONTYPE, data, options);
  }

  createQuestion(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_CREATE_QUESTION, data, options);
  }

  deleteQuestion(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_DELETE_QUESTION, data, options);
  }

  viewSubQuestion() {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_VIEW_SUB_QUESTION, options);
  }

  createSubQuestion(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_CREATE_SUB_QUESTION, data, options);
  }

  deleteSubQuestion(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_DELETE_SUB_QUESTION, data, options);
  }

  viewAssignedSurvey(data: any) {
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_VIEW_SURVEY, data);
  }

  viewSurvey(payloads: any, request: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/surveylist?pageNo=${payloads.pageNo}&pageSize=${payloads.size ? payloads.size : 10}&sortDir=${payloads.sortOrder}&sortBy=created_at${payloads.search ? `&searchKey=${payloads.search}` : ''}`, request)
  }

  viewYear() {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_VIEW_YEAR, options);
  }

  createSurvey(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_VIEW_CREATE_SURVEY, data, options)
  }

  updateSurvey(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_VIEW_UPDATE_SURVEY, data, options)
  }

  deleteSurvey(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_ADDDATASOURCE_VIEW_DELETE_SURVEY, data, options);
  }



  viewlogs(data: any) {
    var input = {
      "loggedInUserId": data.loggedInUserId,
    }
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_VIEW_EVENTS_LOGS, input, options)
  }

  updatePassword(data: any) {
    var input = {
      "loggedInUserId": data.loggedInUserId,
      "currentpassword": data.currentPassword,
      "newPassword": data.newPassword,
      "confirmPassword": data.confirmPassword
    }
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPIONT_UPDATE_PASSWORD, input, options)
  }

  viewmapQuestion(payloads: any, request: any) {

    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/viewSurveyMapQuest?pageNo=${payloads.pageNo}&pageSize=${payloads.size ? payloads.size : 10}&sortDir=${payloads.sortOrder}&sortBy=created_at${payloads.search ? `&searchKey=${payloads.search}` : ''}`, request)
  }

  createmapQuestion(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPIONT_CREATE_MAP_QUESTION, data, options)
  }

  updateMapQuestion(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPIONT_UPDATE_MAP_QUESTION, data, options)
  }

  deleteMapQuestion(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPIONT_DELETE_MAP_QUESTION, data, options)
  }

  ViewSurveyMapSubQuestionByQuestId(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPIONT_VIEWSUBQUESTION_MAP_QUESTION, data, options)
  }


  viewAssignSurvey(payloads: any, data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/getUpdSurveySummary?pageNo=${payloads.pageNo}&pageSize=${payloads.size ? payloads.size : 10}&sortDir=${payloads.sortOrder}&sortBy${payloads.search ? `&searchKey=${payloads.search}` : ''}`, data)
  }

  viewNotification(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPIONT_VIEW_NOTIFICATION, data, options)
  }
  markNotificationAsRead_unread(data) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPIONT_MARK_AS_READ_UNREAD_NOTIFICATION, data, options)
  }

  cloneAndSaveSurvey(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_SAVE_CLONE_SURVEY, data, options);
  }

  getCategory() {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_GET_MEDIAFILE_CATEGORY, options)
  }

  mediaUploadFile(data: any) {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post(this.urlService.API_ENDPOINT_GET_MEDIAFILE_UPLOAD, data, options)
  }

  getMediaFiles(payLoads: any, id: any) {

    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/files?pageNo=${payLoads.pageNo}&pageSize=${payLoads.pageSize ? payLoads.pageSize : 10}&sortDir=desc&sortBy=created_at${payLoads.search ? `&searchKey=${payLoads.search}` : ''}`, id)
  }


  assignUassignSurvey(data: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/assign-unassign-survey`, data);
  }

  notifySurvey(data: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/notifySurvey`, data);
  }

  surveyNameReport(payloads: any, request: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/survey-name-report?pageNo=${payloads.pageNo}&pageSize=${payloads.size ? payloads.size : 10}&sortDir=${payloads.sortOrder}&sortBy=null${payloads.search ? `&searchKey=${payloads.search}` : ''}`, request)
  }

  assignSurveyReport(payloads: any, request: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/assign-survey-report?pageNo=${payloads.pageNo}&pageSize=${payloads.size ? payloads.size : 10}&sortDir=${payloads.sortOrder}&sortBy=null${payloads.search ? `&searchKey=${payloads.search}` : ''}`, request)
  }

  notifyTPDSurvey(data: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/notifyTPDSurvey`, data);
  }

  surveyStatusListReport(payloads: any, request: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/getSurveyStatusList?pageNo=${payloads.pageNo}&pageSize=${payloads.size ? payloads.size : 10}&sortDir=${payloads.sortOrder}&sortBy=null${payloads.search ? `&searchKey=${payloads.search}` : ''}`, request)
  }

  surveyInstanceListReport(payloads: any, request: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/getInstanceWiseList?pageNo=${payloads.pageNo}&pageSize=${payloads.size ? payloads.size : 10}&sortDir=${payloads.sortOrder}&sortBy=null${payloads.search ? `&searchKey=${payloads.search}` : ''}`, request)
  }

  surveyProcedureCall(data: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/surveyProcedureCall`, data);
  }

  getSurveyLevels(data: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/getLevelId`, data);
  }

  surveyLevelWiseReport(payloads: any, request: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/getSurveyDataAccToReport?pageNo=${payloads.pageNo}&pageSize=${payloads.size ? payloads.size : 10}&sortDir=${payloads.sortOrder}&sortBy=null${payloads.search ? `&searchKey=${payloads.search}` : ''}`, request)
  }
}

