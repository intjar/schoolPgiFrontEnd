import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class UrlService {

  API_ENDPOINT: string;
  API_ENDPOINT_USERLOGINS: string;
  API_ENDPOINT_GETMENUPERMISSIONS: string;
  API_ENDPOINT_USERRESETPASSWORD: string
  API_ENDPOINT_VALIDATEOTP: string
  API_ENDPOINT_SENDOTP: string

  API_ENDPOINT_ADDROLEMASTER: string
  API_ENDPOINT_ADDROLEMASTER_VIEWROLE: string
  API_ENDPOINT_ADDROLEMASTERUPDATEROLE: string
  API_ENDPOINT_ADDROLEMASTERDELETEROLE: string

  API_ENDPIONT_INSTANCEMASTER: string
  API_ENDPOINT_INSTANCEMASTER_UPDATEINSTANCE: any
  API_ENDPOINT_INSTANCEMASTER_VIEWINSTANCE: any
  API_ENDPIONT_INSTANCEMASTER_DELETEINSTANCE: any

  API_ENDPOINT_ADDROLEMASTERMANAGEMENU: string
  API_ENDPOINT_ADDROLEMASTER_ASSIGNMENU: string

  API_ENDPOINT_ADDLEVELMASTER_VIEWLEVEL: string
  API_ENDPOINT_ADDLEVELMASTER_CREATELEVEL: string
  API_ENDPOINT_ADDLEVELMASTER_DELETELEVEL: string

  API_ENDPIONT_ADDSCHOOLMASTER_VIEWSCHOOL: string
  API_ENDPIONT_ADDSCHOOLMASTER_VIEWBLOCKLEVELINSTANCES: string
  API_ENDPOINT_ADDSCHOOLMASTER_CREATESCHOOLMASTER: any
  API_ENDPOINT_ADDSCHOOLMASTER_DELETESCHOOLMASTER: any

  API_ENDPOINT_ADDMANAGEDOMAIN_VIEWLEVEL: string
  API_ENDPOINT_VIEWUSER: string
  API_ENDPOINT_CREATEUSER: string
  API_ENDPOINT_UPDATEUSER: string
  API_ENDPOINT_DELETEUSER: string

  API_ENDPOINT_CHILD_LEVEL: string
  API_ENDPOINT_ADDMANAGEDOMAIN_CREATELEVEL: string
  API_ENDPOINT_ADDMANAGEDOMAIN_DELETELEVEL: string

  API_ENDPOINT_ADDMANAGESUBDOMAIN_VIEWLEVEL: string
  API_ENDPOINT_ADDMANAGESUBDOMAIN_CREATELEVEL: string
  API_ENDPOINT_ADDMANAGESUBDOMAIN_DELETELEVEL: string

  API_ENDPOINT_ADDDATASOURCEMASTER_VIEWDATASOURCE: String
  API_ENDPOINT_ADDDATASOURCEMASTER_CREATEDATASOURCE: String
  API_ENDPOINT_ADDDATASOURCEMASTER_UPDATEDATASOURCE: String
  API_ENDPOINT_ADDDATASOURCEMASTER_DELETEDATASOURCE: String
  API_ENDPOINT_ADDDATASOURCE_VIEWLEVEL: string
  API_ENDPOINT_ADDDATASOURCE_CREATELEVEL: string
  API_ENDPOINT_ADDDATASOURCE_DELETELEVEL: string

  API_ENDPOINT_ADDDATASOURCE_VIEW_QUESTION: string
  API_ENDPOINT_ADDDATASOURCE_VIEW_QUESTIONTYPE: string
  API_ENDPOINT_ADDDATASOURCE_CREATE_QUESTION: string;
  API_ENDPOINT_ADDDATASOURCE_DELETE_QUESTION: string;

  API_ENDPOINT_ADDDATASOURCE_VIEW_SUB_QUESTION: string
  API_ENDPOINT_ADDDATASOURCE_CREATE_SUB_QUESTION: string
  API_ENDPOINT_ADDDATASOURCE_DELETE_SUB_QUESTION: string;

  API_ENDPOINT_ADDDATASOURCE_VIEW_SURVEY: string;
  API_ENDPOINT_ADDDATASOURCE_VIEW_YEAR: string;
  API_ENDPOINT_ADDDATASOURCE_VIEW_CREATE_SURVEY: string;
  API_ENDPOINT_ADDDATASOURCE_VIEW_UPDATE_SURVEY: string;
  API_ENDPOINT_ADDDATASOURCE_VIEW_DELETE_SURVEY: string;

  API_ENDPOINT_ADDDATASOURCE_VIEW_ASSIGN_SURVEY: string;

  API_ENDPOINT_VIEW_EVENTS_LOGS: string;

  API_ENDPIONT_UPDATE_PASSWORD: string;

  API_ENDPIONT_VIEW_MAP_QUESTION: string;
  API_ENDPIONT_CREATE_MAP_QUESTION: string;
  API_ENDPIONT_UPDATE_MAP_QUESTION: string;
  API_ENDPIONT_DELETE_MAP_QUESTION: string;
  API_ENDPIONT_VIEWSUBQUESTION_MAP_QUESTION: string;

  API_ENDPIONT_VIEW_NOTIFICATION: string;
  API_ENDPIONT_MARK_AS_READ_UNREAD_NOTIFICATION: string;

  API_ENDPOINT_SAVE_CLONE_SURVEY: string;

  API_ENDPOINT_GET_MEDIAFILE_CATEGORY: string;
  API_ENDPOINT_GET_MEDIAFILE_UPLOAD: string;
  API_ENDPOINT_GET_MEDIA_FILE: string;





  constructor() {

    //this.API_ENDPOINT = 'http://spgi-dev.inroad.in:8080/np/app'; //stage server
    //this.API_ENDPOINT = 'https://spgi-uat.inroad.in/np/app' ; // UAT server

    this.API_ENDPOINT = `${environment.baseAPIURL}`

    this.API_ENDPOINT_USERLOGINS = this.API_ENDPOINT + "/login";
    this.API_ENDPOINT_GETMENUPERMISSIONS = this.API_ENDPOINT + "/getmenulist";
    this.API_ENDPOINT_USERRESETPASSWORD = this.API_ENDPOINT + "/resetpassword";
    this.API_ENDPOINT_VALIDATEOTP = this.API_ENDPOINT + "/validateotp";
    this.API_ENDPOINT_SENDOTP = this.API_ENDPOINT + "/sendOTP";


    this.API_ENDPOINT_ADDROLEMASTER = this.API_ENDPOINT + "/createrole";
    this.API_ENDPOINT_ADDROLEMASTER_VIEWROLE = this.API_ENDPOINT + "/viewRole";
    this.API_ENDPOINT_ADDROLEMASTERUPDATEROLE = this.API_ENDPOINT + "/updateRole";
    this.API_ENDPOINT_ADDROLEMASTERDELETEROLE = this.API_ENDPOINT + "/deleteRole";

    this.API_ENDPIONT_INSTANCEMASTER = this.API_ENDPOINT + "/createInstance";
    this.API_ENDPIONT_INSTANCEMASTER_DELETEINSTANCE = this.API_ENDPOINT + "/deleteInstance";
    this.API_ENDPOINT_INSTANCEMASTER_VIEWINSTANCE = this.API_ENDPOINT + "/viewinstances";
    this.API_ENDPOINT_INSTANCEMASTER_UPDATEINSTANCE = this.API_ENDPOINT + "/updateInstance";

    this.API_ENDPOINT_ADDROLEMASTERMANAGEMENU = this.API_ENDPOINT + "/managesetting";
    this.API_ENDPOINT_ADDROLEMASTER_ASSIGNMENU = this.API_ENDPOINT + "/savesetting";

    this.API_ENDPOINT_ADDLEVELMASTER_VIEWLEVEL = this.API_ENDPOINT + "/viewLevel";
    this.API_ENDPOINT_ADDLEVELMASTER_CREATELEVEL = this.API_ENDPOINT + "/createLevel";
    this.API_ENDPOINT_ADDLEVELMASTER_DELETELEVEL = this.API_ENDPOINT + "/deleteLevel";

    this.API_ENDPIONT_ADDSCHOOLMASTER_VIEWSCHOOL = this.API_ENDPOINT + "/viewSchool";
    this.API_ENDPIONT_ADDSCHOOLMASTER_VIEWBLOCKLEVELINSTANCES = this.API_ENDPOINT + "/viewBlockLevelInstance";
    this.API_ENDPOINT_ADDSCHOOLMASTER_CREATESCHOOLMASTER = this.API_ENDPOINT + "/createSchool";
    this.API_ENDPOINT_ADDSCHOOLMASTER_DELETESCHOOLMASTER = this.API_ENDPOINT + "/deleteSchool"

    this.API_ENDPOINT_ADDMANAGEDOMAIN_VIEWLEVEL = this.API_ENDPOINT + "/viewDomain";
    this.API_ENDPOINT_ADDMANAGEDOMAIN_CREATELEVEL = this.API_ENDPOINT + "/createDomain";
    this.API_ENDPOINT_ADDMANAGEDOMAIN_DELETELEVEL = this.API_ENDPOINT + "/deleteDomain";

    this.API_ENDPOINT_VIEWUSER = this.API_ENDPOINT + "/viewusers";
    this.API_ENDPOINT_CREATEUSER = this.API_ENDPOINT + "/createUser";
    this.API_ENDPOINT_UPDATEUSER = this.API_ENDPOINT + "/updateUser";
    this.API_ENDPOINT_DELETEUSER = this.API_ENDPOINT + "/deleteUser";

    this.API_ENDPOINT_CHILD_LEVEL = this.API_ENDPOINT + "/childLevel";

    this.API_ENDPOINT_ADDMANAGESUBDOMAIN_VIEWLEVEL = this.API_ENDPOINT + "/viewSubDomain";
    this.API_ENDPOINT_ADDMANAGESUBDOMAIN_CREATELEVEL = this.API_ENDPOINT + "/createSubDomain";
    this.API_ENDPOINT_ADDMANAGESUBDOMAIN_DELETELEVEL = this.API_ENDPOINT + "/deleteSubDomain";

    this.API_ENDPOINT_ADDDATASOURCEMASTER_VIEWDATASOURCE = this.API_ENDPOINT + "/viewDataSources"
    this.API_ENDPOINT_ADDDATASOURCEMASTER_CREATEDATASOURCE = this.API_ENDPOINT + "/createDataSource"
    this.API_ENDPOINT_ADDDATASOURCEMASTER_UPDATEDATASOURCE = this.API_ENDPOINT + "/updateDataSource"
    this.API_ENDPOINT_ADDDATASOURCEMASTER_DELETEDATASOURCE = this.API_ENDPOINT + ""
    this.API_ENDPOINT_ADDDATASOURCE_VIEWLEVEL = this.API_ENDPOINT + "/viewDataSources";
    this.API_ENDPOINT_ADDDATASOURCE_CREATELEVEL = this.API_ENDPOINT + "/createDataSource";
    this.API_ENDPOINT_ADDDATASOURCE_DELETELEVEL = this.API_ENDPOINT + "/deleteDataSource";


    this.API_ENDPOINT_ADDDATASOURCE_VIEW_QUESTION = this.API_ENDPOINT + "/viewQuestions";
    this.API_ENDPOINT_ADDDATASOURCE_VIEW_QUESTIONTYPE = this.API_ENDPOINT + "/viewQuestionType";
    this.API_ENDPOINT_ADDDATASOURCE_CREATE_QUESTION = this.API_ENDPOINT + "/createQuestion";
    this.API_ENDPOINT_ADDDATASOURCE_DELETE_QUESTION = this.API_ENDPOINT + "/deleteQuestion";

    this.API_ENDPOINT_ADDDATASOURCE_VIEW_SUB_QUESTION = this.API_ENDPOINT + "/viewSubQuestions";
    this.API_ENDPOINT_ADDDATASOURCE_CREATE_SUB_QUESTION = this.API_ENDPOINT + "/createSubQuestion";
    this.API_ENDPOINT_ADDDATASOURCE_DELETE_SUB_QUESTION = this.API_ENDPOINT + "/deleteSubQuestion";

    this.API_ENDPOINT_ADDDATASOURCE_VIEW_SURVEY = this.API_ENDPOINT + "/surveylist";
    this.API_ENDPOINT_ADDDATASOURCE_VIEW_YEAR = this.API_ENDPOINT + "/yearsList";
    this.API_ENDPOINT_ADDDATASOURCE_VIEW_CREATE_SURVEY = this.API_ENDPOINT + "/createsurvey";
    this.API_ENDPOINT_ADDDATASOURCE_VIEW_UPDATE_SURVEY = this.API_ENDPOINT + "/updatesurvey";
    this.API_ENDPOINT_ADDDATASOURCE_VIEW_DELETE_SURVEY = this.API_ENDPOINT + "/deletesurvey";

    this.API_ENDPOINT_ADDDATASOURCE_VIEW_ASSIGN_SURVEY= this.API_ENDPOINT + "/getUpdSurveySummary";

     this.API_ENDPOINT_VIEW_EVENTS_LOGS = this.API_ENDPOINT + "/vieweventlogs"

    this.API_ENDPOINT_VIEW_EVENTS_LOGS = this.API_ENDPOINT + "/vieweventlogs"

    this.API_ENDPIONT_UPDATE_PASSWORD = this.API_ENDPOINT + "/updatepassword"

    this.API_ENDPIONT_VIEW_MAP_QUESTION = this.API_ENDPOINT + "/viewSurveyMapQuest";
    this.API_ENDPIONT_CREATE_MAP_QUESTION= this.API_ENDPOINT + "/createSurveyMapQuest";
    this.API_ENDPIONT_UPDATE_MAP_QUESTION = this.API_ENDPOINT + "/updateSurveyMapQuestion";
    this.API_ENDPIONT_DELETE_MAP_QUESTION = this.API_ENDPOINT + "/deleteSurveyMapQuestion";
    this. API_ENDPIONT_VIEWSUBQUESTION_MAP_QUESTION = this.API_ENDPOINT + "/surveySubQuestsByQuestId";

   this.API_ENDPIONT_VIEW_NOTIFICATION = this.API_ENDPOINT + "/viewNotifications";
   this.API_ENDPIONT_MARK_AS_READ_UNREAD_NOTIFICATION = this.API_ENDPOINT + "/markNotificationAsReadUnread";

    this.API_ENDPOINT_SAVE_CLONE_SURVEY = this.API_ENDPOINT + "/cloneSurvey";

    this.API_ENDPOINT_GET_MEDIAFILE_CATEGORY = this.API_ENDPOINT + "/mediaCategory";
    this.API_ENDPOINT_GET_MEDIAFILE_UPLOAD = this.API_ENDPOINT + "/mediaUpload";
    this.API_ENDPOINT_GET_MEDIA_FILE = this.API_ENDPOINT + "/files"

  }
}
