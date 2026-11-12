import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-book-search',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './book-search.component.html',
  styleUrl: './book-search.component.css'
})

export class BookSearchComponent {
    @Output() search = new EventEmitter<string>();

    searchControl = new FormControl('angular', {
      nonNullable: true,
      validators: [
                    Validators.required,
                    Validators.minLength(3)
      ]
});

submitSearch(): void {
   this.searchControl.setValue(
    this.searchControl.value.trim()
   );

   this.searchControl.markAsTouched();

   if (this.searchControl.invalid) {
       return;
   }

   this.search.emit(this.searchControl.value);
  }
}
