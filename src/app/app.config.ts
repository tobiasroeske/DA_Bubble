import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
// import { environment } from '../environments/environment.development';

const firebaseConfig = {
  apiKey: "AIzaSyCIw_VDLdKIe_07ziFPONisF9RCaRb72ac",
  authDomain: "da-bubble-697bb.firebaseapp.com",
  projectId: "da-bubble-697bb",
  storageBucket: "da-bubble-697bb.appspot.com",
  messagingSenderId: "177261164734",
  appId: "1:177261164734:web:c1a9d6e1ba5fe82dd4c6ef"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(firebaseConfig))
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideStorage(() => getStorage())), importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"da-bubble-697bb","appId":"1:177261164734:web:c1a9d6e1ba5fe82dd4c6ef","storageBucket":"da-bubble-697bb.appspot.com","apiKey":"AIzaSyCIw_VDLdKIe_07ziFPONisF9RCaRb72ac","authDomain":"da-bubble-697bb.firebaseapp.com","messagingSenderId":"177261164734"}))), importProvidersFrom(provideAuth(() => getAuth())), importProvidersFrom(provideFirestore(() => getFirestore())), importProvidersFrom(provideStorage(() => getStorage())),
  ],
};

