import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from '../Select'

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  describe('Rendering', () => {
    it('renders a select element', () => {
      render(<Select options={options} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders with label when provided', () => {
      render(<Select label="Select Option" options={options} />)
      expect(screen.getByLabelText('Select Option')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<Select options={options} placeholder="Choose an option" />)
      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.options[0].text).toBe('Choose an option')
    })

    it('renders all options', () => {
      render(<Select options={options} />)
      const select = screen.getByRole('combobox') as HTMLSelectElement
      // +1 for empty placeholder option
      expect(select.options).toHaveLength(4)
    })

    it('renders with error message', () => {
      render(<Select options={options} error="Invalid selection" />)
      expect(screen.getByText('Invalid selection')).toBeInTheDocument()
    })

    it('renders with helper text', () => {
      render(<Select options={options} helperText="Choose wisely" />)
      expect(screen.getByText('Choose wisely')).toBeInTheDocument()
    })

    it('renders as required when specified', () => {
      render(<Select label="Required Select" options={options} required />)
      const select = screen.getByRole('combobox')
      expect(select).toBeRequired()
    })

    it('renders as disabled when specified', () => {
      render(<Select options={options} disabled />)
      const select = screen.getByRole('combobox')
      expect(select).toBeDisabled()
    })

    it('applies error styling when error is present', () => {
      render(<Select options={options} error="Invalid" />)
      const select = screen.getByRole('combobox')
      expect(select).toHaveClass('select-error')
    })
  })

  describe('Option Rendering', () => {
    it('renders options with correct values and labels', () => {
      render(<Select options={options} />)
      const select = screen.getByRole('combobox') as HTMLSelectElement

      // Skip placeholder option at index 0
      expect(select.options[1].value).toBe('option1')
      expect(select.options[1].text).toBe('Option 1')
      expect(select.options[2].value).toBe('option2')
      expect(select.options[2].text).toBe('Option 2')
    })

    it('renders disabled options when specified', () => {
      const optionsWithDisabled = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
        { value: 'option3', label: 'Option 3' },
      ]

      render(<Select options={optionsWithDisabled} />)
      const select = screen.getByRole('combobox') as HTMLSelectElement

      expect(select.options[1].disabled).toBe(false)
      expect(select.options[2].disabled).toBe(true)
      expect(select.options[3].disabled).toBe(false)
    })

    it('renders placeholder as disabled option', () => {
      render(<Select options={options} placeholder="Select..." />)
      const select = screen.getByRole('combobox') as HTMLSelectElement

      expect(select.options[0].disabled).toBe(true)
      expect(select.options[0].value).toBe('')
    })
  })

  describe('Interaction', () => {
    it('calls onChange handler when selection changes', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Select options={options} onChange={handleChange} />)
      const select = screen.getByRole('combobox')

      await user.selectOptions(select, 'option2')

      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('updates selected value when changed', async () => {
      const user = userEvent.setup()

      render(<Select options={options} />)
      const select = screen.getByRole('combobox') as HTMLSelectElement

      await user.selectOptions(select, 'option2')

      expect(select.value).toBe('option2')
    })

    it('does not allow selection when disabled', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Select options={options} disabled onChange={handleChange} />)
      const select = screen.getByRole('combobox')

      await user.selectOptions(select, 'option2')

      expect(handleChange).not.toHaveBeenCalled()
    })

    it('calls onBlur handler when focus is lost', async () => {
      const handleBlur = vi.fn()
      const user = userEvent.setup()

      render(<Select options={options} onBlur={handleBlur} />)
      const select = screen.getByRole('combobox')

      await user.click(select)
      await user.tab()

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('calls onFocus handler when focused', async () => {
      const handleFocus = vi.fn()
      const user = userEvent.setup()

      render(<Select options={options} onFocus={handleFocus} />)
      const select = screen.getByRole('combobox')

      await user.click(select)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })
  })

  describe('Controlled Component', () => {
    it('works as controlled select', () => {
      const { rerender } = render(<Select options={options} value="option1" onChange={vi.fn()} />)
      const select = screen.getByRole('combobox') as HTMLSelectElement

      expect(select.value).toBe('option1')

      rerender(<Select options={options} value="option3" onChange={vi.fn()} />)

      expect(select.value).toBe('option3')
    })

    it('respects empty value', () => {
      render(<Select options={options} value="" onChange={vi.fn()} />)
      const select = screen.getByRole('combobox') as HTMLSelectElement

      expect(select.value).toBe('')
    })
  })

  describe('Accessibility', () => {
    it('associates label with select using htmlFor', () => {
      render(<Select id="status-select" label="Status" options={options} />)
      const label = screen.getByText('Status')
      const select = screen.getByRole('combobox')

      expect(label).toHaveAttribute('for', 'status-select')
      expect(select).toHaveAttribute('id', 'status-select')
    })

    it('generates id when not provided', () => {
      render(<Select label="Status" options={options} />)
      const select= screen.getByRole('combobox')
      expect(select).toHaveAttribute('id')
    })

    it('associates error message with select using aria-describedby', () => {
      render(<Select id="status-select" options={options} error="Invalid selection" />)
      const select = screen.getByRole('combobox')
      const errorId = select.getAttribute('aria-describedby')

      expect(errorId).toBeTruthy()
      expect(screen.getByText('Invalid selection')).toHaveAttribute('id', errorId!)
    })

    it('associates helper text with select using aria-describedby', () => {
      render(<Select id="status-select" options={options} helperText="Helper text" />)
      const select = screen.getByRole('combobox')
      const helperId = select.getAttribute('aria-describedby')

      expect(helperId).toBeTruthy()
      expect(screen.getByText('Helper text')).toHaveAttribute('id', helperId!)
    })

    it('sets aria-invalid when error is present', () => {
      render(<Select options={options} error="Invalid" />)
      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('aria-invalid', 'true')
    })

    it('shows required indicator in label', () => {
      render(<Select label="Status" options={options} required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('Custom Props', () => {
    it('applies custom className to container', () => {
      const { container } = render(<Select options={options} className="custom-class" />)
      const selectContainer = container.firstChild
      expect(selectContainer).toHaveClass('custom-class')
    })

    it('forwards additional props to select element', () => {
      render(<Select options={options} data-testid="custom-select" />)
      const select = screen.getByTestId('custom-select')
      expect(select).toBeInTheDocument()
    })
  })
})
