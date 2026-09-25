export interface ModalOptions {
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info';
  confirmLabel?: string;
  onConfirm?: () => void;
}

export function showModal(options: ModalOptions): void {
  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop-custom';
  overlay.innerHTML = `
		<div class="modal-dialog-custom" role="dialog" aria-modal="true" aria-labelledby="modal-title">
			<div class="modal-icon modal-icon-${options.type ?? 'info'}">${options.type === 'error' ? '!' : 'i'}</div>
			<h2 id="modal-title" class="h4">${options.title}</h2>
			<p class="text-secondary mb-4">${options.message}</p>
			<button class="btn btn-primary" type="button" data-modal-close>${options.confirmLabel ?? 'Зрозуміло'}</button>
		</div>`;

  const close = (): void => {
    overlay.remove();
    document.removeEventListener('keydown', onKeyDown);
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close();
  };
  overlay.querySelector<HTMLButtonElement>('[data-modal-close]')?.addEventListener('click', () => {
    options.onConfirm?.();
    close();
  });
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener('keydown', onKeyDown);
  document.body.append(overlay);
}
