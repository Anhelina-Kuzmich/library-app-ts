type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

export function createButton(
  text: string,
  variant: ButtonVariant = 'primary',
  type: 'button' | 'submit' = 'button',
  onClick?: () => void,
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = type;
  btn.className = `btn btn-${variant}`;
  btn.textContent = text;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}
