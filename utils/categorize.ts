// utils/categorize.ts
import { CATEGORY_RULES } from './categories';

export function autoCategorize(description: string): string {
  if (!description) return 'Uncategorized';

  const text = description.toLowerCase();

  for (const category in CATEGORY_RULES) {
    for (const pattern of CATEGORY_RULES[category]) {
      if (pattern.test(text)) {
        return category;
      }
    }
  }

  return 'Uncategorized';
}
