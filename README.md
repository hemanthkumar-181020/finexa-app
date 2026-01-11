# Finexa - Personal Finance Tracker 📱💰

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

A modern, cross-platform mobile application for comprehensive personal finance management.

[Features](#features) | [Installation](#installation) | [Project Structure](#project-structure) | [Contributors](#contributors)

</div>

## ✨ Features

### 🔐 **Authentication & Security**
- Secure user registration and login with Firebase Authentication
- Email verification and password reset functionality
- Secure token management and session persistence

### 💳 **Transaction Management**
- Add, edit, and delete income/expense transactions
- Categorized transaction tracking (Food, Transportation, Entertainment, etc.)
- Real-time transaction updates with Firestore
- Local storage fallback for offline access

### 📊 **Financial Visualization**
- **Expense Pie Charts** - Visual breakdown of spending by category
- **Spending Heatmaps** - Track spending patterns over time
- **Financial Dashboard** - At-a-glance overview of your finances
- Monthly/Weekly spending analysis

### 🏦 **Bank Integration**
- SBI Bank API integration
- PhonePe payment integration
- Support for multiple bank accounts
- Secure transaction synchronization

### 📱 **User Experience**
- Clean, modern design with intuitive navigation
- Tab-based navigation system
- Responsive layout for all device sizes
- File-based routing with Expo Router

## 🛠️ Tech Stack

### **Frontend**
- **React Native** - Mobile app framework
- **Expo** - Development platform
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation

### **Backend Services**
- **Firebase Authentication** - User management
- **Cloud Firestore** - Real-time database
- **Firebase Storage** - File storage

### **State Management**
- **React Context API** - Global state management
- **Custom Hooks** - Reusable logic
- **Local Storage** - Offline data persistence

### **Development Tools**
- **ESLint** - Code linting
- **Expo Application Services (EAS)** - Build services
- **Git** - Version control

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
