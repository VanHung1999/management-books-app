import { getBooks } from "./bookDatabase";

export const getCategories = (): string[] => {
    const books = getBooks();
    const categories = books.map(book => book.category);
    return [...new Set(categories)];
}