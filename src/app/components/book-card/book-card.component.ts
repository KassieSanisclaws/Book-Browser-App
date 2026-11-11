import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Book } from '../../models/book';
import { FavoritiesService } from '../../services/favorities.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css'
})
export class BookCardComponent {
  @Input({ required: true }) book!: Book;

  readonly favoritiesService =  inject(FavoritiesService);
  
  get coverUrl(): string {
    return this.book.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') ?? '';
}

get authors(): string {
  return this.book.volumeInfo.authors?.join(', ') ?? 'Unknown Author';
}

toggleFavorite(): void {
  this.favoritiesService.toggleFavorite(this.book);
 }
}