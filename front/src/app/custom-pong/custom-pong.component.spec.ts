import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPongComponent } from './custom-pong.component';

describe('CustomPongComponent', () => {
  let component: CustomPongComponent;
  let fixture: ComponentFixture<CustomPongComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomPongComponent]
    });
    fixture = TestBed.createComponent(CustomPongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
