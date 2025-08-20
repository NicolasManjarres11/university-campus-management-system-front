import { TestBed } from '@angular/core/testing';

import { CourseServiceTs } from './course.service.ts';

describe('CourseServiceTs', () => {
  let service: CourseServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
