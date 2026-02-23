import type { ReactNode } from 'react'
import { useId } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}: ModalProps) {
  const titleId = useId()

  const modalClasses = ['modal-content', `modal-${size}`, className]
    .filter(Boolean)
    .join(' ')

  const maxWidth = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'

  const handleDialogClose = (
    _event: object,
    reason: 'backdropClick' | 'escapeKeyDown'
  ): void => {
    if (reason === 'backdropClick' && !closeOnBackdropClick) return
    if (reason === 'escapeKeyDown' && !closeOnEscape) return
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleDialogClose}
      aria-labelledby={titleId}
      maxWidth={maxWidth}
      fullWidth
      disableEscapeKeyDown={!closeOnEscape}
      slotProps={{ backdrop: { className: 'modal-backdrop' } }}
      PaperProps={{
        className: modalClasses,
        sx: {
          borderRadius: 2,
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--card-background)',
        },
      }}
    >
      <DialogTitle id={titleId} className="modal-header" sx={{ pr: 6 }}>
        <span className="modal-title">{title}</span>
        <IconButton
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
          sx={{ position: 'absolute', right: 10, top: 10 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent className="modal-body">{children}</DialogContent>
      {footer && (
        <DialogActions className="modal-footer">{footer}</DialogActions>
      )}
    </Dialog>
  )
}
