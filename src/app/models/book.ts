export interface Book {
    id: string;
    volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate: Date;
    description: string;
    categories?: string[];
    pageCount?: number;
    imageLinks?: {
        smallThumbnail?: string;
        thumbnail?: string;
    };
  };
}

export interface BookSearchResponse {
    items?: Book[];
    totalItems: number;
}