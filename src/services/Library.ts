export class Library<T> {
  private readonly items: T[] = [];

  constructor(private readonly getId: (item: T) => string = (item) => String(item)) {}

  add(item: T): void {
    if (this.findById(this.getId(item))) return;
    this.items.push(item);
  }

  remove(itemOrId: T | string): boolean {
    const id = typeof itemOrId === 'string' ? itemOrId : this.getId(itemOrId);
    const index = this.items.findIndex((item) => this.getId(item) === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  findById(id: string): T | undefined {
    return this.items.find((item) => this.getId(item) === id);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  getAll(): T[] {
    return [...this.items];
  }

  clear(): void {
    this.items.length = 0;
  }

  get size(): number {
    return this.items.length;
  }
}
