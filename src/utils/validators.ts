export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface BookFormData {
  title: string;
  author: string;
  year: string;
}

interface UserFormData {
  id: string;
  name: string;
  email: string;
}

function resultFrom(errors: string[]): ValidationResult {
  return { isValid: errors.length === 0, errors };
}

function isNumericId(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

function isValidYear(value: string): boolean {
  const year = Number(value);
  return /^\d{4}$/.test(value) && year >= 1000 && year <= 2100;
}

function isValidEmail(value: string): boolean {
  const email = value.trim();
  const atIndex = email.indexOf('@');
  const domain = email.slice(atIndex + 1);

  return (
    atIndex > 0 && !email.includes(' ') && domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.')
  );
}

export namespace Validation {
  export function validateBookForm(data: BookFormData): ValidationResult {
    const errors: string[] = [];

    if (!data.title.trim()) errors.push('Вкажіть назву книги.');
    if (!data.author.trim()) errors.push('Вкажіть автора.');
    if (!isValidYear(data.year)) errors.push('Вкажіть коректний рік.');

    return resultFrom(errors);
  }

  export function validateUserForm(data: UserFormData): ValidationResult {
    const errors: string[] = [];

    if (!isNumericId(data.id)) errors.push('ID користувача має містити тільки цифри.');
    if (!data.name.trim()) errors.push("Вкажіть ім'я користувача.");
    if (!isValidEmail(data.email)) errors.push('Вкажіть коректний email.');

    return resultFrom(errors);
  }

  export function validateUserId(id: string): ValidationResult {
    const errors = isNumericId(id) ? [] : ['ID користувача має містити тільки цифри.'];
    return resultFrom(errors);
  }
}
