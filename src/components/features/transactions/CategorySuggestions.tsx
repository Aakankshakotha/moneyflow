import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Select } from '@/components/common'
import { TRANSACTION_CATEGORIES, CATEGORY_GROUPS } from '@/constants/categories'

interface CategorySuggestionsProps {
  suggestions: string[]
  selectedCategory: string
  onSelect: (catId: string) => void
}

const groupedCategories = Object.entries(CATEGORY_GROUPS).map(
  ([groupKey, groupInfo]) => ({
    group: groupKey,
    label: `${groupInfo.icon} ${groupInfo.label}`,
    categories: TRANSACTION_CATEGORIES.filter((cat) => cat.group === groupKey),
  })
)

const categorySelectOptions = groupedCategories.flatMap((group) => [
  { value: `__group_${group.group}`, label: group.label, disabled: true },
  ...group.categories.map((cat) => ({ value: cat.id, label: `  ${cat.name}` })),
])

export const CategorySuggestions: React.FC<CategorySuggestionsProps> = ({
  suggestions,
  selectedCategory,
  onSelect,
}) => (
  <>
    {suggestions.length > 0 && (
      <Box
        sx={{
          mt: '-0.5rem',
          p: '0.75rem',
          backgroundColor: 'background.default',
          borderRadius: '0.375rem',
        }}
      >
        <Typography
          component="label"
          sx={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: '0.5rem',
          }}
        >
          Suggested:
        </Typography>
        <Box sx={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {suggestions.slice(0, 3).map((catId) => {
            const cat = TRANSACTION_CATEGORIES.find((c) => c.id === catId)
            if (!cat) return null
            return (
              <Box
                key={catId}
                component="button"
                type="button"
                onClick={() => onSelect(catId)}
                sx={{
                  p: '0.375rem 0.75rem',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.8125rem',
                  fontWeight: selectedCategory === catId ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor:
                    selectedCategory === catId ? cat.color : `${cat.color}20`,
                  color:
                    selectedCategory === catId ? 'common.white' : cat.color,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: 2,
                  },
                }}
              >
                {cat.name}
              </Box>
            )
          })}
        </Box>
      </Box>
    )}

    <Box sx={{ mt: '-0.5rem' }}>
      <Select
        label="Category (Optional)"
        value={selectedCategory}
        onChange={(e) => onSelect(e.target.value)}
        options={categorySelectOptions}
        placeholder="Select a category"
      />
    </Box>
  </>
)
