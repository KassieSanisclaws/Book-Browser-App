import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritiesComponent } from './favorities.component';

describe('FavoritiesComponent', () => {
  let component: FavoritiesComponent;
  let fixture: ComponentFixture<FavoritiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
