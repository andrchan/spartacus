/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrderEntry } from '@spartacus/cart/base/root';
import { ErrorAction, StateUtils } from '@spartacus/core';
import { MULTI_CART_DATA } from '../multi-cart-state';

export const CART_ADD_ENTRY = '[Cart-entry] Add Entry';
export const CART_ADD_ENTRY_SUCCESS = '[Cart-entry] Add Entry Success';
export const CART_ADD_ENTRY_FAIL = '[Cart-entry] Add Entry Fail';
export const CART_REMOVE_ENTRY = '[Cart-entry] Remove Entry';
export const CART_REMOVE_ENTRY_SUCCESS = '[Cart-entry] Remove Entry Success';
export const CART_REMOVE_ENTRY_FAIL = '[Cart-entry] Remove Entry Fail';

export const CART_UPDATE_ENTRY = '[Cart-entry] Update Entry';
export const CART_UPDATE_ENTRY_SUCCESS = '[Cart-entry] Update Entry Success';
export const CART_UPDATE_ENTRY_FAIL = '[Cart-entry] Update Entry Fail';

export class CartAddEntry extends StateUtils.EntityProcessesIncrementAction {
  readonly type = CART_ADD_ENTRY;

  constructor(
    public payload: {
      cartId: string;
      userId: string;
      productCode: string;
      quantity: number;
      pickupStore?: string;
    }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
  }
}

export class CartAddEntrySuccess extends StateUtils.EntityProcessesDecrementAction {
  readonly type = CART_ADD_ENTRY_SUCCESS;

  constructor(
    public payload: {
      userId: string;
      cartId: string;
      productCode: string;
      quantity: number;
      pickupStore?: string;
      deliveryModeChanged?: boolean;
      entry?: OrderEntry;
      quantityAdded?: number;
      statusCode?: string;
      statusMessage?: string;
    }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
  }
}

export class CartAddEntryFail
  extends StateUtils.EntityProcessesDecrementAction
  implements ErrorAction
{
  public error: any;
  readonly type = CART_ADD_ENTRY_FAIL;

  constructor(
    public payload: {
      error: any;
      userId: string;
      cartId: string;
      productCode: string;
      quantity: number;
      pickupStore?: string;
    }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
    this.error = payload.error;
  }
}

export class CartRemoveEntry extends StateUtils.EntityProcessesIncrementAction {
  readonly type = CART_REMOVE_ENTRY;

  constructor(
    public payload: { cartId: string; userId: string; entryNumber: string }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
  }
}

export class CartRemoveEntrySuccess extends StateUtils.EntityProcessesDecrementAction {
  readonly type = CART_REMOVE_ENTRY_SUCCESS;

  constructor(
    public payload: { userId: string; cartId: string; entryNumber: string }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
  }
}

export class CartRemoveEntryFail
  extends StateUtils.EntityProcessesDecrementAction
  implements ErrorAction
{
  public error: any;
  readonly type = CART_REMOVE_ENTRY_FAIL;

  constructor(
    public payload: {
      error: any;
      cartId: string;
      userId: string;
      entryNumber: string;
    }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
    this.error = payload.error;
  }
}

export class CartUpdateEntry extends StateUtils.EntityProcessesIncrementAction {
  readonly type = CART_UPDATE_ENTRY;

  constructor(
    public payload: {
      userId: string;
      cartId: string;
      entryNumber: string;
      quantity?: number;
      pickupStore?: string;
      pickupToDelivery?: boolean;
    }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
  }
}

export class CartUpdateEntrySuccess extends StateUtils.EntityProcessesDecrementAction {
  readonly type = CART_UPDATE_ENTRY_SUCCESS;

  constructor(
    public payload: {
      userId: string;
      cartId: string;
      entryNumber: string;
      quantity?: number;
      pickupStore?: string;
      pickupToDelivery?: boolean;
    }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
  }
}

export class CartUpdateEntryFail
  extends StateUtils.EntityProcessesDecrementAction
  implements ErrorAction
{
  public error: any;
  readonly type = CART_UPDATE_ENTRY_FAIL;

  constructor(
    public payload: {
      error: any;
      userId: string;
      cartId: string;
      entryNumber: string;
      quantity?: number;
      pickupStore?: string;
      pickupToDelivery?: boolean;
    }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
    this.error = payload.error;
  }
}

export type CartEntryAction =
  | CartAddEntry
  | CartAddEntrySuccess
  | CartAddEntryFail
  | CartRemoveEntry
  | CartRemoveEntrySuccess
  | CartRemoveEntryFail
  | CartUpdateEntry
  | CartUpdateEntrySuccess
  | CartUpdateEntryFail;
