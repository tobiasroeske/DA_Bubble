import { TestBed } from '@angular/core/testing';

import { MemberDialogsService } from './member-dialogs.service';

describe('MemberDialogsService', () => {
  let service: MemberDialogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemberDialogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
