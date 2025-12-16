/**
 * THE 'this' KEYWORD — Beginner → Expert
 *
 * A progressive guide explaining how 'this' binding works in JavaScript,
 * building one concept on top of the next. Run with: `node this-keyword.js`
 */

// =======================================================
// BEGINNER: What is 'this'?
// =======================================================

console.log('\n=== BEGINNER: What is "this"? ===\n');

/**
 * 'this' is a keyword that refers to the object that is executing the current code.
 * Its value depends on HOW a function is called, not WHERE it's defined.
 */

// In the global scope, 'this' refers to the global object (in Node: global)
console.log('Global this:', typeof global); // In Node.js, global object exists
console.log('this === global (in strict mode):', globalThis === global); // true in Node

// ====================================================
// BEGINNER: Method Context (Implicit Binding)
// =====================================================

console.log('\n=== BEGINNER: Method Context ===\n');

/**
 * When a function is called as a METHOD (obj.method()), 'this' refers to the object.
 */

const person = {
  name: 'Alice',
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

person.greet(); // Hello, I'm Alice
// 'this' = person because greet was called as person.greet()

const pet = {
  name: 'Fluffy',
  speak() {
    console.log(`${this.name} says hello!`);
  }
};

pet.speak(); // Fluffy says hello!

// =======================================================
// BEGINNER: Function Context (Lost 'this')
// ========================================================

console.log('\n=== BEGINNER: Function Context (Lost this) ===\n');

/**
 * When a function is called as a plain function (not a method),
 * 'this' refers to the global object (or undefined in strict mode).
 */

const user = {
  name: 'Bob',
  getName() {
    return this.name;
  }
};

// Calling as a method
console.log('As method:', user.getName()); // Bob

// Assigning to variable and calling as function
const getName = user.getName;
console.log('As function:', getName()); // undefined or global.name
// 'this' is lost! It's now the global object, which doesn't have 'name'

// This is a very common source of bugs!

// =============================================================
// INTERMEDIATE: Explicit Binding with call, apply, bind
// ==============================================================

console.log('\n=== INTERMEDIATE: Explicit Binding (call, apply, bind) ===\n');

/**
 * You can explicitly set 'this' using:
 * - call(thisArg, arg1, arg2, ...)
 * - apply(thisArg, [arg1, arg2, ...])
 * - bind(thisArg) returns a new function
 */

const car = { brand: 'Toyota' };
const motorcycle = { brand: 'Harley' };

function describe(color, year) {
  console.log(`${this.brand} in ${color}, made in ${year}`);
}

// Using call: pass this + arguments directly
describe.call(car, 'red', 2020); // Toyota in red, made in 2020
describe.call(motorcycle, 'black', 2021); // Harley in black, made in 2021

// Using apply: pass this + arguments as array
const args = ['blue', 2022];
describe.apply(car, args); // Toyota in blue, made in 2022

// Using bind: returns a NEW function with locked 'this'
const carDescribe = describe.bind(car);
carDescribe('green', 2023); // Toyota in green, made in 2023
carDescribe('yellow', 2024); // Toyota in yellow, made in 2024
// 'this' is always 'car' now

console.log('\nKey difference: call/apply execute immediately; bind returns a function.');

// ======================================================
// INTERMEDIATE: Arrow Functions and 'this' Lexical Binding
// =======================================================

console.log('\n=== INTERMEDIATE: Arrow Functions ===\n');

/**
 * Arrow functions do NOT have their own 'this'.
 * They inherit 'this' from the surrounding LEXICAL SCOPE (where they're defined).
 * This is a major difference from regular functions!
 */

const obj = {
  name: 'Carol',
  // Regular function: gets 'this' from how it's called
  regularMethod() {
    console.log('Regular:', this.name);
  },
  // Arrow function: inherits 'this' from surrounding context (obj)
  arrowMethod: () => {
    console.log('Arrow:', this.name); // this is global, NOT obj
  },
  // Arrow inside a method gets 'this' from the method's 'this'
  methodWithArrow() {
    const arrow = () => {
      console.log('Nested arrow:', this.name); // this is obj
    };
    arrow();
  }
};

obj.regularMethod(); // Regular: Carol
obj.arrowMethod(); // Arrow: undefined (this is global)
obj.methodWithArrow(); // Nested arrow: Carol

// Arrow functions are useful for callbacks where you want to PRESERVE 'this'
const button = {
  label: 'Click me',
  onClick: function() {
    // Regular callback might lose 'this'
    setTimeout(function() {
      console.log('Regular callback:', this); // this is global/undefined
    }, 10);
    
    // Arrow function preserves 'this' from onClick
    setTimeout(() => {
      console.log('Arrow callback, this.label:', this.label); // Click me
    }, 20);
  }
};

button.onClick();

// ==========================================================
// INTERMEDIATE: Common Pitfall — Detached Methods
// ==========================================================

console.log('\n=== INTERMEDIATE: Detached Methods Pitfall ===\n');

/**
 * A common bug: storing a method reference and calling it later.
 * The method's 'this' binding is lost.
 */

const counter = {
  count: 0,
  increment() {
    this.count += 1;
    console.log(`Count: ${this.count}`);
  },
  reset() {
    this.count = 0;
  }
};

counter.increment(); // Count: 1

// PITFALL: storing the method
const incDetached = counter.increment;
try {
  incDetached(); // Error or undefined behavior; 'this' is not counter
} catch (e) {
  console.log('Error calling detached method:', e.message);
}

// SOLUTIONS:
// 1) Use bind
const incBound = counter.increment.bind(counter);
incBound(); // Count: 2

// 2) Use arrow in assignment (if using class or modern syntax)
const counter2 = {
  count: 0,
  increment: () => { /* ... */ } // NOT recommended for methods
};

// 3) Call via the object
counter.increment(); // Always works

console.log('\nBest practice: avoid detaching methods or use bind/arrow appropriately.');

// =============================================================
// ADVANCED: 'this' in Constructors (new keyword)
// ==============================================================

console.log('\n=== ADVANCED: Constructor Functions (new keyword) ===\n');

/**
 * When a function is called with 'new', a new object is created and 'this' refers to it.
 * This is how constructor functions work.
 */

function Animal(name) {
  this.name = name; // 'this' is the new object being created
}

Animal.prototype.speak = function() {
  console.log(`${this.name} makes a sound`);
};

const dog = new Animal('Rex');
console.log('dog.name:', dog.name); // Rex
dog.speak(); // Rex makes a sound

// Without 'new', 'this' is global or undefined in strict mode
try {
  const notAnimal = Animal('Spot');
  // notAnimal is undefined; 'this' was global
} catch (e) {
  console.log('Error without new:', e.message);
}

// ==============================================================
// ADVANCED: 'this' in Classes
// ==============================================================

console.log('\n=== ADVANCED: Classes and "this" ===\n');

/**
 * In classes, 'this' refers to the instance.
 * Class methods have implicit 'this' binding in the constructor,
 * but methods called as detached functions still lose 'this'.
 */

class Counter {
  constructor(start = 0) {
    this.count = start;
  }
  
  increment() {
    this.count += 1;
    return this.count;
  }
  
  // Arrow method: 'this' is bound to the instance (stored on construction)
  decrement = () => {
    this.count -= 1;
    return this.count;
  };
}

const c = new Counter(10);
console.log('c.increment():', c.increment()); // 11
console.log('c.decrement():', c.decrement()); // 10

// Detached regular method still loses 'this'
const inc = c.increment;
try {
  inc();
} catch (e) {
  console.log('Detached class method error:', e.message);
}

// But detached arrow method keeps 'this'
const dec = c.decrement;
console.log('Detached arrow method:', dec()); // 9

// =============================================================
// ADVANCED: 'this' in Callbacks and Event Handlers
// ===============================================================

console.log('\n=== ADVANCED: Callbacks & Event Handlers ===\n');

/**
 * In callbacks (setTimeout, array methods, event handlers),
 * 'this' depends on how the callback is invoked.
 * Arrow functions are often the solution here.
 */

const dataFetcher = {
  data: [],
  name: 'Fetcher',
  
  // Callback with arrow: preserves 'this'
  loadArrow() {
    setTimeout(() => {
      this.data = [1, 2, 3];
      console.log(`${this.name} loaded via arrow:`, this.data);
    }, 10);
  },
  
  // Using bind in callback
  loadBind() {
    setTimeout(function() {
      this.data = [4, 5, 6];
      console.log(`${this.name} loaded via bind:`, this.data);
    }.bind(this), 20);
  }
};

dataFetcher.loadArrow();
dataFetcher.loadBind();

// Array methods: callback 'this' is often undefined unless second arg provided
const obj2 = {
  values: [1, 2, 3],
  double() {
    // Without second arg, 'this' in callback is undefined
    const result = this.values.map(function(v) {
      return v * 2;
    });
    
    // With second arg or arrow, 'this' is preserved
    const result2 = this.values.map(v => v * 2);
    
    console.log('Doubled:', result2); // [2, 4, 6]
  }
};

obj2.double();

// =========================================================
// ADVANCED: 'this' Binding Order (Precedence)
// ============================================================

console.log('\n=== ADVANCED: "this" Binding Precedence ===\n');

/**
 * When a function is called, 'this' is determined by (in order):
 * 1. Arrow function? → Use lexical 'this' (from surrounding scope)
 * 2. Called with new? → Use the new object
 * 3. Called with call/apply/bind? → Use the provided 'this'
 * 4. Called as a method? → Use the object
 * 5. Otherwise → Use global object (or undefined in strict mode)
 */

const bindingDemo = {
  name: 'bindingDemo',
  method() {
    console.log('1. Regular method:', this.name);
    
    // call overrides method binding
    const obj3 = { name: 'obj3' };
    this.method.call(obj3); // prints: obj3
    
    // new creates a new object (and binds 'this' to it)
    const result = new this.method(); // prints: undefined (new object)
  }
};

bindingDemo.method(); // Demonstrates precedence

// =====================================================
// ADVANCED: Common Patterns and Anti-patterns
// =======================================================

console.log('\n=== ADVANCED: Patterns & Anti-patterns ===\n');

/**
 * Pattern 1: Storing reference to 'this' (old before arrow functions)
 */
const observer = {
  state: { x: 1 },
  subscribe(fn) {
    const self = this; // "self" holds reference to observer
    this._callback = function(newState) {
      self.state = newState; // use 'self' instead of 'this'
    };
  }
};

/**
 * Pattern 2: Binding in constructor (for class instances)
 */
class EventEmitter {
  constructor() {
    this.on = this.on.bind(this); // locks 'this'
  }
  
  on(event, handler) {
    console.log(`Registered handler for ${event}`);
  }
}

/**
 * Pattern 3: Arrow methods in class (modern)
 */
class Handler {
  name = 'Handler';
  
  handle = () => {
    console.log(`Handled by ${this.name}`); // always works
  };
}

const h = new Handler();
const detached = h.handle;
detached(); // Still works: Handled by Handler

/**
 * Anti-pattern: Arrow function as method in object literal
 */
const badObj = {
  name: 'bad',
  greet: () => {
    console.log(`Hello from ${this.name}`); // 'this' is global, not badObj
  }
};

// badObj.greet(); // Prints undefined (wrong!)

console.log('Patterns demonstrated.');

// ============================================================
// ADVANCED: 'this' in Getters and Setters
// ===========================================================

console.log('\n=== ADVANCED: Getters and Setters ===\n');

const config = {
  _value: 0,
  
  get value() {
    console.log('Getting value from', this); // 'this' is config
    return this._value;
  },
  
  set value(v) {
    console.log('Setting value on', this); // 'this' is config
    this._value = v;
  }
};

console.log('config.value:', config.value); // Getting value from config
config.value = 42; // Setting value on config

// ========================================================
// ADVANCED: 'this' Edge Cases
// =========================================================

console.log('\n=== ADVANCED: Edge Cases ===\n');

// Nested functions lose 'this'
const obj4 = {
  name: 'obj4',
  outer() {
    console.log('Outer this:', this.name); // obj4
    
    function inner() {
      console.log('Inner this:', this.name); // undefined (inner is not a method)
    }
    
    inner(); // lose 'this'
    
    // Arrow preserves it
    (() => {
      console.log('Arrow inner this:', this.name); // obj4
    })();
  }
};

obj4.outer();

// Method chaining depends on returning 'this'
const builder = {
  value: 0,
  add(n) {
    this.value += n;
    return this; // return 'this' for chaining
  },
  multiply(n) {
    this.value *= n;
    return this;
  },
  get() {
    return this.value;
  }
};

const result = builder.add(5).multiply(2).add(3).get();
console.log('Chained result:', result); // (5 * 2) + 3 = 13

// =====================================================
// BEST PRACTICES & DECISION TREE
// ======================================================

console.log('\n=== Best Practices ===\n');

console.log(`
DECISION TREE FOR 'this':

When defining a method on an object:
  → Use regular function () {} or class method
  → Don't use arrow function (loses 'this' to outer scope)

When using as a callback or passing to another function:
  → Use arrow function () => {} (preserves 'this')
  → Or use .bind(this) with regular function

For class methods that might be detached:
  → Use arrow method = () => {} in class
  → Or call via this.method() always
  → Or bind in constructor

When storing 'this' reference:
  → Use arrow functions (modern approach)
  → Or const self = this (older approach still valid)

Constructor vs Class:
  → Class is more modern and clearer
  → Constructor functions still work but require 'new'

Array methods (map, filter, etc.):
  → Use arrow callback: array.map(x => x * 2)
  → Or use second 'this' arg: array.map(function(x) { ... }, this)

Event handlers:
  → Use arrow: el.addEventListener('click', () => { ... })
  → Or use bind: el.addEventListener('click', handler.bind(this))

CHECKLIST:
[ ] Identify where 'this' is used in your code
[ ] Ask: is it a method, constructor, callback, or arrow?
[ ] Verify 'this' refers to the expected object
[ ] Use browser dev tools or console.log(this) to debug
[ ] Prefer arrow functions for callbacks
[ ] Prefer class syntax for constructors
[ ] Avoid detaching methods unless bound

`);

console.log('\n=== End of "this" Keyword Guide ===\n');
