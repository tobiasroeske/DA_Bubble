# DA Bubble

A real-time messaging app inspired by Slack — built with Angular 21 and Firebase.

> **Demo Login**: Email: `guest@guest.de` / Password: `12345678`

---

## Features

- Real-time channels with unlimited members
- Direct messages between users
- Threaded replies
- Emoji reactions
- File attachments
- User presence (online/idle/offline)
- Full-text search across channels and messages
- User profile management
- Responsive design (Desktop & Mobile)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 21 (Standalone Architecture) |
| Styling | Tailwind CSS v4 |
| Backend | Firebase (Auth, Firestore, Storage) |
| Real-time | Firestore `onSnapshot` Listeners |
| State Management | Angular Signals |
| Emoji | ngx-emoji-mart |
| Build Tool | Angular CLI / Vite |

---

## Architecture

```
src/app/
├── board/                    # Main app: channels, chat, threads, dialogs
│   ├── board-chat-field/     # Channel message list + editor
│   ├── board-toolbar/        # Search, notifications
│   ├── sidenav/              # Channel & DM navigation
│   └── thread/               # Threaded replies sidebar
├── login/                    # Authentication
├── register/                 # User registration
├── shared/
│   ├── services/             # Firebase, Auth, Board state
│   └── interfaces/           # TypeScript models
└── environments/             # Firebase configuration
```

**State Management**: Angular Signals handle reactive state. `FirestoreService` subscribes to Firestore real-time listeners and exposes typed Signals (`signal<Channel[]>`, `signal<Message[]>`, etc.) that components consume.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Angular CLI: `npm install -g @angular/cli`
- A Firebase project ([Firebase Console](https://console.firebase.google.com/))

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/da-bubble.git
cd da-bubble

# 2. Install dependencies
npm install

# 3. Configure Firebase
# Copy the example environment file and fill in your Firebase config
cp src/environments/environment.example.ts src/environments/environment.development.ts
# Edit environment.development.ts with your Firebase project credentials

# 4. Start the dev server
npm start
```

Open [http://localhost:4200](http://localhost:4200).

### Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password + Google Sign-In)
3. Enable **Firestore Database**
4. Enable **Storage** for file uploads
5. Set Firestore Rules for security (see `firestore.rules`)
6. Copy your Firebase config to `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  }
};
```

---

## Development

```bash
npm start          # Dev server at localhost:4200
npm run build      # Production build
npm run watch      # Build in watch mode
npm test           # Unit tests with Karma
```

### Styling

Tailwind CSS v4 is configured with PostCSS. Styles are compiled automatically during dev server startup. Global styles are in `src/styles.css`.

### State Management

All reactive state uses Angular Signals (`signal()`, `computed()`, `effect()`). Components inject services and read signals:

```typescript
export class ChannelComponent {
  readonly channels = inject(FirestoreService).channels;
  readonly currentMessage = signal<string>('');
}
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `feat: add X`
4. Open a Pull Request

---

## License

MIT
