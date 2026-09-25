import { Book } from '../../models/Book';
import { Validation } from '../../utils/validators';
import { buildForm } from './FormBuilder';
import { showModal } from './Modal';

export function renderBookForm(container: HTMLElement, onSubmit: (book: Book) => void): void {
  const form = document.createElement('form');
  form.className = 'card p-3 mb-4';

  const titleInput = createInput('title', 'Назва книги', 'text');
  const authorInput = createInput('author', 'Автор', 'text');
  const yearInput = createInput('year', 'Рік видання', 'text');

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary mt-2';
  submitBtn.textContent = 'Додати книгу';

  form.append(titleInput.wrapper, authorInput.wrapper, yearInput.wrapper, submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      title: titleInput.input.value,
      author: authorInput.input.value,
      year: yearInput.input.value,
    };

    const result = Validation.validateBookForm(data);
    if (!result.isValid) {
      showModal({ title: 'Помилка валідації', message: result.errors.join('\n'), type: 'error' });
      return;
    }

    onSubmit(new Book(data.title, data.author, Number(data.year)));
    form.reset();
  });

  container.append(form);
}

function createInput(name: string, label: string, type: string): { wrapper: HTMLElement; input: HTMLInputElement } {
  const wrapper = document.createElement('div');
  wrapper.className = 'mb-2';

  const labelEl = document.createElement('label');
  labelEl.className = 'form-label';
  labelEl.textContent = label;
  labelEl.htmlFor = name;

  const input = document.createElement('input');
  input.type = type;
  input.id = name;
  input.name = name;
  input.className = 'form-control';

  wrapper.append(labelEl, input);
  return { wrapper, input };
}

interface BookFormData extends Record<string, string> {
  title: string;
  author: string;
  year: string;
}

export function renderBookFormBuilder(container: HTMLElement, onSubmit: (book: Book) => void): void {
  const form = buildForm<BookFormData>({
    fields: [
      { name: 'title', label: 'Назва книги', type: 'text' },
      { name: 'author', label: 'Автор', type: 'text' },
      { name: 'year', label: 'Рік видання', type: 'text' },
    ],
    submitLabel: 'Додати книгу',
    validate: Validation.validateBookForm,
    onValid: (data) => onSubmit(new Book(data.title, data.author, Number(data.year))),
  });

  container.append(form);
}
