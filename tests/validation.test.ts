import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Validation } from '../src/utils/validators';

describe('Validation', () => {
  it('перевіряє обов’язкові поля книги', () => {
    const result = Validation.validateBookForm({ title: '', author: '', year: '' });

    expect(result.isValid).to.equal(false);
    expect(result.errors).to.have.length(3);
  });

  it('перевіряє коректність року видання', () => {
    const result = Validation.validateBookForm({ title: 'Book', author: 'Author', year: 'not-year' });

    expect(result.isValid).to.equal(false);
    expect(result.errors).to.include('Вкажіть коректний рік.');
  });

  it('перевіряє id користувача', () => {
    expect(Validation.validateUserId('').isValid).to.equal(false);
    expect(Validation.validateUserId('user@example.com').isValid).to.equal(false);
    expect(Validation.validateUserId('12345').isValid).to.equal(true);
  });

  it('перевіряє id користувача у формі', () => {
    const result = Validation.validateUserForm({ id: 'abc', name: 'Reader', email: 'reader@example.com' });

    expect(result.isValid).to.equal(false);
    expect(result.errors).to.include('ID користувача має містити тільки цифри.');
  });
});
