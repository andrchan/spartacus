/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Action } from '@ngrx/store';
import { ErrorAction } from '../../../error-handling';
import {
  ClearSearch,
  ProductSearchPage,
  Suggestion,
} from '../../../model/product-search.model';
import { SearchConfig } from '../../model/search-config';

export const SEARCH_PRODUCTS = '[Product] Search Products';
export const SEARCH_PRODUCTS_FAIL = '[Product] Search Products Fail';
export const SEARCH_PRODUCTS_SUCCESS = '[Product] Search Products Success';
export const GET_PRODUCT_SUGGESTIONS = '[Product] Get Product Suggestions';
export const GET_PRODUCT_SUGGESTIONS_SUCCESS =
  '[Product] Get Product Suggestions Success';
export const GET_PRODUCT_SUGGESTIONS_FAIL =
  '[Product] Get Product Suggestions Fail';
export const CLEAR_PRODUCT_SEARCH_RESULT =
  '[Product] Clear Product Search Result';

export class SearchProducts implements Action {
  readonly type = SEARCH_PRODUCTS;
  constructor(
    public payload: { queryText: string; searchConfig?: SearchConfig },
    public auxiliary?: boolean
  ) {}
}

export class SearchProductsFail implements ErrorAction {
  readonly type = SEARCH_PRODUCTS_FAIL;
  public error: any;

  constructor(
    public payload: any,
    public auxiliary?: boolean
  ) {
    this.error = payload;
  }
}

export class SearchProductsSuccess implements Action {
  readonly type = SEARCH_PRODUCTS_SUCCESS;
  constructor(
    public payload: ProductSearchPage,
    public auxiliary?: boolean
  ) {}
}

export class GetProductSuggestions implements Action {
  readonly type = GET_PRODUCT_SUGGESTIONS;
  constructor(public payload: { term: string; searchConfig?: SearchConfig }) {}
}

export class GetProductSuggestionsSuccess implements Action {
  readonly type = GET_PRODUCT_SUGGESTIONS_SUCCESS;
  constructor(public payload: Suggestion[]) {}
}

export class GetProductSuggestionsFail implements ErrorAction {
  public error: any;
  readonly type = GET_PRODUCT_SUGGESTIONS_FAIL;
  constructor(public payload: any) {
    this.error = payload;
  }
}

export class ClearProductSearchResult implements Action {
  readonly type = CLEAR_PRODUCT_SEARCH_RESULT;
  constructor(
    public payload: ClearSearch = {
      clearPageResults: false,
      clearSearchboxResults: false,
    }
  ) {}
}

// action types
export type ProductSearchAction =
  | SearchProducts
  | SearchProductsFail
  | SearchProductsSuccess
  | GetProductSuggestions
  | GetProductSuggestionsSuccess
  | GetProductSuggestionsFail
  | ClearProductSearchResult;
