import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StepService {

  private stepCompletedSubject = new Subject<{ direction: any }>()

  stepCompleted$ = this.stepCompletedSubject.asObservable()

  emitStepCompleted(direction: any) {
    this.stepCompletedSubject.next({direction});
  }
}
