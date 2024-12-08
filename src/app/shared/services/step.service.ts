import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StepService {

  private stepCompletedSubject = new Subject<void>()

  stepCompleted$ = this.stepCompletedSubject.asObservable()
  
  emitStepCompleted() {
    this.stepCompletedSubject.next();
  }
}
