import './styles/main.scss';
import { Book } from './models/Book';
import { User } from './models/User';
import { Library } from './services/Library';
import { Storage } from './services/Storage';
import { StorageError } from './utils/errors';
import { showModal } from './ui/components/Modal';
import { renderLibrary, type ViewState } from './ui/render';
import { Validation } from './utils/validators';

interface SavedState {
  books: SavedBook[];
  users: SavedUser[];
}

interface SavedBook {
  title: string;
  author: string;
  year: number;
  borrowed: boolean;
}

interface SavedUser {
  id: string;
  name: string;
  email: string;
  borrowedBookIds: string[];
}

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Елемент #app не знайдено');

const storage = new Storage('library-management-state');
const savedState = storage.load<SavedState>({ books: [], users: [] });
const books = new Library<Book>((book) => book.getId());
const users = new Library<User>((user) => user.getId());
const pageSize = 5;
const viewState: ViewState = { bookPage: 1, userPage: 1, bookSearch: '', userSearch: '' };

for (const book of savedState.books) books.add(new Book(book.title, book.author, book.year, book.borrowed));
for (const user of savedState.users) users.add(new User(user.name, user.email, user.id, user.borrowedBookIds));

app.innerHTML = `
  <main class="app-shell">
    <header class="topbar">
      <div class="brand-lockup"><span class="brand-mark">A/</span><div><p class="eyebrow">ARCHIVE DESK · 02</p><h1>Кураторська бібліотека</h1></div></div>
      <div class="status-chip"><span class="status-dot"></span>локальний архів</div>
    </header>
    <section class="intro-grid" aria-label="Огляд бібліотеки">
      <div><p class="kicker">Колекція / сьогодні</p><h2>Зберігайте знання.<br><em>Керуйте доступом.</em></h2><p class="intro-copy">Єдиний простір для каталогу книг, читачів та історії позик.</p></div>
      <div class="metric-strip"><div><strong id="metric-books">0</strong><span>книг у фонді</span></div><div><strong id="metric-users">0</strong><span>активних читачів</span></div><div><strong id="metric-borrowed">0</strong><span>на руках</span></div></div>
    </section>
    <section class="entry-grid" aria-label="Додати записи">
      <div class="panel form-panel"><div class="section-label"><span>01</span><h2>Нова книга</h2></div><form id="book-form" class="row g-3"><div class="col-12"><label class="form-label" for="book-title">Назва книги</label><input class="form-control" id="book-title" placeholder="Наприклад, The Design of Everyday Things" required></div><div class="col-md-7"><label class="form-label" for="book-author">Автор</label><input class="form-control" id="book-author" placeholder="Ім'я автора" required></div><div class="col-md-5"><label class="form-label" for="book-year">Рік</label><input class="form-control" id="book-year" type="number" min="1000" max="2100" placeholder="2024" required></div><div class="col-12"><button class="btn btn-primary" type="submit">Додати до фонду <span>↗</span></button></div></form></div>
      <div class="panel form-panel form-panel-dark"><div class="section-label"><span>02</span><h2>Новий читач</h2></div><form id="user-form" class="row g-3"><div class="col-md-5"><label class="form-label" for="user-id">ID читача</label><input class="form-control" id="user-id" type="text" inputmode="numeric" pattern="[0-9]+" placeholder="12345" required></div><div class="col-md-7"><label class="form-label" for="user-name">Ім'я</label><input class="form-control" id="user-name" placeholder="Ім'я та прізвище" required></div><div class="col-12"><label class="form-label" for="user-email">Email</label><input class="form-control" id="user-email" type="email" placeholder="reader@archive.com" required></div><div class="col-12"><button class="btn btn-light" type="submit">Зареєструвати читача <span>↗</span></button></div></form></div>
    </section>
    <section class="panel collection-panel" aria-labelledby="books-heading"><div class="section-heading"><div><p class="kicker">Каталог / 01</p><h2 id="books-heading">Фонд видань</h2></div><span class="count-badge" id="book-count"></span></div><label class="visually-hidden" for="book-search">Пошук книг</label><div class="search-wrap"><span>⌕</span><input class="form-control" id="book-search" placeholder="Шукати за назвою або автором"></div><div id="books-list" class="stack-list"></div><nav class="pagination-wrap" aria-label="Пагінація книг" id="book-pagination"></nav></section>
    <section class="panel collection-panel" aria-labelledby="users-heading"><div class="section-heading"><div><p class="kicker">Спільнота / 02</p><h2 id="users-heading">Читачі архіву</h2></div><span class="count-badge" id="user-count"></span></div><label class="visually-hidden" for="user-search">Пошук користувачів</label><div class="search-wrap"><span>⌕</span><input class="form-control" id="user-search" placeholder="Шукати за ім'ям або email"></div><div id="users-list" class="stack-list"></div><nav class="pagination-wrap" aria-label="Пагінація користувачів" id="user-pagination"></nav></section>
    <footer class="app-footer"><span>ARCHIVE DESK / LIBRARY MANAGEMENT</span><span>Дані зберігаються локально</span></footer>
    <div class="toast-stack" id="toast-stack" aria-live="polite"></div>
  </main>`;

function notify(message: string): void {
  const stack = document.querySelector<HTMLElement>('#toast-stack');
  if (!stack) return;
  const toast = document.createElement('div');
  toast.className = 'toast-custom';
  toast.textContent = message;
  stack.append(toast);
  window.setTimeout(() => toast.remove(), 4000);
}

function persist(): void {
  try {
    storage.save({
      books: books.getAll().map((book) => book.toJSON()),
      users: users.getAll().map((user) => user.toJSON()),
    });
  } catch (error) {
    const message = error instanceof StorageError ? error.message : 'Невідома помилка збереження.';
    showModal({ title: 'Помилка архіву', message, type: 'error' });
  }
}

function getInput(id: string): HTMLInputElement {
  return document.querySelector<HTMLInputElement>(id) as HTMLInputElement;
}

function render(): void {
  renderLibrary({ books, users, state: viewState, pageSize, persist, notify, render });
  document.querySelector<HTMLElement>('#metric-books')!.textContent = String(books.size);
  document.querySelector<HTMLElement>('#metric-users')!.textContent = String(users.size);
  document.querySelector<HTMLElement>('#metric-borrowed')!.textContent = String(
    books.getAll().filter((book) => book.isBorrowed()).length,
  );
}

document.querySelector<HTMLInputElement>('#book-search')?.addEventListener('input', (event) => {
  viewState.bookSearch = (event.target as HTMLInputElement).value;
  viewState.bookPage = 1;
  render();
});

document.querySelector<HTMLInputElement>('#user-search')?.addEventListener('input', (event) => {
  viewState.userSearch = (event.target as HTMLInputElement).value;
  viewState.userPage = 1;
  render();
});

document.querySelector<HTMLFormElement>('#book-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = {
    title: getInput('#book-title').value,
    author: getInput('#book-author').value,
    year: getInput('#book-year').value,
  };
  const result = Validation.validateBookForm(data);
  if (!result.isValid)
    return showModal({ title: 'Помилка валідації', message: result.errors.join('\n'), type: 'error' });
  const book = new Book(data.title.trim(), data.author.trim(), Number(data.year));
  if (books.findById(book.getId()))
    return showModal({ title: 'Книга вже існує', message: 'Книга з такими даними вже є в каталозі.', type: 'info' });
  books.add(book);
  persist();
  getInput('#book-title').form?.reset();
  notify('Книгу додано до каталогу.');
  render();
});

document.querySelector<HTMLFormElement>('#user-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = {
    id: getInput('#user-id').value,
    name: getInput('#user-name').value,
    email: getInput('#user-email').value,
  };
  const result = Validation.validateUserForm(data);
  if (!result.isValid)
    return showModal({ title: 'Помилка валідації', message: result.errors.join('\n'), type: 'error' });
  const user = new User(data.name.trim(), data.email.trim(), data.id.trim());
  if (users.findById(user.getId()))
    return showModal({
      title: 'Користувач вже існує',
      message: 'Користувач із таким email вже зареєстрований.',
      type: 'info',
    });
  users.add(user);
  persist();
  getInput('#user-name').form?.reset();
  notify('Користувача додано.');
  render();
});

render();
