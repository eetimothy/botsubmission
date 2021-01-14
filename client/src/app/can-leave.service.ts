import { Injectable } from "@angular/core";
import { CanDeactivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

export interface CanLeaveRouteInterface {
    CanILeave(): Boolean | Promise<boolean>
}

@Injectable()
export class CanLeaveSerivce implements CanDeactivate<CanLeaveRouteInterface>{

    canDeactivate(comp: CanLeaveRouteInterface, currRoute: ActivatedRouteSnapshot,
        currState: RouterStateSnapshot, nextState: RouterStateSnapshot) {

            if (!comp.CanILeave()) {
                return confirm('ARe you sure you wish to leave?')

                return true
            }
        }
}