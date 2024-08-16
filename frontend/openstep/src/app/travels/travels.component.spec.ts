import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelsComponent } from './travels.component';

describe('TravelsComponent', () => {
  let component: TravelsComponent;
  let fixture: ComponentFixture<TravelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
