import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Dialog({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} className="detail-dialog" onCancel={close} onClose={close} onClick={event => { if (event.target === event.currentTarget) close() }} aria-labelledby="dialog-title"><button className="dialog-close icon-button" onClick={close} aria-label="Close dialog"><X /></button><h2 id="dialog-title">{title}</h2>{children}</dialog>
}
