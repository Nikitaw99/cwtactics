class Utility {
  static createFilledListBySupplier(size, valueSupplier) {
    var list, i;

    list = [];
    for (i = 0; i < size; i += 1) {
      list[i] = valueSupplier(i);
    }

    return list;
  }

  static convertStringToHash(str) {
    var hash = 0;

    if (value.length === 0) {
      return hash;
    }

    for (var i = 0; i < value.length; i += 1) {
      var c = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash = hash & hash;
    }

    return hash;
  }
}

class Buffer {

  constructor() {
    this.items = [];
  }

  pushItem(item) {
    this.items.push(Require.isSomething(item));
  }

  popItem(item) {
    Require.isTrue(hasItems());
    this.items.splice(0, 1);
  }

  hasItems() {
    return this.items.length > 0;
  }
}

class PrioritizedBuffer extends Buffer {

  constructor(lowLevelBuffer, highLevelBuffer) {
    this.lowLevelBuffer = Require.InstanceOf(lowLevelBuffer, Buffer);
    this.highLevelBuffer = Require.InstanceOf(highLevelBuffer, Buffer);
  }

  pushItem(item, executeSoonAsPossible) {
    (executeSoonAsPossible ? this.highLevelBuffer : this.lowLevelBuffer).pushItem(item);
  }

  popItem(item) {
    if (this.highLevelBuffer.hasItems()) {
      return this.highLevelBuffer.popItem();
    }

    if (this.lowLevelBuffer.hasItems()) {
      return this.lowLevelBuffer.popItem();
    }

    Require.isTrue(false);
  }

  hasItems() {

  }
}


window.Require = class Require {

  static InstanceOf(instance, clazz) {
    if (!(instance instanceof clazz)) {
      throw new Error("NoInstanceOf: " + clazz);
    }
    return instance;
  }

  static isTrue(value, msg = "IsNotTrue") {
    if (!value) {
      throw new Error(msg);
    }
    return value;
  }

  static isBoolean(value, msg) {
    if (!Types.isBoolean(value)) {
      throw new Error("IsNotABoolean");
    }
    return value;
  }

  static isSomething(value) {
    if (!Types.isSomething(value)) {
      throw new Error("IsNothing");
    }
    return value;
  }

  static isNothing(value) {
    if (Types.isSomething(value)) {
      throw new Error("IsNotNothing");
    }
    return value;
  }

  static isString(value) {
    if (!Types.isString(value)) {
      throw new Error("IsNotAString");
    }
    return value;
  }

  static isInteger(value, msg = "IsNotAnInteger") {
    if (!Types.isInteger(value)) {
      throw new Error(msg);
    }
    return value;
  }
}

window.Types = class Types {
  static isSomething(value) {
    return value !== null && value !== undefined;
  }

  static isInteger(value) {
    return (typeof value === "number" && (value - (value % 1)) === value);
  }

  static isBoolean(value) {
    return (typeof value === "boolean");
  }

  static isString(value) {
    return (typeof value === "string");
  }
}
