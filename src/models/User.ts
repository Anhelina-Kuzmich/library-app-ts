import type { IUser } from './interfaces/IUser';

export class User implements IUser {
  private readonly borrowedBookIds: string[];

  constructor(
    private readonly name: string,
    private readonly email: string,
    private readonly id: string,
    borrowedBookIds: string[] = [],
  ) {
    this.borrowedBookIds = [...borrowedBookIds];
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getBorrowedBookIds(): string[] {
    return [...this.borrowedBookIds];
  }

  borrowBook(bookId: string): boolean {
    if (this.borrowedBookIds.includes(bookId) || this.borrowedBookIds.length >= 3) return false;
    this.borrowedBookIds.push(bookId);
    return true;
  }

  returnBook(bookId: string): boolean {
    const index = this.borrowedBookIds.indexOf(bookId);
    if (index === -1) return false;
    this.borrowedBookIds.splice(index, 1);
    return true;
  }

  toJSON(): object {
    return { id: this.id, name: this.name, email: this.email, borrowedBookIds: this.borrowedBookIds };
  }

  toString(): string {
    return `${this.name} · ${this.email}`;
  }
}
