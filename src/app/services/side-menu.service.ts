import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {
  pageChange: any = new BehaviorSubject("");
  constructor() { }


  public changePage(changeTo: boolean){
    this.pageChange.next(changeTo);
}
}
