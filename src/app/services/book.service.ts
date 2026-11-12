import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { Book, BookSearchResponse, OpenLibraryBook, OpenLibrarySearchResponse, OpenLibraryWork } from '../models/book';

@Injectable({
  providedIn: 'root'
})

export class BookService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://openlibrary.org/search.json?q=angular&limit=20';
  private readonly backUrl = '/json/books-backup.json';

  // Cache The Result During The Session
  private readonly searchCache = new Map<string, BookSearchResponse>();

  private readonly bookCache = new Map<string, Book>();

  searchBooks(query: string): Observable<BookSearchResponse> {
   const normalizedQuery = query.trim().toLowerCase();  
   
   if (!normalizedQuery) {
      return of({ totalItems: 0, items: [] });
   }

   const cached = this.searchCache.get(normalizedQuery);

   if (cached) {
      return of(cached);
   }

  const params = new HttpParams()
  .set('q', query)
  .set('maxResults', '20')
  .set('fields', 'key, title, author_name, first_publish_year, cover_i, subject, number_of_pages_median');

     return this.http.get<OpenLibrarySearchResponse>(`${this.apiUrl}/search.json`, { params }).pipe(
         map(response => {
          const books = response.docs.map(
            item => this.mapSearchBook(item)
          );
            return {
              totalItems: response.numFound,
              items: books
            };
         }),

         tap(response => {
             this.searchCache.set(normalizedQuery, response);

             response.items?.forEach(book => {
                this.bookCache.set(book.id, book);
          });
        }),

          catchError(error => {
            console.warn(
              'Open Library API request failed, falling back to local backup data.',
              error
            );
            return this.searchedBackup(normalizedQuery);
          })
        );
      }

      getBookById(id: string): Observable<Book | null> {
        // Local Backup Fallback Records (IDs begining with "local-")
        if (id.startsWith('local-')) {
          return this.getBackupBookById(id);
        }

        return this.http.get<OpenLibraryWork>(`${this.apiUrl}/works/${encodeURIComponent(id)}.json`
             ).pipe(
                  map(work => {
                    const cached = this.bookCache.get(id);
                    return this.mapWork(work, cached);
                  }),

                  tap(book => this.bookCache.set(book.id, book)),
         
        catchError(error => {
            console.warn('Unable to load Live Library book details, falling back to local backup data.', error);
        
         const cached = this.bookCache.get(id);
         if (cached) {
            return of(cached);
         }

         return this.getBookById(id);
        
        })
      );
    }
  
    private mapSearchBook(item: OpenLibraryBook): Book {
      const id = item.key.split('/').pop() ?? item.key;

      const coverURL = item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : undefined;

      return {
                id,
                volumeInfo: {
                    title: item.title,
                    authors: item.author_name?.slice(0, 5),
                    publishedDate: item.first_publish_year? new Date(item.first_publish_year, 0, 1) : new Date(),
                    categories: item.subject?.slice(0, 8),
                    pageCount: item.number_of_pages_median,
                    imageLinks: coverURL ? { thumbnail: coverURL } : undefined,
                    description: 'No description available.',
                }
            };
         }
   
        private mapWork(
             work: OpenLibraryWork,
             cached?: Book
         ): Book {
             const id = work.key.split('/').pop() ?? work.key;
     
             const description = typeof work.description === 'string' ? work.description : work.description?.value ?? 'No description available.';

             const coverId = work.covers?.find(id => id > 0 ); 

             const coverURL = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined;
                  
             return {
                      id,
                      volumeInfo: {
                          title: work.title,
                          authors: cached?.volumeInfo.authors,
                          description,
                          publishedDate: work.first_publish_date ?? cached?.volumeInfo.publishedDate ?? new Date(),
                          categories: work.subjects?.slice(0, 8) ?? cached?.volumeInfo.categories,
                          pageCount: cached?.volumeInfo.pageCount,
                          imageLinks: coverURL ? { thumbnail: coverURL } : cached?.volumeInfo.imageLinks
               }
             };
            }

            private loadBackUpData(): Observable<BookSearchResponse> {
                return this.http.get<BookSearchResponse>(this.backUrl);
            }

            private searchedBackup(query: string): Observable<BookSearchResponse> {
                return this.loadBackUpData().pipe(
                    map(response => {
                        const matches = (response.items ?? []).filter(book => {
                           const info = book.volumeInfo;
                           const searchableText = [
                             info.title,
                             ...(info.authors ?? []),
                             ...(info.categories ?? []),
                             info.description ?? ''
                           ].join(' ').toLowerCase();

                           return searchableText.includes(query);
                       });
                      
                       matches.forEach(book => {
                          this.bookCache.set(book.id, book);
                       });

                       return {
                          totalItems: matches.length,
                          items: matches
                       };
                    })
                );
            }
          private getBackupBookById(id: string): Observable<Book | null> {
            return this.loadBackUpData().pipe(
                switchMap(response => {
                    const book = response.items?.find(item => item.id === id);

                    if (!book) {
                      throw new Error(`Book with ID ${id} not found in backup data.`);
                     }

                     return of(book);
                }),
              );
            }
          }

