// ============================================================================
// PROTOTYPICAL INHERITANCE IN JAVASCRIPT: BEGINNER TO ADVANCED
// ============================================================================
// JavaScript's inheritance model is based on prototypes, not classes.
// Understanding this is fundamental to mastering JavaScript.


// ============================================================================
// PART 1: BASICS - WHAT IS A PROTOTYPE?
// ============================================================================

// Every JavaScript object has a prototype. The prototype is an object that
// contains properties and methods that other objects can inherit from.

const person = {
  name: "Alice",
  greet() {
    console.log(`Hello, my name is ${this.name}`);
  }
};

person.greet(); // "Hello, my name is Alice"

// You can access an object's prototype using Object.getPrototypeOf()
const prototypeOfPerson = Object.getPrototypeOf(person);
console.log(prototypeOfPerson); // Shows the Object prototype


// ============================================================================
// PART 2: PROTOTYPE CHAIN
// ============================================================================

// When you access a property on an object, JavaScript looks for it in this order:
// 1. On the object itself
// 2. On the object's prototype
// 3. On the prototype's prototype (and so on up the chain)
// 4. Returns undefined if not found

const animal = {
  type: "unknown",
  sleep() {
    console.log(`${this.name} is sleeping`);
  }
};

// Create a new object with 'animal' as its prototype
const dog = Object.create(animal);
dog.name = "Buddy";
dog.breed = "Golden Retriever";

console.log(dog.name);   // "Buddy" (found on dog itself)
console.log(dog.type);   // "unknown" (found on prototype)
dog.sleep();             // "Buddy is sleeping" (method from prototype)

// Check the prototype chain
console.log(Object.getPrototypeOf(dog) === animal); // true


// ============================================================================
// PART 3: CONSTRUCTOR FUNCTIONS (Pre-ES6 Way)
// ============================================================================

// Before ES6 classes, JavaScript used constructor functions to create objects.
// The 'new' keyword is crucial here.

function Animal(name, type) {
  this.name = name;
  this.type = type;
}

// Methods are typically added to the constructor's prototype
Animal.prototype.describe = function() {
  return `${this.name} is a ${this.type}`;
};

Animal.prototype.sleep = function() {
  console.log(`${this.name} is sleeping...`);
};

const cat = new Animal("Whiskers", "cat");
console.log(cat.describe()); // "Whiskers is a cat"
console.log(cat instanceof Animal); // true

// When you use 'new':
// 1. A new object is created
// 2. The object's [[Prototype]] is set to the constructor's prototype property
// 3. The constructor function is called with 'this' bound to the new object
// 4. The object is returned


// ============================================================================
// PART 4: PROTOTYPE DELEGATION AND BEHAVIOR DELEGATION
// ============================================================================

// Different objects can share behavior through their prototype.
// This is called "prototype delegation" - objects delegate to their prototype.

const Car = function(brand, model) {
  this.brand = brand;
  this.model = model;
};

Car.prototype.start = function() {
  console.log(`${this.brand} ${this.model} is starting...`);
};

Car.prototype.stop = function() {
  console.log(`${this.brand} ${this.model} has stopped`);
};

const tesla = new Car("Tesla", "Model 3");
const ford = new Car("Ford", "Focus");

tesla.start();  // "Tesla Model 3 is starting..."
ford.start();   // "Ford Focus is starting..."

// Both tesla and ford delegate to Car.prototype
console.log(Object.getPrototypeOf(tesla) === Car.prototype); // true
console.log(Object.getPrototypeOf(ford) === Car.prototype);  // true


// ============================================================================
// PART 5: INHERITANCE THROUGH PROTOTYPE CHAIN
// ============================================================================

// To set up inheritance, we need to create a prototype chain.
// Child objects should have Parent.prototype in their prototype chain.

function Vehicle(brand) {
  this.brand = brand;
}

Vehicle.prototype.honk = function() {
  console.log(`${this.brand} goes honk!`);
};

function Truck(brand, cargoCapacity) {
  // Call the parent constructor with 'this' bound to the child instance
  Vehicle.call(this, brand);
  this.cargoCapacity = cargoCapacity;
}

// Set up the inheritance chain
// This is the critical step: Truck.prototype's prototype should be Vehicle.prototype
Truck.prototype = Object.create(Vehicle.prototype);
Truck.prototype.constructor = Truck; // Restore the constructor reference

Truck.prototype.loadCargo = function() {
  console.log(`Loading ${this.cargoCapacity} tons of cargo`);
};

const pickup = new Truck("Ford", 2);
pickup.honk();        // "Ford goes honk!" (inherited from Vehicle)
pickup.loadCargo();   // "Loading 2 tons of cargo" (own method)
console.log(pickup instanceof Truck);    // true
console.log(pickup instanceof Vehicle);  // true


// ============================================================================
// PART 6: MULTI-LEVEL INHERITANCE CHAIN
// ============================================================================

// You can have multiple levels of inheritance, creating longer chains.

function LivingThing(age) {
  this.age = age;
}

LivingThing.prototype.grow = function() {
  this.age++;
  console.log(`Age is now ${this.age}`);
};

function Mammal(age, hairColor) {
  LivingThing.call(this, age);
  this.hairColor = hairColor;
}

Mammal.prototype = Object.create(LivingThing.prototype);
Mammal.prototype.constructor = Mammal;

Mammal.prototype.breathe = function() {
  console.log(`${this.hairColor} mammal is breathing`);
};

function Dog(age, hairColor, breed) {
  Mammal.call(this, age, hairColor);
  this.breed = breed;
}

Dog.prototype = Object.create(Mammal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log("Woof!");
};

const golden = new Dog(3, "golden", "Golden Retriever");
golden.grow();       // "Age is now 4" (from LivingThing)
golden.breathe();    // "golden mammal is breathing" (from Mammal)
golden.bark();       // "Woof!" (from Dog)


// ============================================================================
// PART 7: PROPERTY SHADOWING
// ============================================================================

// If a child object defines a property with the same name as the parent,
// the child's property "shadows" the parent's property in the lookup chain.

const parent = {
  greeting: "Hello from parent"
};

const child = Object.create(parent);
child.greeting = "Hello from child";

console.log(child.greeting);  // "Hello from child" (found on child first)
console.log(parent.greeting); // "Hello from parent" (parent unchanged)

// You can still access the parent's shadowed property through the prototype chain
console.log(Object.getPrototypeOf(child).greeting); // "Hello from parent"


// ============================================================================
// PART 8: ES6 CLASSES (SYNTACTIC SUGAR)
// ============================================================================

// ES6 introduced class syntax, which is syntactic sugar over prototypes.
// Under the hood, it still uses prototypical inheritance.

class Animal_ES6 {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }

  static info() {
    console.log("This is an animal class");
  }
}

const cow = new Animal_ES6("Bessie");
cow.speak(); // "Bessie makes a sound"
Animal_ES6.info(); // "This is an animal class"

// Under the hood, this is exactly the same as:
// function Animal_ES6(name) { this.name = name; }
// Animal_ES6.prototype.speak = function() { ... }


// ============================================================================
// PART 9: INHERITANCE WITH ES6 CLASSES
// ============================================================================

// Classes make inheritance cleaner with the 'extends' keyword.

class Animal_ES6_Base {
  constructor(name) {
    this.name = name;
  }

  sleep() {
    console.log(`${this.name} is sleeping`);
  }
}

class Dog_ES6 extends Animal_ES6_Base {
  constructor(name, breed) {
    super(name); // Calls the parent constructor
    this.breed = breed;
  }

  bark() {
    console.log(`${this.name} barks: Woof!`);
  }
}

const puppyMax = new Dog_ES6("Max", "Labrador");
puppyMax.sleep(); // "Max is sleeping" (inherited)
puppyMax.bark();  // "Max barks: Woof!" (own method)
console.log(puppyMax instanceof Dog_ES6);         // true
console.log(puppyMax instanceof Animal_ES6_Base); // true


// ============================================================================
// PART 10: METHOD OVERRIDING
// ============================================================================

// A child can override a parent's method by providing its own implementation.

class Shape {
  getArea() {
    return 0;
  }

  describe() {
    return "I am a shape";
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  getArea() {
    // Override parent method
    return Math.PI * this.radius * this.radius;
  }

  describe() {
    // Call parent method using super
    return super.describe() + " - specifically, a circle";
  }
}

const circle = new Circle(5);
console.log(circle.getArea());    // 78.53981633974483
console.log(circle.describe());   // "I am a shape - specifically, a circle"


// ============================================================================
// PART 11: OBJECT.PROTOTYPE METHODS
// ============================================================================

// All objects inherit from Object.prototype at the top of the chain.
// This gives all objects certain built-in methods.

const obj = { a: 1 };

// These methods come from Object.prototype:
console.log(obj.hasOwnProperty("a"));        // true
console.log(obj.toString());                 // "[object Object]"
console.log(obj.valueOf());                  // { a: 1 }

// Check the prototype chain
console.log(Object.getPrototypeOf(obj) === Object.prototype); // true

// At the top of every prototype chain is Object.prototype
console.log(Object.getPrototypeOf(Object.prototype)); // null


// ============================================================================
// PART 12: CHECKING PROTOTYPE RELATIONSHIPS
// ============================================================================

// Several methods help you understand prototype relationships:

function Vehicle_Check(brand) {
  this.brand = brand;
}

function Car_Check(brand, model) {
  Vehicle_Check.call(this, brand);
  this.model = model;
}

Car_Check.prototype = Object.create(Vehicle_Check.prototype);
Car_Check.prototype.constructor = Car_Check;

const myCar = new Car_Check("Toyota", "Camry");

// instanceof checks if an object is an instance of a constructor
console.log(myCar instanceof Car_Check);      // true
console.log(myCar instanceof Vehicle_Check);  // true
console.log(myCar instanceof Object);         // true

// Object.getPrototypeOf gets the prototype of an object
console.log(Object.getPrototypeOf(myCar) === Car_Check.prototype); // true

// isPrototypeOf checks if an object is in another's prototype chain
console.log(Car_Check.prototype.isPrototypeOf(myCar));      // true
console.log(Vehicle_Check.prototype.isPrototypeOf(myCar));  // true
console.log(Object.prototype.isPrototypeOf(myCar));         // true


// ============================================================================
// PART 13: OBJECT.CREATE WITH PROPERTY DESCRIPTORS
// ============================================================================

// Object.create can take a second argument with property descriptors.
// This allows fine-grained control over inherited properties.

const proto = {
  greet() {
    console.log("Hello");
  }
};

const advanced = Object.create(proto, {
  name: {
    value: "Advanced",
    writable: true,    // Can be changed
    enumerable: true,  // Shows up in for...in loops
    configurable: true // Can be deleted/reconfigured
  },
  secret: {
    value: "hidden",
    writable: false,    // Cannot be changed
    enumerable: false,  // Doesn't show in for...in loops
    configurable: false // Cannot be deleted
  }
});

console.log(advanced.name);    // "Advanced"
console.log(advanced.secret);  // "hidden"

// Try to modify secret - it won't work in strict mode, silently fails in non-strict
advanced.secret = "new value";
console.log(advanced.secret);  // Still "hidden"


// ============================================================================
// PART 14: MIXIN PATTERN (MULTIPLE INHERITANCE SIMULATION)
// ============================================================================

// JavaScript doesn't support true multiple inheritance, but you can use mixins
// to add behavior from multiple sources.

const canEat = {
  eat() {
    console.log(`${this.name} is eating`);
  }
};

const canWalk = {
  walk() {
    console.log(`${this.name} is walking`);
  }
};

const canSwim = {
  swim() {
    console.log(`${this.name} is swimming`);
  }
};

function Organism(name) {
  this.name = name;
}

// Add multiple behaviors through Object.assign (mixin pattern)
Object.assign(Organism.prototype, canEat, canWalk, canSwim);

const duck = new Organism("Donald");
duck.eat();   // "Donald is eating"
duck.walk();  // "Donald is walking"
duck.swim();  // "Donald is swimming"


// ============================================================================
// PART 15: PROTOTYPE POLLUTION VULNERABILITY
// ============================================================================

// Be careful: modifying Object.prototype affects all objects!
// This is a security concern and should be avoided.

// WARNING: This is bad practice - don't do this in production!
// Object.prototype.dangerous = "pollution";
// Now every object would have this property!

// Instead, use specific prototypes:
function SafeObject() {}
SafeObject.prototype.safe = "not pollution";

const safeInstance = new SafeObject();
console.log(safeInstance.safe); // "not pollution"

// Check if a property is on the object itself (not the prototype)
console.log(safeInstance.hasOwnProperty("safe")); // false
console.log(Object.prototype.hasOwnProperty("safe")); // false


// ============================================================================
// PART 16: PROTOTYPE REFLECTION AND INTROSPECTION
// ============================================================================

// You can inspect an object's prototype structure.

class Animal_Reflect {
  speak() {}
}

class Dog_Reflect extends Animal_Reflect {
  bark() {}
}

const dog_reflect = new Dog_Reflect();

// Get all properties (including inherited)
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(dog_reflect)));
// Output shows methods from Dog_Reflect.prototype

// Walk up the prototype chain
let current = dog_reflect;
let depth = 0;
while (current && depth < 5) {
  console.log(`Depth ${depth}:`, Object.getOwnPropertyNames(Object.getPrototypeOf(current)));
  current = Object.getPrototypeOf(current);
  depth++;
}


// ============================================================================
// PART 17: ADVANCED - OBJECT.SETPROTOTYPEOF
// ============================================================================

// You can change an object's prototype after creation with Object.setPrototypeOf.
// WARNING: This is slow and should be avoided in performance-critical code.

const obj1 = { type: "object1" };
const obj2 = { type: "object2", method() { return "from obj2"; } };

console.log(obj1.method); // undefined initially

// Change obj1's prototype to obj2
Object.setPrototypeOf(obj1, obj2);
console.log(obj1.method());    // "from obj2" (now inherited)
console.log(obj1.type);        // "object1" (own property takes precedence)


// ============================================================================
// PART 18: GETTERS AND SETTERS IN PROTOTYPES
// ============================================================================

// You can define computed properties in prototypes using getters/setters.

class Temperature {
  constructor(celsius) {
    this._celsius = celsius;
  }

  get fahrenheit() {
    return this._celsius * 9/5 + 32;
  }

  set fahrenheit(value) {
    this._celsius = (value - 32) * 5/9;
  }

  get celsius() {
    return this._celsius;
  }

  set celsius(value) {
    this._celsius = value;
  }
}

const temp = new Temperature(0);
console.log(temp.fahrenheit); // 32
temp.fahrenheit = 212;
console.log(temp.celsius);    // 100 (getter/setter bridge between two formats)


// ============================================================================
// PART 19: PRIVATE PROPERTIES AND ENCAPSULATION
// ============================================================================

// ES2022 introduced true private properties with # prefix.
// These are not accessible through the prototype chain.

class BankAccount {
  #balance = 0; // Private field

  constructor(initialBalance) {
    this.#balance = initialBalance;
  }

  deposit(amount) {
    this.#balance += amount;
    return this.#balance;
  }

  getBalance() {
    return this.#balance;
  }
}

const account = new BankAccount(100);
console.log(account.getBalance()); // 100
account.deposit(50);
console.log(account.getBalance()); // 150
// console.log(account.#balance); // SyntaxError: private field


// ============================================================================
// PART 20: PROTOTYPE POLLUTION PREVENTION
// ============================================================================

// Modern approach: use Object.create(null) to create objects with no prototype.
// These won't inherit from Object.prototype.

const safeMap = Object.create(null);
safeMap.data = "safe";

console.log(safeMap.toString === Object.prototype.toString); // false
console.log(Object.getPrototypeOf(safeMap)); // null

// This is often used for objects acting as dictionaries/maps.


// ============================================================================
// PART 21: SYMBOL.TOSTRINGTAG FOR CUSTOM OBJECT TYPES
// ============================================================================

// You can customize how objects appear in Object.prototype.toString.

class MyCustomClass {
  get [Symbol.toStringTag]() {
    return "MyCustomClass";
  }
}

const custom = new MyCustomClass();
console.log(Object.prototype.toString.call(custom)); // "[object MyCustomClass]"


// ============================================================================
// PART 22: PROTOTYPE PERFORMANCE CONSIDERATIONS
// ============================================================================

// Properties on the prototype are looked up through the prototype chain.
// Deep chains and searching through many properties can be slower.

class Level1 {
  level1Method() {}
}

class Level2 extends Level1 {
  level2Method() {}
}

class Level3 extends Level2 {
  level3Method() {}
}

class Level4 extends Level3 {
  level4Method() {}
}

const deepInstance = new Level4();

// Looking up deepInstance.level1Method requires traversing the entire chain
deepInstance.level1Method();

// Best practice: keep prototype chains shallow when performance matters
// Use composition over deep inheritance hierarchies


// ============================================================================
// PART 23: REAL-WORLD PATTERN - ABSTRACT BASE CLASS
// ============================================================================

// You can create abstract-like patterns using prototypes.

class AbstractShape {
  constructor(name) {
    if (this.constructor === AbstractShape) {
      throw new Error("Cannot instantiate abstract class");
    }
    this.name = name;
  }

  getArea() {
    throw new Error("getArea() must be implemented");
  }

  describe() {
    return `${this.name} with area ${this.getArea()}`;
  }
}

class Square extends AbstractShape {
  constructor(name, side) {
    super(name);
    this.side = side;
  }

  getArea() {
    return this.side * this.side;
  }
}

// new AbstractShape("test"); // Error: Cannot instantiate abstract class
const square = new Square("MySquare", 5);
console.log(square.describe()); // "MySquare with area 25"


// ============================================================================
// PART 24: CHAIN OF RESPONSIBILITY PATTERN WITH PROTOTYPES
// ============================================================================

// Use prototype delegation to implement the Chain of Responsibility pattern.

class Handler {
  handle(request) {
    if (this.canHandle(request)) {
      console.log(`${this.name} handled: ${request}`);
    } else if (this.next) {
      this.next.handle(request);
    } else {
      console.log("Request could not be handled");
    }
  }

  canHandle(request) {
    return false;
  }
}

class EmailHandler extends Handler {
  constructor(next) {
    super();
    this.name = "EmailHandler";
    this.next = next;
  }

  canHandle(request) {
    return request.type === "email";
  }
}

class PhoneHandler extends Handler {
  constructor(next) {
    super();
    this.name = "PhoneHandler";
    this.next = next;
  }

  canHandle(request) {
    return request.type === "phone";
  }
}

class ChatHandler extends Handler {
  constructor(next) {
    super();
    this.name = "ChatHandler";
    this.next = next;
  }

  canHandle(request) {
    return request.type === "chat";
  }
}

const chatHandler = new ChatHandler(null);
const phoneHandler = new PhoneHandler(chatHandler);
const emailHandler = new EmailHandler(phoneHandler);

emailHandler.handle({ type: "email" }); // EmailHandler handled: [object Object]
emailHandler.handle({ type: "phone" }); // PhoneHandler handled: [object Object]
emailHandler.handle({ type: "chat" });  // ChatHandler handled: [object Object]


// ============================================================================
// SUMMARY
// ============================================================================

// Key Takeaways:
// 1. Every object has a prototype (except Object.prototype itself)
// 2. Properties are looked up through the prototype chain
// 3. Constructor functions set up inheritance when paired with 'new'
// 4. Object.create() is the most reliable way to set up prototypes
// 5. ES6 classes are syntax sugar over prototypes - they're equivalent
// 6. Use Object.getPrototypeOf() to inspect prototypes
// 7. Keep prototype chains shallow for performance
// 8. Don't pollute Object.prototype
// 9. Private fields (#) are truly private and don't appear in prototypes
// 10. Prototypical inheritance enables JavaScript's flexible object model

console.log("✅ Prototypical Inheritance Guide Complete!");
