/**
 * ===================================================================
 * JAVASCRIPT PROTOTYPES: Everything a Developer Must Know
 * ===================================================================
 * 
 * Prototypes are the FOUNDATION of JavaScript. Understanding them
 * is essential, not optional. Let's build this knowledge carefully.
 */

// ===================================================================
// 1. What is a Prototype? The Big Picture
// ===================================================================
/**
 * A prototype is simply an object that other objects can inherit
 * properties and methods from.
 * 
 * JavaScript is PROTOTYPE-BASED, not CLASS-BASED (though classes
 * are syntactic sugar over prototypes).
 * 
 * Core concepts:
 * - Every object has a prototype
 * - Prototypes are objects too
 * - Prototypes have prototypes (chain)
 * - Prototypes enable code reuse via delegation
 */

// ===================================================================
// 2. The [[Prototype]] Internal Slot vs .prototype Property
// ===================================================================
/**
 * This distinction causes confusion. Let's clarify:
 * 
 * [[Prototype]]:
 * - Internal hidden link on EVERY object
 * - What an object delegates to (what it inherits from)
 * - Accessed via: Object.getPrototypeOf(obj) or obj.__proto__
 * - This is what makes property lookup work
 * 
 * .prototype:
 * - A regular property on FUNCTIONS ONLY
 * - Used to set up [[Prototype]] for objects created with `new`
 * - When you call new Foo(), the new object's [[Prototype]] is set to Foo.prototype
 * - NOT what the function inherits from
 */

// Example: Object has both but they're DIFFERENT
function MyFunction() {}
console.log(MyFunction.hasOwnProperty('prototype')); // true - functions have .prototype

const obj = {};
console.log(obj.hasOwnProperty('prototype')); // false - regular objects don't have .prototype
console.log(Object.getPrototypeOf(obj)); // {} - but objects have [[Prototype]]

// ===================================================================
// 3. The Prototype Chain: How Property Lookup Works
// ===================================================================
/**
 * When you access a property on an object, JavaScript searches in this order:
 * 
 * 1. The object itself (own properties)
 * 2. The object's [[Prototype]]
 * 3. The prototype's [[Prototype]]
 * 4. ... up the chain until null
 * 
 * This is DELEGATION, not COPYING. The actual method lives in one place.
 * 
 * Key insight: You're not "inheriting" in the OOP sense.
 * You're delegating property lookup to another object.
 */

const parent = {
  greet() {
    return 'Hello from parent';
  },
  name: 'Parent'
};

const child = Object.create(parent);
child.age = 10;

console.log(child.age); // 10 - found on child itself
console.log(child.greet()); // "Hello from parent" - delegated to parent
console.log(child.name); // "Parent" - delegated to parent

// The chain: child -> parent -> Object.prototype -> null
console.log(Object.getPrototypeOf(child) === parent); // true
console.log(Object.getPrototypeOf(parent) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype)); // null - end of chain

// ===================================================================
// 4. own vs Prototype Properties: Critical Distinction
// ===================================================================
/**
 * Objects can have two types of properties:
 * 
 * OWN property: Defined directly on the object
 * PROTOTYPE property: Found by walking the chain
 * 
 * This matters for loops, serialization, and performance.
 */

const animal = {
  species: 'Unknown'
};

const dog = Object.create(animal);
dog.name = 'Rex'; // own property
dog.breed = 'Labrador'; // own property

console.log(dog.hasOwnProperty('name')); // true
console.log(dog.hasOwnProperty('species')); // false - it's on the prototype
console.log('species' in dog); // true - but it exists in the object
console.log(dog.species); // "Unknown" - accessible via delegation

// Iterate only own properties
for (let key in dog) {
  if (dog.hasOwnProperty(key)) {
    console.log(key); // name, breed (not species)
  }
}

// Get all properties (including prototype)
Object.getOwnPropertyNames(dog); // ['name', 'breed']
Object.keys(dog); // ['name', 'breed']

// ===================================================================
// 5. Constructor Functions and .prototype
// ===================================================================
/**
 * Constructor functions are regular functions called with `new`.
 * 
 * The pattern:
 * 1. Create a function (the constructor)
 * 2. Add methods to function.prototype
 * 3. Call with `new` to create instances
 * 4. Each instance gets a [[Prototype]] pointing to function.prototype
 */

function Animal(name) {
  this.name = name;
}

// Add methods to the prototype (shared by all instances)
Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

Animal.prototype.move = function() {
  return `${this.name} is moving`;
};

const cat = new Animal('Whiskers');
const dog2 = new Animal('Buddy');

// Both instances delegate to Animal.prototype
console.log(cat.speak()); // "Whiskers makes a sound"
console.log(dog2.speak()); // "Buddy makes a sound"

// But they have different own properties
console.log(cat.name); // "Whiskers"
console.log(dog2.name); // "Buddy"

console.log(Object.getPrototypeOf(cat) === Animal.prototype); // true
console.log(Object.getPrototypeOf(dog2) === Animal.prototype); // true

// ===================================================================
// 6. What Happens With the `new` Keyword (CRUCIAL)
// ===================================================================
/**
 * Understanding `new` is essential to prototypes.
 * 
 * When you write: const obj = new Constructor(args)
 * 
 * JavaScript does:
 * 1. Create a new empty object: const obj = {}
 * 2. Set its [[Prototype]]: obj.__proto__ = Constructor.prototype
 * 3. Call the constructor: Constructor.call(obj, args)
 * 4. Return the object: return obj (unless constructor returns an object)
 */

function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.describe = function() {
  return `${this.name} is ${this.age} years old`;
};

// Equivalent to:
// const person = {};
// person.__proto__ = Person.prototype;
// Person.call(person, 'Alice', 30);
// return person;

const person = new Person('Alice', 30);
console.log(person.describe()); // "Alice is 30 years old"
console.log(person.constructor === Person); // true

// ===================================================================
// 7. The .constructor Property: Circular Reference
// ===================================================================
/**
 * By default, Constructor.prototype.constructor points back to Constructor.
 * This creates a circular reference:
 * 
 * Person.prototype.constructor === Person
 * person.constructor === Person
 * 
 * This is useful for:
 * - Creating new instances dynamically
 * - Introspection
 * - Serialization
 * 
 * WARNING: Be careful not to overwrite it accidentally.
 */

function Dog(name) {
  this.name = name;
}

console.log(Dog.prototype.constructor === Dog); // true

const myDog = new Dog('Buddy');
console.log(myDog.constructor === Dog); // true - found via prototype chain

// Create new instance via constructor
const anotherDog = new myDog.constructor('Max');
console.log(anotherDog.name); // "Max"

// ===================================================================
// 8. Object.create(): Manual Prototype Setup
// ===================================================================
/**
 * Object.create(proto) creates a new object with the specified prototype.
 * This is the explicit, intentional way to set up prototypes.
 * 
 * Object.create(null) creates an object with NO prototype (pure object).
 */

const animalPrototype = {
  eat() {
    return `${this.name} is eating`;
  },
  sleep() {
    return `${this.name} is sleeping`;
  }
};

// Create an object with animalPrototype as its [[Prototype]]
const cat2 = Object.create(animalPrototype);
cat2.name = 'Whiskers';
cat2.color = 'orange';

console.log(cat2.eat()); // "Whiskers is eating"
console.log(Object.getPrototypeOf(cat2) === animalPrototype); // true

// Object.create(null) - no prototype chain
const pureObject = Object.create(null);
console.log(Object.getPrototypeOf(pureObject)); // null
console.log(pureObject.hasOwnProperty); // undefined - no methods!

// But you can still add properties
pureObject.key = 'value';
console.log(pureObject.key); // "value"

// ===================================================================
// 9. Prototype Delegation vs Copy (CRITICAL DISTINCTION)
// ===================================================================
/**
 * Prototypes are DELEGATED TO, not copied.
 * This is fundamental to understanding JavaScript.
 * 
 * If you modify the prototype, all instances see the change.
 * This is powerful but also dangerous.
 */

function Vehicle(brand) {
  this.brand = brand;
}

Vehicle.prototype.drive = function() {
  return `${this.brand} is driving`;
};

const car = new Vehicle('Toyota');
const truck = new Vehicle('Ford');

console.log(car.drive()); // "Toyota is driving"

// Now modify the prototype
Vehicle.prototype.drive = function() {
  return `${this.brand} is now flying!`;
};

// Both instances immediately see the change
console.log(car.drive()); // "Toyota is now flying!"
console.log(truck.drive()); // "Ford is now flying!"

// This is because car and truck DELEGATE to Vehicle.prototype
// They don't have a copy of the method

// ===================================================================
// 10. Shadowing: Own Properties Hide Prototype Properties
// ===================================================================
/**
 * When an object has an own property with the same name as a
 * prototype property, the own property takes precedence.
 * This is called SHADOWING.
 */

const defaultSettings = {
  theme: 'light',
  fontSize: 14,
  lang: 'en'
};

const userSettings = Object.create(defaultSettings);

// Access prototype properties
console.log(userSettings.theme); // "light" - from defaultSettings

// User changes theme - creates own property
userSettings.theme = 'dark';
console.log(userSettings.theme); // "dark" - own property shadows prototype

// Other properties still delegate
console.log(userSettings.fontSize); // 14 - still from prototype

// Delete the own property, prototype resurfaces
delete userSettings.theme;
console.log(userSettings.theme); // "light" - prototype is back

console.log(userSettings.hasOwnProperty('theme')); // false
console.log('theme' in userSettings); // true

// ===================================================================
// 11. Mutating Prototypes: Dangers and Considerations
// ===================================================================
/**
 * GENERAL RULE: Don't modify other people's prototypes.
 * 
 * You can modify:
 * - Your own prototypes (fine, but keep it clean)
 * - Built-in prototypes (⚠️ only in special cases, usually bad)
 * 
 * Reasons not to:
 * - Breaks third-party code
 * - Causes naming conflicts
 * - Makes debugging harder
 * - Performance implications
 */

// ❌ BAD: Modifying built-in prototypes
// Array.prototype.unique = function() {
//   return [...new Set(this)];
// };
// // Now ALL arrays have .unique - conflicts with others' code

// ✅ GOOD: Modify your own prototypes
function MyArray(items) {
  this.items = items;
}

MyArray.prototype.unique = function() {
  return [...new Set(this.items)];
};

const arr = new MyArray([1, 2, 2, 3]);
console.log(arr.unique()); // [1, 2, 3]

// ===================================================================
// 12. Prototype Chains: Multiple Levels
// ===================================================================
/**
 * Prototypes have prototypes, creating chains.
 * Property lookup walks the entire chain.
 * 
 * Example chain:
 * grandChild -> child -> parent -> Object.prototype -> null
 */

const grandParent = {
  wealth: 'millions',
  speak() {
    return 'wise words';
  }
};

const parent2 = Object.create(grandParent);
parent2.career = 'engineer';
parent2.skills = ['coding', 'design'];

const grandChild = Object.create(parent2);
grandChild.age = 8;

// Property lookup walks the chain
console.log(grandChild.age); // 8 - own property
console.log(grandChild.career); // "engineer" - 1 level up
console.log(grandChild.wealth); // "millions" - 2 levels up
console.log(grandChild.speak()); // "wise words" - 2 levels up, then call with `this` = grandChild

// The chain
console.log(Object.getPrototypeOf(grandChild) === parent2); // true
console.log(Object.getPrototypeOf(parent2) === grandParent); // true
console.log(Object.getPrototypeOf(grandParent) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype)); // null

// ===================================================================
// 13. Examining Prototypes: Introspection Tools
// ===================================================================
/**
 * Multiple ways to examine and work with prototypes.
 */

function Shape() {}
Shape.prototype.getArea = function() { return 0; };

const shape = new Shape();

// Get the prototype of an object
const proto = Object.getPrototypeOf(shape);
console.log(proto === Shape.prototype); // true

// Check if an object is in the prototype chain
console.log(Shape.prototype.isPrototypeOf(shape)); // true
console.log(Object.prototype.isPrototypeOf(shape)); // true
console.log(Function.prototype.isPrototypeOf(shape)); // false

// Check instance type
console.log(shape instanceof Shape); // true
console.log(shape instanceof Object); // true

// Get all properties
console.log(Object.getOwnPropertyNames(Shape.prototype)); // ['constructor', 'getArea']

// Get property descriptors
console.log(Object.getOwnPropertyDescriptor(Shape.prototype, 'getArea'));
// { value: ƒ, writable: true, enumerable: false, configurable: true }

// ===================================================================
// 14. Property Descriptors: Controlling Prototype Properties
// ===================================================================
/**
 * Properties have descriptors that control their behavior:
 * - value: the value
 * - writable: can it be changed?
 * - enumerable: shows up in for...in loops?
 * - configurable: can the descriptor be changed?
 * 
 * This is crucial for prototypes because methods shouldn't be
 * enumerable by default.
 */

const proto1 = {};

// Default property (all true except writable)
proto1.prop1 = 'value1';
console.log(Object.getOwnPropertyDescriptor(proto1, 'prop1'));
// { value: 'value1', writable: true, enumerable: true, configurable: true }

// Define property explicitly
Object.defineProperty(proto1, 'prop2', {
  value: 'value2',
  writable: false,
  enumerable: false,
  configurable: false
});

console.log(proto1.prop2); // "value2"
// prop1.prop2 = 'new'; // ❌ TypeError in strict mode - not writable
console.log(Object.keys(proto1)); // ['prop1'] - prop2 not enumerable

// This is why methods defined on prototypes don't loop in for...in
// (when defined with Object.defineProperty)

function Counter() {
  this.count = 0;
}

Counter.prototype.increment = function() {
  this.count++;
};

const counter = new Counter();
for (let key in counter) {
  console.log(key); // "count" - increment not shown (not enumerable)
}

// ===================================================================
// 15. instanceof Operator: Checking Prototype Chains
// ===================================================================
/**
 * instanceof checks if Constructor.prototype is anywhere in
 * the object's prototype chain.
 * 
 * obj instanceof Constructor is equivalent to:
 * Constructor.prototype.isPrototypeOf(obj)
 */

function Animal2() {}
function Dog3() {}
Dog3.prototype = Object.create(Animal2.prototype);

const myDog3 = new Dog3();

console.log(myDog3 instanceof Dog3); // true
console.log(myDog3 instanceof Animal2); // true
console.log(myDog3 instanceof Object); // true

// ===================================================================
// 16. ES6 Classes: Modern Syntax Over Prototypes
// ===================================================================
/**
 * ES6 classes are SYNTACTIC SUGAR over prototypes.
 * They don't change the prototype model - they just provide
 * cleaner syntax.
 * 
 * Understanding prototypes first makes classes much clearer.
 */

// These are equivalent:

// Traditional prototype approach
function Vehicle1(brand) {
  this.brand = brand;
}
Vehicle1.prototype.drive = function() {
  return `${this.brand} drives`;
};

// ES6 class approach
class Vehicle2 {
  constructor(brand) {
    this.brand = brand;
  }
  
  drive() {
    return `${this.brand} drives`;
  }
}

// Under the hood, Vehicle2.prototype exists and works like Vehicle1.prototype
const v1 = new Vehicle1('Toyota');
const v2 = new Vehicle2('Honda');

console.log(Object.getPrototypeOf(v1) === Vehicle1.prototype); // true
console.log(Object.getPrototypeOf(v2) === Vehicle2.prototype); // true

// The class methods go on the prototype
console.log(Vehicle2.prototype.hasOwnProperty('drive')); // true

// ===================================================================
// 17. Prototype Pollution: Security Concern
// ===================================================================
/**
 * Prototype pollution is a vulnerability where untrusted input
 * modifies prototypes, affecting all objects.
 * 
 * This is why understanding prototypes is important for security.
 */

// ⚠️ Dangerous pattern
function unsafeMerge(target, source) {
  for (let key in source) {
    target[key] = source[key]; // Could set __proto__, constructor, etc.
  }
  return target;
}

// Attack
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
const user = {};
// unsafeMerge(user, malicious); // Don't do this!

// Now Object.prototype.isAdmin is true - all objects affected!

// ✅ Safe pattern
function safeMerge(target, source) {
  for (let key in source) {
    if (source.hasOwnProperty(key) && key !== '__proto__' && key !== 'constructor') {
      target[key] = source[key];
    }
  }
  return target;
}

// ===================================================================
// 18. Prototype Performance Considerations
// ===================================================================
/**
 * Property lookup has a cost. The longer the chain, the longer
 * the search.
 * 
 * - Own properties: Fast (checked first)
 * - Prototype properties: Slower (must walk chain)
 * - Deep chains: Much slower
 * 
 * This is why it's good practice to:
 * - Cache frequently accessed prototype methods
 * - Keep inheritance chains shallow
 */

// Deep chain is slower
const level1 = { method() {} };
const level2 = Object.create(level1);
const level3 = Object.create(level2);
const level4 = Object.create(level3);
const level5 = Object.create(level4);

console.time('deep access');
for (let i = 0; i < 1000000; i++) {
  level5.method();
}
console.timeEnd('deep access');

// Shallow chain is faster
const fast1 = { method() {} };
const fast2 = Object.create(fast1);

console.time('fast access');
for (let i = 0; i < 1000000; i++) {
  fast2.method();
}
console.timeEnd('fast access');

// ===================================================================
// 19. Object.prototype and Built-in Methods
// ===================================================================
/**
 * Object.prototype is at the top of the chain for most objects.
 * It provides methods like:
 * - toString()
 * - hasOwnProperty()
 * - isPrototypeOf()
 * - propertyIsEnumerable()
 * - valueOf()
 * 
 * These are available on ALL objects through delegation.
 */

const testObj = { x: 10 };

console.log(testObj.toString()); // "[object Object]"
console.log(testObj.hasOwnProperty('x')); // true
console.log(testObj.hasOwnProperty('toString')); // false (it's on prototype)

// These come from Object.prototype
console.log(Object.prototype.hasOwnProperty('toString')); // true
console.log(Object.prototype.hasOwnProperty('hasOwnProperty')); // true

// ===================================================================
// 20. Creating Objects Without Object.prototype
// ===================================================================
/**
 * Object.create(null) creates an object with NO prototype.
 * No chain, no inherited methods.
 * 
 * Useful for:
 * - Maps/dictionaries (won't inherit from Object.prototype)
 * - Pure data objects
 * - Avoiding property name conflicts with built-ins
 */

// Normal object has Object.prototype
const normal = {};
console.log(Object.getPrototypeOf(normal) === Object.prototype); // true
console.log(normal.toString); // function (inherited)

// Null prototype object
const nullProto = Object.create(null);
console.log(Object.getPrototypeOf(nullProto)); // null
console.log(nullProto.toString); // undefined
console.log(nullProto.hasOwnProperty); // undefined

// But can still add properties
nullProto.key = 'value';
console.log(nullProto.key); // "value"

// Useful for dict-like objects
const dict = Object.create(null);
dict.constructor = 'not the built-in';
dict.toString = 'not the built-in';
console.log(dict.constructor); // "not the built-in" - no conflict!

// ===================================================================
// 21. CRITICAL GOTCHAS and Things to Remember
// ===================================================================
/**
 * 1. [[Prototype]] is set ONCE at creation
 *    - Changing an object's prototype later is slow (engine optimization)
 *    - Use Object.setPrototypeOf only when necessary
 * 
 * 2. this is determined by CALL TIME, not definition time
 *    - Methods in prototypes receive correct `this` from the instance
 *    - Arrow functions don't have their own `this`
 * 
 * 3. Shared mutable state in prototypes is dangerous
 *    - Arrays, objects on prototypes are SHARED
 *    - Each instance should have its own copy
 * 
 * 4. for...in loops walk the ENTIRE chain
 *    - Always use hasOwnProperty() to filter
 *    - Use Object.keys() for own properties only
 * 
 * 5. Delete only removes own properties
 *    - Can't delete prototype properties via instance
 *    - Must delete from the prototype itself
 * 
 * 6. constructor property can be accidentally overwritten
 *    - Easy to break instanceof checks
 *    - Always restore it when replacing prototypes
 * 
 * 7. Functions have .prototype, objects might not
 *    - Only constructors/functions have .prototype property
 *    - Everything has [[Prototype]]
 */

// Gotcha 1: Shared mutable state
function BadClass() {}
BadClass.prototype.items = []; // ❌ SHARED by all instances!

const bad1 = new BadClass();
const bad2 = new BadClass();
bad1.items.push('a');
console.log(bad2.items); // ['a'] - bad1's change affected bad2!

// ✅ CORRECT: Instance property
function GoodClass() {
  this.items = []; // Each instance has its own
}

const good1 = new GoodClass();
const good2 = new GoodClass();
good1.items.push('a');
console.log(good2.items); // [] - good2 is not affected

// ===================================================================
// 22. Summary: Key Insights About Prototypes
// ===================================================================
/**
 * ✅ JavaScript objects delegate to prototypes for properties
 * ✅ Prototypes are objects that form chains
 * ✅ Property lookup walks the chain until found or null
 * ✅ Each object has [[Prototype]] (internal link)
 * ✅ Functions have .prototype property (for instances)
 * ✅ `new` sets the instance's [[Prototype]] to Function.prototype
 * ✅ Constructor functions enable pattern reuse
 * ✅ Classes are syntactic sugar over the same mechanism
 * ✅ Shadowing lets instances override prototype properties
 * ✅ instanceof checks the prototype chain
 * ✅ for...in loops the entire chain (filter with hasOwnProperty)
 * ✅ Don't mutate other people's prototypes
 * ✅ Keep prototype chains shallow
 * ✅ Avoid shared mutable state in prototypes
 * ✅ Understanding prototypes makes classes make sense
 * ✅ Prototypes enable all of JavaScript's code reuse patterns
 */
