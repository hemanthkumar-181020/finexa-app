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

### 📊 Financial Visualization
- **Expense Pie Charts** - Visual breakdown of spending by category
- **Spending Heatmaps** - Track spending patterns over time
- **Financial Dashboard** - At-a-glance overview of your finances
- Monthly/Weekly spending analysis

### 🏦 Transactions From Banks Pdf 
- SBI Bank pdf processing via external API
- PhonePe pdf processing via external API
- Support for multiple bank pdfs
- Secure transaction synchronization

### 🤖 AI-Powered Features
- Spending predictions and forecasting
- Smart budget recommendations
- Transaction categorization

## 🏗️ System Architecture

### Microservices Architecture
```
┌─────────────────────────────────────────┐
│         React Native Mobile App         │
│                 (Expo)                  │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│          Firebase Services              │
│  ┌────────────┬────────────┬─────────┐ │
│  │  Auth      │  Firestore │ Storage │ │
│  └────────────┴────────────┴─────────┘ │
└─────┬────────────┬────────────┬────────┘
      │            │            │
┌─────▼────┐ ┌─────▼────┐ ┌────▼──────┐
│ SBI PDF  │ │PhonePe PDF│ │Prediction │
│ Extractor│ │ Extractor │ │   API     │
│ Service  │ │ Service   │ │           │
└──────────┘ └───────────┘ └───────────┘
```

### External API Services Integration

| Service | Purpose | Repository | Deployment |
|---------|---------|------------|------------|
| **SBI PDF Extractor** | Process SBI bank statements | [github.com/reddy1307/sbi-pdf-extract](https://github.com/reddy1307/sbi-pdf-extract) | Vercel/Render |
| **PhonePe PDF Extractor** | Process PhonePe statements | [github.com/reddy1307/PDF-EXTRACT](https://github.com/reddy1307/PDF-EXTRACT) | Vercel/Render |
| **Spending Predict API** | AI spending predictions | [github.com/reddy1307/spending-predict-api](https://github.com/reddy1307/spending-predict-api) | Vercel/Render |

### Data Flow Diagram
```
User Uploads PDF → Firebase Storage → External API Service
       ↓                              ↓
Mobile App ←─── Processed Data ←── API Response
       ↓
Firestore Storage
       ↓
Dashboard Display
       ↓
Charts & Analytics
```

## 🛠️ Tech Stack

### Frontend
- **React Native** - Mobile app framework
- **Expo** - Development platform
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation

### Backend Services
- **Firebase Authentication** - User management
- **Firebase Storage** - File storage
- **External APIs** - PDF processing and AI services

### State Management
- **React Context API** - Global state management
- **Custom Hooks** - Reusable logic

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
   # or
   yarn install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication and Firestore
   - Download configuration files:
     - `GoogleService-Info.plist` (iOS)
     - `google-services.json` (Android)
   - Place these files in the project root directory

4. **Configure External APIs**
   Create a `.env` file with:
   ```env
   EXPO_PUBLIC_SBI_API_URL=https://your-sbi-service.vercel.app/api
   EXPO_PUBLIC_PHONEPE_API_URL=https://your-phonepe-service.vercel.app/api
   EXPO_PUBLIC_PREDICTION_API_URL=https://your-prediction-service.render.com/api
   ```

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
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Home screen
├── assets/images/         # Images and UI assets
├── components/            # Reusable UI components
├── constants/             # App constants and config
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── reducers/              # State reducers
├── services/              # External services
│   ├── firebase/          # Firebase services
│   └── banking/           # Bank API integrations
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

## 📊 External Service Integration

### API Service Configuration
```typescript
// services/api/config.ts
export const API_ENDPOINTS = {
  SBI_PDF_EXTRACT: process.env.EXPO_PUBLIC_SBI_API_URL + '/extract',
  PHONEPE_PDF_EXTRACT: process.env.EXPO_PUBLIC_PHONEPE_API_URL + '/extract',
  SPENDING_PREDICT: process.env.EXPO_PUBLIC_PREDICTION_API_URL + '/predict',
};

// services/api/client.ts
export class APIClient {
  async processSBIPDF(pdfFile: File, userId: string) {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('userId', userId);
    
    const response = await fetch(API_ENDPOINTS.SBI_PDF_EXTRACT, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  }
  
  async getSpendingPredictions(userId: string, timeframe: string) {
    const response = await fetch(`${API_ENDPOINTS.SPENDING_PREDICT}?userId=${userId}&timeframe=${timeframe}`);
    return response.json();
  }
}
```

### PDF Processing Flow
1. User uploads bank statement PDF
2. PDF stored in Firebase Storage
3. PDF sent to appropriate external service (SBI/PhonePe)
4. Service extracts transactions and returns structured data
5. Data stored in Firestore and displayed in app
6. Prediction API analyzes patterns for future spending

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
- [Spending Predict API](https://github.com/reddy1307/spending-predict-api)

---

<div align="center">
  
**Finexa** - Take control of your finances, one transaction at a time! 💪

*Last Updated: January 2026 | Version: 1.0.0*

</div>
