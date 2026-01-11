// app/constants/categoryGradients.ts

/**
 * Category gradient colors mapping
 * Format: [darkColor, lightColor]
 * Used across the app for consistent category visualization.
 */
export const CATEGORY_GRADIENTS: Record<string, readonly [string, string]> = {
  // Income/Transfer
  "Income / Transfer In": ["#059669", "#10B981"],

  // Core Expenses
  Recharge: ["#3B82F6", "#60A5FA"],
  "Food & Dining": ["#EF4444", "#F87171"],
  Fuel: ["#F59E0B", "#FBBF24"],
  Shopping: ["#8B5CF6", "#A78BFA"],
  Groceries: ["#EC4899", "#F472B6"],
  Travel: ["#06B6D4", "#22D3EE"],
  Entertainment: ["#F97316", "#FB923C"],
  Utilities: ["#84CC16", "#A3E635"],
  Education: ["#6366F1", "#818CF8"],
  Healthcare: ["#DC2626", "#EF4444"],
  "Banking & Finance": ["#0EA5E9", "#38BDF8"],
  "Transfer Out": ["#6B7280", "#9CA3AF"],

  // Extended Coverage
  "Personal Care": ["#A855F7", "#C084FC"],
  "Home & Kitchen": ["#FACC15", "#FDE047"],
  "Gifts & Donations": ["#E11D48", "#F43F5E"],
  "Business Expenses": ["#7C3AED", "#8B5CF6"],
  "Hobbies & Leisure": ["#14B8A6", "#2DD4BF"],
  "Vehicle Maintenance": ["#B45309", "#D97706"],
  "Child & Family": ["#BE185D", "#DB2777"],
  "Technology & Software": ["#1E40AF", "#3B82F6"],

  // Fallback
  "Other Expense": ["#64748B", "#94A3B8"],

  // Legacy / short names for backward compatibility
  Food: ["#EF4444", "#F87171"], // maps to Food & Dining
  Transport: ["#06B6D4", "#22D3EE"], // maps to Travel
  Bills: ["#6366F1", "#818CF8"], // maps to Utilities
  Other: ["#64748B", "#94A3B8"], // maps to Other Expense
};

/**
 * Get gradient colors for a category with fallback.
 * @param category - Category name
 * @returns Tuple of [darkColor, lightColor]
 */
export function getCategoryGradient(
  category: string
): readonly [string, string] {
  return CATEGORY_GRADIENTS[category] || ["#64748B", "#94A3B8"];
}

/**
 * Get primary (dark) color for a category.
 */
export function getCategoryColor(category: string): string {
  return getCategoryGradient(category)[0];
}

/**
 * Get light variant color for a category.
 */
export function getCategoryLightColor(category: string): string {
  return getCategoryGradient(category)[1];
}
