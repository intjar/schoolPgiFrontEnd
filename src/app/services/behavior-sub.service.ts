import { Injectable } from '@angular/core';
import { BehaviorSubject , Subject} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BehaviorSubService {

  constructor() { }
private subject = new Subject<any>()
  private messageSource = new BehaviorSubject<string>("default message");
  currentApprovalStageMessage = this.messageSource.asObservable();

  // updateApprovalMessage(message: string) {
  //   this.messageSource.next(message)
  //   }

  sendClickEvent(value){
    this.subject.next(value)
  }
  updateApprovalMessage(message: string) {
    this.messageSource.next(message)
    }
}
