/**
 * ===================================================================
 * JAVASCRIPT INHERITANCE: A Complete Developer's Guide
 * ===================================================================
 * 
 * JavaScript inheritance is fundamentally different from classical
 * OOP languages like Java or C++. Understanding this is CRITICAL.
 */

// ===================================================================
// 1. PROTOTYPES: The Foundation of Everything
// ===================================================================
/**
 * Every JavaScript object has a hidden property called [[Prototype]]
 * (accessed via __proto__ or Object.getPrototypeOf()).
 * 
 * This is NOT the same as the `.prototype` property on functions.
 * - [[Prototype]]: The object's internal link (WHAT it inherits from)
 * - .prototype: A property on constructor functions (WHAT will be others' [[Prototype]])
 */

const obj = {};
console.log(Object.getPrototypeOf(obj) === Object.prototype); // true

// ===================================================================
// 2. Prototype Chain: How Property Lookup Works
// ===================================================================
/**
 * When you access a property on an object, JavaScript searches:
 * 1. The object itself
 * 2. Its [[Prototype]]
 * 3. Its prototype's [[Prototype]]
 * 4. ... until reaching null (end of chain)
 * 
 * This is DELEGATION - not copying.
 */

const parent = {
  greet() {
    return `Hello, I'm ${this.name}`;
  }
};

const child = Object.create(parent);
child.name = 'Alice';

console.log(child.greet()); // "Hello, I'm Alice"
console.log(child.hasOwnProperty('greet')); // false - it's on parent
console.log('greet' in child); // true - found via chain

// ===================================================================
// 3. Constructor Functions: The Pre-ES6 Pattern
// ===================================================================
/**
 * Before classes (ES6), developers used constructor functions.
 * 
 * Key points:
 * - Called with `new` keyword
 * - `this` refers to the new object
 * - By convention, capitalized (Animal, not animal)
 * - The `.prototype` property sets up inheritance
 */

function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

const dog = new Animal('Dog');
console.log(dog.speak()); // "Dog makes a sound"
console.log(dog instanceof Animal); // true

// What happens behind the scenes with `new`:
// const dog = {};
// dog.__proto__ = Animal.prototype;
// Animal.call(dog, 'Dog');
// return dog;

// ===================================================================
// 4. Prototype-based Inheritance: Setting Up the Chain
// ===================================================================
/**
 * To inherit from a constructor function, link the prototypes.
 * 
 * CRITICAL: Don't just do `Dog.prototype = Animal.prototype`
 * because modifying Dog.prototype would modify Animal.prototype.
 */

function Dog(name, breed) {
  Animal.call(this, name); // Call parent constructor
  this.breed = breed;
}

// Set up the prototype chain correctly
Dog.prototype = Object.create(Animal.prototype);
// ⚠️ Restore the constructor property (lost in Object.create)
Dog.prototype.constructor = Dog;

Dog.prototype.speak = function() {
  return `${this.name} barks`;
};

const myDog = new Dog('Buddy', 'Golden Retriever');
console.log(myDog.speak()); // "Buddy barks"
console.log(myDog instanceof Dog); // true
console.log(myDog instanceof Animal); // true
console.log(myDog.constructor === Dog); // true

// ===================================================================
// 5. ES6 Classes: Syntactic Sugar Over Prototypes
// ===================================================================
/**
 * Classes are NOT a new inheritance model - they're syntax sugar
 * over the prototype system. Under the hood, it's all prototypes.
 * 
 * Classes provide:
 * - Cleaner syntax
 * - `super` keyword for parent access
 * - Constructor methods
 * - Static methods
 * - Private fields (#)
 */

class Vehicle {
  constructor(brand) {
    this.brand = brand;
  }

  describe() {
    return `This is a ${this.brand}`;
  }

  static info() {
    return 'Vehicles are for transportation';
  }
}

class Car extends Vehicle {
  constructor(brand, doors) {
    super(brand); // Call parent constructor - REQUIRED before using `this`
    this.doors = doors;
  }

  describe() {
    // super.methodName() calls parent's method
    return super.describe() + ` with ${this.doors} doors`;
  }
}

const myCar = new Car('Toyota', 4);
console.log(myCar.describe()); // "This is a Toyota with 4 doors"
console.log(Car.info()); // Static method inheritance works too

// ===================================================================
// 6. The `this` Context: Critical for Inheritance
// ===================================================================
/**
 * `this` in inheritance is CRUCIAL to understand.
 * `this` is determined by HOW a method is called, not WHERE it's defined.
 * 
 * This affects inheritance deeply - child methods operate on child objects.
 */

class Person {
  constructor(name) {
    this.name = name;
  }

  getName() {
    return this.name; // `this` is the actual object calling this method
  }
}

class Employee extends Person {
  constructor(name, id) {
    super(name);
    this.id = id;
  }

  getInfo() {
    // `this` refers to the Employee instance
    return `${this.getName()} - ID: ${this.id}`;
  }
}

const emp = new Employee('Bob', '123');
console.log(emp.getInfo()); // "Bob - ID: 123"

// ===================================================================
// 7. Property Shadowing: Overriding vs Replacing
// ===================================================================
/**
 * When a child object has a property with the same name as parent,
 * the child's property "shadows" (hides) the parent's property.
 * 
 * This happens in the prototype chain at the first matching property.
 */

class Base {
  getValue() {
    return 'base value';
  }
}

class Derived extends Base {
  getValue() {
    // This shadows the parent method
    return 'derived value';
  }

  getParentValue() {
    // Use super to call the shadowed parent method
    return super.getValue();
  }
}

const d = new Derived();
console.log(d.getValue()); // "derived value"
console.log(d.getParentValue()); // "base value"

// ===================================================================
// 8. Multi-level Inheritance: Deep Chains
// ===================================================================
/**
 * Chains can go multiple levels deep.
 * Remember: property lookup searches level by level.
 * 
 * Deep chains can impact performance - keep inheritance reasonable.
 */

class LivingThing {
  isAlive() {
    return true;
  }
}

class Mammal extends LivingThing {
  hasFur() {
    return true;
  }
}

class Cat extends Mammal {
  meow() {
    return 'meow!';
  }
}

const cat = new Cat();
console.log(cat.isAlive()); // true - found 2 levels up
console.log(cat.hasFur()); // true - found 1 level up
console.log(cat.meow()); // "meow!" - found on cat

// ===================================================================
// 9. Object.create(): Direct Prototype Manipulation
// ===================================================================
/**
 * Object.create() allows creating objects with specific prototypes.
 * Useful for manual prototype chain setup.
 */

const animalProto = {
  eat() {
    return `${this.name} is eating`;
  }
};

const dog1 = Object.create(animalProto, {
  name: { value: 'Rex', enumerable: true },
  age: { value: 5, writable: true }
});

console.log(dog1.eat()); // "Rex is eating"
console.log(Object.getPrototypeOf(dog1) === animalProto); // true

// ===================================================================
// 10. Mixins: Multiple Sources of Behavior
// ===================================================================
/**
 * JavaScript doesn't have true multiple inheritance, but you can
 * use mixins to combine behaviors from multiple objects.
 * 
 * This is composition over inheritance - often better design.
 */

const canEat = {
  eat() {
    return 'eating';
  }
};

const canWalk = {
  walk() {
    return 'walking';
  }
};

const canSwim = {
  swim() {
    return 'swimming';
  }
};

class Duck {
  constructor(name) {
    this.name = name;
  }
}

// Mix in behaviors (copy methods to prototype)
Object.assign(Duck.prototype, canEat, canWalk, canSwim);

const duck = new Duck('Donald');
console.log(duck.eat()); // "eating"
console.log(duck.walk()); // "walking"
console.log(duck.swim()); // "swimming"

// ===================================================================
// 11. Property Descriptors and Getters/Setters: Inheritance Helpers
// ===================================================================
/**
 * Properties inherited through prototypes can have getters/setters
 * that run computations when accessed or modified.
 */

class Temperature {
  constructor(celsius) {
    this._celsius = celsius;
  }

  get celsius() {
    return this._celsius;
  }

  set celsius(value) {
    this._celsius = value;
  }

  get fahrenheit() {
    return (this._celsius * 9/5) + 32;
  }

  set fahrenheit(value) {
    this._celsius = (value - 32) * 5/9;
  }
}

const temp = new Temperature(25);
console.log(temp.fahrenheit); // 77
temp.fahrenheit = 86;
console.log(temp.celsius); // ~30

// ===================================================================
// 12. Avoiding Common Inheritance Pitfalls
// ===================================================================
/**
 * PITFALL 1: Shared Mutable State in Prototypes
 * Objects in prototype are SHARED across all instances.
 */

class BadExample {
  constructor() {
    // ✅ CORRECT: Instance property (unique per object)
    this.items = [];
  }
}

class AlsoBadExample {}
AlsoBadExample.prototype.items = []; // ❌ WRONG: Shared!

const obj1 = new AlsoBadExample();
const obj2 = new AlsoBadExample();
obj1.items.push('a');
console.log(obj2.items); // ['a'] - obj2 is affected!

// ===================================================================
// PITFALL 2: Forgetting `super()` in child constructor
// ===================================================================

class Parent {
  constructor(x) {
    this.x = x;
  }
}

class Child extends Parent {
  constructor(x, y) {
    super(x); // ✅ REQUIRED before using `this`
    this.y = y;
    // Without super(), `this` is uninitialized - ReferenceError
  }
}

// ===================================================================
// PITFALL 3: Arrow Functions Lose Inheritance Context
// ===================================================================

class EventEmitter {
  constructor(name) {
    this.name = name;
    // ❌ BAD: Arrow function has its own `this`, not the instance
    // this.onEvent = () => {};
    
    // ✅ GOOD: Regular function inherits `this` from call site
    this.onEvent = function() {
      return this.name;
    };
  }
}

// ===================================================================
// 13. Checking Inheritance Relationships
// ===================================================================
/**
 * Multiple ways to check inheritance relationships.
 */

class Animal2 {}
class Dog2 extends Animal2 {}
const myDog2 = new Dog2();

// instanceof: Check prototype chain
console.log(myDog2 instanceof Dog2); // true
console.log(myDog2 instanceof Animal2); // true
console.log(myDog2 instanceof Object); // true

// Object.getPrototypeOf(): Get direct prototype
console.log(Object.getPrototypeOf(myDog2) === Dog2.prototype); // true

// .isPrototypeOf(): Check if an object is in the chain
console.log(Animal2.prototype.isPrototypeOf(myDog2)); // true
console.log(Dog2.prototype.isPrototypeOf(myDog2)); // true

// ===================================================================
// 14. Modern Patterns: Composition Over Inheritance
// ===================================================================
/**
 * A modern JavaScript trend: favor composition and mixins
 * over deep inheritance hierarchies.
 * 
 * Reason: Deep hierarchies are inflexible and hard to maintain.
 * Composition: Mix and match behaviors as needed.
 */

// Mixin approach (composition)
const withLogging = (obj) => ({
  ...obj,
  log(msg) {
    console.log(`[${this.name}] ${msg}`);
  }
});

const withTimestamp = (obj) => ({
  ...obj,
  getTimestamp() {
    return new Date().toISOString();
  }
});

const logger = withTimestamp(
  withLogging({
    name: 'MyLogger',
    message: 'Hello'
  })
);

logger.log(logger.getTimestamp());

// ===================================================================
// 15. Private Fields: Modern Encapsulation
// ===================================================================
/**
 * ES2022 introduced private fields (#), a cleaner way to hide
 * implementation details that don't pollute the prototype chain.
 */

class BankAccount {
  #balance = 0; // Private field - not in prototype, not enumerable

  constructor(initialBalance) {
    this.#balance = initialBalance;
  }

  deposit(amount) {
    this.#balance += amount;
  }

  getBalance() {
    return this.#balance;
  }
}

const account = new BankAccount(100);
account.deposit(50);
console.log(account.getBalance()); // 150
// console.log(account.#balance); // ❌ SyntaxError: private field

// ===================================================================
// 16. Abstract Classes and Interfaces Patterns
// ===================================================================
/**
 * JavaScript has no built-in abstract classes, but you can
 * create patterns that enforce implementation in children.
 */

class AbstractShape {
  constructor(name) {
    if (new.target === AbstractShape) {
      throw new TypeError('Cannot instantiate abstract class');
    }
    this.name = name;
  }

  // Subclasses must implement this
  area() {
    throw new Error('area() must be implemented');
  }
}

class Circle extends AbstractShape {
  constructor(radius) {
    super('Circle');
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }
}

// new AbstractShape('test'); // ❌ TypeError
const circle = new Circle(5);
console.log(circle.area()); // 78.53981633974483

// ===================================================================
// KEY TAKEAWAYS FOR EVERY DEVELOPER
// ===================================================================
/**
 * 1. JavaScript uses PROTOTYPE-based inheritance, not classical
 * 2. Every object has a [[Prototype]] that it delegates to
 * 3. Property lookup walks the prototype chain
 * 4. Classes are syntax sugar over prototypes
 * 5. `this` is determined by how a method is called
 * 6. Use `super()` to call parent constructors in classes
 * 7. Avoid shared mutable state in prototypes
 * 8. Prefer composition (mixins) over deep inheritance
 * 9. Use private fields (#) for encapsulation
 * 10. Keep inheritance hierarchies shallow and simple
 * 11. Understand instanceof and Object.getPrototypeOf()
 * 12. Arrow functions don't have their own `this`
 * 13. Getter/setter inheritance is powerful
 * 14. Don't shadow constructor property carelessly
 * 15. Test instanceof carefully - check the whole chain
 */