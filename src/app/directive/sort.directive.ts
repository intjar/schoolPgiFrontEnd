import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { Sort } from '../pipes/sort.pipe';

@Directive({
  selector: '[appSort]'
})
export class SortDirective {

  @Input() appSort: Array<any>;

  constructor(private el: ElementRef, private renderer: Renderer2, private sort:Sort) { }

  //@HostListener("click")
  // sortData(){
  //  const elem = this.el.nativeElement
  //  const order = elem.getAttribute("data-order");
  // const type = elem.getAttribute("data-type");
  //  const property = elem.getAttribute("data-name");
  //   if(order == "desc"){
  //       this.appSort.sort(this.sort.startSort(property,order,type));
  //       elem.setAttribute("data-order","asc")
  //   }
  //   else{
  //       this.appSort.sort(this.sort.startSort(property,order,type));
  //       elem.setAttribute("data-order","desc")
  //   }
  // }



}
