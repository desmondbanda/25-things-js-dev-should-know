/**
 * FACTORY FUNCTIONS: From Beginner to Expert
 * 
 * A comprehensive guide building concepts step by step with runnable examples.
 * Run with: node factory-functions.js
 */

// ============================================================================
// BEGINNER: What Is a Factory Function?
// ============================================================================

/**
 * A factory function is any function that creates and returns an object.
 * It's a simple alternative to constructors or classes.
 * 
 * Benefits:
 * - No `new` keyword needed
 * - No confusion with `this` binding
 * - Easy to compose and pass dependencies
 * - Explicit control over returned object shape
 */

console.log('\n=== BEGINNER: Basic Factory ===\n');

// Simple factory returning a new object each time
function createPerson(name) {
  return {
    name,
    greet() {
      console.log(`Hi, I'm ${this.name}`);
    }
  };
}

const alice = createPerson('Alice');
alice.greet(); // Hi, I'm Alice

const bob = createPerson('Bob');
bob.greet(); // Hi, I'm Bob

/**
 * Tradeoff of simple factories:
 * - Each instance gets its own `greet` function (memory overhead if many instances)
 * - But very readable and private scope is easy to add
 */
console.log('Each instance has its own greet method:');
console.log(alice.greet === bob.greet); // false (separate functions)

// ============================================================================
// INTERMEDIATE: Sharing Behavior with Prototypes
// ============================================================================

console.log('\n=== INTERMEDIATE: Shared Methods via Object.create ===\n');

/**
 * Problem with simple factories: methods are recreated per instance.
 * Solution: Use Object.create() to share a prototype with methods,
 * while keeping per-instance data on the object.
 */

const personProto = {
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  },
  sayAge() {
    console.log(`I'm ${this.age} years old`);
  }
};

function createPersonWithSharedMethods(name, age) {
  const person = Object.create(personProto);
  person.name = name;
  person.age = age;
  return person;
}

const charlie = createPersonWithSharedMethods('Charlie', 30);
const diana = createPersonWithSharedMethods('Diana', 28);

charlie.greet(); // Hi, I'm Charlie
diana.sayAge(); // I'm 28 years old

/**
 * Now methods are shared across instances (memory efficient for many objects):
 */
console.log('Shared methods across instances:');
console.log(charlie.greet === diana.greet); // true (same function)
console.log(charlie.greet === personProto.greet); // true

// ============================================================================
// INTERMEDIATE: Private State with Closures
// ============================================================================

console.log('\n=== INTERMEDIATE: Private State via Closures ===\n');

/**
 * Use closures to hide internal state from callers.
 * Only the returned methods can access the private variables.
 */

function createCounter(initialValue = 0) {
  let count = initialValue; // private variable (closure)
  
  return {
    increment() {
      count += 1;
      return count;
    },
    decrement() {
      count -= 1;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter1 = createCounter(5);
console.log(counter1.increment()); // 6
console.log(counter1.increment()); // 7
console.log(counter1.decrement()); // 6
console.log(counter1.getCount());  // 6

// The `count` variable is completely inaccessible from outside
try {
  console.log(counter1.count); // undefined (not exposed)
} catch (e) {
  console.log('count is private:', e.message);
}

/**
 * Tradeoff: 
 * - Strong privacy (no way to break encapsulation)
 * - But each instance gets its own methods (memory overhead)
 */

// ============================================================================
// ADVANCED: Private Data + Shared Methods using WeakMap
// ============================================================================

console.log('\n=== ADVANCED: WeakMap for Privacy + Shared Methods ===\n');

/**
 * Problem: closures give privacy but methods are per-instance.
 *          prototypes give shared methods but no privacy.
 * 
 * Solution: Use WeakMap to store private data keyed by instance,
 *           and define methods on a shared prototype that access it.
 */

// Private storage for all counter instances
const _counterPrivate = new WeakMap();

const counterProto = {
  increment() {
    const data = _counterPrivate.get(this);
    data.count += 1;
    return data.count;
  },
  decrement() {
    const data = _counterPrivate.get(this);
    data.count -= 1;
    return data.count;
  },
  getCount() {
    return _counterPrivate.get(this).count;
  }
};

function createCounterAdvanced(initialValue = 0) {
  const obj = Object.create(counterProto);
  _counterPrivate.set(obj, { count: initialValue }); // Store private data
  return obj;
}

const counter2 = createCounterAdvanced(10);
const counter3 = createCounterAdvanced(20);

console.log(counter2.increment()); // 11
console.log(counter3.increment()); // 21

/**
 * Methods are shared, reducing memory:
 */
console.log('Methods are shared across instances:');
console.log(counter2.increment === counter3.increment); // true

/**
 * Data is still private:
 */
console.log('Private data is inaccessible:');
console.log(counter2.getCount()); // 11 (data is private)
console.log(_counterPrivate.get(counter2)); // { count: 11 } (only accessible internally)

// ============================================================================
// ADVANCED: Composable Factories & Mixins
// ============================================================================

console.log('\n=== ADVANCED: Composable Factories (Mixins) ===\n');

/**
 * Avoid deep inheritance hierarchies by composing small behavior objects.
 * Functional mixins return partial behavior that is merged into the final object.
 */

// Mixin 1: Movement behavior
function withMovable(state) {
  return {
    move(dx, dy) {
      state.x += dx;
      state.y += dy;
      console.log(`Moved to (${state.x}, ${state.y})`);
    },
    getPosition() {
      return { x: state.x, y: state.y };
    }
  };
}

// Mixin 2: Drawing behavior
function withDrawable(state) {
  return {
    draw() {
      console.log(`Drawing at (${state.x}, ${state.y})`);
    }
  };
}

// Mixin 3: Nameable behavior
function withNamable() {
  return {
    setName(name) {
      this.name = name;
    },
    getName() {
      return this.name;
    }
  };
}

// Compose all behaviors into a single entity
function createEntity(name, x = 0, y = 0) {
  const state = { x, y };
  return Object.assign(
    {},
    withMovable(state),
    withDrawable(state),
    withNamable(),
    { name } // Additional per-instance data
  );
}

const entity = createEntity('Hero', 1, 2);
entity.draw();                    // Drawing at (1, 2)
entity.move(3, 4);                // Moved to (4, 6)
console.log(entity.getName());    // Hero
console.log(entity.getPosition()); // { x: 4, y: 6 }

/**
 * Benefits:
 * - Small, focused behaviors
 * - Easy to reuse and combine
 * - Flat structure (no deep inheritance)
 * - Testable in isolation
 */

// ============================================================================
// ADVANCED: Dependency Injection
// ============================================================================

console.log('\n=== ADVANCED: Dependency Injection ===\n');

/**
 * Inject dependencies (logger, timer, storage, etc.) into factories.
 * This makes code testable: pass fake implementations in tests.
 */

function createLogger({
  timeProvider = () => new Date().toISOString(),
  output = console.log
} = {}) {
  return {
    log(message) {
      const timestamp = timeProvider();
      output(`[${timestamp}] ${message}`);
    }
  };
}

// Real usage
const realLogger = createLogger();
realLogger.log('Application started');

// Test usage with fake time
let capturedLogs = [];
const testLogger = createLogger({
  timeProvider: () => '2025-01-01T00:00:00Z',
  output: (msg) => capturedLogs.push(msg)
});
testLogger.log('Test message');
console.log('Test log captured:', capturedLogs[0]);

/**
 * With DI, we can easily:
 * - Control time in tests
 * - Capture logs for assertion
 * - Swap implementations without changing the logger code
 */

// ============================================================================
// ADVANCED: TypeScript Typing (Example)
// ============================================================================

console.log('\n=== ADVANCED: TypeScript Example (conceptual) ===\n');

/**
 * In TypeScript, you'd add types to factories for better IDE support and safety.
 * (This is a conceptual example; actual TS would be in a .ts file)
 * 
 * interface Entity {
 *   id: string;
 *   name: string;
 *   move(dx: number, dy: number): void;
 * }
 * 
 * function createEntity<T extends object>(props: T, id: string): Entity & T {
 *   return { ...props, id, move: (dx, dy) => { ... } };
 * }
 */

console.log('TypeScript allows precise types for factory returns.');
console.log('See TypeScript docs for generic factory examples.');

// ============================================================================
// ADVANCED: Testing Patterns
// ============================================================================

console.log('\n=== ADVANCED: Testing Patterns ===\n');

/**
 * Factories are easy to test because:
 * 1. Dependencies are injected
 * 2. No global state needed
 * 3. Each test can create fresh instances
 */

// Example: Simple test helper
function testCounterFactory() {
  const c = createCounterAdvanced(0);
  
  // Test 1: Initial state
  if (c.getCount() !== 0) throw new Error('Initial count should be 0');
  
  // Test 2: Increment
  c.increment();
  if (c.getCount() !== 1) throw new Error('Count should be 1 after increment');
  
  // Test 3: Decrement
  c.decrement();
  if (c.getCount() !== 0) throw new Error('Count should be 0 after decrement');
  
  console.log('✓ All counter tests passed');
}

testCounterFactory();

// ============================================================================
// PERFORMANCE & MEMORY TRADEOFFS
// ============================================================================

console.log('\n=== Performance Tradeoffs ===\n');

// Benchmark: 100k instances with different patterns

const iterations = 100000;

// Pattern 1: Closure-based (per-instance functions)
function benchmarkClosureBased() {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    createCounter(i);
  }
  return performance.now() - start;
}

// Pattern 2: Prototype-based (shared methods)
function benchmarkPrototypeBased() {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    createCounterAdvanced(i);
  }
  return performance.now() - start;
}

const closureTime = benchmarkClosureBased();
const protoTime = benchmarkPrototypeBased();

console.log(`Creating ${iterations} closure-based instances: ${closureTime.toFixed(2)}ms`);
console.log(`Creating ${iterations} prototype-based instances: ${protoTime.toFixed(2)}ms`);
console.log(`Prototype-based is ~${(closureTime / protoTime).toFixed(1)}x faster`);

console.log('\nMemory note:');
console.log('- Closure-based: each instance has its own methods (more memory)');
console.log('- Prototype-based: shared methods (less memory for many instances)');
console.log('- WeakMap adds overhead per lookup, but excellent privacy + shared methods');

// ============================================================================
// BEST PRACTICES & PITFALLS
// ============================================================================

console.log('\n=== Best Practices & Pitfalls ===\n');

console.log(`
BEST PRACTICES:
1. Use simple object factory when: few instances, simplicity matters, no privacy needed.
2. Use Object.create + prototype when: many instances, shared methods save memory.
3. Use closures when: privacy is essential and instance count is small.
4. Use WeakMap + prototype when: privacy + shared methods + many instances.
5. Use mixins when: composing flexible, reusable behaviors.
6. Inject dependencies for testability.
7. Keep factories pure: avoid side effects outside the returned object.

PITFALLS:
1. Arrow functions in methods don't bind 'this' correctly.
   Example: const obj = { method: () => this... } // 'this' is wrong
2. Forgetting to return the object (returns undefined).
3. Mutating private state in ways that break invariants.
4. Exposing private data by accident (return objects that reference internals).
5. Creating thousands of instances with per-instance methods (memory bloat).
6. Not using WeakMap carefully: if you keep strong refs to keys elsewhere, they leak.
7. Mixing factory and constructor patterns in same codebase (confusing for readers).
`);

// ============================================================================
// QUICK CHECKLIST
// ============================================================================

console.log('=== When to Use Each Pattern ===\n');

console.log(`
Pattern                      Use When                                Examples
────────────────────────────────────────────────────────────────────────────
Simple Object Factory        Few instances, simplicity, no privacy   createButton(), createDialog()
Prototype + Object.create    Many instances, shared methods          createUser(), createEntity()
Closure-based Private        Privacy essential, few instances        createSecret(), createToken()
WeakMap + Prototype          Privacy + shared methods + many         createSecureCounter()
Composable/Mixins            Flexible behavior composition           createGameCharacter(mixins)
Dependency Injection         Testability, swappable dependencies     createService(logger, db)
`);

console.log('\n=== End of Factory Functions Guide ===\n');
