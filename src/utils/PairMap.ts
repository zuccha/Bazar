export default class PairMap<Key1, Key2, Value> {
  map: Map<Key1, Map<Key2, Value>>;

  constructor() {
    this.map = new Map();
  }

  has(key1: Key1, key2: Key2): boolean {
    const innerMap = this.map.get(key1);
    return innerMap !== undefined && innerMap.has(key2);
  }

  get(key1: Key1, key2: Key2): Value | undefined {
    const innerMap = this.map.get(key1);
    return innerMap !== undefined ? innerMap.get(key2) : undefined;
  }

  set(key1: Key1, key2: Key2, value: Value): void {
    let innerMap = this.map.get(key1);
    if (innerMap === undefined) {
      innerMap = new Map();
      this.map.set(key1, innerMap);
    }
    innerMap.set(key2, value);
  }

  delete(key1: Key1, key2: Key2): void {
    const innerMap = this.map.get(key1);
    if (innerMap !== undefined) {
      innerMap.delete(key2);
      if (innerMap.size === 0) {
        this.map.delete(key1);
      }
    }
  }
}
