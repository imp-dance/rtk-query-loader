import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { ReactElement } from "react";

export type UseQueryResult<T> = {
  // Base query state
  originalArgs?: unknown; // Arguments passed to the query
  data?: T; // The latest returned result regardless of hook arg, if present
  currentData?: T; // The latest returned result for the current hook arg, if present
  error?: unknown; // Error result if present
  requestId?: string; // A string generated by RTK Query
  endpointName?: string; // The name of the given endpoint for the query
  startedTimeStamp?: number; // Timestamp for when the query was initiated
  fulfilledTimeStamp?: number; // Timestamp for when the query was completed

  // Derived request status booleans
  isUninitialized: boolean; // Query has not started yet.
  isLoading: boolean; // Query is currently loading for the first time. No data yet.
  isFetching: boolean; // Query is currently fetching, but might have data from an earlier request.
  isSuccess: boolean; // Query has data from a successful load.
  isError: boolean; // Query is currently in an "error" state.

  refetch: () => void; // A function to force refetch the query
};

export type MakeDataRequired<
  T extends readonly UseQueryResult<unknown>[]
> = {
  // @ts-ignore: TS2536: Type '"data"' cannot be used to index type 'T[K]'.
  [K in keyof T]: T[K] & { data: NonNullable<T[K]["data"]> };
};

export type LoaderTransformFunction<
  QRU extends readonly UseQueryResult<unknown>[],
  R extends unknown
> = (queries: MakeDataRequired<QRU>) => R;

export type OptionalGenericArg<T> = T extends never ? [] : [T];

export type CreateUseLoaderArgs<
  QRU extends readonly UseQueryResult<unknown>[],
  R extends unknown,
  A = never
> = {
  queries: (...args: OptionalGenericArg<A>) => QRU;
  transform?: LoaderTransformFunction<QRU, R>;
};

export type UseLoader<A, R> = (
  ...args: OptionalGenericArg<A>
) => UseQueryResult<R>;

export type CreateLoaderType = <
  QRU extends readonly UseQueryResult<unknown>[],
  R extends unknown = MakeDataRequired<QRU>,
  A = never
>(
  createLoaderArgs: CreateUseLoaderArgs<QRU, R, A>
) => UseLoader<A, R>;

export type ComponentWithLoaderData<
  P extends Record<string, any>,
  R extends unknown
> = (props: P, loaderData: R) => ReactElement;

export type InferLoaderData<T> = T extends Loader<
  any,
  infer X,
  any
>
  ? X
  : T extends Loader<never, infer Y, any>
  ? Y
  : T extends Loader<any, infer Z, never>
  ? Z
  : never;

export type Component<P extends Record<string, any>> = (
  props: P
) => ReactElement;

export type WithLoaderArgs<
  P extends unknown,
  R extends unknown,
  A = never
> = Loader<P, R, A>;

export type WhileFetchingArgs<
  P extends unknown,
  R extends unknown
> = {
  prepend?: (props: P, data?: R) => ReactElement;
  append?: (props: P, data?: R) => ReactElement;
};

export type CreateLoaderArgs<
  P extends unknown,
  QRU extends readonly UseQueryResult<unknown>[],
  R extends unknown = MakeDataRequired<QRU>,
  A = never
> = Partial<CreateUseLoaderArgs<QRU, R, A>> & {
  queriesArg?: (props: P) => A;
  onLoading?: (props: P) => ReactElement;
  onError?: (
    props: P,
    error: FetchBaseQueryError | SerializedError,
    joinedQuery: UseQueryResult<undefined>
  ) => ReactElement;
  /** @deprecated Using onFetching might result in loss of internal state. Use `whileFetching` instead, or pass the query to the component */
  onFetching?: (
    props: P,
    renderBody: () => ReactElement
  ) => ReactElement;
  whileFetching?: WhileFetchingArgs<P, R>;
};

export type Loader<
  P extends unknown,
  R extends unknown,
  A = never
> = {
  useLoader: UseLoader<A, R>;
  queriesArg?: (props: P) => A;
  onLoading?: (props: P) => ReactElement;
  onError?: (
    props: P,
    error: SerializedError | FetchBaseQueryError,
    joinedQuery: UseQueryResult<undefined>
  ) => ReactElement;
  /** @deprecated Using onFetching might result in loss of internal state. Use `whileFetching` instead, or pass the query to the component */
  onFetching?: (
    props: P,
    renderBody: () => ReactElement
  ) => ReactElement;
  whileFetching?: WhileFetchingArgs<P, R>;
  extend: <
    QRUb extends readonly UseQueryResult<unknown>[],
    Pb extends unknown = P,
    Rb extends unknown = QRUb extends unknown
      ? R
      : MakeDataRequired<QRUb>,
    Ab = A
  >(
    newLoader: Partial<CreateLoaderArgs<Pb, QRUb, Rb, Ab>>
  ) => Loader<Pb, Rb, Ab>;
};
