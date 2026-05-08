// Template for local environment configuration.
// Copy this file to environment.local.ts and fill in your Firebase credentials.
// environment.local.ts is listed in .gitignore and will not be committed.
//
// Get your Firebase config at:
// https://console.firebase.google.com -> Project Settings -> Your apps -> SDK setup
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
};
