import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { ReactElement } from "react";
import { useCreateQuery } from "./createQuery";

/** Result of a RTK useQuery hook */
export type UseQueryResult<T> = {
  // Base query state
  /** Arguments passed to the query */
  originalArgs?: unknown;
  /** The latest returned result regardless of hook arg, if present */
  data?: T;
  /** The latest returned result for the current hook arg, if present */
  currentData?: T;
  /** Error result if present */
  error?: unknown;
  /** A string generated by RTK Query */
  requestId?: string;
  /** The name of the given endpoint for the query */
  endpointName?: string;
  /** Timestamp for when the query was initiated */
  startedTimeStamp?: number;
  /** Timestamp for when the query was completed */
  fulfilledTimeStamp?: number;

  // Derived request status booleans
  /** Query has not started yet */
  isUninitialized: boolean;
  /** Query is currently loading for the first time. No data yet. */
  isLoading: boolean;
  /** Query is currently fetching, but might have data from an earlier request. */
  isFetching: boolean;
  /** Query has data from a successful load */
  isSuccess: boolean;
  /** Query is currently in an "error" state */
  isError: boolean;

  /** A function to force refetch the query */
  refetch: () => void;
};

/** _X are types that are extended from in the generics */
export type _Q = Record<string, UseQueryResult<unknown>>;
export type _D = Record<string, UseQueryResult<unknown>>;
export type _E = unknown;
export type _P = Record<string, unknown>;
export type _R = unknown;

export type MakeDataRequired<T extends _Q> = {
  // @ts-ignore: TS2536: Type '"data"' cannot be used to index type 'T[K]'.
  [K in keyof T]: T[K] & { data: NonNullable<T[K]["data"]> };
};

export type DataShape<
  Q extends _Q,
  D extends _D,
  E extends _E
> = {
  queries?: Q;
  deferredQueries?: D;
  payload?: E;
};

/** Use: `(...args: OptionalGenericArg<T>) => void;`
 * Allows either `T` or `none` for the parameter
 */
export type OptionalGenericArg<T> = T extends never ? [] : [T];

export type LoaderTransformFunction<
  Q extends _Q,
  D extends _D,
  E extends _E,
  R extends unknown
> = (data: DataShape<MakeDataRequired<Q>, D, E>) => R;

export type CreateUseLoaderArgs<
  Q extends _Q,
  D extends _D,
  E extends _E,
  R extends _R,
  A = never
> = {
  /** Should return a list of RTK useQuery results.
   * Example:
   * ```typescript
   * (args: Args) => ({
   *    queries: {
   *      pokemon: useGetPokemonQuery(args.pokemonId),
   *    }
   * })
   * ```
   */
  useQuery: (
    ...args: OptionalGenericArg<A>
  ) => DataShape<Q, D, E>;
  /** Transforms the output of the queries */
  transform?: (data: DataShape<Q, D, E>) => R;
};

export type UseLoader<A, R> = (
  ...args: OptionalGenericArg<A>
) => UseQueryResult<R>;

export type ComponentWithLoaderData<
  P extends Record<string, any>,
  R extends unknown
> = (props: P, loaderData: R) => ReactElement;

/** Use: `InferLoaderData<typeof loader>`. Returns the return-value of the given loader's aggregated query. */
export type InferLoaderData<T> = T extends Loader<
  any,
  infer X,
  any,
  any
>
  ? X
  : T extends Loader<never, infer Y, any, any>
  ? Y
  : T extends Loader<any, infer Z, never, any>
  ? Z
  : never;

export type Component<P extends Record<string, any>> = (
  props: P
) => ReactElement;

export type WhileFetchingArgs<
  P extends unknown,
  R extends unknown
> = {
  /** Will be prepended before the component while the query is fetching */
  prepend?: (props: P, data?: R) => ReactElement;
  /** Will be appended after the component while the query is fetching */
  append?: (props: P, data?: R) => ReactElement;
};

export type CustomLoaderProps<T = unknown> = {
  /** What the loader requests be rendered while fetching data */
  onFetching?: React.ReactElement;
  /** What the loader requests be rendered while fetching data */
  whileFetching?: {
    /** Should be appended to the success result while fetching */
    append?: React.ReactElement;
    /** Should be prepended to the success result while fetching */
    prepend?: React.ReactElement;
  };
  /** What the loader requests be rendered when data is available */
  onSuccess: (data: T) => React.ReactElement;
  /** What the loader requests be rendered when the query fails */
  onError?: (
    error: SerializedError | FetchBaseQueryError
  ) => JSX.Element;
  /** What the loader requests be rendered while loading data */
  onLoading?: React.ReactElement;
  /** The joined query for the loader */
  query: UseQueryResult<T>;
};

export type CreateLoaderArgs<
  P extends unknown,
  Q extends _Q,
  D extends _D,
  E extends _E,
  R extends unknown = MakeDataRequired<Q>,
  A = never
> = Partial<CreateUseLoaderArgs<Q, D, E, R, A>> & {
  /** Generates an argument for the `queries` based on component props */
  queriesArg?: (props: P) => A;
  /** Determines what to render while loading (with no data to fallback on) */
  onLoading?: (props: P) => ReactElement;
  /** Determines what to render when query fails. */
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
  /** Determines what to render besides success-result while query is fetching. */
  whileFetching?: WhileFetchingArgs<P, R>;
  /** The component to use to switch between rendering the different query states. */
  loaderComponent?: Component<CustomLoaderProps>;
};

export type Loader<
  P extends unknown,
  R extends unknown,
  Q extends _Q = _Q,
  D extends _D = _D,
  A = never
> = {
  /** A hook that runs all queries and returns aggregated result */
  useLoader: UseLoader<A, R>;
  /** Generates an argument for the `queries` based on component props */
  queriesArg?: (props: P) => A;
  /** Determines what to render while loading (with no data to fallback on) */
  onLoading?: (props: P) => ReactElement;
  /** Determines what to render when query fails. */
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
  /** Determines what to render besides success-result while query is fetching. */
  whileFetching?: WhileFetchingArgs<P, R>;
  /** Returns a new `Loader` extended from this `Loader`, with given overrides. */
  extend: <
    Qb extends _Q = Q,
    Db extends _D = _Q,
    Pb extends unknown = P,
    Rb extends unknown = Qb extends Q
      ? R extends never
        ? Q
        : R
      : MakeDataRequired<Qb>,
    Ab = A
  >(
    newLoader: Partial<CreateLoaderArgs<Pb, Qb, Db, Rb, Ab>>
  ) => Loader<
    Pb,
    Rb,
    Qb extends never ? Q : Qb,
    Db extends never ? D : Db,
    Ab
  >;
  /** The component to use to switch between rendering the different query states. */
  LoaderComponent: Component<CustomLoaderProps>;
};

export type CreateQueryGetter<T extends unknown> =
  () => Promise<T>;

export type CreateQueryReducerAction<T extends unknown> =
  | {
      type: "load";
    }
  | {
      type: "fetch";
    }
  | {
      type: "error";
      payload: {
        error: unknown;
      };
    }
  | {
      type: "success";
      payload: {
        data: T;
      };
    };

/************************************************/
/*  Legacy/unused, for backwards compatibility  */
/************************************************/
export type WithLoaderArgs<
  P extends unknown,
  R extends unknown,
  A = never
> = Loader<P, R, _Q, _Q, A>;

const _createLoaderTypeTest = <
  P extends unknown,
  Q extends _Q,
  D extends _D,
  E extends _E,
  R extends unknown = MakeDataRequired<Q>,
  A = never
>(
  args: CreateLoaderArgs<P, Q, D, E, R>
): Loader<P, R, Q, D, A> => {
  return {} as Loader<P, R, Q, D, A>;
};

const asd = _createLoaderTypeTest({
  useQuery: () => {
    return {
      queries: {
        test: useCreateQuery(async () => "foo" as const),
      },
      deferredQueries: {
        best: useCreateQuery(async () => "bar" as const),
      },
    };
  },
});
