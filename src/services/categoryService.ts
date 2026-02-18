/**
 * Category Service
 * Manages predefined transaction categories for expense tracking
 */

import type { TransactionCategory } from '../types/transaction'

/**
 * Predefined transaction categories
 */
export const CATEGORIES: TransactionCategory[] = [
  // Income categories
  {
    id: 'income-salary',
    name: 'Salary',
    group: 'income',
    color: '#10b981',
    icon: '💰',
  },
  {
    id: 'income-freelance',
    name: 'Freelance',
    group: 'income',
    color: '#059669',
    icon: '💼',
  },
  {
    id: 'income-investment',
    name: 'Investment',
    group: 'income',
    color: '#047857',
    icon: '📈',
  },
  {
    id: 'income-other',
    name: 'Other Income',
    group: 'income',
    color: '#065f46',
    icon: '💵',
  },

  // Housing & Home categories
  {
    id: 'home-rent',
    name: 'Rent',
    group: 'home',
    color: '#3b82f6',
    icon: '🏠',
  },
  {
    id: 'home-mortgage',
    name: 'Mortgage',
    group: 'home',
    color: '#2563eb',
    icon: '🏡',
  },
  {
    id: 'home-maintenance',
    name: 'Home Maintenance',
    group: 'home',
    color: '#1d4ed8',
    icon: '🔧',
  },
  {
    id: 'home-furnishing',
    name: 'Furnishing',
    group: 'home',
    color: '#1e40af',
    icon: '🛋️',
  },

  // Transportation categories
  {
    id: 'transport-fuel',
    name: 'Fuel',
    group: 'transportation',
    color: '#f59e0b',
    icon: '⛽',
  },
  {
    id: 'transport-public',
    name: 'Public Transport',
    group: 'transportation',
    color: '#d97706',
    icon: '🚇',
  },
  {
    id: 'transport-car',
    name: 'Car Payment',
    group: 'transportation',
    color: '#b45309',
    icon: '🚗',
  },
  {
    id: 'transport-maintenance',
    name: 'Car Maintenance',
    group: 'transportation',
    color: '#92400e',
    icon: '🔧',
  },
  {
    id: 'transport-parking',
    name: 'Parking',
    group: 'transportation',
    color: '#78350f',
    icon: '🅿️',
  },

  // Food & Dining categories
  {
    id: 'food-groceries',
    name: 'Groceries',
    group: 'food',
    color: '#84cc16',
    icon: '🛒',
  },
  {
    id: 'food-dining',
    name: 'Dining Out',
    group: 'food',
    color: '#65a30d',
    icon: '🍽️',
  },
  {
    id: 'food-coffee',
    name: 'Coffee & Snacks',
    group: 'food',
    color: '#4d7c0f',
    icon: '☕',
  },

  // Healthcare categories
  {
    id: 'health-insurance',
    name: 'Health Insurance',
    group: 'healthcare',
    color: '#ef4444',
    icon: '🏥',
  },
  {
    id: 'health-doctor',
    name: 'Doctor Visits',
    group: 'healthcare',
    color: '#dc2626',
    icon: '👨‍⚕️',
  },
  {
    id: 'health-pharmacy',
    name: 'Pharmacy',
    group: 'healthcare',
    color: '#b91c1c',
    icon: '💊',
  },
  {
    id: 'health-fitness',
    name: 'Fitness',
    group: 'healthcare',
    color: '#991b1b',
    icon: '💪',
  },

  // Entertainment categories
  {
    id: 'entertainment-streaming',
    name: 'Streaming Services',
    group: 'entertainment',
    color: '#ec4899',
    icon: '📺',
  },
  {
    id: 'entertainment-movies',
    name: 'Movies & Events',
    group: 'entertainment',
    color: '#db2777',
    icon: '🎬',
  },
  {
    id: 'entertainment-hobbies',
    name: 'Hobbies',
    group: 'entertainment',
    color: '#be185d',
    icon: '🎨',
  },
  {
    id: 'entertainment-travel',
    name: 'Travel',
    group: 'entertainment',
    color: '#9f1239',
    icon: '✈️',
  },

  // Utilities categories
  {
    id: 'utilities-electricity',
    name: 'Electricity',
    group: 'utilities',
    color: '#8b5cf6',
    icon: '⚡',
  },
  {
    id: 'utilities-water',
    name: 'Water',
    group: 'utilities',
    color: '#7c3aed',
    icon: '💧',
  },
  {
    id: 'utilities-internet',
    name: 'Internet',
    group: 'utilities',
    color: '#6d28d9',
    icon: '🌐',
  },
  {
    id: 'utilities-phone',
    name: 'Phone',
    group: 'utilities',
    color: '#5b21b6',
    icon: '📱',
  },
  {
    id: 'utilities-gas',
    name: 'Gas',
    group: 'utilities',
    color: '#4c1d95',
    icon: '🔥',
  },

  // Personal categories
  {
    id: 'personal-clothing',
    name: 'Clothing',
    group: 'personal',
    color: '#06b6d4',
    icon: '👔',
  },
  {
    id: 'personal-beauty',
    name: 'Beauty & Care',
    group: 'personal',
    color: '#0891b2',
    icon: '💄',
  },
  {
    id: 'personal-education',
    name: 'Education',
    group: 'personal',
    color: '#0e7490',
    icon: '📚',
  },
  {
    id: 'personal-gifts',
    name: 'Gifts',
    group: 'personal',
    color: '#155e75',
    icon: '🎁',
  },

  // Other category
  {
    id: 'other',
    name: 'Other',
    group: 'other',
    color: '#6b7280',
    icon: '📌',
  },
]

/**
 * Category service for managing transaction categories
 */
export const categoryService = {
  /**
   * Get all available categories
   */
  getAllCategories(): TransactionCategory[] {
    return CATEGORIES
  },

  /**
   * Get categories by group
   */
  getCategoriesByGroup(
    group: TransactionCategory['group']
  ): TransactionCategory[] {
    return CATEGORIES.filter((cat) => cat.group === group)
  },

  /**
   * Get category by ID
   */
  getCategoryById(id: string): TransactionCategory | undefined {
    return CATEGORIES.find((cat) => cat.id === id)
  },

  /**
   * Get income categories
   */
  getIncomeCategories(): TransactionCategory[] {
    return this.getCategoriesByGroup('income')
  },

  /**
   * Get expense categories (all non-income categories)
   */
  getExpenseCategories(): TransactionCategory[] {
    return CATEGORIES.filter((cat) => cat.group !== 'income')
  },

  /**
   * Get category name by ID
   */
  getCategoryName(id: string): string {
    const category = this.getCategoryById(id)
    return category ? category.name : 'Uncategorized'
  },

  /**
   * Get category color by ID
   */
  getCategoryColor(id: string): string {
    const category = this.getCategoryById(id)
    return category ? category.color : '#6b7280'
  },

  /**
   * Get category icon by ID
   */
  getCategoryIcon(id: string): string {
    const category = this.getCategoryById(id)
    return category ? category.icon || '📌' : '📌'
  },
}
