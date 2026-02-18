import type { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  title?: string
  subtitle?: string
  footer?: ReactNode
  noPadding?: boolean
  hoverable?: boolean
}

export function Card({
  children,
  title,
  subtitle,
  footer,
  noPadding = false,
  hoverable = true,
  className = '',
  ...rest
}: CardProps) {
  const classes = [
    'card',
    hoverable && 'card-hoverable',
    noPadding && 'card-no-padding',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={classes} {...rest}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </article>
  )
}
