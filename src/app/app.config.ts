import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(
      BrowserModule,
      RouterModule
    )
  ],
};
