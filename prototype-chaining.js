/**
 * ===================================================================
 * PROTOTYPE CHAINING IN JAVASCRIPT — A Progressive Guide
 * ===================================================================
 *
 * This file explains prototype chaining from first principles up to
 * practical engineering considerations every JS developer should know.
 * We'll cover: prototypes, the lookup algorithm, creating chains,
 * examples, inspection tools, pitfalls, performance, and best practices.
 */

// ===================================================================
// 1) Quick mental model: delegation, not copying
// ===================================================================
/**
 * Objects don't "inherit" by copying fields. Instead they DELEGATE
 * property access to another object (their prototype). That delegation
 * forms a chain ending at `null`.
 */

// ===================================================================
// 2) [[Prototype]] vs `.prototype` (the most important distinction)
// ===================================================================
/**
 * - Every object has an internal [[Prototype]] (accessible via
 *   `Object.getPrototypeOf(obj)` or `obj.__proto__`).
 * - Functions (as constructors) have a `.prototype` property which is
 *   used to initialize the [[Prototype]] of instances created with `new`.
 *
 * Remember: [[Prototype]] is an object's link; `.prototype` is a property
 * on functions used when creating objects with `new`.
 */

// ===================================================================
// 3) Prototype chain and property lookup algorithm
// ===================================================================
/**
 * When evaluating `obj.prop` JavaScript follows these steps:
 * 1. Look for `prop` on `obj` (own properties)
 * 2. If not found, look on Object.getPrototypeOf(obj)
 * 3. Repeat step 2 up the chain until property is found or prototype === null
 * 4. If not found, result is `undefined`
 *
 * Method calls use the object that initiated the lookup as `this`.
 */

const root = { rootValue: 'root' };
const mid = Object.create(root);
mid.midValue = 'mid';
const leaf = Object.create(mid);
leaf.ownValue = 'leaf';

console.log(leaf.ownValue); // 'leaf' (own)
console.log(leaf.midValue); // 'mid' (delegated to mid)
console.log(leaf.rootValue); // 'root' (delegated to root)
console.log(Object.getPrototypeOf(leaf) === mid); // true

// ===================================================================
// 4) Creating prototype chains: common techniques
// ===================================================================
/**
 * - `Object.create(proto)` -> creates a new object whose [[Prototype]] is `proto`.
 * - Constructor functions + `new` -> new object's [[Prototype]] is `Ctor.prototype`.
 * - `class` uses the same prototype mechanism under the hood.
 * - `Object.setPrototypeOf(obj, proto)` -> change prototype at runtime (slow, avoid when possible).
 */

// Object.create example (explicit delegation)
const animalProto = {
	speak() { return `${this.name} makes a sound`; }
};
const dog = Object.create(animalProto);
dog.name = 'Rex';
console.log(dog.speak()); // 'Rex makes a sound'

// Constructor + prototype example
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() { return `${this.name} generic sound`; };
function Dog(name) { Animal.call(this, name); }
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function() { return `${this.name} barks`; };

const d = new Dog('Buddy');
console.log(d.speak()); // 'Buddy barks'
console.log(d instanceof Dog); // true
console.log(d instanceof Animal); // true

// ===================================================================
// 5) Methods and `this` in prototype chain
// ===================================================================
/**
 * Methods defined on prototypes are looked up via the chain but executed
 * with `this` bound to the calling object (the instance) — not the prototype.
 */

const proto = {
	id: 42,
	show() { return `id=${this.id}`; }
};
const o = Object.create(proto);
o.id = 7;
console.log(o.show()); // 'id=7' (this refers to `o`)

// ===================================================================
// 6) own properties shadow prototype properties
// ===================================================================
proto.value = 'proto';
o.value = 'own';
console.log(o.value); // 'own' (own property shadows prototype)
delete o.value;
console.log(o.value); // 'proto' (prototype resurfaces)

// ===================================================================
// 7) Inspecting prototype chains (tools and idioms)
// ===================================================================
/**
 * - `Object.getPrototypeOf(obj)` — return direct prototype
 * - `proto.isPrototypeOf(obj)` — test if proto is in chain
 * - `obj instanceof Constructor` — true if Constructor.prototype is in chain
 * - `Object.getOwnPropertyNames` / `Object.keys` / `for...in` — distinguish own vs inherited
 */

console.log(Object.getPrototypeOf(d) === Dog.prototype); // true
console.log(Animal.prototype.isPrototypeOf(d)); // true
console.log(Object.prototype.isPrototypeOf(d)); // true

// for...in iterates enumerable own + inherited properties
for (const k in d) {
	if (d.hasOwnProperty(k)) {
		console.log('own:', k);
	} else {
		console.log('inherited:', k);
	}
}

// ===================================================================
// 8) Prototype pollution and security
// ===================================================================
/**
 * Prototype pollution occurs when untrusted input modifies prototypes
 * (for example setting `__proto__`), affecting all objects. Always
 * sanitize input and avoid unsafe merging patterns.
 */

// Unsafe merge example (don't do this)
function unsafeMerge(target, source) {
	for (const k in source) { target[k] = source[k]; }
}

// Safer: check own properties and forbid `__proto__` / `constructor`
function safeMerge(target, source) {
	for (const k in source) {
		if (!Object.prototype.hasOwnProperty.call(source, k)) continue;
		if (k === '__proto__' || k === 'constructor') continue;
		target[k] = source[k];
	}
}

// ===================================================================
// 9) Performance notes and mutable shared state
// ===================================================================
/**
 * - Prototype lookups are slightly slower than own property access.
 * - Deep prototype chains increase lookup time.
 * - Mutating prototypes (especially at runtime) can deoptimize engines.
 * - Putting mutable objects (arrays/objects) on prototypes shares state
 *   across all instances — usually a bug.
 */

function Bad() {}
Bad.prototype.items = []; // shared across all instances — avoid this
const b1 = new Bad();
const b2 = new Bad();
b1.items.push(1);
console.log(b2.items); // [1] — surprising shared state

// Good: give each instance its own storage in constructor
function Good() { this.items = []; }
Good.prototype.add = function(x) { this.items.push(x); };
const g1 = new Good();
const g2 = new Good();
g1.add(1);
console.log(g2.items); // []

// ===================================================================
// 10) Changing prototypes at runtime
// ===================================================================
/**
 * `Object.setPrototypeOf(obj, proto)` works but is slow and harms optimizations.
 * Prefer creating objects with the right prototype using `Object.create` or `new`.
 */

const base = { name: 'base' };
const dynamic = {};
Object.setPrototypeOf(dynamic, base); // possible but slow
console.log(dynamic.name); // 'base'

// ===================================================================
// 11) Classes are sugar — prototype chaining still applies
// ===================================================================
class A { a() { return 'a'; } }
class B extends A { b() { return 'b'; } }
const inst = new B();
console.log(typeof inst.a); // 'function' (inherited via prototype chain)

// Under the hood: B.prototype.[[Prototype]] === A.prototype
console.log(Object.getPrototypeOf(B.prototype) === A.prototype);

// ===================================================================
// 12) Practical patterns: composition and mixins
// ===================================================================
/**
 * Instead of long inheritance chains, prefer composition and mixins.
 * Mixins can copy methods onto prototypes or objects; composition
 * tends to be easier to reason about.
 */

const canFly = { fly() { return `${this.name} flies`; } };
const canSwim = { swim() { return `${this.name} swims`; } };
const bird = Object.create(canFly);
bird.name = 'Tweety';
console.log(bird.fly());

// Or mixin into a prototype
function Creature(name) { this.name = name; }
Object.assign(Creature.prototype, canSwim, canFly);
const c = new Creature('Nemo');
console.log(c.swim());

// ===================================================================
// 13) Tools to debug prototype chains
// ===================================================================
/**
 * - `console.dir(obj)` shows prototype in many runtimes
 * - Chrome/Node devtools show `__proto__` chain in object inspector
 * - Use `Object.getPrototypeOf`, `.isPrototypeOf`, and `.hasOwnProperty`
 */

// ===================================================================
// 14) Checklist: what every JS developer must internalize
// ===================================================================
/**
 * - Objects delegate to prototypes — delegation, not copying.
 * - `Object.getPrototypeOf(obj)` reveals the link; `.prototype` is for constructors.
 * - `new` sets [[Prototype]] = Constructor.prototype and binds `this` to the instance.
 * - Property lookup walks the chain until `null`.
 * - Own properties shadow prototype properties.
 * - Avoid shared mutable state on prototypes.
 * - Don't mutate built-in prototypes; avoid `Object.setPrototypeOf` at runtime.
 * - Use composition/mixins when appropriate instead of deep chains.
 * - Beware of prototype pollution; sanitize inputs.
 */

// ===================================================================
// 15) Final note: practice exercises you can try
// ===================================================================
/**
 * - Create an object chain 4 levels deep and time property lookup.
 * - Replace a prototype with `Object.create` vs `Object.setPrototypeOf` and observe performance.
 * - Implement a simple mixin and compare it to subclassing.
 */

// Try running this file with: node prototype-chaining.js
