interface ResolvedName {
  original: string;
  value: string;
  namespace: string;
}
type CallbackMap = Record<
  string,
  Record<string, ((...args: unknown[]) => unknown)[]>
>;
export default class EventEmitter {
  callbacks: CallbackMap;
  constructor() {
    this.callbacks = {};
    this.callbacks.base = {};
  }
  on(_names: string, callback: (...args: unknown[]) => unknown): this | false {
    if (typeof _names === 'undefined' || _names === '') {
      console.warn('wrong names');
      return false;
    }
    if (typeof callback === 'undefined') {
      console.warn('wrong callback');
      return false;
    }
    const names = this.resolveNames(_names);
    names.forEach((_name) => {
      const name = this.resolveName(_name);
      if (!(this.callbacks[name.namespace] instanceof Object))
        this.callbacks[name.namespace] = {};
      if (!(this.callbacks[name.namespace][name.value] instanceof Array))
        this.callbacks[name.namespace][name.value] = [];
      this.callbacks[name.namespace][name.value].push(callback);
    });
    return this;
  }
  off(_names: string): this | false {
    if (typeof _names === 'undefined' || _names === '') {
      console.warn('wrong name');
      return false;
    }
    const names = this.resolveNames(_names);
    names.forEach((_name) => {
      const name = this.resolveName(_name);
      if (name.namespace !== 'base' && name.value === '') {
        delete this.callbacks[name.namespace];
      } else if (name.namespace === 'base') {
        for (const namespace in this.callbacks) {
          if (
            this.callbacks[namespace] instanceof Object &&
            this.callbacks[namespace][name.value] instanceof Array
          ) {
            delete this.callbacks[namespace][name.value];
            if (Object.keys(this.callbacks[namespace]).length === 0)
              delete this.callbacks[namespace];
          }
        }
      } else if (
        this.callbacks[name.namespace] instanceof Object &&
        this.callbacks[name.namespace][name.value] instanceof Array
      ) {
        delete this.callbacks[name.namespace][name.value];
        if (Object.keys(this.callbacks[name.namespace]).length === 0)
          delete this.callbacks[name.namespace];
      }
    });
    return this;
  }
  trigger(_name: string, _args?: unknown[]): unknown {
    if (typeof _name === 'undefined' || _name === '') {
      console.warn('wrong name');
      return false;
    }
    let finalResult: unknown = null;
    let result: unknown = null;
    const args = !(_args instanceof Array) ? [] : _args;
    const nameList = this.resolveNames(_name);
    const name = this.resolveName(nameList[0]);
    if (name.namespace === 'base') {
      for (const namespace in this.callbacks) {
        if (
          this.callbacks[namespace] instanceof Object &&
          this.callbacks[namespace][name.value] instanceof Array
        ) {
          this.callbacks[namespace][name.value].forEach((callback) => {
            result = callback.apply(this, args);
            if (typeof finalResult === 'undefined') {
              finalResult = result;
            }
          });
        }
      }
    } else if (this.callbacks[name.namespace] instanceof Object) {
      if (name.value === '') {
        console.warn('wrong name');
        return this;
      }
      this.callbacks[name.namespace][name.value].forEach((callback) => {
        result = callback.apply(this, args);
        if (typeof finalResult === 'undefined') finalResult = result;
      });
    }
    return finalResult;
  }
  resolveNames(_names: string): string[] {
    const normalized = _names
      .replace(/[^a-zA-Z0-9 ,/.]/g, '')
      .replace(/[,/]+/g, ' ')
      .split(' ');
    return normalized;
  }
  resolveName(name: string): ResolvedName {
    const newName: ResolvedName = {
      original: name,
      value: '',
      namespace: 'base',
    };
    const parts = name.split('.');
    newName.original = name;
    newName.value = parts[0];
    newName.namespace = 'base';
    if (parts.length > 1 && parts[1] !== '') {
      newName.namespace = parts[1];
    }
    return newName;
  }
}
