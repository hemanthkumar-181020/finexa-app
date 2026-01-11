# Finexa - Personal Finance Tracker 📱💰

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

A modern, cross-platform mobile application for comprehensive personal finance management.

</div>

## ✨ Features

### 🔐 Authentication & Security
- Secure user registration and login with Firebase Authentication
- Email verification and password reset functionality
- Secure token management and session persistence

### 💳 Transaction Management
- Add, edit, and delete income/expense transactions
- Categorized transaction tracking (Food, Transportation, Entertainment, etc.)
- Real-time transaction updates
- **UTR-based duplicate detection** - Prevents duplicate transactions using UTR numbers as unique keys

### 📊 Financial Visualization
- **Expense Pie Charts** - Visual breakdown of spending by category
- **Spending Heatmaps** - Track spending patterns over time
- **Financial Dashboard** - At-a-glance overview of your finances
- Monthly/Weekly spending analysis

### 🏦 Bank PDF Processing
- **SBI Bank PDF processing** - FastAPI service with UTR extraction
- **PhonePe PDF processing** - FastAPI service with UTR-based deduplication
- **pdfplumber & regex** - Advanced text extraction from PDFs
- **UTR as primary key** - Unique transaction identification across all services

### 📈 ML-Powered Features
- Spending predictions using machine learning models
- Smart budget recommendations based on spending patterns
- Transaction categorization

## 🏗️ System Architecture

### UTR-Based Transaction Processing
```
┌─────────────────────────────────────────┐
│         React Native Mobile App         │
│                 (Expo)                  │
└─────────────────────┬───────────────────┘
                      │ (PDF Upload)
┌─────────────────────▼───────────────────┐
│          Firebase Storage               │
│           (PDF Storage)                 │
└─────────────────────┬───────────────────┘
                      │ (Send to API)
┌─────────────────────▼───────────────────┐
│        FastAPI PDF Services             │
│  ┌─────────────────────────────┐        │
│  │ 1. Extract text (pdfplumber)│        │
│  │ 2. Find UTRs (regex)        │        │
│  │ 3. Parse transactions       │        │
│  │ 4. Check UTR duplicates     │        │
│  └─────────────────────────────┘        │
└─────────────────────┬───────────────────┘
                      │ (Processed Data)
┌─────────────────────▼───────────────────┐
│        Firebase Firestore               │
│  ┌─────────────────────────────┐        │
│  │ Transactions indexed by UTR │        │
│  │ UTR-based duplicate checks  │        │
│  │ Real-time updates           │        │
│  └─────────────────────────────┘        │
└─────────────────────────────────────────┘
```

### External Services (All using UTR as key)

| Service | Purpose | Repository | Deployment |
|---------|---------|------------|------------|
| **SBI PDF Extractor** | Process SBI bank statements with UTR extraction | [github.com/reddy1307/sbi-pdf-extract](https://github.com/reddy1307/sbi-pdf-extract) | Vercel |
| **PhonePe PDF Extractor** | Process PhonePe statements with UTR-based parsing | [github.com/reddy1307/PDF-EXTRACT](https://github.com/reddy1307/PDF-EXTRACT) | Vercel |
| **Spending Predict API** | ML-based spending predictions using UTR-linked data | [github.com/reddy1307/spending-predict-api](https://github.com/reddy1307/spending-predict-api) | Render |

## 🚀 Installation

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Studio Emulator

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/hemanthkumar-181020/finexa-app.git
   cd finexa-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   Create a `.env` file in the project root with:
   ```env
   # Firebase Configuration
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

   # External API Services
   EXPO_PUBLIC_SBI_API_URL=https://sbi-pdf-extract.vercel.app/api
   EXPO_PUBLIC_PHONEPE_API_URL=https://pdf-extract.vercel.app/api
   EXPO_PUBLIC_PREDICTION_API_URL=https://spending-predict-api.onrender.com/api
   ```

4. **Firebase Configuration**
   - Download Firebase config files from Firebase Console
   - Place `GoogleService-Info.plist` (iOS) and `google-services.json` (Android) in project root

5. **Start Development**
   ```bash
   npx expo start
   ```
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## 📁 Project Structure

```
finexa-app/
├── app/                    # App screens (file-based routing)
├── assets/images/         # Images and UI assets
├── components/            # Reusable UI components
├── constants/             # App constants and config
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── reducers/              # State reducers
├── services/              # External services
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── scripts/               # Build and utility scripts
```

## 🔧 Available Scripts

```bash
# Development
npm start                 # Start Expo development server
npm run android          # Run on Android device/emulator
npm run ios              # Run on iOS simulator
npm run web              # Run web version

# Project Management
npm run reset-project    # Reset to fresh project state
npx expo prebuild        # Generate native project files

# Production Builds
npx eas build --platform android    # Build for Android
npx eas build --platform ios        # Build for iOS
npx eas submit --platform ios       # Submit to App Store
npx eas submit --platform android   # Submit to Play Store
```

## 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/hemanthkumar-181020">
        <img src="https://avatars.githubusercontent.com/u/150165710?v=4" width="100px;" alt="Hemanth Kumar"/>
        <br />
        <sub><b>Hemanth Kumar</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/reddy1307">
        <img src="https://avatars.githubusercontent.com/u/150165710?v=4" width="100px;" alt="Santhosh Reddy"/>
        <br />
        <sub><b>Santhosh Reddy</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Preethamchegu">
        <img src="https://avatars.githubusercontent.com/u/150165710?v=4" width="100px;" alt="Preetham Chegu"/>
        <br />
        <sub><b>Preetham Chegu</b></sub>
      </a>
    </td>
  </tr>
</table>

## 🔗 Useful Links

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### External Service Repositories:
- [SBI PDF Extractor](https://github.com/reddy1307/sbi-pdf-extract)
- [PhonePe PDF Extractor](https://github.com/reddy1307/PDF-EXTRACT)
- [Spending Predict API (ML Models)](https://github.com/reddy1307/spending-predict-api)

---

<div align="center">
  
**Finexa** - Take control of your finances, one transaction at a time! 💪

*Last Updated: January 2026 | Version: 1.0.0*

</div>
```
