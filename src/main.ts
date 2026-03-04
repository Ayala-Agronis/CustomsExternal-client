import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { environment } from './environments/environment';

if (environment.production) {
  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  console.time = noop;
  console.timeEnd = noop;
  console.group = noop;
  console.groupEnd = noop;

  // console.warn = noop;
  // console.error = noop;
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
