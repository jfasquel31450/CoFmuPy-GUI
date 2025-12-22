import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoJsConnectionComponent } from './go-js-connection.component';

describe('GoJsConnectionComponent', () => {
  let component: GoJsConnectionComponent;
  let fixture: ComponentFixture<GoJsConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoJsConnectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoJsConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
