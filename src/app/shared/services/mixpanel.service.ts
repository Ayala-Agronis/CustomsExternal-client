// src/app/shared/services/mixpanel.service.ts
import { Injectable } from '@angular/core';
import mixpanel from 'mixpanel-browser';

@Injectable({
  providedIn: 'root'
})
export class MixpanelService {
  constructor() {
    mixpanel.init('65526ff5f11ef1d3f90853764b76c6b0', {
      debug: true
    });
  }

  track(eventName: string, properties?: any): void {
    mixpanel.track(eventName, properties);
  }

  identify(userId: string): void {
    mixpanel.identify(userId);
  }

  setUserProperties(properties: any): void {
    mixpanel.people.set(properties);
  }
}
