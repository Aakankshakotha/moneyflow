import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  describe('Rendering', () => {
    it('renders an input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with label when provided', () => {
      render(<Input label="Email Address" />)
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter email" />)
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
    })

    it('renders with error message', () => {
      render(<Input error="Invalid email" />)
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })

    it('renders with helper text', () => {
      render(<Input helperText="We'll never share your email" />)
      expect(
        screen.getByText("We'll never share your email")
      ).toBeInTheDocument()
    })

    it('renders as required when specified', () => {
      render(<Input label="Email" required />)
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })

    it('renders as disabled when specified', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('applies error styling when error is present', () => {
      render(<Input error="Invalid" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('input-error')
    })
  })

  describe('Input Types', () => {
    it('renders as text input by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders as email input when specified', () => {
      render(<Input type="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders as password input when specified', () => {
      render(<Input type="password" />)
      // Password inputs don't have a role, find by placeholder or test id
      const container = render(
        <Input type="password" data-testid="password-input" />
      )
      const input = container.getByTestId('password-input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders as number input when specified', () => {
      render(<Input type="number" />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('renders as date input when specified', () => {
      const { container } = render(<Input type="date" />)
      const input = container.querySelector('input[type="date"]')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('calls onChange handler when value changes', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'hello')

      expect(handleChange).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalledTimes(5) // Once per character
    })

    it('calls onBlur handler when input loses focus', async () => {
      const handleBlur = vi.fn()
      const user = userEvent.setup()

      render(<Input onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')

      await user.click(input)
      await user.tab()

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('calls onFocus handler when input gains focus', async () => {
      const handleFocus = vi.fn()
      const user = userEvent.setup()

      render(<Input onFocus={handleFocus} />)
      const input = screen.getByRole('textbox')

      await user.click(input)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('updates value when typing', async () => {
      const user = userEvent.setup()

      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      await user.type(input, 'test value')

      expect(input.value).toBe('test value')
    })

    it('does not allow typing when disabled', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Input disabled onChange={handleChange} />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'test')

      expect(handleChange).not.toHaveBeenCalled()
    })

    it('respects maxLength prop', async () => {
      const user = userEvent.setup()

      render(<Input maxLength={5} />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      await user.type(input, 'toolong')

      expect(input.value).toBe('toolo')
    })
  })

  describe('Controlled Component', () => {
    it('works as controlled input', async () => {
      const { rerender } = render(<Input value="initial" onChange={vi.fn()} />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      expect(input.value).toBe('initial')

      rerender(<Input value="updated" onChange={vi.fn()} />)

      expect(input.value).toBe('updated')
    })
  })

  describe('Accessibility', () => {
    it('associates label with input using htmlFor', () => {
      render(<Input id="email-input" label="Email" />)
      const label = screen.getByText('Email')
      const input = screen.getByRole('textbox')

      expect(label).toHaveAttribute('for', 'email-input')
      expect(input).toHaveAttribute('id', 'email-input')
    })

    it('generates id when not provided', () => {
      render(<Input label="Email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id')
    })

    it('associates error message with input using aria-describedby', () => {
      render(<Input id="email-input" error="Invalid email" />)
      const input = screen.getByRole('textbox')
      const errorId = input.getAttribute('aria-describedby')

      expect(errorId).toBeTruthy()
      expect(screen.getByText('Invalid email')).toHaveAttribute('id', errorId!)
    })

    it('associates helper text with input using aria-describedby', () => {
      render(<Input id="email-input" helperText="Helper text" />)
      const input = screen.getByRole('textbox')
      const helperId = input.getAttribute('aria-describedby')

      expect(helperId).toBeTruthy()
      expect(screen.getByText('Helper text')).toHaveAttribute('id', helperId!)
    })

    it('sets aria-invalid when error is present', () => {
      render(<Input error="Invalid" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('does not set aria-invalid when no error', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveAttribute('aria-invalid')
    })

    it('shows required indicator in label', () => {
      render(<Input label="Email" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('Custom Props', () => {
    it('applies custom className to container', () => {
      const { container } = render(<Input className="custom-class" />)
      const inputContainer = container.firstChild
      expect(inputContainer).toHaveClass('custom-class')
    })

    it('forwards additional props to input element', () => {
      render(<Input data-testid="custom-input" autoComplete="off" />)
      const input = screen.getByTestId('custom-input')
      expect(input).toHaveAttribute('autocomplete', 'off')
    })

    it('supports min and max for number inputs', () => {
      render(<Input type="number" min={0} max={100} />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '100')
    })
  })
})
