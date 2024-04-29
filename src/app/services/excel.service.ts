import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }
  downloadFile(data:any, filename='data',headers:any) {

    let csvData = this.ConvertToCSV(data, headers);
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
        dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    // // this._toast.showMessage('File Downloaded Successfully', 'Close');
    document.body.removeChild(dwldLink);
}

ConvertToCSV(objArray:any, headerList:any) {
     let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
     let str = '';
     let row = 'S.No,';

     for (let index in headerList) {
         let header = headerList[index].toUpperCase().replace("_", " ");
         row += header + ',';
     }
     row = row.slice(0, -1);
     str += row.trim() + '\r\n';
     for (let i = 0; i < array.length; i++) {
         let line = (i+1)+'';
         for (let index in headerList) {
            let head = headerList[index];
            if (array[i][head]){
                array[i][head] = array[i][head].toString().replace(",", " ");
            }
            if (array[i][head] == 'Total'){
                line = ''
            }
            line += ',' + array[i][head];
         }
         str += line + '\r\n';
     }

     return str;
 }

}
