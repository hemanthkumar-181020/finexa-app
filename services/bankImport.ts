import type { DocumentPickerAsset } from 'expo-document-picker';
import type { Transaction } from '../types/transaction';

export async function importBankStatement(
  file: DocumentPickerAsset,
): Promise<Transaction[]> {
  const formData = new FormData();

  formData.append('file', {
    uri: file.uri,
    name: file.name ?? 'statement.pdf',
    type: file.mimeType ?? 'application/pdf',
  } as any);

  const response = await fetch(
    'https://pdf-extract-19k2.vercel.app/upload',
    {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to upload bank statement');
  }

  const data = await response.json();

  // normalize backend → app format
  return data.transactions.map((t: any) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, // Expo-safe
    amount: Number(t.amount),
    type: t.type === 'DEBIT' ? 'expense' : 'income',
    category: t.category ?? 'Uncategorized',
    date: new Date(t.date).toISOString(),
    note: t.description,
    source: 'bank',
  }));
}
