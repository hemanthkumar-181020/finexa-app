import type { DocumentPickerAsset } from 'expo-document-picker';
import { saveTransactionsToFirestore } from './firestoreTransactions';
import { useAuth } from './AuthContext';

const BASE_URL = 'https://pdf-extract-1.vercel.app';

export async function importBankStatement(
  file: DocumentPickerAsset,
  uid: string, // ⚠️ pass uid from authenticated user
): Promise<number> {
  if (!uid) throw new Error('User UID is required to save transactions');

  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name ?? 'statement.pdf',
    type: file.mimeType ?? 'application/pdf',
  } as any);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('PDF upload failed');
  }

  const data = await response.json();

  // ✅ Save transactions under current user in Firestore
  await saveTransactionsToFirestore(uid, data.transactions);

  return data.transactions.length;
}
