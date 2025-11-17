/**
 * ============================================================
 * FACTORY FUNCTIONS vs CONSTRUCTOR FUNCTIONS
 * A progressive, practical guide every JS developer should know
 * ============================================================
 *
 * We'll build from simple concepts to deeper internals:
 * 1. What each pattern looks like
 * 2. How `this` and object creation differ
 * 3. How prototypes and shared methods behave
 * 4. Private state via closures vs prototype/private fields
 * 5. Performance, instanceof, and pitfalls
 */

// -----------------------------
// 1) Factory Function — simple and explicit
// -----------------------------
function createUserFactory(name, age) {
	// Factory returns a brand-new object each call
	return {
		name,
		age,
		greet() {
			return `Hi, I'm ${this.name}`;
		}
	};
}

const f1 = createUserFactory('Alice', 30);
const f2 = createUserFactory('Bob', 25);

console.log(f1.greet()); // Hi, I'm Alice
console.log(f2.greet()); // Hi, I'm Bob

// Note: methods created here are distinct function objects per instance
console.log(f1.greet === f2.greet); // false

// -----------------------------
// 2) Constructor Function — `new` and `.prototype`
// -----------------------------
function UserConstructor(name, age) {
	// When called with `new`, `this` is the newly created object
	this.name = name;
	this.age = age;
}

// Methods defined on the prototype are shared (single function object)
UserConstructor.prototype.greet = function() {
	return `Hi, I'm ${this.name}`;
};

const c1 = new UserConstructor('Alice', 30);
const c2 = new UserConstructor('Bob', 25);

console.log(c1.greet()); // Hi, I'm Alice
console.log(c2.greet()); // Hi, I'm Bob
console.log(c1.greet === c2.greet); // true

// -----------------------------
// 3) Why `this` matters — what `new` actually does
// -----------------------------
/*
 Behind the scenes, `new Constructor(arg1, arg2)` roughly does:

 1. Create a new empty object: const obj = {};
 2. Set obj.[[Prototype]] = Constructor.prototype;
 3. Call Constructor with `this` bound to obj: const result = Constructor.call(obj, arg1, arg2);
 4. If Constructor returned an object, return that; otherwise return obj.

 This is why `this` inside a constructor refers to the instance being created.
*/

function simulateNew(constructor, ...args) {
	const obj = Object.create(constructor.prototype);
	const result = constructor.apply(obj, args);
	return (result !== null && (typeof result === 'object' || typeof result === 'function')) ? result : obj;
}

// Equivalent to `new UserConstructor('X', 1)`
const sim = simulateNew(UserConstructor, 'Sim', 1);
console.log(sim.greet());

// -----------------------------
// 4) Factories vs Constructors: method identity & memory
// -----------------------------
/*
 - Factory functions create fresh objects each call and typically recreate
	 any methods placed on the returned object (unless you delegate to a shared
	 prototype manually).
 - Constructor functions combined with prototypes allow sharing methods across
	 instances via the prototype chain, saving memory when many instances exist.

 Trade-off:
 - If methods capture private state (closures) unique per instance, factories
	 are convenient (each instance keeps its private closure variables).
 - If methods don't need private state, put them on the prototype to avoid
	 per-instance allocations.
*/

// Example: Private state via factory (closure)
function createCounterFactory() {
	let count = 0; // private to this instance
	return {
		increment() { count += 1; return count; },
		get() { return count; }
	};
}

const cf = createCounterFactory();
console.log(cf.increment()); // 1
console.log(cf.get()); // 1

// Example: Prototype-based counter (no private closure, shared methods)
function CounterProto() {
	this.count = 0;
}
CounterProto.prototype.increment = function() { this.count += 1; return this.count; };
CounterProto.prototype.get = function() { return this.count; };

const cp = new CounterProto();
console.log(cp.increment()); // 1
console.log(cp.get()); // 1

// -----------------------------
// 5) instanceof, constructor property, and identity
// -----------------------------
console.log(c1 instanceof UserConstructor); // true
console.log(Object.getPrototypeOf(c1) === UserConstructor.prototype); // true
console.log(c1.constructor === UserConstructor); // usually true (unless prototype overwritten)

// Factories normally produce plain objects whose prototype is Object.prototype
const f3 = createUserFactory('Eve', 45);
console.log(f3 instanceof UserConstructor); // false
console.log(f3 instanceof Object); // true

// If you want factory-created objects to behave like instances,
// you can delegate to a prototype explicitly:
const protoUser = {
	greet() { return `Hi, I'm ${this.name}`; }
};
function createUserWithProto(name, age) {
	const o = Object.create(protoUser);
	o.name = name;
	o.age = age;
	return o;
}
const fp = createUserWithProto('ProtoUser', 20);
console.log(Object.getPrototypeOf(fp) === protoUser); // true

// -----------------------------
// 6) Pitfalls: forgetting `new`, accidental globals, and return values
// -----------------------------
function MaybeForgotNew(name) {
	if (!(this instanceof MaybeForgotNew)) {
		// Defensive: allow safe calling without `new`
		return new MaybeForgotNew(name);
	}
	this.name = name;
}

// If called without `new` and not defended, `this` could be `window` (pre-strict)
// or `undefined` (strict mode) causing errors. Defensive check is common.

// Also: constructors can explicitly return an object, replacing the created one
function Weird() {
	this.a = 1;
	return { b: 2 }; // the returned object wins
}
const w = new Weird();
console.log(w); // { b: 2 }

// Factories always explicitly return the object you want; constructors implicitly
// return `this` unless they return an object.

// -----------------------------
// 7) When to use which pattern
// -----------------------------
/*
 Use a factory when:
 - You need per-instance private state via closures.
 - You prefer explicit returned objects and don't rely on `instanceof`.
 - You want to avoid `new` or defensive checks.

 Use a constructor + prototype when:
 - You need many instances that share behavior (memory efficiency).
 - You want `instanceof` checks and natural prototype chains.
 - You rely on the familiar `new`/`prototype` mental model.

 Note: ES6 classes are syntactic sugar for constructor + prototype.
*/

// -----------------------------
// 8) Best practices & gotchas (summary)
// -----------------------------
/*
 - Understand what `new` does: it creates the object and binds `this`.
 - Prefer prototype methods for behavior that doesn't require private state.
 - Use factory closures for private data and simple APIs.
 - Beware of shared mutable prototype properties (arrays/objects on prototype).
 - Defensive constructors: ensure function works if called without `new`.
 - Avoid mutating built-in prototypes (Array.prototype, etc.).
 - If you need class-like semantics but want privacy, consider private fields (#) or WeakMap.

 Quick checklist:
 - Do you need private per-instance data? -> factory or closure/private fields
 - Do you need many instances with shared methods? -> constructor + prototype
 - Do you need `instanceof` or `constructor` identity? -> constructor
 - Are you returning an object explicitly? -> use factory or be careful in constructor
*/

// -----------------------------
// 9) Closing note: `this` creation is central
// -----------------------------
/*
 The mental model developers must internalize:
 - In constructor functions, `this` is created and returned by `new` (unless an object is returned).
 - In factories, `this` is not involved; you explicitly construct and return an object.
 - Methods' behavior depends on how they're defined (closure-bound vs prototype methods).

 Mastering these differences leads to safer, more memory-efficient, and predictable code.
*/
