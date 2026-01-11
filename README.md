# Finexa - Personal Finance Tracker 📱💰

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

A modern, cross-platform mobile application for comprehensive personal finance management built with enterprise-grade architecture.

[Features](#-features) • [Architecture](#️-system-architecture) • [API Documentation](#-api-integration) • [Installation](#-installation)

</div>

---

## ✨ Features

### 🔐 Authentication & Security
- Firebase Authentication with email/password
- JWT token management and auto-refresh
- Biometric authentication (Face ID/Fingerprint)
- Secure credential storage with Expo SecureStore
- Session management and persistence

### 💳 Transaction Management
- Full CRUD operations for transactions
- Real-time sync with Firestore
- Offline-first architecture with queue
- Bulk import/export (CSV, Excel)
- Receipt photo attachment
- Smart categorization

### 📊 Financial Visualization
- Interactive pie charts and bar graphs
- Spending heatmaps
- Budget vs actual comparison
- Monthly/weekly trend analysis
- Predictive analytics

### 🏦 Bank Integration
- SBI Bank API integration
- PhonePe payment gateway
- Multi-account support
- Auto transaction sync
- Balance reconciliation

### 📱 User Experience
- Material Design 3 UI
- Dark mode support
- Gesture controls
- Offline functionality
- Push notifications

---

## 🏗️ System Architecture

### Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│              FINEXA MOBILE APPLICATION                   │
│               (React Native + Expo)                      │
└──────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PRESENTATION │  │   BUSINESS   │  │     DATA     │
│    LAYER     │  │     LOGIC    │  │    LAYER     │
│              │  │              │  │              │
│ • Screens    │─▶│ • Hooks      │─▶│ • Services   │
│ • Components │  │ • Context    │  │ • API Client │
│ • Navigation │  │ • Reducers   │  │ • Cache      │
└──────────────┘  └──────────────┘  └──────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   FIREBASE   │  │  BANKING API │  │  BACKEND API │
│              │  │              │  │              │
│ • Auth       │  │ • SBI        │  │ • REST       │
│ • Firestore  │  │ • PhonePe    │  │ • Analytics  │
│ • Storage    │  │ • UPI        │  │ • Sync       │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Layered Architecture Details

```
┌─────────────────────────────────────────────────────┐
│             APPLICATION LAYER (app/)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  (auth)/                  (tabs)/                   │
│  ├─ login.tsx            ├─ index.tsx (Dashboard)  │
│  ├─ register.tsx         ├─ transactions.tsx       │
│  └─ forgot-password.tsx  ├─ analytics.tsx          │
│                          ├─ accounts.tsx           │
│  modals/                 └─ profile.tsx            │
│  ├─ add-transaction.tsx                            │
│  └─ bank-connect.tsx    _layout.tsx (Root)         │
│                                                     │
├─────────────────────────────────────────────────────┤
│            BUSINESS LOGIC LAYER                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  hooks/                  context/                   │
│  ├─ useAuth.ts          ├─ AuthContext.tsx         │
│  ├─ useTransactions.ts  ├─ TransactionContext.tsx  │
│  ├─ useBanking.ts       └─ BankingContext.tsx      │
│  └─ useAnalytics.ts                                │
│                          reducers/                  │
│                          ├─ authReducer.ts          │
│                          └─ transactionReducer.ts   │
│                                                     │
├─────────────────────────────────────────────────────┤
│               DATA LAYER (services/)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  api/                    firebase/                  │
│  ├─ client.ts           ├─ auth.service.ts         │
│  ├─ interceptors.ts     ├─ firestore.service.ts    │
│  └─ modules/            └─ storage.service.ts      │
│     ├─ auth.api.ts                                 │
│     ├─ transactions.api.ts  banking/               │
│     └─ analytics.api.ts     ├─ sbi.service.ts      │
│                             ├─ phonepe.service.ts  │
│  storage/                   └─ bank.interface.ts   │
│  ├─ secureStore.ts                                 │
│  ├─ cache.service.ts    utils/                     │
│  └─ offline.service.ts  ├─ validation.ts           │
│                         ├─ errorHandler.ts         │
│                         └─ logger.ts               │
└─────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```
User Action (UI)
       │
       ▼
Custom Hook (useTransactions)
       │
       ├─────────────┐
       ▼             ▼
  Context API    API Service
       │         (transactions.api.ts)
       │             │
       │             ▼
       │      API Client (Axios)
       │             │
       │     ┌───────┴───────┐
       │     ▼               ▼
       │  Interceptor    Interceptor
       │  (Request)      (Response)
       │     │               │
       │     ▼               │
       │  Add Auth Token     │
       │  Check Network      │
       │     │               │
       │     ▼               ▼
       │   HTTP Request → Backend API
       │                     │
       │                     ▼
       │              ┌──────┴──────┐
       │              ▼             ▼
       │         Success      Error (401)
       │              │             │
       │              │      Token Refresh
       │              │             │
       │              └─────────────┘
       │                     │
       ▼                     ▼
  Update State      Return Response
       │                     │
       └──────────┬──────────┘
                  ▼
          Update UI Component
                  │
                  ▼
         Cache in AsyncStorage
```

---

## 🔌 API Integration

### 1. API Client Setup

**services/api/client.ts**
```typescript
import axios from 'axios';
import { getAuthToken } from '../firebase/auth.service';
import NetInfo from '@react-native-community/netinfo';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(async (config) => {
  // Check connectivity
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    throw new Error('No internet connection');
  }

  // Add auth token
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      await handleTokenRefresh();
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

### 2. Transaction API Module

**services/api/modules/transactions.api.ts**
```typescript
import { apiClient } from '../client';

export class TransactionAPI {
  // GET all transactions
  static async getAll(userId: string) {
    const { data } = await apiClient.get('/api/v1/transactions', {
      params: { userId }
    });
    return data;
  }

  // POST create transaction
  static async create(transaction) {
    const { data } = await apiClient.post(
      '/api/v1/transactions',
      transaction
    );
    return data;
  }

  // PUT update transaction
  static async update(id: string, updates) {
    const { data } = await apiClient.put(
      `/api/v1/transactions/${id}`,
      updates
    );
    return data;
  }

  // DELETE transaction
  static async delete(id: string) {
    await apiClient.delete(`/api/v1/transactions/${id}`);
  }

  // GET analytics
  static async getAnalytics(userId: string, period: string) {
    const { data } = await apiClient.get(
      '/api/v1/transactions/analytics',
      { params: { userId, period } }
    );
    return data;
  }
}
```

### 3. Banking Integration

**services/banking/sbi.service.ts**
```typescript
import { apiClient } from '../api/client';
import * as SecureStore from 'expo-secure-store';

export class SBIBankService {
  // Authenticate
  static async authenticate(credentials) {
    const { data } = await apiClient.post(
      '/api/v1/banking/sbi/auth',
      credentials
    );
    
    await SecureStore.setItemAsync('sbi_token', data.accessToken);
    return data;
  }

  // Get balance
  static async getBalance(accountNumber: string) {
    const token = await SecureStore.getItemAsync('sbi_token');
    const { data } = await apiClient.get(
      `/api/v1/banking/sbi/balance/${accountNumber}`,
      { headers: { 'X-Bank-Token': token } }
    );
    return data;
  }

  // Fetch transactions
  static async getTransactions(accountNumber, startDate, endDate) {
    const token = await SecureStore.getItemAsync('sbi_token');
    const { data } = await apiClient.get(
      `/api/v1/banking/sbi/transactions/${accountNumber}`,
      {
        params: { startDate, endDate },
        headers: { 'X-Bank-Token': token }
      }
    );
    return data.transactions;
  }

  // Sync transactions
  static async syncTransactions(userId, accountNumber) {
    const { data } = await apiClient.post(
      '/api/v1/banking/sbi/sync',
      { userId, accountNumber }
    );
    return data;
  }
}
```

**services/banking/phonepe.service.ts**
```typescript
import { apiClient } from '../api/client';
import crypto from 'crypto-js';

export class PhonePeService {
  private static MERCHANT_ID = process.env.EXPO_PUBLIC_PHONEPE_MERCHANT_ID;
  private static SALT_KEY = process.env.EXPO_PUBLIC_PHONEPE_SALT;

  // Initiate payment
  static async initiatePayment(paymentData) {
    const payload = {
      merchantId: this.MERCHANT_ID,
      merchantTransactionId: `TXN_${Date.now()}`,
      amount: paymentData.amount * 100,
      merchantUserId: paymentData.userId,
      redirectUrl: paymentData.redirectUrl,
      paymentInstrument: { type: 'PAY_PAGE' },
    };

    const base64Payload = btoa(JSON.stringify(payload));
    const checksum = this.generateChecksum(base64Payload);

    const { data } = await apiClient.post(
      '/api/v1/payment/phonepe/initiate',
      { request: base64Payload },
      { headers: { 'X-VERIFY': checksum } }
    );

    return data;
  }

  // Check payment status
  static async checkStatus(transactionId: string) {
    const { data } = await apiClient.get(
      `/api/v1/payment/phonepe/status/${transactionId}`
    );
    return data;
  }

  private static generateChecksum(data: string): string {
    return crypto.SHA256(`${data}${this.SALT_KEY}`).toString();
  }
}
```

### 4. Firebase Integration

**services/firebase/firestore.service.ts**
```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';

export class FirestoreService {
  // Real-time listener
  static subscribeToTransactions(userId, callback) {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(transactions);
    });
  }

  // Create
  static async createTransaction(transaction) {
    const docRef = await addDoc(
      collection(db, 'transactions'),
      {
        ...transaction,
        createdAt: new Date().toISOString(),
      }
    );
    return docRef.id;
  }

  // Update
  static async updateTransaction(id, data) {
    await updateDoc(doc(db, 'transactions', id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  // Delete
  static async deleteTransaction(id) {
    await deleteDoc(doc(db, 'transactions', id));
  }
}
```

### 5. Custom Hook Integration

**hooks/useTransactions.ts**
```typescript
import { useState, useEffect } from 'react';
import { TransactionAPI } from '@/services/api/modules/transactions.api';
import { FirestoreService } from '@/services/firebase/firestore.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from cache
  useEffect(() => {
    AsyncStorage.getItem('transactions').then(cached => {
      if (cached) setTransactions(JSON.parse(cached));
    });
  }, []);

  // Real-time sync
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = FirestoreService.subscribeToTransactions(
      user.uid,
      (data) => {
        setTransactions(data);
        AsyncStorage.setItem('transactions', JSON.stringify(data));
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  // Add transaction
  const addTransaction = async (transaction) => {
    try {
      const id = await FirestoreService.createTransaction({
        ...transaction,
        userId: user.uid,
      });
      
      await TransactionAPI.create({ ...transaction, id, userId: user.uid });
      return id;
    } catch (err) {
      setError('Failed to add transaction');
      throw err;
    }
  };

  // Update transaction
  const updateTransaction = async (id, data) => {
    await FirestoreService.updateTransaction(id, data);
    await TransactionAPI.update(id, data);
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    await FirestoreService.deleteTransaction(id);
    await TransactionAPI.delete(id);
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
```

### 6. Error Handling

**utils/errorHandler.ts**
```typescript
import { AxiosError } from 'axios';
import { FirebaseError } from 'firebase/app';

export class ErrorHandler {
  static handle(error: unknown): string {
    if (error instanceof AxiosError) {
      if (!error.response) {
        return 'Network error. Check your connection.';
      }
      
      switch (error.response.status) {
        case 400: return 'Invalid request';
        case 401: return 'Unauthorized. Please login again.';
        case 403: return 'Access denied';
        case 404: return 'Resource not found';
        case 500: return 'Server error. Try again later.';
        default: return 'An error occurred';
      }
    }
    
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found': return 'User not found';
        case 'auth/wrong-password': return 'Invalid password';
        default: return error.message;
      }
    }
    
    return 'Unexpected error occurred';
  }
}
```

---

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build platform
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation
- **Axios** - HTTP client

### Backend & Services
- **Firebase Auth** - User authentication
- **Cloud Firestore** - Real-time database
- **Firebase Storage** - File storage
- **REST APIs** - Backend communication

### State Management
- **React Context** - Global state
- **Custom Hooks** - Reusable logic
- **AsyncStorage** - Local persistence

### External Integrations
- **SBI Bank API** - Banking integration
- **PhonePe** - Payment gateway
- **UPI** - Payment protocol

---

## 🚀 Installation

### Prerequisites
- Node.js v18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Environment Setup

Create `.env` file:
```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project

# API
EXPO_PUBLIC_API_BASE_URL=https://api.finexa.com

# Banking
EXPO_PUBLIC_SBI_API_KEY=your_sbi_key
EXPO_PUBLIC_PHONEPE_MERCHANT_ID=your_merchant_id
EXPO_PUBLIC_PHONEPE_SALT=your_salt
```

### Installation Steps

```bash
# Clone repository
git clone https://github.com/hemanthkumar-181020/finexa-app.git
cd finexa-app

# Install dependencies
npm install

# Start development
npx expo start
```

---

## 📁 Project Structure

```
finexa-app/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── transactions.tsx
│   │   └── profile.tsx
│   └── _layout.tsx
├── components/
├── hooks/
│   ├── useAuth.ts
│   └── useTransactions.ts
├── services/
│   ├── api/
│   │   ├── client.ts
│   │   └── modules/
│   ├── firebase/
│   └── banking/
├── utils/
└── types/
```

---

## 🔧 Available Scripts

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npx eas build         # Build production app
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/NewFeature`
3. Commit changes: `git commit -m 'Add NewFeature'`
4. Push to branch: `git push origin feature/NewFeature`
5. Open Pull Request

---

## 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/hemanthkumar-181020">
        <img src="https://avatars.githubusercontent.com/u/150165710?v=4" width="100px;"/>
        <br/>
        <b>Hemanth Kumar</b>
      </a>
      <br/>
      Project Lead
    </td>
    <td align="center">
      <a href="https://github.com/reddy1307">
        <img src="https://avatars.githubusercontent.com/u/150165710?v=4" width="100px;"/>
        <br/>
        <b>Santhosh Reddy</b>
      </a>
      <br/>
      UI/UX Developer
    </td>
    <td align="center">
      <a href="https://github.com/Preethamchegu">
        <img src="https://avatars.githubusercontent.com/u/150165710?v=4" width="100px;"/>
        <br/>
        <b>Preetham Chegu</b>
      </a>
      <br/>
      Feature Developer
    </td>
  </tr>
</table>

---

## 📄 License

All rights reserved. Not licensed for public use.

---

## 🔗 Resources

- [Expo Docs](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/docs)
- [TypeScript](https://www.typescriptlang.org/)

---

<div align="center">

**Finexa** - Master your finances! 💪

*Version 1.0.0 | January 2026*

</div>
