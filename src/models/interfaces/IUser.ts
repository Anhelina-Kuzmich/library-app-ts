export interface IUser {
  getId(): string;
  getName(): string;
  getEmail(): string;
  getBorrowedBookIds(): string[];
  borrowBook(bookId: string): boolean;
  returnBook(bookId: string): boolean;
}
