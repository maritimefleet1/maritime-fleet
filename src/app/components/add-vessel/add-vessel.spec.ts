import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVessel } from './add-vessel';

describe('AddVessel', () => {
  let component: AddVessel;
  let fixture: ComponentFixture<AddVessel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVessel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVessel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
