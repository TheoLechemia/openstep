import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepDetailComponent } from './step-detail.component';

describe('StepDetailComponent', () => {
  let component: StepDetailComponent;
  let fixture: ComponentFixture<StepDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
