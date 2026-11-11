import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Book, BookSearchResponse } from '../models/book';

@Injectable({
  providedIn: 'root'
})

export class BookService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://www.googleapis.com/books/v1/volumes';

  searchBooks(query: string): Observable<BookSearchResponse> {
  const params = new HttpParams()
  .set('q', query)
  .set('maxResults', '20')
  .set('printType', 'books');

  return this.http.get<BookSearchResponse>(
    this.apiUrl, 
    { params }
   );
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }
}
