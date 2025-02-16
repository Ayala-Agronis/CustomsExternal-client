import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StepService {

  private stepCompletedSubject = new Subject<{ direction: any }>()
  private maxIndexSubject = new Subject<any>()

  stepCompleted$ = this.stepCompletedSubject.asObservable()
  maxIndex$ = this.maxIndexSubject.asObservable()

  emitStepCompleted(direction: any) {
    this.stepCompletedSubject.next({direction});
  }

  updateMaxIndex(index:any){
    this.maxIndexSubject.next(index);
  }

}
