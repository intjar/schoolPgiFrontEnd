import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pdf-commom',
  templateUrl: './pdf-commom.component.html',
  styleUrls: ['./pdf-commom.component.scss']
})
export class PdfCommomComponent {
  @Input() items: any = [];
  basePath:any =environment.baseURLfileUpload

  replaceString(item:any){
    if(item?.includes('/media_upload/'))
    {
      return this.basePath + item
    }
    else if(item?.includes('000Z')){
  return (new Date(item) instanceof Date)
    }
    else{
      return item?.split('||').toLocaleString()
    }

  }

  replaceAns(item:string){
    return item?.replace(/\|/g, "->")
  }
}
