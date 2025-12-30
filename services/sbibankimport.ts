import type { DocumentPickerAsset } from 'expo-document-picker';
import { saveTransactionsToFirestore } from './firestoreTransactions';

const SBI_BASE_URL = 'https://sbi-pdf-extract-finexa.vercel.app/';

type ParsedTransaction = {
  amount: number | string;
  type: 'CREDIT' | 'DEBIT';
  date: string;
  description?: string;
  category?: string;
  utr?: string; // SBI backend returns utr (lowercase)
};

export async function importSBIStatement(
  file: DocumentPickerAsset,
  password: string,
  uid: string | undefined,
): Promise<{ total: number; saved: number; skipped: number; message: string }> {
  if (!uid) {
    throw new Error('❌ User UID missing. User not authenticated.');
  }

  if (!file?.uri) {
    throw new Error('❌ Invalid SBI PDF file');
  }

  if (!password) {
    throw new Error('❌ PDF password is required for SBI statements');
  }

  console.log('📤 Uploading SBI PDF to parsing service...');
  
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'sbi_statement.pdf',
    type: file.mimeType || 'application/pdf',
  } as any);

  // 🔑 Append SBI password
  formData.append('password', password);

  console.log('🔐 Sending request with password...');

  const response = await fetch(`${SBI_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('❌ SBI PDF API Error:', text);
    
    // Check if it's a password error
    if (text.includes('password') || text.includes('Password') || response.status === 401) {
      throw new Error('Invalid PDF password. Please check and try again.');
    }
    
    throw new Error('Failed to process SBI PDF');
  }

  const data: ParsedTransaction[] = await response.json();

  console.log('📥 SBI API Response received:', {
    transactionCount: data?.length || 0,
    hasUTRField: data?.[0]?.utr ? 'Yes' : 'No', // Changed to utr
    sampleUTR: data?.[0]?.utr || 'None' // Changed to utr
  });

  if (!Array.isArray(data)) {
    console.error('❌ Invalid response format from SBI service:', data);
    throw new Error('Invalid response from SBI PDF service');
  }

  if (data.length === 0) {
    return {
      total: 0,
      saved: 0,
      skipped: 0,
      message: 'No transactions found in SBI PDF'
    };
  }

  // Transform the API data - No UTR mapping needed since it's already utr
  const transformedTransactions = data.map((t) => {
    return {
      amount: t.amount,
      type: t.type,
      date: t.date,
      description: t.description,
      category: t.category,
      utr: t.utr || undefined // Already in correct format
    };
  });

  console.log(`📊 Found ${transformedTransactions.length} transactions in SBI PDF`);
  
  // Check UTRs
  const transactionsWithUTR = transformedTransactions.filter(t => t.utr);
  console.log(`🔑 ${transactionsWithUTR.length}/${transformedTransactions.length} transactions have UTR`);

  // Save to Firestore
  const result = await saveTransactionsToFirestore(uid, transformedTransactions);

  return {
    total: data.length,
    saved: result.saved,
    skipped: result.skipped,
    message: `Imported ${result.saved} SBI transactions. ${result.skipped} duplicates skipped.`
  };
}