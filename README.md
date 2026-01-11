# Finexa – Personal Finance Tracker 📱💰

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

A modern, cross-platform personal finance app that ingests bank PDFs, prevents duplicate transactions with **UTR-based matching**, and gives ML-powered spending insights.

</div>

---

## ✨ Features

### 🔐 Authentication & Security
- Secure user registration and login with Firebase Authentication
- Email verification and password reset
- Secure token management and session persistence

### 💳 Transaction Management
- Add, edit, and delete income/expense transactions
- Categorized tracking (Food, Transport, Entertainment, etc.)
- Real-time transaction updates
- **UTR-based duplicate detection** – each transaction is uniquely keyed by UTR to avoid duplicates across all sources

### 📊 Financial Visualization
- **Expense pie charts** – visual breakdown of spending by category
- **Spending heatmaps** – track spending patterns over time
- **Financial dashboard** – at-a-glance overview of balance and recent activity
- Monthly/weekly spending analysis

### 🏦 Bank PDF Processing (UTR-first)
- **SBI PDF processing** – FastAPI + Python service with UTR extraction
- **PhonePe PDF processing** – FastAPI + Python service with UTR-based deduplication
- **pdfplumber + regex** – robust text extraction and UTR parsing from PDFs
- **UTR as primary key** – shared identifier for all transactions across services

### 📈 ML-Powered Features
- Category-wise spending predictions using Python ML models
- Smart budget recommendations based on historical patterns
- Transaction categorization assistance

---

## 🏗️ System Architecture

### UTR-Based Transaction Processing

Finexa treats **UTR as the single source of truth** for transactions, so the same payment appearing in multiple statements is stored only once.

```text
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
│        FastAPI Python Services          │
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
