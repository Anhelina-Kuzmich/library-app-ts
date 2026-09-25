import { createButton } from './Button';

export interface FieldConfig<T> {
  name: keyof T;
  label: string;
  type: 'text' | 'number';
}

export interface FormBuilderOptions<T> {
  fields: FieldConfig<T>[];
  submitLabel: string;
  validate: (data: T) => { isValid: boolean; errors: string[] };
  onValid: (data: T) => void;
}

export function buildForm<T extends Record<string, string>>(options: FormBuilderOptions<T>): HTMLFormElement {
  const form = document.createElement('form');
  form.className = 'card p-3 mb-4';

  const inputs = new Map<keyof T, HTMLInputElement>();

  options.fields.forEach((field) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-2';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = field.label;

    const input = document.createElement('input');
    input.type = field.type;
    input.className = 'form-control';
    input.name = String(field.name);

    inputs.set(field.name, input);
    wrapper.append(label, input);
    form.append(wrapper);
  });

  const submitBtn = createButton(options.submitLabel, 'primary', 'submit');
  form.append(submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {} as T;
    inputs.forEach((input, key) => {
      data[key] = input.value as T[typeof key];
    });

    const result = options.validate(data);
    if (!result.isValid) {
      import('./Modal').then(({ showModal }) =>
        showModal({ title: 'Помилка валідації', message: result.errors.join('\n'), type: 'error' }),
      );
      return;
    }

    options.onValid(data);
    form.reset();
  });

  return form;
}
