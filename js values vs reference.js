/**
 * JS: Values vs References — Beginner → Expert
 *
 * A progressive guide explaining how JavaScript handles values and references,
 * building one concept on top of the next. Run with: `node "js values vs reference.js"`
 */

// ============================================================================
// BEGINNER: Primitives (Copy by Value) vs Objects (Copy by Reference)
// ============================================================================

console.log('\n=== BEGINNER: Primitives (copy by value) ===\n');

// Primitives: number, string, boolean, null, undefined, symbol, bigint
let a = 5;
let b = a; // copy by value
b = b + 1;
console.log('a:', a); // 5 (unchanged)
console.log('b:', b); // 6

let s1 = 'hello';
let s2 = s1;
s2 = s2.toUpperCase();
console.log('s1:', s1); // 'hello'
console.log('s2:', s2); // 'HELLO'

console.log('\n=== BEGINNER: Objects & Arrays (copy by reference) ===\n');

// Objects and arrays are assigned by reference (the variable holds a reference)
const obj1 = { x: 1 };
const obj2 = obj1; // both variables reference the same object
obj2.x = 2;
console.log('obj1.x:', obj1.x); // 2 (mutated via obj2)

const arr1 = [1, 2, 3];
const arr2 = arr1;
arr2.push(4);
console.log('arr1:', arr1); // [1,2,3,4]

// Key takeaway: for primitives, assignment copies the value; for objects, assignment copies the reference.

// ============================================================================
// INTERMEDIATE: Aliasing, Mutation, and Function Parameters
// ============================================================================

console.log('\n=== INTERMEDIATE: Aliasing & Function Parameters ===\n');

function mutate(o) {
	o.value = 'mutated';
}

const original = { value: 'init' };
mutate(original);
console.log('original after mutate:', original); // { value: 'mutated' }

// If you want to avoid mutation, create a copy before mutating
function safeMutate(o) {
	const copy = { ...o }; // shallow copy
	copy.value = 'safe';
	return copy;
}

const o1 = { a: 1 };
const o2 = safeMutate(o1);
console.log('o1:', o1); // { a: 1 }
console.log('o2:', o2); // { a: 1, value: 'safe' }

// ============================================================================
// INTERMEDIATE: Equality, Identity, and Object.is
// ============================================================================

console.log('\n=== INTERMEDIATE: Equality & Identity ===\n');

// Primitives compare by value
console.log(1 === 1); // true
console.log('foo' === 'foo'); // true

// Objects compare by reference (identity)
const x = { n: 1 };
const y = { n: 1 };
const z = x;
console.log('x === y:', x === y); // false (distinct objects)
console.log('x === z:', x === z); // true (same reference)

// Object.is handles NaN and -0 differently than === in edge cases
console.log('NaN === NaN:', NaN === NaN); // false
console.log('Object.is(NaN, NaN):', Object.is(NaN, NaN)); // true

// ============================================================================
// INTERMEDIATE: Shallow Copy Techniques and Pitfalls
// ============================================================================

console.log('\n=== INTERMEDIATE: Shallow Copy Techniques ===\n');

const src = { a: 1, b: { c: 2 } };

// Spread syntax (shallow copy)
const shallow1 = { ...src };
// Object.assign (shallow copy)
const shallow2 = Object.assign({}, src);

// Both only copy top-level properties; nested objects are still shared
shallow1.b.c = 99;
console.log('src.b.c after shallow1 change:', src.b.c); // 99

// Arrays: slice or spread
const arr = [{ a: 1 }, { b: 2 }];
const arrShallow = arr.slice();
arrShallow[0].a = 42;
console.log('arr[0].a after arrShallow change:', arr[0].a); // 42

console.log('\nShallow copies do not protect nested objects from mutation.');

// ============================================================================
// INTERMEDIATE: Deep Copy Options (and limitations)
// ============================================================================

console.log('\n=== INTERMEDIATE: Deep Copy Options ===\n');

// 1) JSON.parse(JSON.stringify(...))
const withFunc = { a: 1, b: { c: 2 }, toJSON: () => 'no' };
const deepJson = JSON.parse(JSON.stringify(src));
console.log('deepJson:', deepJson);

// Downsides of JSON method:
// - Loses functions, undefined, Symbol, BigInt
// - Can't handle circular references

// Example: circular references break JSON
const circ = { a: 1 };
circ.self = circ;
try {
	JSON.stringify(circ);
} catch (err) {
	console.log('JSON.stringify circular error:', err.message);
}

// 2) structuredClone (modern, Node 17+/browsers)
if (typeof structuredClone === 'function') {
	const copy = structuredClone(circ);
	console.log('structuredClone preserved circular?:', !!copy.self);
} else {
	console.log('structuredClone not available in this runtime.');
}

// 3) Utility libraries: lodash.cloneDeep
// const _ = require('lodash'); const cloned = _.cloneDeep(obj);

// 4) Custom deep clone (handles many cases, but complex)
function deepClone(value, seen = new WeakMap()) {
	if (value === null || typeof value !== 'object') return value;
	if (seen.has(value)) return seen.get(value);
	if (Array.isArray(value)) {
		const arr = [];
		seen.set(value, arr);
		for (const v of value) arr.push(deepClone(v, seen));
		return arr;
	}
	const out = {};
	seen.set(value, out);
	for (const key of Object.keys(value)) {
		out[key] = deepClone(value[key], seen);
	}
	return out;
}

const nested = { a: { b: { c: 3 } } };
const clonedNested = deepClone(nested);
clonedNested.a.b.c = 99;
console.log('nested.a.b.c:', nested.a.b.c); // still 3

// ============================================================================
// ADVANCED: Immutability, Object.freeze, and Persistent Data Patterns
// ============================================================================

console.log('\n=== ADVANCED: Immutability & Object.freeze ===\n');

const freezeObj = Object.freeze({ x: 1 });
try {
	freezeObj.x = 2; // fails silently in non-strict, throws in strict mode
} catch (e) {
	console.log('Cannot mutate frozen object:', e.message);
}
console.log('freezeObj.x:', freezeObj.x); // 1

// shallow freeze — nested objects still mutable
const freezeNested = Object.freeze({ n: { v: 1 } });
freezeNested.n.v = 9;
console.log('freezeNested.n.v after mutation:', freezeNested.n.v); // 9

// Deep-freeze helper (simple version)
function deepFreeze(obj) {
	Object.getOwnPropertyNames(obj).forEach((name) => {
		const prop = obj[name];
		if (prop && typeof prop === 'object' && !Object.isFrozen(prop)) {
			deepFreeze(prop);
		}
	});
	return Object.freeze(obj);
}

const deepObj = { a: { b: 2 } };
deepFreeze(deepObj);
try { deepObj.a.b = 5; } catch (e) {}
console.log('deepObj.a.b after attempt:', deepObj.a.b); // still 2

// Persistent data structure idea (structural sharing) — libraries like Immer
// Immer example (pseudo): const next = produce(base, draft => { draft.x = 1 });
// It creates a new object with shared unchanged parts.

// ============================================================================
// ADVANCED: Performance Tradeoffs & When to Clone
// ============================================================================

console.log('\n=== ADVANCED: Performance Tradeoffs ===\n');

// Copying large structures is expensive. Consider alternatives:
// - Use structural sharing (immutability helpers)
// - Update in-place for short-lived objects or hot loops
// - Use lazy copying (copy-on-write)

// Example: avoid deep-cloning an object if you only need to change a single top-level property
function updateName(obj, name) {
	return { ...obj, name }; // cheap shallow copy
}

// ============================================================================
// ADVANCED: Proxies, Mutation Detection, and Debugging Aliasing
// ============================================================================

console.log('\n=== ADVANCED: Proxies & Mutation Detection ===\n');

const handler = {
	set(target, prop, value) {
		console.log(`Setting ${String(prop)} =`, value);
		target[prop] = value;
		return true;
	}
};

const proxied = new Proxy({ a: 1 }, handler);
proxied.a = 100; // logs the set operation

// Useful to detect accidental mutation when debugging.

// ============================================================================
// ADVANCED: TypeScript & Structural Typing Notes
// ============================================================================

console.log('\n=== ADVANCED: TypeScript Notes ===\n');

// TypeScript types annotate the shapes, but value/reference semantics stay the same.
// Example (TS conceptual):
// interface User { id: string; name: string }
// function cloneUser(user: User): User { return { ...user }; }

console.log('TS helps catch mutation mistakes via readonly types (e.g., Readonly<T>).');

// ============================================================================
// BEST PRACTICES & PITFALLS
// ============================================================================

console.log('\n=== Best Practices & Pitfalls ===\n');

console.log(`
Best practices:
- Prefer immutability for shared state (e.g., React state).
- Use shallow copy (spread) for top-level updates; deep clone only when necessary.
- Inject dependencies and avoid global mutation in libraries.
- Use structuredClone or libraries for safe deep-copying if needed.
- Use Object.freeze / deepFreeze for debugging immutability issues.
- Use proxies to detect accidental mutation during development.

Pitfalls:
- Assuming objects are copied when they are not (aliasing bugs).
- Using JSON methods for deep clone when objects contain functions, Symbols, BigInt or circular refs.
- Excessive deep cloning on hot paths (performance/memory).

Checklist before mutating an object:
1) Is it shared? If yes, prefer copying or immutable update.
2) Is a shallow copy enough? If yes, use spread/Object.assign.
3) If deep copy required, prefer structuredClone or a tested utility.

`);

console.log('\n=== End of Values vs References Guide ===\n');

// Helpful quick-run note:
// node "js values vs reference.js"

