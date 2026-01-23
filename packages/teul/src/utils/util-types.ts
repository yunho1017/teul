/**
 * 문자열을 구분자로 분리하는 타입 (String.prototype.split()의 타입 버전)
 * @example
 * ```ts
 * // ['a', 'b', 'c']
 * type Case1 = Split<'abc', ''>
 *
 * // ['a', 'b', 'c']
 * type Case2 = Split<'a,b,c', ','>
 *
 * // ['hello', 'world']
 * type Case3 = Split<'hello/world', '/'>
 * ```
 */
export type Split<
  Str extends string,
  Del extends string | number,
> = string extends Str
  ? string[]
  : '' extends Str
    ? []
    : Str extends `${infer T}${Del}${infer U}`
      ? [T, ...Split<U, Del>]
      : [Str];

/**
 * boolean 타입을 반대로 변환 (true → false, false → true)
 * @example
 * ```ts
 * // false
 * type Case1 = Not<true>
 *
 * // true
 * type Case2 = Not<false>
 * ```
 */
type Not<T extends boolean> = T extends true ? false : true;

/**
 * 첫 번째 타입이 두 번째 타입을 확장하는지 확인
 * @example
 * ```ts
 * // true (1은 number 타입의 부분집합)
 * type Case1 = Extends<1, number>
 *
 * // false (number는 1보다 넓은 타입)
 * type Case2 = Extends<number, 1>
 *
 * // true
 * type Case3 = Extends<'hello', string>
 * ```
 */
type Extends<T, Base> = [T] extends [Base] ? true : false;

/**
 * 첫 번째 타입이 두 번째 타입을 확장하지 않는지 확인
 * @example
 * ```ts
 * // false (1은 number를 확장함)
 * type Case1 = NotExtends<1, number>
 *
 * // true (number는 1을 확장하지 않음)
 * type Case2 = NotExtends<number, 1>
 *
 * // true
 * type Case3 = NotExtends<string, number>
 * ```
 */
type NotExtends<T, Base> = Not<Extends<T, Base>>;

/**
 * 배열이 고정 길이 튜플인지 확인
 * @example
 * ```ts
 * // true (고정 길이 튜플)
 * type Case1 = IsTuple<[1, 2, 3]>
 *
 * // false (가변 길이 배열)
 * type Case2 = IsTuple<number[]>
 *
 * // true
 * type Case3 = IsTuple<readonly [string, number]>
 * ```
 */
type IsTuple<T extends readonly unknown[]> = NotExtends<number, T['length']>;

/**
 * 조건에 따라 다른 타입을 반환 (삼항 연산자의 타입 버전)
 * @example
 * ```ts
 * // 'valid'
 * type Case1 = If<true, 'valid'>
 *
 * // 'invalid'
 * type Case2 = If<false, 'valid', 'invalid'>
 *
 * // number
 * type Case3 = If<true, number, string>
 * ```
 */
type If<Condition, IfTrue = true, IfFalse = false> = Condition extends true
  ? IfTrue
  : IfFalse;

/**
 * 빈 배열이면 해당 타입을 반환하고, 아니면 never를 반환
 * @example
 * ```ts
 * // never (요소가 있는 배열)
 * type Case1 = EmptyArray<[1]>
 *
 * // []
 * type Case2 = EmptyArray<[]>
 *
 * // never
 * type Case3 = EmptyArray<[1, 2, 3]>
 * ```
 */
type EmptyArray<T extends readonly unknown[]> = T extends readonly [
  unknown,
  ...unknown[],
]
  ? never
  : T;

/**
 * 타입이 never인지 확인
 * @example
 * ```ts
 * // true
 * type Case1 = IsNever<never>
 *
 * // false
 * type Case2 = IsNever<true>
 *
 * // false
 * type Case3 = IsNever<unknown>
 * ```
 */
type IsNever<T> = [T] extends [never] ? true : false;

/**
 * 배열이 비어있는지 확인
 * @example
 * ```ts
 * // false (요소가 있음)
 * type Case1 = IsEmptyArray<[1]>
 *
 * // true (빈 배열)
 * type Case2 = IsEmptyArray<[]>
 *
 * // false
 * type Case3 = IsEmptyArray<[string, number]>
 * ```
 */
type IsEmptyArray<T extends readonly unknown[]> = If<
  IsNever<EmptyArray<T>>,
  false,
  true
>;

/**
 * 배열이 비어있으면 두 번째 인자를, 아니면 세 번째 인자를 반환
 * @example
 * ```ts
 * // string (빈 배열이므로)
 * type Case1 = IfEmptyArray<[], string, number>
 *
 * // number (요소가 있으므로)
 * type Case2 = IfEmptyArray<[1], string, number>
 *
 * // true (기본값)
 * type Case3 = IfEmptyArray<[]>
 * ```
 */
type IfEmptyArray<
  T extends readonly unknown[],
  IfTrue = true,
  IfFalse = false,
> = If<IsEmptyArray<T>, IfTrue, IfFalse>;

/**
 * 배열의 요소를 구분자로 연결하는 타입 (Array.prototype.join()의 타입 버전)
 * @example
 * ```ts
 * // 'a-p-p-l-e'
 * type Case1 = Join<["a", "p", "p", "l", "e"], "-">
 *
 * // '21212'
 * type Case2 = Join<["2", "2", "2"], 1>
 *
 * // 'o'
 * type Case3 = Join<["o"], "u">
 *
 * // 'hello/world/foo'
 * type Case4 = Join<["hello", "world", "foo"], "/">
 * ```
 */
export type Join<
  T extends readonly (string | number)[],
  Glue extends string | number,
> =
  IsTuple<T> extends true
    ? T extends readonly [
        infer First extends string | number,
        ...infer Rest extends readonly (string | number)[],
      ]
      ? IfEmptyArray<Rest, First, `${First}${Glue}${Join<Rest, Glue>}`>
      : never
    : never;

/**
 * 문자열에서 특정 문자열을 모두 다른 문자열로 교체 (String.prototype.replaceAll()의 타입 버전)
 * @example
 * ```ts
 * // 'remove him him'
 * type Case1 = ReplaceAll<'remove me me', 'me', 'him'>
 *
 * // 'remove me me' (찾는 문자열이 없으면 그대로)
 * type Case2 = ReplaceAll<'remove me me', 'us', 'him'>
 *
 * // 'hello_world_foo'
 * type Case3 = ReplaceAll<'hello-world-foo', '-', '_'>
 * ```
 */
export type ReplaceAll<
  T extends string,
  Pivot extends string,
  ReplaceBy extends string,
> = T extends `${infer A}${Pivot}${infer B}`
  ? ReplaceAll<`${A}${ReplaceBy}${B}`, Pivot, ReplaceBy>
  : T;

/**
 * 복잡한 타입을 읽기 쉽게 펼쳐서 보여주는 헬퍼 타입
 * @example
 * ```ts
 * type User = { name: string } & { age: number }
 * // { name: string; age: number }
 * type PrettyUser = Prettify<User>
 * ```
 * @see https://www.totaltypescript.com/concepts/the-prettify-helper
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
