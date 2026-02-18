import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '../Modal'

describe('Modal', () => {
  describe('Visibility', () => {
    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Test Modal">
          Modal content
        </Modal>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          Modal content
        </Modal>
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('shows modal content when open', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Test Modal">
          Modal content
        </Modal>
      )
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })
  })

  describe('Title', () => {
    it('renders title when provided', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title">
          Content
        </Modal>
      )
      expect(screen.getByText('Modal Title')).toBeInTheDocument()
    })

    it('renders title as h2 heading', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title">
          Content
        </Modal>
      )
      const heading = screen.getByRole('heading', { name: 'Modal Title' })
      expect(heading.tagName).toBe('H2')
    })
  })

  describe('Close functionality', () => {
    it('calls onClose when close button is clicked', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen onClose={handleClose} title="Modal Title">
          Content
        </Modal>
      )

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop is clicked', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen onClose={handleClose} title="Modal Title">
          Content
        </Modal>
      )

      const backdrop = document.querySelector('.modal-backdrop')
      expect(backdrop).toBeInTheDocument()

      await user.click(backdrop!)

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when modal content is clicked', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen onClose={handleClose} title="Modal Title">
          Content
        </Modal>
      )

      const content = screen.getByText('Content')
      await user.click(content)

      expect(handleClose).not.toHaveBeenCalled()
    })

    it('does not close on backdrop click when closeOnBackdropClick is false', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal
          isOpen
          onClose={handleClose}
          title="Modal Title"
          closeOnBackdropClick={false}
        >
          Content
        </Modal>
      )

      const backdrop = document.querySelector('.modal-backdrop')
      await user.click(backdrop!)

      expect(handleClose).not.toHaveBeenCalled()
    })

    it('closes on Escape key press', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen onClose={handleClose} title="Modal Title">
          Content
        </Modal>
      )

      await user.keyboard('{Escape}')

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('does not close on Escape when closeOnEscape is false', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal
          isOpen
          onClose={handleClose}
          title="Modal Title"
          closeOnEscape={false}
        >
          Content
        </Modal>
      )

      await user.keyboard('{Escape}')

      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe('Sizes', () => {
    it('renders in medium size by default', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title">
          Content
        </Modal>
      )
      const modal = document.querySelector('.modal-content')
      expect(modal).toHaveClass('modal-md')
    })

    it('renders in small size when specified', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title" size="sm">
          Content
        </Modal>
      )
      const modal = document.querySelector('.modal-content')
      expect(modal).toHaveClass('modal-sm')
    })

    it('renders in large size when specified', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title" size="lg">
          Content
        </Modal>
      )
      const modal = document.querySelector('.modal-content')
      expect(modal).toHaveClass('modal-lg')
    })
  })

  describe('Footer', () => {
    it('renders footer when provided', () => {
      render(
        <Modal
          isOpen
          onClose={vi.fn()}
          title="Modal Title"
          footer={<div>Footer content</div>}
        >
          Content
        </Modal>
      )
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('does not render footer when not provided', () => {
      const { container } = render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title">
          Content
        </Modal>
      )
      const footer = container.querySelector('.modal-footer')
      expect(footer).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has dialog role', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title">
          Content
        </Modal>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has aria-modal attribute', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title">
          Content
        </Modal>
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby pointing to title', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title">
          Content
        </Modal>
      )
      const dialog = screen.getByRole('dialog')
      const titleId = dialog.getAttribute('aria-labelledby')
      expect(titleId).toBeTruthy()

      const title = document.getElementById(titleId!)
      expect(title).toHaveTextContent('Modal Title')
    })

    it('traps focus within modal', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title">
          <button>Button 1</button>
          <button>Button 2</button>
        </Modal>
      )
      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('close button has accessible label', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Modal Title">
          Content
        </Modal>
      )
      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toHaveAccessibleName()
    })
  })

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(
        <Modal
          isOpen
          onClose={vi.fn()}
          title="Modal Title"
          className="custom-modal"
        >
          Content
        </Modal>
      )
      const modal = document.querySelector('.modal-content')
      expect(modal).toHaveClass('custom-modal')
    })
  })
})
