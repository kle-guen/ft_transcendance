import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandleauthComponent } from './handleauth.component';

describe('HandleauthComponent', () => {
  let component: HandleauthComponent;
  let fixture: ComponentFixture<HandleauthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HandleauthComponent]
    });
    fixture = TestBed.createComponent(HandleauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
