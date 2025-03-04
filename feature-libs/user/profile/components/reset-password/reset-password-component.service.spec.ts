import { TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import {
  FeatureConfigService,
  FeaturesConfigModule,
  GlobalMessageService,
  GlobalMessageType,
  HttpErrorModel,
  I18nTestingModule,
  RoutingService,
} from '@spartacus/core';
import {
  FormErrorsModule,
  PasswordVisibilityToggleModule,
} from '@spartacus/storefront';
import { UserPasswordFacade } from '@spartacus/user/profile/root';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ResetPasswordComponentService } from './reset-password-component.service';
import createSpy = jasmine.createSpy;

const resetToken = '123#Token';
const routerState$: BehaviorSubject<any> = new BehaviorSubject({
  state: {
    queryParams: {
      token: resetToken,
    },
  },
});

class MockUserPasswordFacade implements Partial<UserPasswordFacade> {
  reset() {
    return of({});
  }
}

class MockRoutingService {
  go = createSpy().and.stub();
  getRouterState() {
    return routerState$;
  }
}
class MockGlobalMessageService {
  add = createSpy().and.stub();
}

describe('ResetPasswordComponentService', () => {
  let service: ResetPasswordComponentService;
  let userPasswordService: UserPasswordFacade;
  let routingService: RoutingService;
  let globalMessageService: GlobalMessageService;
  let passwordConfirm: AbstractControl;
  let password: AbstractControl;
  let featureConfigService: FeatureConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        I18nTestingModule,
        FormErrorsModule,
        PasswordVisibilityToggleModule,
        FeaturesConfigModule,
      ],
      providers: [
        ResetPasswordComponentService,
        {
          provide: UserPasswordFacade,
          useClass: MockUserPasswordFacade,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    featureConfigService = TestBed.inject(FeatureConfigService);
    spyOn(featureConfigService, 'isEnabled').and.returnValue(true);

    service = TestBed.inject(ResetPasswordComponentService);

    userPasswordService = TestBed.inject(UserPasswordFacade);
    routingService = TestBed.inject(RoutingService);
    globalMessageService = TestBed.inject(GlobalMessageService);

    password = service.form.controls.password;
    passwordConfirm = service.form.controls.passwordConfirm;
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('isUpdating$', () => {
    it('should return true', () => {
      service['busy$'].next(true);
      let result;
      service.isUpdating$.subscribe((value) => (result = value)).unsubscribe();
      expect(result).toBeTruthy();
      expect(service.form.disabled).toBeTruthy();
    });

    it('should return false', () => {
      service['busy$'].next(false);
      let result;
      service.isUpdating$.subscribe((value) => (result = value)).unsubscribe();
      expect(result).toBeFalsy();
      expect(service.form.disabled).toBeFalsy();
    });
  });

  describe('resetToken$', () => {
    it('should return token', () => {
      let result;
      service.resetToken$.subscribe((value) => (result = value)).unsubscribe();
      expect(result).toEqual(resetToken);
    });

    it('should not return token', () => {
      routerState$.next({
        state: {
          queryParams: {},
        },
      });
      let result;
      service.resetToken$.subscribe((value) => (result = value)).unsubscribe();
      expect(result).toBeFalsy();
    });
  });

  describe('reset', () => {
    describe('success', () => {
      beforeEach(() => {
        password.setValue('Qwe123!');
        passwordConfirm.setValue('Qwe123!');
      });

      it('should reset password', () => {
        spyOn(userPasswordService, 'reset').and.callThrough();
        service.resetPassword(resetToken);
        expect(userPasswordService.reset).toHaveBeenCalledWith(
          resetToken,
          'Qwe123!'
        );
      });

      it('should show message', () => {
        service.resetPassword(resetToken);
        expect(globalMessageService.add).toHaveBeenCalledWith(
          { key: 'forgottenPassword.passwordResetSuccess' },
          GlobalMessageType.MSG_TYPE_CONFIRMATION
        );
      });

      it('should reroute to the login page', () => {
        service.resetPassword(resetToken);
        expect(routingService.go).toHaveBeenCalledWith({ cxRoute: 'login' });
      });

      it('should reset form', () => {
        spyOn(service.form, 'reset').and.callThrough();
        service.resetPassword(resetToken);
        expect(service.form.reset).toHaveBeenCalled();
      });
    });

    describe('error', () => {
      describe('valid form', () => {
        beforeEach(() => {
          password.setValue('Qwe123!');
          passwordConfirm.setValue('Qwe123!');
        });

        it('should show error message', () => {
          const error = new HttpErrorModel();
          error.details = [{ message: 'error message' }];
          spyOn(userPasswordService, 'reset').and.returnValue(
            throwError(() => error)
          );
          service.resetPassword(resetToken);
          expect(globalMessageService.add).toHaveBeenCalledWith(
            { raw: 'error message' },
            GlobalMessageType.MSG_TYPE_ERROR
          );
        });

        it('should not show error message', () => {
          spyOn(userPasswordService, 'reset').and.returnValue(
            throwError(() => null)
          );
          service.resetPassword(resetToken);
          expect(globalMessageService.add).not.toHaveBeenCalled();
        });

        it('should not show error message', () => {
          spyOn(userPasswordService, 'reset').and.returnValue(
            throwError(() => ({}))
          );
          service.resetPassword(resetToken);
          expect(globalMessageService.add).not.toHaveBeenCalled();
        });
      });
    });

    it('should not reset invalid form', () => {
      spyOn(userPasswordService, 'reset').and.returnValue(
        throwError(() => ({}))
      );
      passwordConfirm.setValue('Diff123!');
      service.resetPassword(resetToken);
      expect(userPasswordService.reset).not.toHaveBeenCalled();
      expect(globalMessageService.add).not.toHaveBeenCalled();
      expect(routingService.go).not.toHaveBeenCalled();
    });
  });

  describe('password validators', () => {
    it('should have new validators when feature flag isEnabled', () => {
      const passwordControl = service.form.get(
        'password'
      ) as UntypedFormControl;
      const validators = passwordControl.validator
        ? passwordControl.validator({} as any)
        : [];

      expect(passwordControl).toBeTruthy();
      expect(validators).toEqual({
        required: true,
        cxMinOneDigit: true,
        cxMinOneUpperCaseCharacter: true,
        cxMinOneSpecialCharacter: true,
        cxMinSixCharactersLength: true,
      });
    });
  });
});
