// Standard T-Shirt size options used across admin (stock management) and
// storefront (size picker) UI. Keep this list in sync in both places.
export const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;

export type TShirtSize = typeof TSHIRT_SIZES[number];

// Categories that use size-based inventory. Matches by substring (case-insensitive)
// so variants like "Custom T-Shirts" or "T-Shirts" both qualify.
const SIZED_CATEGORY_KEYWORDS = ['t-shirt', 'tshirt'];

export const isSizedCategory = (category?: string) => {
  if (!category) return false;
  const normalized = category.toLowerCase();
  return SIZED_CATEGORY_KEYWORDS.some((kw) => normalized.includes(kw));
};
