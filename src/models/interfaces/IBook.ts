export interface IBook {
  getId(): string;
  getTitle(): string;
  getAuthor(): string;
  getYear(): number;
  isBorrowed(): boolean;
  borrow(): void;
  returnBook(): void;
}
