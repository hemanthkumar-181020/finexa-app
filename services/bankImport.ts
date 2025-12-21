import type { DocumentPickerAsset } from 'expo-document-picker';
import { saveTransactionsToFirestore } from './firestoreTransactions';

const BASE_URL = 'https://pdf-extract-fin.vercel.app';

type ParsedTransaction = {
  amount: number | string;
  type: 'CREDIT' | 'DEBIT';
  date: string;
  description?: string;
  category?: string;
  UTR_No?: string; // API returns UTR_No, not utr
};

export async function importBankStatement(
  file: DocumentPickerAsset,
  uid: string | undefined,
): Promise<{ total: number; saved: number; skipped: number; message: string }> {
  if (!uid) {
    throw new Error('❌ User UID missing. User not authenticated.');
  }

  if (!file?.uri) {
    throw new Error('❌ Invalid PDF file');
  }

  console.log('📤 Uploading PDF to parsing service...');
  
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'statement.pdf',
    type: file.mimeType || 'application/pdf',
  } as any);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('❌ PDF API Error:', text);
    throw new Error('PDF upload failed');
  }

  const data: { transactions?: ParsedTransaction[]; count?: number } = await response.json();

  console.log('📥 API Response received:', {
    transactionCount: data.transactions?.length || 0,
    hasUTRField: data.transactions?.[0]?.UTR_No ? 'Yes' : 'No',
    sampleUTR: data.transactions?.[0]?.UTR_No || 'None'
  });

  if (!Array.isArray(data.transactions)) {
    throw new Error('❌ Invalid response format from PDF service');
  }

  if (data.transactions.length === 0) {
    return {
      total: 0,
      saved: 0,
      skipped: 0,
      message: 'No transactions found in PDF'
    };
  }

  // Transform the API data
  const transformedTransactions = data.transactions.map((t) => {
    return {
      amount: t.amount,
      type: t.type,
      date: t.date,
      description: t.description,
      category: t.category,
      // Map UTR_No to utr (lowercase)
      utr: t.UTR_No || undefined
    };
  });

  console.log(`📊 Found ${transformedTransactions.length} transactions in PDF`);
  
  // Check UTRs
  const transactionsWithUTR = transformedTransactions.filter(t => t.utr);
  console.log(`🔑 ${transactionsWithUTR.length}/${transformedTransactions.length} transactions have UTR`);

  // Save to Firestore
  const result = await saveTransactionsToFirestore(uid, transformedTransactions);

  return {
    total: data.transactions.length,
    saved: result.saved,
    skipped: result.skipped,
    message: `Imported ${result.saved} transactions. ${result.skipped} duplicates skipped.`
  };
}