import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../Card'

describe('Card', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders with title when provided', () => {
      render(<Card title="Card Title">Content</Card>)
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('renders with subtitle when provided', () => {
      render(
        <Card title="Title" subtitle="Subtitle">
          Content
        </Card>
      )
      expect(screen.getByText('Subtitle')).toBeInTheDocument()
    })

    it('renders footer when provided', () => {
      render(<Card footer={<div>Footer content</div>}>Content</Card>)
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('renders without padding when noPadding is true', () => {
      const { container } = render(<Card noPadding>Content</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('card-no-padding')
    })

    it('renders with hover effect by default', () => {
      const { container } = render(<Card>Content</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('card-hoverable')
    })

    it('renders without hover effect when hoverable is false', () => {
      const { container } = render(<Card hoverable={false}>Content</Card>)
      const card = container.firstChild
      expect(card).not.toHaveClass('card-hoverable')
    })
  })

  describe('Structure', () => {
    it('renders header section when title is provided', () => {
      const { container } = render(<Card title="Title">Content</Card>)
      const header = container.querySelector('.card-header')
      expect(header).toBeInTheDocument()
    })

    it('does not render header section when no title', () => {
      const { container } = render(<Card>Content</Card>)
      const header = container.querySelector('.card-header')
      expect(header).not.toBeInTheDocument()
    })

    it('renders body section', () => {
      const { container } = render(<Card>Content</Card>)
      const body = container.querySelector('.card-body')
      expect(body).toBeInTheDocument()
    })

    it('renders footer section when footer is provided', () => {
      const { container } = render(
        <Card footer={<div>Footer</div>}>Content</Card>
      )
      const footer = container.querySelector('.card-footer')
      expect(footer).toBeInTheDocument()
    })

    it('does not render footer section when no footer', () => {
      const { container } = render(<Card>Content</Card>)
      const footer = container.querySelector('.card-footer')
      expect(footer).not.toBeInTheDocument()
    })
  })

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>
      )
      const card = container.firstChild
      expect(card).toHaveClass('custom-class')
      expect(card).toHaveClass('card') // Base class should still be present
    })

    it('forwards additional props to container', () => {
      const { container } = render(
        <Card data-testid="custom-card">Content</Card>
      )
      const card = container.querySelector('[data-testid="custom-card"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses article element by default', () => {
      const { container } = render(<Card>Content</Card>)
      const article = container.querySelector('article')
      expect(article).toBeInTheDocument()
    })

    it('has proper heading hierarchy', () => {
      render(<Card title="Card Title">Content</Card>)
      const heading = screen.getByRole('heading', { name: 'Card Title' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H3')
    })
  })
})
