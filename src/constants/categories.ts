import type { TransactionCategory } from '@/types/transaction'
import { CATEGORIES, categoryService } from '@/services/categoryService'

/**
 * Predefined transaction categories organized by groups
 * Re-exported from categoryService for consistency
 */
export const TRANSACTION_CATEGORIES: TransactionCategory[] = CATEGORIES

/**
 * Category groups with labels
 */
export const CATEGORY_GROUPS = {
  home: { label: 'Home', icon: '🏠' },
  transportation: { label: 'Transportation', icon: '🚗' },
  food: { label: 'Food & Dining', icon: '🍽️' },
  healthcare: { label: 'Healthcare', icon: '⚕️' },
  entertainment: { label: 'Entertainment', icon: '🎬' },
  utilities: { label: 'Utilities & Bills', icon: '💡' },
  personal: { label: 'Personal', icon: '👤' },
  income: { label: 'Income', icon: '💰' },
  other: { label: 'Other', icon: '📋' },
} as const

/**
 * Get category by ID
 */
export function getCategoryById(id: string): TransactionCategory | undefined {
  return categoryService.getCategoryById(id)
}

/**
 * Get categories by group
 */
export function getCategoriesByGroup(group: string): TransactionCategory[] {
  return TRANSACTION_CATEGORIES.filter((cat) => cat.group === group)
}

/**
 * Get suggested categories based on description
 */
export function suggestCategories(description: string): TransactionCategory[] {
  const desc = description.toLowerCase()
  const suggestions: TransactionCategory[] = []

  const keywords: Record<string, string[]> = {
    'home-rent': ['rent', 'lease'],
    'home-mortgage': ['mortgage'],
    'food-groceries': [
      'grocery',
      'groceries',
      'supermarket',
      'walmart',
      'target',
      'costco',
    ],
    'utilities-electricity': ['electric', 'power', 'electricity'],
    'utilities-water': ['water'],
    'utilities-internet': ['internet', 'wifi', 'broadband'],
    'utilities-phone': ['phone', 'mobile', 'verizon', 'att', 't-mobile'],
    'utilities-gas': ['utility', 'utilities', 'bill'],
    'transport-fuel': ['gas', 'fuel', 'shell', 'chevron', 'exxon'],
    'transport-car': ['car payment', 'auto loan'],
    'transport-public': ['subway', 'train', 'bus', 'metro'],
    'transport-parking': ['parking'],
    'food-dining': ['restaurant', 'dinner', 'lunch', 'breakfast', 'food'],
    'food-coffee': ['coffee', 'starbucks', 'cafe'],
    'health-doctor': ['doctor', 'hospital', 'clinic', 'medical'],
    'health-pharmacy': ['pharmacy', 'cvs', 'walgreens', 'prescription'],
    'entertainment-streaming': [
      'netflix',
      'spotify',
      'hulu',
      'disney',
      'subscription',
    ],
    'entertainment-movies': ['movie', 'theater', 'cinema'],
    'entertainment-travel': ['travel', 'flight', 'hotel', 'vacation'],
    'personal-clothing': ['clothing', 'clothes', 'fashion'],
    'personal-education': ['education', 'school', 'tuition', 'course'],
    'income-salary': ['salary', 'paycheck', 'wages'],
    'income-freelance': ['freelance', 'gig', 'contract'],
    other: ['misc', 'miscellaneous'],
  }

  for (const [categoryId, terms] of Object.entries(keywords)) {
    if (terms.some((term) => desc.includes(term))) {
      const category = getCategoryById(categoryId)
      if (category) {
        suggestions.push(category)
      }
    }
  }

  return suggestions.slice(0, 3) // Return top 3 suggestions
}
