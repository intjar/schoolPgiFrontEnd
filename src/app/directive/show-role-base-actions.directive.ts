import { Directive, HostListener, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';


@Directive({
  selector: '[appShowRoleBaseActions]',
})
export class ShowRoleBaseActionsDirective implements OnInit {
  // the role the user must have
  @Input() public appShowRoleBaseActions: Array<any> = [];

  /**
   * @param {ViewContainerRef} viewContainerRef -- the location where we need to render the templateRef
   * @param {TemplateRef<any>} templateRef -- the templateRef to be potentially rendered
   * @param {RolesService} rolesService -- will give us access to the roles a user has
   */

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
  ) {}
  menusData:any = JSON.parse((sessionStorage.getItem('menus') as string));
  

  ngOnInit() {
    if(Array.isArray(this.appShowRoleBaseActions[1])){
      const hasPermission = this.checkModuleAccess();
      if (hasPermission) {
        // If the user has permission, render the element
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        // If the user doesn't have permission, remove the element from the DOM
        this.viewContainerRef.clear();
      }

    }else{
      // Check the access type and title to determine if the user has permission
      const hasPermission = this.checkPermission();
      if (hasPermission) {
        // If the user has permission, render the element
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        // If the user doesn't have permission, remove the element from the DOM
        this.viewContainerRef.clear();
      }
    }
  }
  
  
  private checkPermission(): boolean { 
    let title =  this.appShowRoleBaseActions[0];
    let  accessType = this.appShowRoleBaseActions[1];
    // Iterate through the menu items to find a match for access type, title and status true
    for (const menuGroup of this.menusData) {
      for (const menuItem of menuGroup) {
        if (menuItem.accesstype === accessType && menuItem.title === title && menuItem.status) {
          return true;
        }
      }
    }
    return false; // No matching permission found
  }

  private checkModuleAccess(): boolean {
    let title =  this.appShowRoleBaseActions[0];
    let  accessType = this.appShowRoleBaseActions[1];
    // Iterate through the menu items to find a match for access type, title and status true
    for (const menuGroup of this.menusData) {
      // const hasAccess = menuGroup.some((menuItem:any) => accessType.includes(menuItem?.accesstype) && menuItem.title === title && menuItem.status);
      const hasAccess = menuGroup.some((menuItem:any) => {return accessType.includes(menuItem?.accesstype) && menuItem.title === title && menuItem.status
      });
      if (hasAccess) {
        return true;
      } 
    }
    return false; // No matching permission found
  }
}
