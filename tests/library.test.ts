import { expect } from 'chai';
import { describe, it } from 'mocha';
import { User } from '../src/models/User';
import { Library } from '../src/services/Library';

interface TestItem {
  id: string;
  name: string;
}

describe('Library<T>', () => {
  const createLibrary = (): Library<TestItem> => new Library((item) => item.id);

  it('додає об’єкт і повертає всі об’єкти', () => {
    const library = createLibrary();
    const item = { id: '1', name: 'Book' };

    library.add(item);

    expect(library.getAll()).to.deep.equal([item]);
    expect(library.size).to.equal(1);
  });

  it('не додає об’єкт із повторним id', () => {
    const library = createLibrary();

    library.add({ id: '1', name: 'First' });
    library.add({ id: '1', name: 'Duplicate' });

    expect(library.size).to.equal(1);
  });

  it('знаходить і видаляє об’єкт', () => {
    const library = createLibrary();
    library.add({ id: '1', name: 'Book' });

    expect(library.findById('1')?.name).to.equal('Book');
    expect(library.remove('1')).to.equal(true);
    expect(library.findById('1')).to.equal(undefined);
    expect(library.remove('missing')).to.equal(false);
  });

  it('не дозволяє користувачу позичити більше трьох книг', () => {
    const user = new User('Reader', 'reader@example.com', '123');

    expect(user.borrowBook('book-1')).to.equal(true);
    expect(user.borrowBook('book-2')).to.equal(true);
    expect(user.borrowBook('book-3')).to.equal(true);
    expect(user.borrowBook('book-4')).to.equal(false);
    expect(user.getBorrowedBookIds()).to.have.length(3);
  });
});
