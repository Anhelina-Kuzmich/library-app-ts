import { Book } from '../models/Book';
import { User } from '../models/User';
import { Library } from '../services/Library';
import { showModal } from './components/Modal';

export interface ViewState {
  bookPage: number;
  userPage: number;
  bookSearch: string;
  userSearch: string;
}

export interface RenderOptions {
  books: Library<Book>;
  users: Library<User>;
  state: ViewState;
  pageSize: number;
  persist: () => void;
  notify: (message: string) => void;
  render: () => void;
}

function renderPagination(
  container: HTMLElement,
  page: number,
  totalItems: number,
  pageSize: number,
  onPageChange: (nextPage: number) => void,
): void {
  container.replaceChildren();
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return;

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn btn-sm ${pageNumber === page ? 'btn-primary' : 'btn-outline-secondary'}`;
    button.textContent = String(pageNumber);
    button.setAttribute('aria-label', `Сторінка ${pageNumber}`);
    button.setAttribute('aria-current', pageNumber === page ? 'page' : 'false');
    button.addEventListener('click', () => onPageChange(pageNumber));
    container.append(button);
  }
}

export function renderLibrary({ books, users, state, pageSize, persist, notify, render }: RenderOptions): void {
  const bookList = document.querySelector<HTMLElement>('#books-list');
  const userList = document.querySelector<HTMLElement>('#users-list');
  const bookCount = document.querySelector<HTMLElement>('#book-count');
  const userCount = document.querySelector<HTMLElement>('#user-count');
  const bookPagination = document.querySelector<HTMLElement>('#book-pagination');
  const userPagination = document.querySelector<HTMLElement>('#user-pagination');
  if (!bookList || !userList || !bookCount || !userCount || !bookPagination || !userPagination) return;

  renderBooks({ books, users, state, pageSize, persist, notify, render, bookList, bookCount, bookPagination });
  renderUsers({ users, books, state, pageSize, persist, notify, render, userList, userCount, userPagination });
}

interface BookRenderOptions extends Omit<RenderOptions, 'render'> {
  render: () => void;
  bookList: HTMLElement;
  bookCount: HTMLElement;
  bookPagination: HTMLElement;
}

function renderBooks({
  books,
  users,
  state,
  pageSize,
  persist,
  notify,
  render,
  bookList,
  bookCount,
  bookPagination,
}: BookRenderOptions): void {
  const filteredBooks = books.getAll().filter((book) => {
    const query = state.bookSearch.trim().toLocaleLowerCase();
    return !query || `${book.getTitle()} ${book.getAuthor()}`.toLocaleLowerCase().includes(query);
  });
  const pageCount = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  state.bookPage = Math.min(state.bookPage, pageCount);
  const visibleBooks = filteredBooks.slice((state.bookPage - 1) * pageSize, state.bookPage * pageSize);

  bookList.replaceChildren();
  bookCount.textContent = `${filteredBooks.length}/${books.size} ${books.size === 1 ? 'книга' : 'книг'}`;
  for (const book of visibleBooks) {
    const row = document.createElement('div');
    row.className = 'list-item record-row d-flex flex-wrap justify-content-between align-items-center gap-3';
    const text = document.createElement('span');
    text.className = 'record-title';
    text.textContent = book.toString();
    row.append(text);

    const controls = document.createElement('div');
    controls.className = 'd-flex flex-wrap gap-2';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm';
    deleteButton.textContent = 'Видалити';
    deleteButton.addEventListener('click', () => {
      const owner = users.find((user) => user.getBorrowedBookIds().includes(book.getId()));
      owner?.returnBook(book.getId());
      books.remove(book);
      persist();
      notify(`Книгу «${book.getTitle()}» видалено.`);
      render();
    });
    controls.append(deleteButton);

    if (book.isBorrowed()) {
      addReturnButton(controls, book, users, persist, notify, render);
    } else if (users.size) {
      addBorrowControls(controls, book, users, persist, notify, render);
    }
    row.append(controls);
    bookList.append(row);
  }

  if (!visibleBooks.length) {
    bookList.innerHTML = `<div class="empty-state">${books.size ? 'За запитом нічого не знайдено.' : 'Книги ще не додані.'}</div>`;
  }
  renderPagination(bookPagination, state.bookPage, filteredBooks.length, pageSize, (nextPage) => {
    state.bookPage = nextPage;
    render();
  });
}

function addReturnButton(
  controls: HTMLElement,
  book: Book,
  users: Library<User>,
  persist: () => void,
  notify: (message: string) => void,
  render: () => void,
): void {
  const owner = users.find((user) => user.getBorrowedBookIds().includes(book.getId()));
  const returnButton = document.createElement('button');
  returnButton.className = 'btn btn-outline-secondary btn-sm';
  returnButton.textContent = `Повернути${owner ? ` (${owner.getName()})` : ''}`;
  returnButton.addEventListener('click', () => {
    book.returnBook();
    owner?.returnBook(book.getId());
    persist();
    notify(`Книгу «${book.getTitle()}» повернуто.`);
    render();
  });
  controls.append(returnButton);
}

function addBorrowControls(
  controls: HTMLElement,
  book: Book,
  users: Library<User>,
  persist: () => void,
  notify: (message: string) => void,
  render: () => void,
): void {
  const select = document.createElement('select');
  select.className = 'form-select form-select-sm';
  select.setAttribute('aria-label', `Оберіть користувача для книги ${book.getTitle()}`);
  select.innerHTML = '<option value="">Оберіть користувача</option>';
  for (const user of users.getAll()) {
    const option = document.createElement('option');
    option.value = user.getId();
    option.textContent = `${user.getName()} (${user.getBorrowedBookIds().length}/3)`;
    select.append(option);
  }

  const borrowButton = document.createElement('button');
  borrowButton.className = 'btn btn-primary btn-sm';
  borrowButton.textContent = 'Позичити';
  borrowButton.addEventListener('click', () => {
    const user = users.findById(select.value);
    if (!user) return notify('Спочатку оберіть користувача.');
    if (user.getBorrowedBookIds().length >= 3) {
      showModal({
        title: 'Ліміт позик',
        message: `${user.getName()} вже позичив(ла) 3 книги. Четверта позика недоступна.`,
        type: 'error',
      });
      return;
    }
    showModal({
      title: 'Підтвердити позику',
      message: `${user.getName()} хоче позичити «${book.getTitle()}».`,
      confirmLabel: 'Позичити',
      onConfirm: () => {
        book.borrow();
        user.borrowBook(book.getId());
        persist();
        notify(`Книгу «${book.getTitle()}» успішно позичено.`);
        render();
      },
    });
  });
  controls.append(select, borrowButton);
}

interface UserRenderOptions extends Omit<RenderOptions, 'render'> {
  render: () => void;
  userList: HTMLElement;
  userCount: HTMLElement;
  userPagination: HTMLElement;
}

function renderUsers({
  users,
  books,
  state,
  pageSize,
  persist,
  notify,
  render,
  userList,
  userCount,
  userPagination,
}: UserRenderOptions): void {
  const filteredUsers = users.getAll().filter((user) => {
    const query = state.userSearch.trim().toLocaleLowerCase();
    return !query || `${user.getName()} ${user.getEmail()}`.toLocaleLowerCase().includes(query);
  });
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  state.userPage = Math.min(state.userPage, pageCount);
  const visibleUsers = filteredUsers.slice((state.userPage - 1) * pageSize, state.userPage * pageSize);

  userList.replaceChildren();
  userCount.textContent = `${filteredUsers.length}/${users.size} ${users.size === 1 ? 'користувач' : 'користувачів'}`;
  for (const user of visibleUsers) {
    const row = document.createElement('div');
    row.className = 'list-item record-row d-flex flex-wrap justify-content-between align-items-center gap-3';
    const text = document.createElement('span');
    text.className = 'record-title';
    text.textContent = `ID ${user.getId()} · ${user.getName()} · ${user.getEmail()} · Позик: ${user.getBorrowedBookIds().length}/3`;
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm';
    deleteButton.textContent = 'Видалити';
    deleteButton.addEventListener('click', () => {
      for (const borrowedBookId of user.getBorrowedBookIds()) books.findById(borrowedBookId)?.returnBook();
      users.remove(user);
      persist();
      notify(`Користувача «${user.getName()}» видалено.`);
      render();
    });
    row.append(text, deleteButton);
    userList.append(row);
  }

  if (!visibleUsers.length) {
    userList.innerHTML = `<div class="empty-state">${users.size ? 'За запитом нічого не знайдено.' : 'Користувачі ще не додані.'}</div>`;
  }
  renderPagination(userPagination, state.userPage, filteredUsers.length, pageSize, (nextPage) => {
    state.userPage = nextPage;
    render();
  });
}
