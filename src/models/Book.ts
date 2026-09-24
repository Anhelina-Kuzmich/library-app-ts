import type { IBook } from './interfaces/IBook';

export class Book implements IBook {
  private borrowed = false;

  constructor(
    private readonly title: string,
    private readonly author: string,
    private readonly year: number,
    borrowed = false,
  ) {
    this.borrowed = borrowed;
  }

  getId(): string {
    return `${this.title}-${this.author}-${this.year}`;
  }

  getTitle(): string {
    return this.title;
  }

  getAuthor(): string {
    return this.author;
  }

  getYear(): number {
    return this.year;
  }

  isBorrowed(): boolean {
    return this.borrowed;
  }

  borrow(): void {
    this.borrowed = true;
  }

  returnBook(): void {
    this.borrowed = false;
  }

  toJSON(): object {
    return {
      id: this.getId(),
      title: this.title,
      author: this.author,
      year: this.year,
      borrowed: this.borrowed,
    };
  }

  toString(): string {
    return `${this.title} · ${this.author} · ${this.year}`;
  }
}
