/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  EntitiesModel,
  LoggerService,
  OCC_USER_ID_ANONYMOUS,
  StateUtils,
  tryNormalizeHttpError,
} from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { OrderApprovalConnector } from '../../connectors/order-approval.connector';
import { OrderApproval } from '../../model/order-approval.model';
import { OrderApprovalActions } from '../actions/index';

@Injectable()
export class OrderApprovalEffects {
  protected logger = inject(LoggerService);

  loadOrderApproval$: Observable<
    | OrderApprovalActions.LoadOrderApprovalSuccess
    | OrderApprovalActions.LoadOrderApprovalFail
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderApprovalActions.LOAD_ORDER_APPROVAL),
      map((action: OrderApprovalActions.LoadOrderApproval) => action.payload),
      filter((payload) => payload.userId !== OCC_USER_ID_ANONYMOUS),
      switchMap(({ userId, orderApprovalCode }) => {
        return this.orderApprovalConnector.get(userId, orderApprovalCode).pipe(
          map((orderApproval: OrderApproval) => {
            return new OrderApprovalActions.LoadOrderApprovalSuccess([
              orderApproval,
            ]);
          }),
          catchError((error: HttpErrorResponse) =>
            of(
              new OrderApprovalActions.LoadOrderApprovalFail({
                orderApprovalCode,
                error: tryNormalizeHttpError(error, this.logger),
              })
            )
          )
        );
      })
    )
  );

  loadOrderApprovals$: Observable<
    | OrderApprovalActions.LoadOrderApprovalsSuccess
    | OrderApprovalActions.LoadOrderApprovalSuccess
    | OrderApprovalActions.LoadOrderApprovalsFail
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderApprovalActions.LOAD_ORDER_APPROVALS),
      map((action: OrderApprovalActions.LoadOrderApprovals) => action.payload),
      filter((payload) => payload.userId !== OCC_USER_ID_ANONYMOUS),
      switchMap(({ userId, params }) =>
        this.orderApprovalConnector.getList(userId, params).pipe(
          switchMap((orderApprovals: EntitiesModel<OrderApproval>) => {
            const { values, page } = StateUtils.normalizeListPage(
              orderApprovals,
              'code'
            );
            return [
              new OrderApprovalActions.LoadOrderApprovalSuccess(values),
              new OrderApprovalActions.LoadOrderApprovalsSuccess({
                page,
                params,
              }),
            ];
          }),
          catchError((error: HttpErrorResponse) =>
            of(
              new OrderApprovalActions.LoadOrderApprovalsFail({
                params: params,
                error: tryNormalizeHttpError(error, this.logger),
              })
            )
          )
        )
      )
    )
  );

  makeDecision$: Observable<
    | OrderApprovalActions.MakeDecisionSuccess
    | OrderApprovalActions.LoadOrderApproval
    | OrderApprovalActions.MakeDecisionFail
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderApprovalActions.MAKE_DECISION),
      map((action: OrderApprovalActions.MakeDecision) => action.payload),
      filter((payload) => payload.userId !== OCC_USER_ID_ANONYMOUS),
      switchMap(({ userId, orderApprovalCode, orderApprovalDecision }) =>
        this.orderApprovalConnector
          .makeDecision(userId, orderApprovalCode, orderApprovalDecision)
          .pipe(
            switchMap((orderApprovalDecisionData) => [
              new OrderApprovalActions.MakeDecisionSuccess({
                orderApprovalCode,
                orderApprovalDecision: orderApprovalDecisionData,
              }),
              new OrderApprovalActions.LoadOrderApproval({
                userId,
                orderApprovalCode,
              }),
            ]),
            catchError((error: HttpErrorResponse) =>
              of(
                new OrderApprovalActions.MakeDecisionFail({
                  orderApprovalCode: orderApprovalCode,
                  error: tryNormalizeHttpError(error, this.logger),
                })
              )
            )
          )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private orderApprovalConnector: OrderApprovalConnector
  ) {}
}
