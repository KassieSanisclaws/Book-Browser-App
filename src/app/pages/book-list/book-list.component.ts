import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { Book } from '../../models/book';
import { BookService } from '../../services/book.service';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { BookSearchComponent } from '../../components/book-search/book-search.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [BookCardComponent, BookSearchComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})

export class BookListComponent implements OnInit, OnDestroy {
   private readonly bookService = inject(BookService)
   private request?: Subscription;

   readonly books = signal<Book[]>([]);
   readonly loading = signal(false);
   readonly error = signal('');
   readonly searchTerm = signal('angular');
   readonly selectedCategory = signal('All'); 
  
   readonly categories = computed(() => {
    const values = this.books().flatMap(
      book => book.volumeInfo.categories ?? [] 
    );

    return ['All', ...new Set(values)].sort((a, b) => {
        if( a === 'All') return -1;
        if( b === 'All') return 1;
        return a.localeCompare(b);
     });
   });

   readonly filteredBooks = computed(() => {
     const category = this.selectedCategory();

     return this.books().filter(book =>
       category === 'All' ||
       (book.volumeInfo.categories ?? []).includes(category)
       );
     });
   
     readonly bookCount = computed(() => this.filteredBooks().length
     );
  
    ngOnInit(): void {
      this.searchBooks('angular');
    }

    searchBooks(query: string): void {
      const trimmedQuery = query.trim();

      if(trimmedQuery.length < 2) return;

      this.request?.unsubscribe();
      this.searchTerm.set(trimmedQuery);
      this.selectedCategory.set('All');
      this.books.set([]);
      this.error.set('');
      this.loading.set(true);

      this.request = this.bookService.searchBooks(trimmedQuery)
        .subscribe({
          next: response => {
              this.books.set(response.items ?? []);
              this.loading.set(false);
          },
        
        error: err => {
            console.error('Book Search Failed:', err);
            this.error.set(' Unable To Load Books, We Are Truly Sorry. Please Try Again Later');
            this.loading.set(false);
          }
        });
    }

    changeCategory(event: Event): void {
       const select = event.target as HTMLSelectElement;
       this.selectedCategory.set(select.value);
    }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
  }
}
