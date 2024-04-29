import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})
export class Sort implements PipeTransform {

  sortOrder = 1;
  collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  })

  transform(array: any, field: any): any[] {
    if (!Array.isArray(array)) {
      return [];
    }
    array.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }

  // startSort(property, order, type = '') {
  //   if (order == "desc") {
  //     this.sortOrder = -1
  //   }
  //   return (a, b) => {
  //     if (type == 'date') {
  //       return this.sortData(new Date(a[property]), new Date(b[property]));
  //     }
  //     else {
  //       return this.collator.compare(a[property], b[property]) * this.sortOrder;
  //     }
  //   }
  // }

  // sortData(a, b){
  //   if (a < b) {
  //     return -1  * this.sortOrder
  //   } else if (a > b) {
  //     return 1 * this.sortOrder
  //   } else {
  //     return 0 * this.sortOrder
  //   }
 
  // }


}
