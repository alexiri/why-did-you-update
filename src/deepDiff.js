import _isEqual from 'lodash/isEqual'
import _isFunction from 'lodash/isFunction'
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _union from 'lodash/union'
import Immutable from 'immutable';

const isReferenceEntity = o => Array.isArray(o) || _isObject(o)

export class DeepDiff {
  constructor(prev, next, name, opts){
    this.prev = prev
    this.next = next
    this.name = name
    this.opts = opts
    this.useImmutable = opts.useImmutable
  }

  run(){
    if (this.opts.maxdepth <= 0) return;
    const isRefEntity = isReferenceEntity(this.prev) && isReferenceEntity(this.next)

    if (!_isEqual(this.prev, this.next)) {
      const isFunc = _isFunction(this.prev) && _isFunction(this.next)

      if (isFunc) {
        if (this.prev.name === this.next.name) {
          this.notify(`Value is a function. Possibly avoidable re-render?`, false)
        }
      } else if (isRefEntity) {
        this.refDeepDiff()
      }
    } else if (this.prev !== this.next) {
      this.notify(`Value did not change. Avoidable re-render!`, true)

      if (isRefEntity) {
        this.refDeepDiff()
      }
    }
  }

  notify(status, bold){
    console.group(this.name)

    if (bold) {
      console.warn(`%c%s (depth %d)`, `font-weight: bold`, status, this.opts.maxdepth)
    } else {
      console.warn(`%s (depth %d)`, status, this.opts.maxdepth)
    }

    console.log(`%cbefore`, `font-weight: bold`, this.prev)
    console.log(`%cafter `, `font-weight: bold`, this.next)
    console.groupEnd()
  }

  refDeepDiff(){
    let keys;
    if(this.useImmutable && this.isImmutable()){
      // Immutable.List's instance do not have _keys, so forEach do not execute 😎
      keys = _union(this.prev._keys, this.next._keys);
    } else {
      keys = _union(_keys(this.prev), _keys(this.next))
    }
    let opts = this.opts;
    opts.maxdepth = this.opts.maxdepth - 1;
    keys.forEach(key => {
      return new DeepDiff(this.prev[key], this.next[key], `${this.name}.${key}`, opts).run()
    })
  }

  isImmutable(){
    return Immutable.Iterable.isIterable(this.prev) && Immutable.Iterable.isIterable(this.next);
  }
}

