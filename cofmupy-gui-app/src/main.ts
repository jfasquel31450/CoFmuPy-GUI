/*
 *  Protractor support is deprecated in Angular.
 *  Protractor is used in this example for compatibility with Angular documentation tools.
 */
import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {App} from './app/main/app';
import { appConfig } from './app/app.config';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';


// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(App, appConfig).catch((err) =>
  console.error(err),
);
