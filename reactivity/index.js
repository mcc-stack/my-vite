/**
 * Obj.name = xx 触发set,执行收集到的effect
 * 用map收集所有依赖
 */
var targetMap = new WeakMap();
var effectStack = []; //存储effect
/**
 * 进行依赖收集
 * @param {object} target
 * @param {string} key
 */
function track(target, key) {
  // initial
  const effect = effectStack[effectStack.length - 1];
  if (effect) {
    var depMap = targetMap.get(target);
    if (depMap === undefined) {
      depMap = new Map();
      targetMap.set(target, depMap);
    }

    var dep = depMap.get(key);
    if (dep === undefined) {
      dep = new Set();
      depMap.set(key, dep);
    }
    if (!dep.has(effect)) {
      dep.add(effect);
      effect.deps.push(dep);
    }
  }
  // 依赖收集
}
function trigger(target, key, info) {
  var depMap = targetMap.get(target);
  if (depMap === undefined) {
    return; // 没有副作用
  }
  const effects = new Set();
  const computeds = new Set(); // computed是一个特殊的effect
  if (key) {
    var deps = depMap.get(key);
    deps.forEach(effect => {
      if (effect.computed) {
        computeds.add(effect);
      } else {
        effects.add(effect);
      }
    });
  }
  effects.forEach(effect => effect());
  computeds.forEach(computed => computed());
}

const baseHandler = {
  get(target, key) {
    const ret = target[key];
    // 进行依赖收集
    track(target, key);
    return ret;
  },
  set(target, key, val) {
    const info = { oldVal: target[key], newVal: val };
    target[key] = val;
    trigger(target, key, info);
  }
};

/**
 *
 * @param {object} target
 */
function reactive(target) {
  const observed = new Proxy(target, baseHandler);
  return observed;
}

function computed(fn) {
  const runner = effect(fn, { computed: true, lazy: true });
  return {
    effect: runner,
    get value() {
      return runner();
    }
  };
}

function createReactiveEffect(fn, options) {
  const effect = function effect(...args) {
    return run(effect, fn, args);
  };
  effect.deps = [];
  effect.computed = options.computed;
  effect.lazy = options.lazy;
  return effect;
}

// 调度
function run(effect, fn, args) {
  if (effectStack.indexOf(effect) === -1) {
    try {
      effectStack.push(effect);
      return fn(...args);
    } finally {
      effectStack.pop();
    }
  }
}
/**
 *
 * @param {Function} fn
 * @param {object} options
 */
function effect(fn, options = {}) {
  var e = createReactiveEffect(fn, options);
  if (!options.lazy) {
    e();
  }
  return e;
}
