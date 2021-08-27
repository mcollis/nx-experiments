/* eslint-disable @typescript-eslint/no-unused-vars */
import * as R from 'ramda';

URLSearchParams.prototype.concat = function (u) {
  R.forEach(([key, value]) => this.append(key, value), toPairs(u));
  return this;
};

export const of = R.constructN(1, URLSearchParams);
export const get = R.curry((key, u) => u.get(key));
export const has = R.curry((key, u) => u.has(key));
export const entries = (u) => u.entries();

export const unsafe_set = R.curry((key, v, u) => {
  u.set(key, v);
  return u;
});
export const unsafe_append = R.curry((key, v, u) => {
  u.append(key, v);
  return u;
});
export const unsafe_delete = R.curry((key, u) => {
  u.delete(key);
  return u;
});
export const unsafe_concat = R.curry((a, b) => a.concat(b));

export const set = R.curry((key, v, u) => unsafe_set(key, v, of(u)));
export const append = R.curry((key, v, u) => unsafe_append(key, v, of(u)));
export const remove = R.curry((key, u) => unsafe_delete(key, of(u)));
export const concat = R.curry((a, b) => unsafe_concat(of(a), b));
export const toPairs = R.compose(Array.from, entries);

const Pair = {
  map: (fn) => R.adjust(1, fn),
  sequence: ([key, xs]) => R.map(R.pair(key), xs),
  traverse: (fn) => R.compose(Pair.sequence, Pair.map(fn)),
};

const Utils = {
  toArray: R.unless(Array.isArray, R.of),
  moreThanOne: R.compose(R.gt(R.__, 1), R.length),
};

export const clean = R.compose(
  of,
  R.reject(
    R.compose(
      R.anyPass([R.isNil, R.isEmpty, R.equals('null'), R.equals('undefined')]),
      R.nth(1)
    )
  ),
  toPairs
);

// fromQuery :: Object -> URLSearchParams
export const fromQuery = R.compose(
  of,
  R.chain(Pair.traverse(Utils.toArray)),
  R.toPairs
);

// toQuery :: URLSearchParams -> Object
const toQuery = R.compose(
  R.map(R.unless(Utils.moreThanOne, R.head)),
  R.reduceBy((a, [_, v]) => a.concat(v), [], R.head),
  toPairs
);
