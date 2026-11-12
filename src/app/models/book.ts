export interface Book {
    id: string;
    volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate: Date | string;
    description: string;
    publisher?: string;
    publisherDate?: Date;
    categories?: string[];
    pageCount?: number;
    imageLinks?: {
        smallThumbnail?: string;
        thumbnail?: string;
    };
  };
}

// Open Library API response interface
export interface BookSearchResponse {
    totalItems: number;
    items?: Book[];
}

export interface OpenLibrarySearchResponse {
    numFound: number;
    docs: OpenLibraryBook[];
}

export interface OpenLibraryBook {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    subject?: string[];
    number_of_pages_median?: number;
}

// Open Library Structure Returned from the API
export interface OpenLibraryWork {
    key: string;
    title: string;
    description?: string | { type?: string; value: string };
    covers?: number[];
    subjects?: string[];
    first_publish_date?: string;
}


