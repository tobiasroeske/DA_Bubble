// Production environment configuration.
// The real Firebase config is injected at deploy time via CI/CD environment variables
// or configured separately per deployment target.
//
// For local development, the Angular build replaces this file with
// environment.development.ts (see angular.json fileReplacements).
//
// To set up your own Firebase project, copy environment.example.ts to
// environment.development.ts and fill in your Firebase Console credentials.
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
};
