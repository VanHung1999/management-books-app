import { Book } from "@/app/types/book";
import { categoriesInitial } from "./category-book";

// Helper function to generate random status
const generateRandomStatus = (maxCopies: number) => {
  const available = Math.floor(Math.random() * maxCopies);
  const loaned = Math.floor(Math.random() * (maxCopies - available));
  const disabled = Math.floor(Math.random() * (maxCopies - available - loaned));
  const renovated = maxCopies - available - loaned - disabled;
  return { available, loaned, disabled, renovated };
};

// Function to transform Google Books data to our Book interface
const transformGoogleBook = (item: any): Book => {
  const volumeInfo = item.volumeInfo;
  const num = Math.floor(Math.random() * 20) + 1; // 1-20 copies

  return {
    id: item.id,
    name: volumeInfo.title,
    num,
    category: volumeInfo.categories?.[0] || "Uncategorized",
    description: volumeInfo.description || `A book by ${volumeInfo.authors?.[0] || 'unknown author'}`,
    author: volumeInfo.authors?.[0] || "Unknown",
    ISBN: volumeInfo.industryIdentifiers?.[0]?.identifier || "",
    publishYear: new Date(volumeInfo.publishedDate).getFullYear(),
    coverImage: volumeInfo.imageLinks?.thumbnail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: generateRandomStatus(num)
  };
};

// Main function to fetch books
export async function fetchRealBooks(): Promise<Book[]> {
  const bookCategories = categoriesInitial;
  
  const books: Book[] = [];
  const maxBooksPerCategory = 20;

  try {
    for (const category of bookCategories) {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${category}` +
        `&maxResults=${maxBooksPerCategory}` +
        '&langRestrict=en' +
        '&orderBy=relevance' +
        '&printType=books'
      );

      if (!response.ok) {
        console.error(`Failed to fetch ${category} books:`, response.statusText);
        continue;
      }

      const data = await response.json();
      
      const categoryBooks = data.items
        ?.filter((item: any) => 
          item.volumeInfo?.title &&
          item.volumeInfo?.authors?.length > 0 &&
          item.volumeInfo?.description
        )
        .map(transformGoogleBook)
        .slice(0, maxBooksPerCategory) || [];

      books.push(...categoryBooks);
    }

    return books;

  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}