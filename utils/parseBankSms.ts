export type ParsedTransaction = {
  amount: number | null;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  note: string;
  utr?: string;
};

export function parseBankSms(text: string): ParsedTransaction {
  const lower = text.toLowerCase();

  // Amount
  const amountMatch = text.match(/(?:rs\.?|inr)\s?([\d,]+(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null;

  // Type
  const type =
    lower.includes("credited") || lower.includes("credit") ? "income" : "expense";

  // Date (supports dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd)
  let date: Date = new Date();
  const dateMatch = text.match(
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\d{4}[-/]\d{1,2}[-/]\d{1,2})/
  );
  if (dateMatch) {
    const parsedDate = new Date(dateMatch[0]);
    if (!isNaN(parsedDate.getTime())) date = parsedDate;
  }

  // UTR (optional)
  const utrMatch = text.match(/\b([A-Za-z0-9]{9,20})\b/);
  const utr = utrMatch ? utrMatch[1] : undefined;

  // Category guess
  let category = "Other";
  if (lower.includes("upi")) category = "Shopping";
  else if (lower.includes("atm")) category = "Cash Withdrawal";
  else if (lower.includes("salary")) category = "Salary";
  else if (lower.includes("electricity") || lower.includes("bill")) category = "Bills & Utilities";
  else if (lower.includes("grocery") || lower.includes("store")) category = "Groceries";
  else if (lower.includes("fuel") || lower.includes("petrol") || lower.includes("diesel")) category = "Fuel";

  // Note (first 120 chars)
  const note = text.slice(0, 120);

  return {
    amount,
    type,
    category,
    date,
    note,
    utr,
  };
}
