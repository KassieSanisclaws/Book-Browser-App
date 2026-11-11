import { Injectable, computed, signal } from '@angular/core';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})

export class FavoritiesService {
   private readonly storageKey = 'book-browser-favorities';
   
   private readonly favoritiesBooks = signal<Book[]>(
    this.loadFavorites()
   );

   readonly favorites = this.favoritiesBooks.asReadonly();

   readonly count = computed(
    () => this.favoritiesBooks().length
   );

   isFavorite(id: string): boolean {
     return this.favoritiesBooks().some(book => book.id === id);
   }

   toggleFavorite(book: Book): void {
     this.favoritiesBooks.update(current => {
      const exists = current.some(item => item.id === book.id);

      const updated = exists
        ? current.filter(item => item.id !== book.id)
        : [...current, book];

        this.saveFavorites(updated);
        return updated;
     });
    }

    private loadFavorites(): Book[] {
      try {
        const saved = localStorage.getItem(this.storageKey);
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        
        return Array.isArray(parsed) ? parsed.filter(
          (item): item is Book =>
          item !== null && 
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          item.volumeInfo !== null &&
          typeof item.volumeInfo === 'object' &&
          typeof item.volumeInfo.title === 'string'
        )
        : [];
      } catch {
        return [];
      }
    }


    private saveFavorites(books: Book[]): void {
     try {
         localStorage.setItem(this.storageKey, JSON.stringify(books));
      } catch (error){
        console.error('Error saving favorites to localStorage:', error);
      }
    }
}
