# Montraq - Personal Money Tracker

Montraq is a discipline-first personal finance application designed to help users track income, expenses, and savings with a focus on conscious spending. It features a modern, glassmorphism-inspired UI and full Progressive Web App (PWA) capabilities for a native-like experience on all devices.

## 🚀 Key Features

- **Dashboard Overview**: Real-time tracking of monthly income, mandatory expenses, available balance, and remaining budget.
- **Budget Categories**: Visual progress bars for efficient budget management.
- **Transactions**: Easy-to-use modals for adding income and expenses.
- **PWA Support**: Installable on mobile and desktop, works offline, and offers a standalone app experience.
- **Responsive Design**: Optimized for both mobile and desktop views with a "Mobile First" navigation bar.
- **Animations**: Smooth transitions and interactive elements using framer-motion.
- **Firebase Backend**: Secure authentication and real-time data storage using Firebase.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Vanilla CSS (Glassmorphism)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Heroicons / Inline SVGs
- **Backend/Auth**: Firebase (Authentication, Firestore)
- **PWA**: vite-plugin-pwa

## 📱 PWA Capabilities

This app is a fully compliant Progressive Web App:
- **Installable**: Custom install prompt for a native app feel.
- **Offline Ready**: Caches assets and critical data for offline access.
- **Native UX**: Disables pinch-zoom and pull-to-refresh for a solid app-like interaction.

## 🔧 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/C4lie/MONTRAQ.git
   cd MONTRAQ
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📦 Deployment

The app is deployed using Firebase Hosting.

**Live Link:** [https://vaultify-b7045.web.app](https://vaultify-b7045.web.app)

To deploy updates:
```bash
npm run build
npx firebase deploy --only hosting
```

---
Built with ❤️ using React & Vite.
