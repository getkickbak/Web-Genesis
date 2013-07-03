// libmp3lame.js - port of libmp3lame to JavaScript using emscripten
// by Andreas Krennmair <ak@synflood.at>
var Lame = (function() {
// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 61144;
var _tabsel_123;
var _stderr;
var _freqs;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,27,134,42,204,204,52,43,33,78,132,43,252,247,157,43,88,156,166,43,252,247,157,43,33,78,132,43,204,204,52,43,0,27,134,42,83,248,191,44,254,169,171,44,146,50,149,44,159,129,122,44,239,29,73,44,62,186,23,44,116,173,207,43,133,159,107,43,183,89,146,42,83,248,191,172,254,169,171,172,146,50,149,172,159,129,122,172,239,29,73,172,62,186,23,172,116,173,207,171,133,159,107,171,183,89,146,170,0,27,134,170,204,204,52,171,33,78,132,171,252,247,157,171,88,156,166,171,252,247,157,171,33,78,132,171,204,204,52,171,0,27,134,170,0,27,134,42,204,204,52,43,33,78,132,43,252,247,157,43,88,156,166,43,252,247,157,43,33,78,132,43,204,204,52,43,0,27,134,42,83,248,191,44,254,169,171,44,146,50,149,44,159,129,122,44,239,29,73,44,62,186,23,44,116,173,207,43,133,159,107,43,183,89,146,42,37,39,192,172,51,37,173,172,234,209,152,172,227,84,131,172,249,175,89,172,11,14,43,172,102,34,244,171,201,49,137,171,74,123,157,170,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,144,128,170,174,79,227,170,5,174,113,170,234,207,6,62,205,19,212,62,139,111,68,63,255,175,139,63,23,208,166,63,117,235,200,63,190,226,245,63,122,130,26,64,105,251,74,64,185,87,144,64,107,16,243,64,233,58,183,65,92,28,124,63,187,141,36,63,68,29,175,62,178,143,112,63,212,208,49,190,125,27,68,191,215,179,93,63,0,0,0,63,254,181,3,191,218,134,241,190,2,115,160,190,116,71,58,190,29,176,193,189,135,203,39,189,29,161,104,188,70,123,114,187,168,132,91,63,216,185,97,63,221,26,115,63,129,186,123,63,65,218,126,63,253,200,127,63,101,249,127,63,141,255,127,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,144,128,42,174,79,227,42,5,174,113,42,37,39,192,44,51,37,173,44,234,209,152,44,227,84,131,44,249,175,89,44,11,14,43,44,102,34,244,43,201,49,137,43,74,123,157,42,83,248,191,172,254,169,171,172,146,50,149,172,159,129,122,172,239,29,73,172,62,186,23,172,116,173,207,171,133,159,107,171,183,89,146,170,0,27,134,170,204,204,52,171,33,78,132,171,252,247,157,171,88,156,166,171,252,247,157,171,33,78,132,171,204,204,52,171,0,27,134,170,137,158,227,63,229,83,236,63,167,94,245,63,155,20,249,63,14,217,252,63,123,143,234,63,218,151,217,63,226,132,191,63,124,145,168,63,0,0,128,63,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,128,63,54,89,75,63,152,134,33,63,152,134,33,63,152,134,33,63,152,134,33,63,152,134,33,63,250,155,128,62,153,158,240,61,0,0,0,0,3,4,6,7,9,10,4,5,6,7,8,10,5,6,7,8,9,10,7,7,8,9,9,10,8,8,9,9,10,11,9,9,10,10,11,11,0,0,0,0,7,0,5,0,9,0,14,0,15,0,7,0,6,0,4,0,5,0,5,0,6,0,7,0,7,0,6,0,8,0,8,0,8,0,5,0,15,0,6,0,9,0,10,0,5,0,1,0,11,0,7,0,9,0,6,0,4,0,1,0,14,0,4,0,6,0,2,0,6,0,0,0,2,4,7,9,9,10,4,4,6,10,10,10,7,6,8,10,10,11,9,10,10,11,11,12,9,9,10,11,12,12,10,10,11,11,13,13,0,0,0,0,3,0,4,0,6,0,18,0,12,0,5,0,5,0,1,0,2,0,16,0,9,0,3,0,7,0,3,0,5,0,14,0,7,0,3,0,19,0,17,0,15,0,13,0,10,0,4,0,13,0,5,0,8,0,11,0,5,0,1,0,12,0,4,0,4,0,1,0,1,0,0,0,1,4,7,9,9,10,4,6,8,9,9,10,7,7,9,10,10,11,8,9,10,11,11,11,8,9,10,11,11,12,9,10,11,12,12,12,0,0,0,0,1,0,2,0,10,0,19,0,16,0,10,0,3,0,3,0,7,0,10,0,5,0,3,0,11,0,4,0,13,0,17,0,8,0,4,0,12,0,11,0,18,0,15,0,11,0,2,0,7,0,6,0,9,0,14,0,3,0,1,0,6,0,4,0,5,0,3,0,2,0,0,0,3,4,6,8,4,4,6,7,5,6,7,8,7,7,8,9,7,0,3,0,5,0,1,0,6,0,2,0,3,0,2,0,5,0,4,0,4,0,1,0,3,0,3,0,2,0,0,0,1,4,7,8,4,5,8,9,7,8,9,10,8,8,9,10,1,0,2,0,6,0,5,0,3,0,1,0,4,0,4,0,7,0,5,0,7,0,1,0,6,0,1,0,1,0,0,0,2,3,7,4,4,7,6,7,8,0,0,0,0,0,0,0,3,0,2,0,1,0,1,0,1,0,1,0,3,0,2,0,0,0,0,0,0,0,0,0,4,5,5,6,5,6,6,7,5,6,6,7,6,7,7,8,15,0,28,0,26,0,48,0,22,0,40,0,36,0,64,0,14,0,24,0,20,0,32,0,12,0,16,0,8,0,0,0,1,5,5,7,5,8,7,9,5,7,7,9,7,9,9,10,1,0,10,0,8,0,20,0,12,0,20,0,16,0,32,0,14,0,12,0,24,0,0,0,28,0,16,0,24,0,16,0,1,4,7,4,5,7,6,7,8,0,0,0,0,0,0,0,1,0,2,0,1,0,3,0,1,0,1,0,3,0,2,0,0,0,0,0,0,0,0,0,4,5,7,8,9,10,10,11,11,12,12,12,12,12,13,10,5,6,7,8,9,10,10,11,11,11,12,12,12,12,12,10,7,7,8,9,9,10,10,11,11,11,11,12,12,12,13,9,8,8,9,9,10,10,10,11,11,11,11,12,12,12,12,9,9,9,9,10,10,10,10,11,11,11,12,12,12,12,13,9,10,9,10,10,10,10,11,11,11,11,12,12,12,12,12,9,10,10,10,10,10,11,11,11,11,12,12,12,12,12,13,9,11,10,10,10,11,11,11,11,12,12,12,12,12,13,13,10,11,11,11,11,11,11,11,11,11,12,12,12,12,13,13,10,11,11,11,11,11,11,11,12,12,12,12,12,13,13,13,10,12,11,11,11,11,12,12,12,12,12,12,13,13,13,13,10,12,12,11,11,11,12,12,12,12,12,12,13,13,13,13,10,12,12,12,12,12,12,12,12,12,12,13,13,13,13,13,10,12,12,12,12,12,12,12,12,13,13,13,13,13,13,13,10,13,12,12,12,12,12,12,13,13,13,13,13,13,13,13,10,9,9,9,9,9,9,9,9,9,9,9,10,10,10,10,6,15,0,13,0,46,0,80,0,146,0,6,1,248,0,178,1,170,1,157,2,141,2,137,2,109,2,5,2,8,4,88,0,14,0,12,0,21,0,38,0,71,0,130,0,122,0,216,0,209,0,198,0,71,1,89,1,63,1,41,1,23,1,42,0,47,0,22,0,41,0,74,0,68,0,128,0,120,0,221,0,207,0,194,0,182,0,84,1,59,1,39,1,29,2,18,0,81,0,39,0,75,0,70,0,134,0,125,0,116,0,220,0,204,0,190,0,178,0,69,1,55,1,37,1,15,1,16,0,147,0,72,0,69,0,135,0,127,0,118,0,112,0,210,0,200,0,188,0,96,1,67,1,50,1,29,1,28,2,14,0,7,1,66,0,129,0,126,0,119,0,114,0,214,0,202,0,192,0,180,0,85,1,61,1,45,1,25,1,6,1,12,0,249,0,123,0,121,0,117,0,113,0,215,0,206,0,195,0,185,0,91,1,74,1,52,1,35,1,16,1,8,2,10,0,179,1,115,0,111,0,109,0,211,0,203,0,196,0,187,0,97,1,76,1,57,1,42,1,27,1,19,2,125,1,17,0,171,1,212,0,208,0,205,0,201,0,193,0,186,0,177,0,169,0,64,1,47,1,30,1,12,1,2,2,121,1,16,0,79,1,199,0,197,0,191,0,189,0,181,0,174,0,77,1,65,1,49,1,33,1,19,1,9,2,123,1,115,1,11,0,156,2,184,0,183,0,179,0,175,0,88,1,75,1,58,1,48,1,34,1,21,1,18,2,127,1,117,1,110,1,10,0,140,2,90,1,171,0,168,0,164,0,62,1,53,1,43,1,31,1,20,1,7,1,1,2,119,1,112,1,106,1,6,0,136,2,66,1,60,1,56,1,51,1,46,1,36,1,28,1,13,1,5,1,0,2,120,1,114,1,108,1,103,1,4,0,108,2,44,1,40,1,38,1,32,1,26,1,17,1,10,1,3,2,124,1,118,1,113,1,109,1,105,1,101,1,2,0,9,4,24,1,22,1,18,1,11,1,8,1,3,1,126,1,122,1,116,1,111,1,107,1,104,1,102,1,100,1,0,0,43,0,20,0,19,0,17,0,15,0,13,0,11,0,9,0,7,0,6,0,4,0,7,0,5,0,3,0,1,0,3,0,1,4,3,5,0,0,0,0,1,0,1,0,1,0,0,0,1,5,7,9,10,10,11,11,12,12,12,13,13,13,14,10,4,6,8,9,10,11,11,11,12,12,12,13,14,13,14,10,7,8,9,10,11,11,12,12,13,12,13,13,13,14,14,11,9,9,10,11,11,12,12,12,13,13,14,14,14,15,15,12,10,10,11,11,12,12,13,13,13,14,14,14,15,15,15,11,10,10,11,11,12,13,13,14,13,14,14,15,15,15,16,12,11,11,11,12,13,13,13,13,14,14,14,14,15,15,16,12,11,11,12,12,13,13,13,14,14,15,15,15,15,17,17,12,11,12,12,13,13,13,14,14,15,15,15,15,16,16,16,12,12,12,12,13,13,14,14,15,15,15,15,16,15,16,15,13,12,13,12,13,14,14,14,14,15,16,16,16,17,17,16,12,13,13,13,13,14,14,15,16,16,16,16,16,16,15,16,13,13,14,14,14,14,15,15,15,15,17,16,16,16,16,18,13,15,14,14,14,15,15,16,16,16,18,17,17,17,19,17,13,14,15,13,14,16,16,15,16,16,17,18,17,19,17,16,13,10,10,10,11,11,12,12,12,13,13,13,13,13,13,13,10,1,5,7,9,10,10,11,11,12,12,12,13,13,13,14,11,4,6,8,9,10,11,11,11,12,12,12,13,14,13,14,11,7,8,9,10,11,11,12,12,13,12,13,13,13,14,14,12,9,9,10,11,11,12,12,12,13,13,14,14,14,15,15,13,10,10,11,11,12,12,13,13,13,14,14,14,15,15,15,12,10,10,11,11,12,13,13,14,13,14,14,15,15,15,16,13,11,11,11,12,13,13,13,13,14,14,14,14,15,15,16,13,11,11,12,12,13,13,13,14,14,15,15,15,15,17,17,13,11,12,12,13,13,13,14,14,15,15,15,15,16,16,16,13,12,12,12,13,13,14,14,15,15,15,15,16,15,16,15,14,12,13,12,13,14,14,14,14,15,16,16,16,17,17,16,13,13,13,13,13,14,14,15,16,16,16,16,16,16,15,16,14,13,14,14,14,14,15,15,15,15,17,16,16,16,16,18,14,15,14,14,14,15,15,16,16,16,18,17,17,17,19,17,14,14,15,13,14,16,16,15,16,16,17,18,17,19,17,16,14,11,11,11,12,12,13,13,13,14,14,14,14,14,14,14,12,1,0,5,0,14,0,44,0,74,0,63,0,110,0,93,0,172,0,149,0,138,0,242,0,225,0,195,0,120,1,17,0,3,0,4,0,12,0,20,0,35,0,62,0,53,0,47,0,83,0,75,0,68,0,119,0,201,0,107,0,207,0,9,0,15,0,13,0,23,0,38,0,67,0,58,0,103,0,90,0,161,0,72,0,127,0,117,0,110,0,209,0,206,0,16,0,45,0,21,0,39,0,69,0,64,0,114,0,99,0,87,0,158,0,140,0,252,0,212,0,199,0,131,1,109,1,26,0,75,0,36,0,68,0,65,0,115,0,101,0,179,0,164,0,155,0,8,1,246,0,226,0,139,1,126,1,106,1,9,0,66,0,30,0,59,0,56,0,102,0,185,0,173,0,9,1,142,0,253,0,232,0,144,1,132,1,122,1,189,1,16,0,111,0,54,0,52,0,100,0,184,0,178,0,160,0,133,0,1,1,244,0,228,0,217,0,129,1,110,1,203,2,10,0,98,0,48,0,91,0,88,0,165,0,157,0,148,0,5,1,248,0,151,1,141,1,116,1,124,1,121,3,116,3,8,0,85,0,84,0,81,0,159,0,156,0,143,0,4,1,249,0,171,1,145,1,136,1,127,1,215,2,201,2,196,2,7,0,154,0,76,0,73,0,141,0,131,0,0,1,245,0,170,1,150,1,138,1,128,1,223,2,103,1,198,2,96,1,11,0,139,0,129,0,67,0,125,0,247,0,233,0,229,0,219,0,137,1,231,2,225,2,208,2,117,3,114,3,183,1,4,0,243,0,120,0,118,0,115,0,227,0,223,0,140,1,234,2,230,2,224,2,209,2,200,2,194,2,223,0,180,1,6,0,202,0,224,0,222,0,218,0,216,0,133,1,130,1,125,1,108,1,120,3,187,1,195,2,184,1,181,1,192,6,4,0,235,2,211,0,210,0,208,0,114,1,123,1,222,2,211,2,202,2,199,6,115,3,109,3,108,3,131,13,97,3,2,0,121,1,113,1,102,0,187,0,214,2,210,2,102,1,199,2,197,2,98,3,198,6,103,3,130,13,102,3,178,1,0,0,12,0,10,0,7,0,11,0,10,0,17,0,11,0,9,0,13,0,12,0,10,0,7,0,5,0,3,0,1,0,3,0,3,5,6,8,8,9,10,10,10,11,11,12,12,12,13,14,5,5,7,8,9,9,10,10,10,11,11,12,12,12,13,13,6,7,7,8,9,9,10,10,10,11,11,12,12,13,13,13,7,8,8,9,9,10,10,11,11,11,12,12,12,13,13,13,8,8,9,9,10,10,11,11,11,11,12,12,12,13,13,13,9,9,9,10,10,10,11,11,11,11,12,12,13,13,13,14,10,9,10,10,10,11,11,11,11,12,12,12,13,13,14,14,10,10,10,11,11,11,11,12,12,12,12,12,13,13,13,14,10,10,10,11,11,11,11,12,12,12,12,13,13,14,14,14,10,10,11,11,11,11,12,12,12,13,13,13,13,14,14,14,11,11,11,11,12,12,12,12,12,13,13,13,13,14,15,14,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,15,12,12,11,12,12,12,13,13,13,13,13,13,14,14,15,15,12,12,12,12,12,13,13,13,13,14,14,14,14,14,15,15,13,13,13,13,13,13,13,13,14,14,14,14,15,15,14,15,13,13,13,13,13,13,13,14,14,14,14,14,15,15,15,15,7,0,12,0,18,0,53,0,47,0,76,0,124,0,108,0,89,0,123,0,108,0,119,0,107,0,81,0,122,0,63,0,13,0,5,0,16,0,27,0,46,0,36,0,61,0,51,0,42,0,70,0,52,0,83,0,65,0,41,0,59,0,36,0,19,0,17,0,15,0,24,0,41,0,34,0,59,0,48,0,40,0,64,0,50,0,78,0,62,0,80,0,56,0,33,0,29,0,28,0,25,0,43,0,39,0,63,0,55,0,93,0,76,0,59,0,93,0,72,0,54,0,75,0,50,0,29,0,52,0,22,0,42,0,40,0,67,0,57,0,95,0,79,0,72,0,57,0,89,0,69,0,49,0,66,0,46,0,27,0,77,0,37,0,35,0,66,0,58,0,52,0,91,0,74,0,62,0,48,0,79,0,63,0,90,0,62,0,40,0,38,0,125,0,32,0,60,0,56,0,50,0,92,0,78,0,65,0,55,0,87,0,71,0,51,0,73,0,51,0,70,0,30,0,109,0,53,0,49,0,94,0,88,0,75,0,66,0,122,0,91,0,73,0,56,0,42,0,64,0,44,0,21,0,25,0,90,0,43,0,41,0,77,0,73,0,63,0,56,0,92,0,77,0,66,0,47,0,67,0,48,0,53,0,36,0,20,0,71,0,34,0,67,0,60,0,58,0,49,0,88,0,76,0,67,0,106,0,71,0,54,0,38,0,39,0,23,0,15,0,109,0,53,0,51,0,47,0,90,0,82,0,58,0,57,0,48,0,72,0,57,0,41,0,23,0,27,0,62,0,9,0,86,0,42,0,40,0,37,0,70,0,64,0,52,0,43,0,70,0,55,0,42,0,25,0,29,0,18,0,11,0,11,0,118,0,68,0,30,0,55,0,50,0,46,0,74,0,65,0,49,0,39,0,24,0,16,0,22,0,13,0,14,0,7,0,91,0,44,0,39,0,38,0,34,0,63,0,52,0,45,0,31,0,52,0,28,0,19,0,14,0,8,0,9,0,3,0,123,0,60,0,58,0,53,0,47,0,43,0,32,0,22,0,37,0,24,0,17,0,12,0,15,0,10,0,2,0,1,0,71,0,37,0,34,0,30,0,28,0,20,0,17,0,26,0,21,0,16,0,10,0,6,0,8,0,6,0,2,0,0,0,1,5,7,8,9,10,10,11,10,11,12,12,13,13,14,14,4,6,8,9,10,10,11,11,11,11,12,12,13,14,14,14,7,8,9,10,11,11,12,12,11,12,12,13,13,14,15,15,8,9,10,11,11,12,12,12,12,13,13,13,13,14,15,15,9,9,11,11,12,12,13,13,12,13,13,14,14,15,15,16,10,10,11,12,12,12,13,13,13,13,14,13,15,15,16,16,10,11,12,12,13,13,13,13,13,14,14,14,15,15,16,16,11,11,12,13,13,13,14,14,14,14,15,15,15,16,18,18,10,10,11,12,12,13,13,14,14,14,14,15,15,16,17,17,11,11,12,12,13,13,13,15,14,15,15,16,16,16,18,17,11,12,12,13,13,14,14,15,14,15,16,15,16,17,18,19,12,12,12,13,14,14,14,14,15,15,15,16,17,17,17,18,12,13,13,14,14,15,14,15,16,16,17,17,17,18,18,18,13,13,14,15,15,15,16,16,16,16,16,17,18,17,18,18,14,14,14,15,15,15,17,16,16,19,17,17,17,19,18,18,13,14,15,16,16,16,17,16,17,17,18,18,21,20,21,18,1,0,5,0,14,0,21,0,34,0,51,0,46,0,71,0,42,0,52,0,68,0,52,0,67,0,44,0,43,0,19,0,3,0,4,0,12,0,19,0,31,0,26,0,44,0,33,0,31,0,24,0,32,0,24,0,31,0,35,0,22,0,14,0,15,0,13,0,23,0,36,0,59,0,49,0,77,0,65,0,29,0,40,0,30,0,40,0,27,0,33,0,42,0,16,0,22,0,20,0,37,0,61,0,56,0,79,0,73,0,64,0,43,0,76,0,56,0,37,0,26,0,31,0,25,0,14,0,35,0,16,0,60,0,57,0,97,0,75,0,114,0,91,0,54,0,73,0,55,0,41,0,48,0,53,0,23,0,24,0,58,0,27,0,50,0,96,0,76,0,70,0,93,0,84,0,77,0,58,0,79,0,29,0,74,0,49,0,41,0,17,0,47,0,45,0,78,0,74,0,115,0,94,0,90,0,79,0,69,0,83,0,71,0,50,0,59,0,38,0,36,0,15,0,72,0,34,0,56,0,95,0,92,0,85,0,91,0,90,0,86,0,73,0,77,0,65,0,51,0,44,0,43,0,42,0,43,0,20,0,30,0,44,0,55,0,78,0,72,0,87,0,78,0,61,0,46,0,54,0,37,0,30,0,20,0,16,0,53,0,25,0,41,0,37,0,44,0,59,0,54,0,81,0,66,0,76,0,57,0,54,0,37,0,18,0,39,0,11,0,35,0,33,0,31,0,57,0,42,0,82,0,72,0,80,0,47,0,58,0,55,0,21,0,22,0,26,0,38,0,22,0,53,0,25,0,23,0,38,0,70,0,60,0,51,0,36,0,55,0,26,0,34,0,23,0,27,0,14,0,9,0,7,0,34,0,32,0,28,0,39,0,49,0,75,0,30,0,52,0,48,0,40,0,52,0,28,0,18,0,17,0,9,0,5,0,45,0,21,0,34,0,64,0,56,0,50,0,49,0,45,0,31,0,19,0,12,0,15,0,10,0,7,0,6,0,3,0,48,0,23,0,20,0,39,0,36,0,35,0,53,0,21,0,16,0,23,0,13,0,10,0,6,0,1,0,4,0,2,0,16,0,15,0,17,0,27,0,25,0,20,0,29,0,11,0,17,0,12,0,16,0,8,0,1,0,1,0,0,0,1,0,4,4,6,8,9,10,10,10,4,5,6,7,9,9,10,10,6,6,7,8,9,10,9,10,7,7,8,8,9,10,10,10,8,8,9,9,10,10,10,11,9,9,10,10,10,11,10,11,9,9,9,10,10,11,11,12,10,10,10,11,11,11,11,12,9,0,6,0,16,0,33,0,41,0,39,0,38,0,26,0,7,0,5,0,6,0,9,0,23,0,16,0,26,0,11,0,17,0,7,0,11,0,14,0,21,0,30,0,10,0,7,0,17,0,10,0,15,0,12,0,18,0,28,0,14,0,5,0,32,0,13,0,22,0,19,0,18,0,16,0,9,0,5,0,40,0,17,0,31,0,29,0,17,0,13,0,4,0,2,0,27,0,12,0,11,0,15,0,10,0,7,0,4,0,1,0,27,0,12,0,8,0,12,0,6,0,3,0,1,0,0,0,2,4,6,8,9,10,9,10,4,5,6,8,10,10,9,10,6,7,8,9,10,11,10,10,8,8,9,11,10,12,10,11,9,10,10,11,11,12,11,12,9,10,11,12,12,13,12,13,9,9,9,10,11,12,12,12,9,9,10,11,12,12,12,12,3,0,4,0,10,0,24,0,34,0,33,0,21,0,15,0,5,0,3,0,4,0,10,0,32,0,17,0,11,0,10,0,11,0,7,0,13,0,18,0,30,0,31,0,20,0,5,0,25,0,11,0,19,0,59,0,27,0,18,0,12,0,5,0,35,0,33,0,31,0,58,0,30,0,16,0,7,0,5,0,28,0,26,0,32,0,19,0,17,0,15,0,8,0,14,0,14,0,12,0,9,0,13,0,14,0,9,0,4,0,1,0,11,0,4,0,6,0,6,0,6,0,3,0,2,0,0,0,1,4,7,9,10,10,10,11,4,6,8,9,10,11,10,10,7,8,9,10,11,12,11,11,8,9,10,11,12,12,11,12,9,10,11,12,12,12,12,12,10,11,12,12,13,13,12,13,9,10,11,12,12,12,13,13,10,10,11,12,12,13,13,13,1,0,2,0,10,0,23,0,35,0,30,0,12,0,17,0,3,0,3,0,8,0,12,0,18,0,21,0,12,0,7,0,11,0,9,0,15,0,21,0,32,0,40,0,19,0,6,0,14,0,13,0,22,0,34,0,46,0,23,0,18,0,7,0,20,0,19,0,33,0,47,0,27,0,22,0,9,0,3,0,31,0,22,0,41,0,26,0,21,0,20,0,5,0,3,0,14,0,13,0,10,0,11,0,16,0,6,0,5,0,1,0,9,0,8,0,7,0,8,0,4,0,4,0,2,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,0,128,64,192,32,160,96,224,16,144,80,208,48,176,112,240,8,136,72,200,40,168,104,232,24,152,88,216,56,184,120,248,4,132,68,196,36,164,100,228,20,148,84,212,52,180,116,244,12,140,76,204,44,172,108,236,28,156,92,220,60,188,124,252,2,130,66,194,34,162,98,226,18,146,82,210,50,178,114,242,10,138,74,202,42,170,106,234,26,154,90,218,58,186,122,250,6,134,70,198,38,166,102,230,22,150,86,214,54,182,118,246,14,142,78,206,46,174,110,238,30,158,94,222,62,190,126,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,205,204,60,65,154,153,89,65,154,153,137,65,0,0,0,66,0,0,58,66,51,51,77,66,0,0,102,66,51,51,134,66,0,0,143,66,51,51,169,66,51,51,195,66,0,0,2,67,154,153,217,64,154,153,185,64,154,153,185,64,205,204,204,64,0,0,208,64,102,102,30,65,154,153,65,65,102,102,102,65,0,0,112,65,51,51,151,65,205,204,172,65,51,51,215,65,205,204,8,66,205,204,32,66,51,51,59,66,0,0,98,66,205,204,114,66,205,204,147,66,102,102,171,66,205,204,186,66,51,51,252,66,0,0,0,0,0,0,0,0,1,0,0,0,16,0,0,0,17,0,0,0,8,0,0,0,9,0,0,0,24,0,0,0,25,0,0,0,4,0,0,0,5,0,0,0,20,0,0,0,21,0,0,0,12,0,0,0,13,0,0,0,28,0,0,0,29,0,0,0,2,0,0,0,3,0,0,0,18,0,0,0,19,0,0,0,10,0,0,0,11,0,0,0,26,0,0,0,27,0,0,0,6,0,0,0,7,0,0,0,22,0,0,0,23,0,0,0,14,0,0,0,15,0,0,0,30,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,40,26,0,0,32,26,0,0,3,0,0,0,0,0,0,0,8,23,0,0,248,22,0,0,3,0,0,0,0,0,0,0,128,22,0,0,112,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,80,22,0,0,64,22,0,0,4,0,0,0,0,0,0,0,32,22,0,0,16,22,0,0,6,0,0,0,0,0,0,0,200,21,0,0,160,21,0,0,6,0,0,0,0,0,0,0,88,21,0,0,48,21,0,0,6,0,0,0,0,0,0,0,232,20,0,0,192,20,0,0,8,0,0,0,0,0,0,0,240,37,0,0,176,37,0,0,8,0,0,0,0,0,0,0,48,37,0,0,240,36,0,0,8,0,0,0,0,0,0,0,112,36,0,0,48,36,0,0,16,0,0,0,0,0,0,0,48,34,0,0,48,33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,27,0,0,16,0,0,0,0,0,0,0,48,31,0,0,48,30,0,0,1,0,0,0,1,0,0,0,48,28,0,0,48,26,0,0,2,0,0,0,3,0,0,0,48,28,0,0,48,26,0,0,3,0,0,0,7,0,0,0,48,28,0,0,48,26,0,0,4,0,0,0,15,0,0,0,48,28,0,0,48,26,0,0,6,0,0,0,63,0,0,0,48,28,0,0,48,26,0,0,8,0,0,0,255,0,0,0,48,28,0,0,48,26,0,0,10,0,0,0,255,3,0,0,48,28,0,0,48,26,0,0,13,0,0,0,255,31,0,0,48,28,0,0,48,26,0,0,4,0,0,0,15,0,0,0,32,24,0,0,32,23,0,0,5,0,0,0,31,0,0,0,32,24,0,0,32,23,0,0,6,0,0,0,63,0,0,0,32,24,0,0,32,23,0,0,7,0,0,0,127,0,0,0,32,24,0,0,32,23,0,0,8,0,0,0,255,0,0,0,32,24,0,0,32,23,0,0,9,0,0,0,255,1,0,0,32,24,0,0,32,23,0,0,11,0,0,0,255,7,0,0,32,24,0,0,32,23,0,0,13,0,0,0,255,31,0,0,32,24,0,0,32,23,0,0,0,0,0,0,0,0,0,0,216,22,0,0,200,22,0,0,0,0,0,0,0,0,0,0,168,22,0,0,152,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,121,207,23,190,138,59,1,66,164,51,148,67,155,200,92,68,202,167,45,70,175,40,132,68,192,222,152,67,129,155,246,65,199,156,118,64,77,183,109,66,194,101,49,68,74,15,165,69,82,45,182,197,71,104,76,196,73,213,153,194,66,4,147,192,94,6,104,63,54,189,72,62,3,97,30,190,44,76,9,66,68,231,150,67,96,102,76,68,47,215,52,70,17,168,147,68,117,204,160,67,46,219,249,65,68,124,109,64,146,154,86,66,183,10,43,68,136,68,163,69,35,243,198,197,129,62,99,196,80,169,179,194,43,42,173,192,1,24,82,63,194,197,199,62,223,144,36,190,144,150,16,66,32,15,152,67,140,47,55,68,113,86,59,70,101,128,162,68,120,164,167,67,193,231,251,65,149,237,87,64,209,237,60,66,46,47,35,68,80,99,160,69,178,232,215,197,240,127,122,196,100,62,207,194,121,91,195,192,207,220,61,63,49,160,20,63,61,91,42,190,177,1,23,66,106,129,151,67,98,254,28,68,14,27,65,70,229,136,176,68,246,95,173,67,75,201,252,65,52,59,74,64,173,80,34,66,178,10,26,68,170,126,156,69,83,240,232,197,121,249,136,196,253,124,236,194,231,48,218,192,193,13,43,63,21,239,67,63,139,188,47,190,75,118,28,66,177,43,149,67,81,195,251,67,92,30,70,70,161,146,189,68,23,254,177,67,116,41,251,65,165,166,58,64,77,48,7,66,62,185,15,68,225,169,151,69,144,236,249,197,102,184,148,196,253,164,5,195,130,12,247,192,196,112,25,63,234,90,113,63,120,177,52,190,11,224,32,66,197,255,144,67,75,169,179,67,9,89,74,70,63,131,201,68,227,108,181,67,12,94,248,65,73,159,52,64,49,233,215,65,148,121,4,68,250,250,145,69,153,95,5,198,224,82,160,196,230,149,21,195,193,75,10,193,185,213,8,63,218,57,142,63,244,54,185,190,93,45,36,66,238,197,138,67,123,163,67,67,193,197,77,70,150,52,212,68,118,180,183,67,208,116,244,65,169,3,34,64,173,143,160,65,68,192,240,67,195,135,139,69,122,165,13,198,28,180,171,196,130,42,38,195,136,83,25,193,112,40,242,62,153,103,162,63,55,74,189,190,167,146,37,66,148,165,130,67,182,247,78,65,135,96,80,70,71,144,221,68,247,225,184,67,182,2,238,65,153,191,25,64,113,224,84,65,226,71,215,67,116,104,132,69,186,183,21,198,32,182,182,196,153,32,55,195,248,124,43,193,205,19,212,62,243,4,181,63,187,232,192,190,91,122,38,66,227,13,113,67,88,242,59,195,65,40,82,70,237,132,229,68,213,190,184,67,201,3,232,65,16,147,4,64,105,242,216,64,110,227,188,67,47,102,121,69,214,134,29,198,81,62,193,196,85,96,72,195,235,212,61,193,80,50,183,62,3,228,197,63,71,16,196,190,73,155,36,66,18,122,88,67,23,20,203,195,140,28,83,70,216,249,235,68,185,166,183,67,247,22,225,65,11,250,244,63,71,16,196,62,69,237,161,67,91,2,105,69,239,4,37,198,124,38,203,196,16,160,89,195,54,63,80,193,66,80,155,62,49,219,212,63,46,15,21,191,242,108,33,66,98,51,60,67,83,17,32,196,220,60,83,70,70,243,240,68,238,104,181,67,38,192,215,65,112,137,223,63,88,12,180,192,157,166,134,67,47,214,87,69,149,32,44,198,6,85,212,196,16,196,106,195,193,157,98,193,212,63,128,62,152,197,225,63,57,182,22,191,234,239,28,66,206,194,27,67,244,79,94,196,226,141,82,70,182,97,244,68,249,56,178,67,221,40,207,65,124,229,200,63,57,233,50,193,16,207,86,67,160,18,70,69,73,205,50,198,21,165,220,196,104,176,123,195,1,246,119,193,175,175,75,62,94,131,236,63,230,143,74,191,36,147,21,66,35,102,239,66,16,227,143,196,201,17,81,70,166,76,246,68,130,2,174,67,22,218,197,65,28,72,177,63,12,95,131,193,224,12,33,67,81,229,51,69,247,251,56,198,140,255,227,196,139,36,134,195,184,137,134,193,100,229,23,62,11,250,244,63,223,202,75,191,201,237,12,66,223,9,160,66,174,0,178,196,45,207,78,70,187,185,246,68,213,254,168,67,51,80,186,65,197,91,178,63,32,204,168,193,139,247,216,66,54,123,33,69,232,158,62,198,230,72,234,196,148,31,142,195,218,232,144,193,220,181,201,61,190,20,251,63,15,177,127,191,152,64,2,66,94,213,19,66,106,66,213,196,38,205,75,70,66,172,245,68,70,55,163,67,112,102,177,65,251,108,153,63,81,248,202,193,231,35,102,66,180,6,15,69,179,170,67,198,226,90,239,196,151,161,149,195,66,6,155,193,60,57,73,61,109,196,254,63,54,211,37,70,68,177,165,69,175,113,104,68,69,51,54,68,128,12,144,67,180,213,129,66,2,0,241,65,34,63,131,64,49,19,72,70,167,49,243,68,86,182,156,67,170,105,166,65,251,100,249,68,112,3,16,65,17,158,233,193,0,0,0,0,0,0,0,0,128,1,0,0,128,4,0,0,128,4,0,0,0,0,0,0,128,1,0,0,128,4,0,0,64,2,0,0,0,0,0,0,193,192,0,0,129,193,0,0,64,1,0,0,1,195,0,0,192,3,0,0,128,2,0,0,65,194,0,0,1,198,0,0,192,6,0,0,128,7,0,0,65,199,0,0,0,5,0,0,193,197,0,0,129,196,0,0,64,4,0,0,1,204,0,0,192,12,0,0,128,13,0,0,65,205,0,0,0,15,0,0,193,207,0,0,129,206,0,0,64,14,0,0,0,10,0,0,193,202,0,0,129,203,0,0,64,11,0,0,1,201,0,0,192,9,0,0,128,8,0,0,65,200,0,0,1,216,0,0,192,24,0,0,128,25,0,0,65,217,0,0,0,27,0,0,193,219,0,0,129,218,0,0,64,26,0,0,0,30,0,0,193,222,0,0,129,223,0,0,64,31,0,0,1,221,0,0,192,29,0,0,128,28,0,0,65,220,0,0,0,20,0,0,193,212,0,0,129,213,0,0,64,21,0,0,1,215,0,0,192,23,0,0,128,22,0,0,65,214,0,0,1,210,0,0,192,18,0,0,128,19,0,0,65,211,0,0,0,17,0,0,193,209,0,0,129,208,0,0,64,16,0,0,1,240,0,0,192,48,0,0,128,49,0,0,65,241,0,0,0,51,0,0,193,243,0,0,129,242,0,0,64,50,0,0,0,54,0,0,193,246,0,0,129,247,0,0,64,55,0,0,1,245,0,0,192,53,0,0,128,52,0,0,65,244,0,0,0,60,0,0,193,252,0,0,129,253,0,0,64,61,0,0,1,255,0,0,192,63,0,0,128,62,0,0,65,254,0,0,1,250,0,0,192,58,0,0,128,59,0,0,65,251,0,0,0,57,0,0,193,249,0,0,129,248,0,0,64,56,0,0,0,40,0,0,193,232,0,0,129,233,0,0,64,41,0,0,1,235,0,0,192,43,0,0,128,42,0,0,65,234,0,0,1,238,0,0,192,46,0,0,128,47,0,0,65,239,0,0,0,45,0,0,193,237,0,0,129,236,0,0,64,44,0,0,1,228,0,0,192,36,0,0,128,37,0,0,65,229,0,0,0,39,0,0,193,231,0,0,129,230,0,0,64,38,0,0,0,34,0,0,193,226,0,0,129,227,0,0,64,35,0,0,1,225,0,0,192,33,0,0,128,32,0,0,65,224,0,0,1,160,0,0,192,96,0,0,128,97,0,0,65,161,0,0,0,99,0,0,193,163,0,0,129,162,0,0,64,98,0,0,0,102,0,0,193,166,0,0,129,167,0,0,64,103,0,0,1,165,0,0,192,101,0,0,128,100,0,0,65,164,0,0,0,108,0,0,193,172,0,0,129,173,0,0,64,109,0,0,1,175,0,0,192,111,0,0,128,110,0,0,65,174,0,0,1,170,0,0,192,106,0,0,128,107,0,0,65,171,0,0,0,105,0,0,193,169,0,0,129,168,0,0,64,104,0,0,0,120,0,0,193,184,0,0,129,185,0,0,64,121,0,0,1,187,0,0,192,123,0,0,128,122,0,0,65,186,0,0,1,190,0,0,192,126,0,0,128,127,0,0,65,191,0,0,0,125,0,0,193,189,0,0,129,188,0,0,64,124,0,0,1,180,0,0,192,116,0,0,128,117,0,0,65,181,0,0,0,119,0,0,193,183,0,0,129,182,0,0,64,118,0,0,0,114,0,0,193,178,0,0,129,179,0,0,64,115,0,0,1,177,0,0,192,113,0,0,128,112,0,0,65,176,0,0,0,80,0,0,193,144,0,0,129,145,0,0,64,81,0,0,1,147,0,0,192,83,0,0,128,82,0,0,65,146,0,0,1,150,0,0,192,86,0,0,128,87,0,0,65,151,0,0,0,85,0,0,193,149,0,0,129,148,0,0,64,84,0,0,1,156,0,0,192,92,0,0,128,93,0,0,65,157,0,0,0,95,0,0,193,159,0,0,129,158,0,0,64,94,0,0,0,90,0,0,193,154,0,0,129,155,0,0,64,91,0,0,1,153,0,0,192,89,0,0,128,88,0,0,65,152,0,0,1,136,0,0,192,72,0,0,128,73,0,0,65,137,0,0,0,75,0,0,193,139,0,0,129,138,0,0,64,74,0,0,0,78,0,0,193,142,0,0,129,143,0,0,64,79,0,0,1,141,0,0,192,77,0,0,128,76,0,0,65,140,0,0,0,68,0,0,193,132,0,0,129,133,0,0,64,69,0,0,1,135,0,0,192,71,0,0,128,70,0,0,65,134,0,0,1,130,0,0,192,66,0,0,128,67,0,0,65,131,0,0,0,65,0,0,193,129,0,0,129,128,0,0,64,64,0,0,0,0,0,0,8,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,80,0,0,0,96,0,0,0,112,0,0,0,128,0,0,0,144,0,0,0,160,0,0,0,255,255,255,255,0,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,80,0,0,0,96,0,0,0,112,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,1,0,0,64,1,0,0,255,255,255,255,0,0,0,0,8,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,69,114,114,111,114,58,32,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,105,110,95,98,117,102,102,101,114,32,98,117,102,102,101,114,10,0,37,100,0,0,0,0,0,0,69,114,114,111,114,58,32,77,65,88,95,72,69,65,68,69,82,95,66,85,70,32,116,111,111,32,115,109,97,108,108,32,105,110,32,98,105,116,115,116,114,101,97,109,46,99,32,10,0,0,0,0,0,0,0,0,32,49,37,37,32,32,98,117,103,32,105,110,32,76,65,77,69,32,101,110,99,111,100,105,110,103,32,108,105,98,114,97,114,121,0,0,0,0,0,0,32,57,37,37,32,32,89,111,117,114,32,115,121,115,116,101,109,32,105,115,32,111,118,101,114,99,108,111,99,107,101,100,0,0,0,0,0,0,0,0,51,46,57,57,46,53,0,0,57,48,37,37,32,32,76,65,77,69,32,99,111,109,112,105,108,101,100,32,119,105,116,104,32,98,117,103,103,121,32,118,101,114,115,105,111,110,32,111,102,32,103,99,99,32,117,115,105,110,103,32,97,100,118,97,110,99,101,100,32,111,112,116,105,109,105,122,97,116,105,111,110,115,0,0,0,0,0,0,84,104,105,115,32,105,115,32,97,32,102,97,116,97,108,32,101,114,114,111,114,46,32,32,73,116,32,104,97,115,32,115,101,118,101,114,97,108,32,112,111,115,115,105,98,108,101,32,99,97,117,115,101,115,58,0,98,105,116,32,114,101,115,101,114,118,111,105,114,32,101,114,114,111,114,58,32,10,108,51,95,115,105,100,101,45,62,109,97,105,110,95,100,97,116,97,95,98,101,103,105,110,58,32,37,105,32,10,82,101,115,118,111,105,114,32,115,105,122,101,58,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,10,114,101,115,118,32,100,114,97,105,110,32,40,112,111,115,116,41,32,32,32,32,32,32,32,32,32,37,105,32,10,114,101,115,118,32,100,114,97,105,110,32,40,112,114,101,41,32,32,32,32,32,32,32,32,32,32,37,105,32,10,104,101,97,100,101,114,32,97,110,100,32,115,105,100,101,105,110,102,111,58,32,32,32,32,32,32,37,105,32,10,100,97,116,97,32,98,105,116,115,58,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,10,116,111,116,97,108,32,98,105,116,115,58,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,40,114,101,109,97,105,110,100,101,114,58,32,37,105,41,32,10,98,105,116,115,112,101,114,102,114,97,109,101,58,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,10,0,0,115,116,114,97,110,103,101,32,101,114,114,111,114,32,102,108,117,115,104,105,110,103,32,98,117,102,102,101,114,32,46,46,46,32,10,0,0,0,0,0,73,110,116,101,114,110,97,108,32,98,117,102,102,101,114,32,105,110,99,111,110,115,105,115,116,101,110,99,121,46,32,102,108,117,115,104,98,105,116,115,32,60,62,32,82,101,115,118,83,105,122,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,221,1,30,61,115,47,118,192,47,250,176,188,158,20,250,64,153,188,161,186,158,119,53,193,81,220,194,184,116,225,80,65,83,153,135,188,1,154,68,193,129,18,177,60,29,186,23,65,225,231,169,188,42,236,187,192,86,189,194,59,84,76,48,64,23,210,72,59,21,174,94,191,117,48,252,56,166,136,14,62,45,12,61,59,187,242,93,61,21,159,94,192,66,120,238,188,39,159,203,64,116,13,11,188,159,194,8,193,122,116,11,188,136,161,23,65,15,206,8,188,48,10,13,193,54,239,183,60,24,84,219,64,42,177,212,188,119,161,140,192,227,27,133,60,46,141,12,64,204,220,29,187,91,68,64,191,179,14,221,59,38,166,6,62,18,27,246,186,98,72,30,62,88,65,24,192,146,25,191,189,204,80,54,64,198,233,127,189,83,84,41,192,195,60,177,60,160,42,15,64,141,230,100,189,27,243,213,191,107,217,67,61,72,195,128,63,221,177,17,59,30,72,235,190,198,2,2,61,96,182,39,62,140,213,99,188,41,29,78,189,32,117,213,59,250,86,192,60,8,103,16,188,195,30,155,62,254,109,206,191,55,145,103,190,17,54,138,63,79,222,175,189,44,92,131,190,5,120,6,61,113,172,38,190,93,7,22,188,128,210,103,190,162,171,193,188,106,76,200,62,186,131,191,187,206,177,98,190,217,136,128,61,99,84,56,61,14,238,10,183,195,81,164,60,229,233,6,59,220,52,70,59,209,172,241,188,164,63,172,62,202,209,191,191,12,238,130,190,224,157,95,63,198,63,242,189,120,245,249,61,39,37,244,61,171,200,78,191,74,115,160,189,61,4,245,62,155,0,154,187,253,11,255,189,221,42,193,187,240,154,38,189,226,118,106,61,225,172,170,61,116,82,8,60,208,143,45,189,111,248,133,188,144,228,243,60,148,49,144,188,83,247,229,62,31,210,32,191,69,246,18,190,75,222,151,62,236,79,105,190,172,192,190,190,13,131,104,188,76,24,12,59,175,11,39,61,83,49,215,190,21,234,253,189,13,83,99,62,22,214,39,61,196,1,201,59,137,153,214,61,247,48,138,61,143,176,152,188,61,242,108,61,134,205,2,189,7,1,4,61,132,146,177,59,35,242,16,63,249,36,134,191,99,48,65,191,195,71,149,62,202,81,38,62,41,63,137,190,8,118,43,62,71,89,6,60,108,141,65,190,36,174,230,62,232,94,158,62,59,32,169,190,83,31,141,190,179,5,138,61,91,28,212,59,139,246,67,189,211,25,177,61,92,87,134,60,98,50,27,189,45,15,148,60,22,191,192,187,190,188,20,63,131,166,2,191,181,32,8,191,54,36,163,190,218,83,18,190,249,108,79,190,122,105,51,62,249,208,22,62,32,205,194,60,1,112,199,62,138,81,31,62,88,186,110,190,236,195,129,190,127,224,86,189,85,103,133,60,212,73,205,188,47,187,141,61,242,19,200,60,237,111,24,189,6,255,148,60,149,162,245,187,69,87,9,63,94,65,128,190,239,223,215,190,42,39,221,190,85,217,52,187,98,70,12,189,146,207,46,61,213,159,63,189,79,51,209,189,227,53,135,62,214,104,21,62,42,194,26,62,27,131,201,188,75,199,51,190,101,108,229,189,100,191,64,190,139,76,38,189,16,94,96,61,204,36,68,61,80,177,64,61,130,177,181,188,0,0,0,0,98,120,124,63,40,114,252,191,98,120,252,191,59,253,120,63,98,120,124,63,19,41,124,63,180,33,252,191,19,41,252,191,229,96,120,63,19,41,124,63,66,185,122,63,86,171,250,191,66,185,250,191,92,142,117,63,66,185,122,63,120,174,121,63,129,154,249,191,120,174,249,191,222,132,115,63,120,174,121,63,91,33,121,63,194,9,249,191,91,33,249,191,234,113,114,63,91,33,121,63,110,236,118,63,58,195,246,191,110,236,246,191,69,43,110,63,110,236,118,63,141,200,117,63,87,148,245,191,141,200,245,191,134,249,107,63,141,200,117,63,202,100,117,63,133,44,245,191,202,100,245,191,31,58,107,63,202,100,117,63,138,43,114,63,214,203,241,191,138,43,242,191,124,22,101,63,138,43,114,63,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  var _floor=Math.floor;
  var _cos=Math.cos;
  function _log10(x) {
      return Math.log(x) / Math.LN10;
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  var _ceil=Math.ceil;
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  var _fabs=Math.abs;
  var _llvm_pow_f32=Math.pow;
  function _ExitMP3() {
  Module['printErr']('missing function: ExitMP3'); abort(-1);
  }
  function _decodeMP3_unclipped() {
  Module['printErr']('missing function: decodeMP3_unclipped'); abort(-1);
  }
  var _log=Math.log;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      var flush = function(filedes) {
        // Right now we write all data directly, except for output devices.
        if (FS.streams[filedes] && FS.streams[filedes].object.output) {
          if (!FS.streams[filedes].isTerminal) { // don't flush terminals, it would cause a \n to also appear
            FS.streams[filedes].object.output(null);
          }
        }
      };
      try {
        if (stream === 0) {
          for (var i = 0; i < FS.streams.length; i++) if (FS.streams[i]) flush(i);
        } else {
          flush(stream);
        }
        return 0;
      } catch (e) {
        ___setErrNo(ERRNO_CODES.EIO);
        return -1;
      }
    }
  var _llvm_va_start=undefined;
  function _llvm_va_end() {}
  var _sin=Math.sin;
  var _fabsf=Math.abs;
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  var _floorf=Math.floor;
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var _llvm_memset_p0i8_i64=_memset;
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    return Module["dynCall_iiiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stderr|0;var n=env._tabsel_123|0;var o=env._freqs|0;var p=+env.NaN;var q=+env.Infinity;var r=0;var s=0;var t=0;var u=0;var v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0.0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=global.Math.floor;var P=global.Math.abs;var Q=global.Math.sqrt;var R=global.Math.pow;var S=global.Math.cos;var T=global.Math.sin;var U=global.Math.tan;var V=global.Math.acos;var W=global.Math.asin;var X=global.Math.atan;var Y=global.Math.atan2;var Z=global.Math.exp;var _=global.Math.log;var $=global.Math.ceil;var aa=global.Math.imul;var ab=env.abort;var ac=env.assert;var ad=env.asmPrintInt;var ae=env.asmPrintFloat;var af=env.min;var ag=env.invoke_vi;var ah=env.invoke_vii;var ai=env.invoke_iiiiiii;var aj=env.invoke_ii;var ak=env.invoke_v;var al=env.invoke_iii;var am=env.invoke_viiii;var an=env._llvm_va_end;var ao=env._llvm_lifetime_end;var ap=env._fabsf;var aq=env._snprintf;var ar=env._abort;var as=env._fprintf;var at=env._fflush;var au=env._llvm_pow_f32;var av=env._log;var aw=env._fabs;var ax=env._floor;var ay=env.___setErrNo;var az=env.__reallyNegative;var aA=env._send;var aB=env._decodeMP3_unclipped;var aC=env._sprintf;var aD=env._log10;var aE=env._sin;var aF=env._sysconf;var aG=env._ExitMP3;var aH=env._time;var aI=env.__formatString;var aJ=env._ceil;var aK=env._floorf;var aL=env._vfprintf;var aM=env._cos;var aN=env._pwrite;var aO=env._sbrk;var aP=env.___errno_location;var aQ=env._llvm_lifetime_start;var aR=env._write;var aS=env._fwrite;
// EMSCRIPTEN_START_FUNCS
function a_(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function a$(){return i|0}function a0(a){a=a|0;i=a}function a1(a,b){a=a|0;b=b|0;if((r|0)==0){r=a;s=b}}function a2(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function a3(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function a4(a){a=a|0;E=a}function a5(a){a=a|0;F=a}function a6(a){a=a|0;G=a}function a7(a){a=a|0;H=a}function a8(a){a=a|0;I=a}function a9(a){a=a|0;J=a}function ba(a){a=a|0;K=a}function bb(a){a=a|0;L=a}function bc(a){a=a|0;M=a}function bd(a){a=a|0;N=a}function be(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=d[e+2|0]|0;g=(f&128|0)!=0?262140:196598;h=(((g^f<<10)&65536|0)==0?g:g^32773)<<1;g=(((h^f<<11)&65536|0)==0?h:h^32773)<<1;h=(((g^f<<12)&65536|0)==0?g:g^32773)<<1;g=(((h^f<<13)&65536|0)==0?h:h^32773)<<1;h=(((g^f<<14)&65536|0)==0?g:g^32773)<<1;g=(((h^f<<15)&65536|0)==0?h:h^32773)<<1;h=d[e+3|0]|0;i=(((g^f<<16)&65536|0)==0?g:g^32773)<<1;g=(((i^h<<9)&65536|0)==0?i:i^32773)<<1;i=(((g^h<<10)&65536|0)==0?g:g^32773)<<1;g=(((i^h<<11)&65536|0)==0?i:i^32773)<<1;i=(((g^h<<12)&65536|0)==0?g:g^32773)<<1;g=(((i^h<<13)&65536|0)==0?i:i^32773)<<1;i=(((g^h<<14)&65536|0)==0?g:g^32773)<<1;g=(((i^h<<15)&65536|0)==0?i:i^32773)<<1;i=((g^h<<16)&65536|0)==0?g:g^32773;g=c[b+24>>2]|0;if((g|0)>6){j=i;k=6}else{l=i>>>8&255;m=i&255;n=e+4|0;a[n]=l;o=e+5|0;a[o]=m;return}do{i=d[e+k|0]|0;b=j<<1;h=(((i<<9^b)&65536|0)==0?b:b^32773)<<1;b=(((h^i<<10)&65536|0)==0?h:h^32773)<<1;h=(((b^i<<11)&65536|0)==0?b:b^32773)<<1;b=(((h^i<<12)&65536|0)==0?h:h^32773)<<1;h=(((b^i<<13)&65536|0)==0?b:b^32773)<<1;b=(((h^i<<14)&65536|0)==0?h:h^32773)<<1;h=(((b^i<<15)&65536|0)==0?b:b^32773)<<1;j=((h^i<<16)&65536|0)==0?h:h^32773;k=k+1|0;}while((k|0)<(g|0));l=j>>>8&255;m=j&255;n=e+4|0;a[n]=l;o=e+5|0;a[o]=m;return}function bf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;e=c[a+52132>>2]|0;f=c[a+52128>>2]|0;g=(f|0)==0?255:f-1|0;f=(c[a+39840+(g*48&-1)>>2]|0)-(c[a+292>>2]|0)|0;c[b>>2]=f;if((f|0)>-1){h=1-e+g|0;j=f-(aa(((g|0)<(e|0)?h+256|0:h)<<3,c[a+24>>2]|0)|0)|0}else{j=f}h=a+16|0;e=c[a+84744>>2]|0;if((e|0)==0){k=a+120|0;l=c[h>>2]|0}else{g=c[h>>2]|0;k=58840+(g<<6)+(e<<2)|0;l=g}g=c[a+84752>>2]|0;e=c[a+64>>2]|0;h=((aa((l*72e3&-1)+72e3|0,c[k>>2]|0)|0)/(e|0)&-1)+g<<3;g=h+j|0;j=h+f|0;f=((j&7|0)!=0&1)+((j|0)/8&-1)|0;c[b>>2]=f;c[b>>2]=(c[a+296>>2]|0)+1+f;if((g|0)>=0){i=d;return g|0}bO(a,59640,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);i=d;return g|0}function bg(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;do{if((e|0)>7){f=b+300|0;g=b+296|0;h=b+52132|0;i=b+292|0;j=b+284|0;k=b+24|0;l=8;do{m=c[f>>2]|0;if((m|0)==0){c[f>>2]=8;n=(c[g>>2]|0)+1|0;c[g>>2]=n;o=c[h>>2]|0;if((c[b+39840+(o*48&-1)>>2]|0)==(c[i>>2]|0)){p=(c[j>>2]|0)+n|0;q=b+39840+(o*48&-1)+8|0;o=c[k>>2]|0;bU(p|0,q|0,o)|0;o=c[k>>2]|0;q=(c[g>>2]|0)+o|0;c[g>>2]=q;c[i>>2]=(c[i>>2]|0)+(o<<3);c[h>>2]=(c[h>>2]|0)+1&255;r=q}else{r=n}a[(c[j>>2]|0)+r|0]=0;s=c[f>>2]|0}else{s=m}m=(l|0)<(s|0)?l:s;l=l-m|0;n=s-m|0;c[f>>2]=n;q=(c[j>>2]|0)+(c[g>>2]|0)|0;a[q]=(76>>>(l>>>0)<<n|d[q])&255;t=(c[i>>2]|0)+m|0;c[i>>2]=t;}while((l|0)>0);l=e-8|0;if((l|0)>7){u=8;v=t}else{w=l;break}do{l=c[f>>2]|0;if((l|0)==0){c[f>>2]=8;m=(c[g>>2]|0)+1|0;c[g>>2]=m;q=c[h>>2]|0;if((c[b+39840+(q*48&-1)>>2]|0)==(v|0)){n=(c[j>>2]|0)+m|0;o=b+39840+(q*48&-1)+8|0;q=c[k>>2]|0;bU(n|0,o|0,q)|0;q=c[k>>2]|0;o=(c[g>>2]|0)+q|0;c[g>>2]=o;c[i>>2]=(c[i>>2]|0)+(q<<3);c[h>>2]=(c[h>>2]|0)+1&255;x=o}else{x=m}a[(c[j>>2]|0)+x|0]=0;y=c[f>>2]|0}else{y=l}l=(u|0)<(y|0)?u:y;u=u-l|0;m=y-l|0;c[f>>2]=m;o=(c[j>>2]|0)+(c[g>>2]|0)|0;a[o]=(65>>>(u>>>0)<<m|d[o])&255;v=(c[i>>2]|0)+l|0;c[i>>2]=v;}while((u|0)>0);l=e-16|0;if((l|0)>7){z=8;A=v}else{w=l;break}do{l=c[f>>2]|0;if((l|0)==0){c[f>>2]=8;o=(c[g>>2]|0)+1|0;c[g>>2]=o;m=c[h>>2]|0;if((c[b+39840+(m*48&-1)>>2]|0)==(A|0)){q=(c[j>>2]|0)+o|0;n=b+39840+(m*48&-1)+8|0;m=c[k>>2]|0;bU(q|0,n|0,m)|0;m=c[k>>2]|0;n=(c[g>>2]|0)+m|0;c[g>>2]=n;c[i>>2]=(c[i>>2]|0)+(m<<3);c[h>>2]=(c[h>>2]|0)+1&255;B=n}else{B=o}a[(c[j>>2]|0)+B|0]=0;C=c[f>>2]|0}else{C=l}l=(z|0)<(C|0)?z:C;z=z-l|0;o=C-l|0;c[f>>2]=o;n=(c[j>>2]|0)+(c[g>>2]|0)|0;a[n]=(77>>>(z>>>0)<<o|d[n])&255;A=(c[i>>2]|0)+l|0;c[i>>2]=A;}while((z|0)>0);l=e-24|0;if((l|0)>7){D=8;E=A}else{w=l;break}do{l=c[f>>2]|0;if((l|0)==0){c[f>>2]=8;n=(c[g>>2]|0)+1|0;c[g>>2]=n;o=c[h>>2]|0;if((c[b+39840+(o*48&-1)>>2]|0)==(E|0)){m=(c[j>>2]|0)+n|0;q=b+39840+(o*48&-1)+8|0;o=c[k>>2]|0;bU(m|0,q|0,o)|0;o=c[k>>2]|0;q=(c[g>>2]|0)+o|0;c[g>>2]=q;c[i>>2]=(c[i>>2]|0)+(o<<3);c[h>>2]=(c[h>>2]|0)+1&255;F=q}else{F=n}a[(c[j>>2]|0)+F|0]=0;G=c[f>>2]|0}else{G=l}l=(D|0)<(G|0)?D:G;D=D-l|0;n=G-l|0;c[f>>2]=n;q=(c[j>>2]|0)+(c[g>>2]|0)|0;a[q]=(69>>>(D>>>0)<<n|d[q])&255;E=(c[i>>2]|0)+l|0;c[i>>2]=E;}while((D|0)>0);l=e-32|0;if((l|0)<=31){w=l;break}q=e-40|0;n=(q>>>0<40?q&-8^-8:-48)+e|0;q=0;o=l;l=E;while(1){m=a[59216+q|0]|0;p=8;H=l;do{I=c[f>>2]|0;if((I|0)==0){c[f>>2]=8;J=(c[g>>2]|0)+1|0;c[g>>2]=J;K=c[h>>2]|0;if((c[b+39840+(K*48&-1)>>2]|0)==(H|0)){L=(c[j>>2]|0)+J|0;M=b+39840+(K*48&-1)+8|0;K=c[k>>2]|0;bU(L|0,M|0,K)|0;K=c[k>>2]|0;M=(c[g>>2]|0)+K|0;c[g>>2]=M;c[i>>2]=(c[i>>2]|0)+(K<<3);c[h>>2]=(c[h>>2]|0)+1&255;N=M}else{N=J}a[(c[j>>2]|0)+N|0]=0;O=c[f>>2]|0}else{O=I}I=(p|0)<(O|0)?p:O;p=p-I|0;J=O-I|0;c[f>>2]=J;M=(c[j>>2]|0)+(c[g>>2]|0)|0;a[M]=(m>>p<<J|d[M])&255;H=(c[i>>2]|0)+I|0;c[i>>2]=H;}while((p|0)>0);p=o-8|0;m=q+1|0;if((m|0)<6&(p|0)>7){q=m;o=p;l=H}else{break}}w=n-32|0}else{w=e}}while(0);if((w|0)<=0){return}e=b+52136|0;O=b+300|0;N=b+296|0;E=b+52132|0;D=b+292|0;G=b+284|0;F=b+24|0;A=b+144|0;z=w;w=c[e>>2]|0;do{C=1;do{B=c[O>>2]|0;if((B|0)==0){c[O>>2]=8;v=(c[N>>2]|0)+1|0;c[N>>2]=v;u=c[E>>2]|0;if((c[b+39840+(u*48&-1)>>2]|0)==(c[D>>2]|0)){y=(c[G>>2]|0)+v|0;x=b+39840+(u*48&-1)+8|0;u=c[F>>2]|0;bU(y|0,x|0,u)|0;u=c[F>>2]|0;x=(c[N>>2]|0)+u|0;c[N>>2]=x;c[D>>2]=(c[D>>2]|0)+(u<<3);c[E>>2]=(c[E>>2]|0)+1&255;P=x}else{P=v}a[(c[G>>2]|0)+P|0]=0;Q=c[O>>2]|0}else{Q=B}B=(C|0)<(Q|0)?C:Q;C=C-B|0;v=Q-B|0;c[O>>2]=v;x=(c[G>>2]|0)+(c[N>>2]|0)|0;a[x]=(w>>C<<v|d[x])&255;c[D>>2]=(c[D>>2]|0)+B;}while((C|0)>0);w=(c[A>>2]|0)==0&1^c[e>>2];c[e>>2]=w;z=z-1|0;}while((z|0)>0);return}function bh(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,bh=0;e=i;i=i+8|0;f=e|0;g=b+16|0;h=b+84744|0;j=c[h>>2]|0;if((j|0)==0){k=b+120|0;l=c[g>>2]|0}else{m=c[g>>2]|0;k=58840+(m<<6)+(j<<2)|0;l=m}m=b+84752|0;j=c[m>>2]|0;g=b+64|0;n=c[g>>2]|0;o=((aa((l*72e3&-1)+72e3|0,c[k>>2]|0)|0)/(n|0)&-1)+j<<3;j=b+21320|0;bg(b,c[j>>2]|0);n=b+52128|0;k=c[n>>2]|0;c[b+39840+(k*48&-1)+4>>2]=0;l=b+24|0;bT(b+39840+(k*48&-1)+8|0,0,c[l>>2]|0);k=c[n>>2]|0;p=c[b+39840+(k*48&-1)+4>>2]|0;if((c[g>>2]|0)<16e3){g=p;q=12;r=k;do{s=8-(g&7)|0;t=(q|0)<(s|0)?q:s;q=q-t|0;u=(g>>3)+(b+39840+(r*48&-1)+8)|0;a[u]=(4094>>>(q>>>0)<<s-t|(d[u]|0))&255;g=t+g|0;r=c[n>>2]|0}while((q|0)>0);c[b+39840+(r*48&-1)+4>>2]=g;w=r;x=g}else{g=p;p=12;r=k;do{k=8-(g&7)|0;q=(p|0)<(k|0)?p:k;p=p-q|0;t=(g>>3)+(b+39840+(r*48&-1)+8)|0;a[t]=(4095>>>(p>>>0)<<k-q|(d[t]|0))&255;g=q+g|0;r=c[n>>2]|0}while((p|0)>0);c[b+39840+(r*48&-1)+4>>2]=g;w=r;x=g}g=b+16|0;r=c[g>>2]|0;p=x;x=1;q=w;do{w=8-(p&7)|0;t=(x|0)<(w|0)?x:w;x=x-t|0;k=(p>>3)+(b+39840+(q*48&-1)+8)|0;a[k]=(r>>x<<w-t|(d[k]|0))&255;p=t+p|0;q=c[n>>2]|0}while((x|0)>0);c[b+39840+(q*48&-1)+4>>2]=p;x=p;p=2;r=q;do{q=8-(x&7)|0;t=(p|0)<(q|0)?p:q;p=p-t|0;k=(x>>3)+(b+39840+(r*48&-1)+8)|0;a[k]=(1>>>(p>>>0)<<q-t|(d[k]|0))&255;x=t+x|0;r=c[n>>2]|0}while((p|0)>0);c[b+39840+(r*48&-1)+4>>2]=x;p=b+160|0;t=(c[p>>2]|0)==0&1;k=x;x=1;q=r;do{r=8-(k&7)|0;w=(x|0)<(r|0)?x:r;x=x-w|0;u=(k>>3)+(b+39840+(q*48&-1)+8)|0;a[u]=(t>>>(x>>>0)<<r-w|(d[u]|0))&255;k=w+k|0;q=c[n>>2]|0}while((x|0)>0);c[b+39840+(q*48&-1)+4>>2]=k;x=c[h>>2]|0;h=k;k=4;t=q;do{q=8-(h&7)|0;w=(k|0)<(q|0)?k:q;k=k-w|0;u=(h>>3)+(b+39840+(t*48&-1)+8)|0;a[u]=(x>>k<<q-w|(d[u]|0))&255;h=w+h|0;t=c[n>>2]|0}while((k|0)>0);c[b+39840+(t*48&-1)+4>>2]=h;k=c[b+20>>2]|0;x=h;h=2;w=t;do{t=8-(x&7)|0;u=(h|0)<(t|0)?h:t;h=h-u|0;q=(x>>3)+(b+39840+(w*48&-1)+8)|0;a[q]=(k>>h<<t-u|(d[q]|0))&255;x=u+x|0;w=c[n>>2]|0}while((h|0)>0);c[b+39840+(w*48&-1)+4>>2]=x;h=c[m>>2]|0;m=x;x=1;k=w;do{w=8-(m&7)|0;u=(x|0)<(w|0)?x:w;x=x-u|0;q=(m>>3)+(b+39840+(k*48&-1)+8)|0;a[q]=(h>>x<<w-u|(d[q]|0))&255;m=u+m|0;k=c[n>>2]|0}while((x|0)>0);c[b+39840+(k*48&-1)+4>>2]=m;x=c[b+172>>2]|0;h=m;m=1;u=k;do{k=8-(h&7)|0;q=(m|0)<(k|0)?m:k;m=m-q|0;w=(h>>3)+(b+39840+(u*48&-1)+8)|0;a[w]=(x>>m<<k-q|(d[w]|0))&255;h=q+h|0;u=c[n>>2]|0}while((m|0)>0);c[b+39840+(u*48&-1)+4>>2]=h;m=c[b+180>>2]|0;x=h;h=2;q=u;do{u=8-(x&7)|0;w=(h|0)<(u|0)?h:u;h=h-w|0;k=(x>>3)+(b+39840+(q*48&-1)+8)|0;a[k]=(m>>h<<u-w|(d[k]|0))&255;x=w+x|0;q=c[n>>2]|0}while((h|0)>0);c[b+39840+(q*48&-1)+4>>2]=x;h=c[b+84756>>2]|0;m=x;x=2;w=q;do{q=8-(m&7)|0;k=(x|0)<(q|0)?x:q;x=x-k|0;u=(m>>3)+(b+39840+(w*48&-1)+8)|0;a[u]=(h>>x<<q-k|(d[u]|0))&255;m=k+m|0;w=c[n>>2]|0}while((x|0)>0);c[b+39840+(w*48&-1)+4>>2]=m;x=c[b+164>>2]|0;h=m;m=1;k=w;do{w=8-(h&7)|0;u=(m|0)<(w|0)?m:w;m=m-u|0;q=(h>>3)+(b+39840+(k*48&-1)+8)|0;a[q]=(x>>m<<w-u|(d[q]|0))&255;h=u+h|0;k=c[n>>2]|0}while((m|0)>0);c[b+39840+(k*48&-1)+4>>2]=h;m=c[b+168>>2]|0;x=h;h=1;u=k;do{k=8-(x&7)|0;q=(h|0)<(k|0)?h:k;h=h-q|0;w=(x>>3)+(b+39840+(u*48&-1)+8)|0;a[w]=(m>>h<<k-q|(d[w]|0))&255;x=q+x|0;u=c[n>>2]|0}while((h|0)>0);c[b+39840+(u*48&-1)+4>>2]=x;h=c[b+176>>2]|0;m=x;x=2;q=u;do{u=8-(m&7)|0;w=(x|0)<(u|0)?x:u;x=x-w|0;k=(m>>3)+(b+39840+(q*48&-1)+8)|0;a[k]=(h>>x<<u-w|(d[k]|0))&255;m=w+m|0;q=c[n>>2]|0}while((x|0)>0);x=b+39840+(q*48&-1)+4|0;c[x>>2]=m;if((c[p>>2]|0)==0){y=m}else{h=m;m=16;do{w=8-(h&7)|0;k=(m|0)<(w|0)?m:w;m=m-k|0;h=k+h|0;}while((m|0)>0);c[x>>2]=h;y=h}h=b+21312|0;x=c[h>>2]|0;do{if((c[g>>2]|0)==1){m=y;k=9;w=q;do{u=8-(m&7)|0;t=(k|0)<(u|0)?k:u;k=k-t|0;r=(m>>3)+(b+39840+(w*48&-1)+8)|0;a[r]=(x>>k<<u-t|(d[r]|0))&255;m=t+m|0;w=c[n>>2]|0}while((k|0)>0);c[b+39840+(w*48&-1)+4>>2]=m;k=b+72|0;t=c[b+21316>>2]|0;if((c[k>>2]|0)==2){r=m;u=3;s=w;do{z=8-(r&7)|0;A=(u|0)<(z|0)?u:z;u=u-A|0;B=(r>>3)+(b+39840+(s*48&-1)+8)|0;a[B]=(t>>u<<z-A|(d[B]|0))&255;r=A+r|0;s=c[n>>2]|0}while((u|0)>0);c[b+39840+(s*48&-1)+4>>2]=r;C=s;D=r}else{u=m;A=5;B=w;do{z=8-(u&7)|0;E=(A|0)<(z|0)?A:z;A=A-E|0;F=(u>>3)+(b+39840+(B*48&-1)+8)|0;a[F]=(t>>A<<z-E|(d[F]|0))&255;u=E+u|0;B=c[n>>2]|0}while((A|0)>0);c[b+39840+(B*48&-1)+4>>2]=u;C=B;D=u}A=c[k>>2]|0;if((A|0)>0){t=0;w=C;m=D;while(1){r=c[b+21328+(t<<4)>>2]|0;s=m;E=1;F=w;do{z=8-(s&7)|0;G=(E|0)<(z|0)?E:z;E=E-G|0;H=(s>>3)+(b+39840+(F*48&-1)+8)|0;a[H]=(r>>E<<z-G|(d[H]|0))&255;s=G+s|0;F=c[n>>2]|0}while((E|0)>0);c[b+39840+(F*48&-1)+4>>2]=s;E=c[b+21328+(t<<4)+4>>2]|0;r=s;G=1;H=F;do{z=8-(r&7)|0;I=(G|0)<(z|0)?G:z;G=G-I|0;J=(r>>3)+(b+39840+(H*48&-1)+8)|0;a[J]=(E>>G<<z-I|(d[J]|0))&255;r=I+r|0;H=c[n>>2]|0}while((G|0)>0);c[b+39840+(H*48&-1)+4>>2]=r;G=c[b+21328+(t<<4)+8>>2]|0;E=r;F=1;s=H;do{I=8-(E&7)|0;J=(F|0)<(I|0)?F:I;F=F-J|0;z=(E>>3)+(b+39840+(s*48&-1)+8)|0;a[z]=(G>>F<<I-J|(d[z]|0))&255;E=J+E|0;s=c[n>>2]|0}while((F|0)>0);c[b+39840+(s*48&-1)+4>>2]=E;F=c[b+21328+(t<<4)+12>>2]|0;G=E;H=1;r=s;do{J=8-(G&7)|0;z=(H|0)<(J|0)?H:J;H=H-z|0;I=(G>>3)+(b+39840+(r*48&-1)+8)|0;a[I]=(F>>H<<J-z|(d[I]|0))&255;G=z+G|0;r=c[n>>2]|0}while((H|0)>0);c[b+39840+(r*48&-1)+4>>2]=G;H=t+1|0;F=c[k>>2]|0;if((H|0)<(F|0)){t=H;w=r;m=G}else{K=0;L=F;M=r;break}}}else{K=0;L=A;M=C}while(1){if((L|0)>0){m=0;w=M;t=c[b+39840+(M*48&-1)+4>>2]|0;while(1){u=(c[b+304+(K*10504&-1)+(m*5252&-1)+4844>>2]|0)+(c[b+304+(K*10504&-1)+(m*5252&-1)+4768>>2]|0)|0;B=t;F=12;H=w;do{s=8-(B&7)|0;E=(F|0)<(s|0)?F:s;F=F-E|0;z=(B>>3)+(b+39840+(H*48&-1)+8)|0;a[z]=(u>>F<<s-E|(d[z]|0))&255;B=E+B|0;H=c[n>>2]|0}while((F|0)>0);c[b+39840+(H*48&-1)+4>>2]=B;F=(c[b+304+(K*10504&-1)+(m*5252&-1)+4772>>2]|0)/2&-1;u=B;E=9;z=H;do{s=8-(u&7)|0;I=(E|0)<(s|0)?E:s;E=E-I|0;J=(u>>3)+(b+39840+(z*48&-1)+8)|0;a[J]=(F>>E<<s-I|(d[J]|0))&255;u=I+u|0;z=c[n>>2]|0}while((E|0)>0);c[b+39840+(z*48&-1)+4>>2]=u;E=c[b+304+(K*10504&-1)+(m*5252&-1)+4780>>2]|0;F=u;H=8;B=z;do{I=8-(F&7)|0;J=(H|0)<(I|0)?H:I;H=H-J|0;s=(F>>3)+(b+39840+(B*48&-1)+8)|0;a[s]=(E>>H<<I-J|(d[s]|0))&255;F=J+F|0;B=c[n>>2]|0}while((H|0)>0);c[b+39840+(B*48&-1)+4>>2]=F;H=c[b+304+(K*10504&-1)+(m*5252&-1)+4784>>2]|0;E=F;z=4;u=B;do{J=8-(E&7)|0;s=(z|0)<(J|0)?z:J;z=z-s|0;I=(E>>3)+(b+39840+(u*48&-1)+8)|0;a[I]=(H>>z<<J-s|(d[I]|0))&255;E=s+E|0;u=c[n>>2]|0}while((z|0)>0);z=b+39840+(u*48&-1)+4|0;c[z>>2]=E;H=b+304+(K*10504&-1)+(m*5252&-1)+4788|0;if((c[H>>2]|0)==0){B=E;F=1;do{s=8-(B&7)|0;I=(F|0)<(s|0)?F:s;F=F-I|0;B=I+B|0;}while((F|0)>0);c[z>>2]=B;F=b+304+(K*10504&-1)+(m*5252&-1)+4796|0;I=c[F>>2]|0;if((I|0)==14){c[F>>2]=16;F=c[n>>2]|0;N=16;O=F;P=c[b+39840+(F*48&-1)+4>>2]|0}else{N=I;O=u;P=B}I=P;F=5;s=O;do{J=8-(I&7)|0;Q=(F|0)<(J|0)?F:J;F=F-Q|0;R=(I>>3)+(b+39840+(s*48&-1)+8)|0;a[R]=(N>>F<<J-Q|(d[R]|0))&255;I=Q+I|0;s=c[n>>2]|0}while((F|0)>0);c[b+39840+(s*48&-1)+4>>2]=I;F=b+304+(K*10504&-1)+(m*5252&-1)+4800|0;B=c[F>>2]|0;if((B|0)==14){c[F>>2]=16;F=c[n>>2]|0;S=16;T=F;U=c[b+39840+(F*48&-1)+4>>2]|0}else{S=B;T=s;U=I}B=U;F=5;z=T;do{Q=8-(B&7)|0;R=(F|0)<(Q|0)?F:Q;F=F-R|0;J=(B>>3)+(b+39840+(z*48&-1)+8)|0;a[J]=(S>>F<<Q-R|(d[J]|0))&255;B=R+B|0;z=c[n>>2]|0}while((F|0)>0);c[b+39840+(z*48&-1)+4>>2]=B;F=b+304+(K*10504&-1)+(m*5252&-1)+4804|0;I=c[F>>2]|0;if((I|0)==14){c[F>>2]=16;F=c[n>>2]|0;V=16;W=F;X=c[b+39840+(F*48&-1)+4>>2]|0}else{V=I;W=z;X=B}I=X;F=5;s=W;do{R=8-(I&7)|0;J=(F|0)<(R|0)?F:R;F=F-J|0;Q=(I>>3)+(b+39840+(s*48&-1)+8)|0;a[Q]=(V>>F<<R-J|(d[Q]|0))&255;I=J+I|0;s=c[n>>2]|0}while((F|0)>0);c[b+39840+(s*48&-1)+4>>2]=I;F=c[b+304+(K*10504&-1)+(m*5252&-1)+4824>>2]|0;B=I;z=4;J=s;do{Q=8-(B&7)|0;R=(z|0)<(Q|0)?z:Q;z=z-R|0;Y=(B>>3)+(b+39840+(J*48&-1)+8)|0;a[Y]=(F>>z<<Q-R|(d[Y]|0))&255;B=R+B|0;J=c[n>>2]|0}while((z|0)>0);c[b+39840+(J*48&-1)+4>>2]=B;z=c[b+304+(K*10504&-1)+(m*5252&-1)+4828>>2]|0;F=B;s=3;I=J;do{R=8-(F&7)|0;Y=(s|0)<(R|0)?s:R;s=s-Y|0;Q=(F>>3)+(b+39840+(I*48&-1)+8)|0;a[Q]=(z>>s<<R-Y|(d[Q]|0))&255;F=Y+F|0;I=c[n>>2]|0}while((s|0)>0);c[b+39840+(I*48&-1)+4>>2]=F;Z=I;_=F}else{s=E;z=1;J=u;do{B=8-(s&7)|0;Y=(z|0)<(B|0)?z:B;z=z-Y|0;Q=(s>>3)+(b+39840+(J*48&-1)+8)|0;a[Q]=(1>>>(z>>>0)<<B-Y|(d[Q]|0))&255;s=Y+s|0;J=c[n>>2]|0}while((z|0)>0);c[b+39840+(J*48&-1)+4>>2]=s;z=c[H>>2]|0;u=s;E=2;F=J;do{I=8-(u&7)|0;Y=(E|0)<(I|0)?E:I;E=E-Y|0;Q=(u>>3)+(b+39840+(F*48&-1)+8)|0;a[Q]=(z>>E<<I-Y|(d[Q]|0))&255;u=Y+u|0;F=c[n>>2]|0}while((E|0)>0);c[b+39840+(F*48&-1)+4>>2]=u;E=c[b+304+(K*10504&-1)+(m*5252&-1)+4792>>2]|0;z=u;J=1;s=F;do{H=8-(z&7)|0;Y=(J|0)<(H|0)?J:H;J=J-Y|0;Q=(z>>3)+(b+39840+(s*48&-1)+8)|0;a[Q]=(E>>J<<H-Y|(d[Q]|0))&255;z=Y+z|0;s=c[n>>2]|0}while((J|0)>0);c[b+39840+(s*48&-1)+4>>2]=z;J=b+304+(K*10504&-1)+(m*5252&-1)+4796|0;E=c[J>>2]|0;if((E|0)==14){c[J>>2]=16;J=c[n>>2]|0;$=16;ab=J;ac=c[b+39840+(J*48&-1)+4>>2]|0}else{$=E;ab=s;ac=z}E=ac;J=5;F=ab;do{u=8-(E&7)|0;Y=(J|0)<(u|0)?J:u;J=J-Y|0;Q=(E>>3)+(b+39840+(F*48&-1)+8)|0;a[Q]=($>>J<<u-Y|(d[Q]|0))&255;E=Y+E|0;F=c[n>>2]|0}while((J|0)>0);c[b+39840+(F*48&-1)+4>>2]=E;J=b+304+(K*10504&-1)+(m*5252&-1)+4800|0;z=c[J>>2]|0;if((z|0)==14){c[J>>2]=16;J=c[n>>2]|0;ad=16;ae=J;af=c[b+39840+(J*48&-1)+4>>2]|0}else{ad=z;ae=F;af=E}z=af;J=5;s=ae;do{Y=8-(z&7)|0;Q=(J|0)<(Y|0)?J:Y;J=J-Q|0;u=(z>>3)+(b+39840+(s*48&-1)+8)|0;a[u]=(ad>>J<<Y-Q|(d[u]|0))&255;z=Q+z|0;s=c[n>>2]|0}while((J|0)>0);c[b+39840+(s*48&-1)+4>>2]=z;J=c[b+304+(K*10504&-1)+(m*5252&-1)+4808>>2]|0;E=z;F=3;Q=s;do{u=8-(E&7)|0;Y=(F|0)<(u|0)?F:u;F=F-Y|0;H=(E>>3)+(b+39840+(Q*48&-1)+8)|0;a[H]=(J>>F<<u-Y|(d[H]|0))&255;E=Y+E|0;Q=c[n>>2]|0}while((F|0)>0);c[b+39840+(Q*48&-1)+4>>2]=E;F=c[b+304+(K*10504&-1)+(m*5252&-1)+4812>>2]|0;J=E;s=3;z=Q;do{Y=8-(J&7)|0;H=(s|0)<(Y|0)?s:Y;s=s-H|0;u=(J>>3)+(b+39840+(z*48&-1)+8)|0;a[u]=(F>>s<<Y-H|(d[u]|0))&255;J=H+J|0;z=c[n>>2]|0}while((s|0)>0);c[b+39840+(z*48&-1)+4>>2]=J;s=c[b+304+(K*10504&-1)+(m*5252&-1)+4816>>2]|0;F=J;Q=3;E=z;do{H=8-(F&7)|0;u=(Q|0)<(H|0)?Q:H;Q=Q-u|0;Y=(F>>3)+(b+39840+(E*48&-1)+8)|0;a[Y]=(s>>Q<<H-u|(d[Y]|0))&255;F=u+F|0;E=c[n>>2]|0}while((Q|0)>0);c[b+39840+(E*48&-1)+4>>2]=F;Z=E;_=F}Q=c[b+304+(K*10504&-1)+(m*5252&-1)+4832>>2]|0;s=_;z=1;J=Z;do{u=8-(s&7)|0;Y=(z|0)<(u|0)?z:u;z=z-Y|0;H=(s>>3)+(b+39840+(J*48&-1)+8)|0;a[H]=(Q>>z<<u-Y|(d[H]|0))&255;s=Y+s|0;J=c[n>>2]|0}while((z|0)>0);c[b+39840+(J*48&-1)+4>>2]=s;z=c[b+304+(K*10504&-1)+(m*5252&-1)+4836>>2]|0;Q=s;F=1;E=J;do{Y=8-(Q&7)|0;H=(F|0)<(Y|0)?F:Y;F=F-H|0;u=(Q>>3)+(b+39840+(E*48&-1)+8)|0;a[u]=(z>>F<<Y-H|(d[u]|0))&255;Q=H+Q|0;E=c[n>>2]|0}while((F|0)>0);c[b+39840+(E*48&-1)+4>>2]=Q;F=c[b+304+(K*10504&-1)+(m*5252&-1)+4840>>2]|0;z=Q;J=1;s=E;do{H=8-(z&7)|0;u=(J|0)<(H|0)?J:H;J=J-u|0;Y=(z>>3)+(b+39840+(s*48&-1)+8)|0;a[Y]=(F>>J<<H-u|(d[Y]|0))&255;z=u+z|0;s=c[n>>2]|0}while((J|0)>0);c[b+39840+(s*48&-1)+4>>2]=z;J=m+1|0;F=c[k>>2]|0;if((J|0)<(F|0)){m=J;w=s;t=z}else{ag=F;ah=s;break}}}else{ag=L;ah=M}t=K+1|0;if((t|0)<2){K=t;L=ag;M=ah}else{ai=ah;break}}}else{k=y;A=8;t=q;do{w=8-(k&7)|0;m=(A|0)<(w|0)?A:w;A=A-m|0;r=(k>>3)+(b+39840+(t*48&-1)+8)|0;a[r]=(x>>A<<w-m|(d[r]|0))&255;k=m+k|0;t=c[n>>2]|0}while((A|0)>0);A=b+39840+(t*48&-1)+4|0;c[A>>2]=k;m=c[b+21316>>2]|0;r=b+72|0;w=c[r>>2]|0;if((w|0)>0){aj=k;ak=w;al=t}else{c[A>>2]=k;ai=t;break}do{A=8-(aj&7)|0;w=(ak|0)<(A|0)?ak:A;ak=ak-w|0;G=(aj>>3)+(b+39840+(al*48&-1)+8)|0;a[G]=(m>>ak<<A-w|(d[G]|0))&255;aj=w+aj|0;al=c[n>>2]|0}while((ak|0)>0);m=c[r>>2]|0;c[b+39840+(al*48&-1)+4>>2]=aj;if((m|0)>0){am=0;an=al;ao=aj}else{ai=al;break}while(1){m=(c[b+304+(am*5252&-1)+4844>>2]|0)+(c[b+304+(am*5252&-1)+4768>>2]|0)|0;t=ao;k=12;w=an;do{G=8-(t&7)|0;A=(k|0)<(G|0)?k:G;k=k-A|0;F=(t>>3)+(b+39840+(w*48&-1)+8)|0;a[F]=(m>>k<<G-A|(d[F]|0))&255;t=A+t|0;w=c[n>>2]|0}while((k|0)>0);c[b+39840+(w*48&-1)+4>>2]=t;k=(c[b+304+(am*5252&-1)+4772>>2]|0)/2&-1;m=t;A=9;F=w;do{G=8-(m&7)|0;J=(A|0)<(G|0)?A:G;A=A-J|0;E=(m>>3)+(b+39840+(F*48&-1)+8)|0;a[E]=(k>>A<<G-J|(d[E]|0))&255;m=J+m|0;F=c[n>>2]|0}while((A|0)>0);c[b+39840+(F*48&-1)+4>>2]=m;A=c[b+304+(am*5252&-1)+4780>>2]|0;k=m;w=8;t=F;do{J=8-(k&7)|0;E=(w|0)<(J|0)?w:J;w=w-E|0;G=(k>>3)+(b+39840+(t*48&-1)+8)|0;a[G]=(A>>w<<J-E|(d[G]|0))&255;k=E+k|0;t=c[n>>2]|0}while((w|0)>0);c[b+39840+(t*48&-1)+4>>2]=k;w=c[b+304+(am*5252&-1)+4784>>2]|0;A=k;F=9;m=t;do{E=8-(A&7)|0;G=(F|0)<(E|0)?F:E;F=F-G|0;J=(A>>3)+(b+39840+(m*48&-1)+8)|0;a[J]=(w>>F<<E-G|(d[J]|0))&255;A=G+A|0;m=c[n>>2]|0}while((F|0)>0);F=b+39840+(m*48&-1)+4|0;c[F>>2]=A;w=b+304+(am*5252&-1)+4788|0;if((c[w>>2]|0)==0){t=A;k=1;do{G=8-(t&7)|0;J=(k|0)<(G|0)?k:G;k=k-J|0;t=J+t|0;}while((k|0)>0);c[F>>2]=t;k=b+304+(am*5252&-1)+4796|0;J=c[k>>2]|0;if((J|0)==14){c[k>>2]=16;k=c[n>>2]|0;ap=16;aq=k;ar=c[b+39840+(k*48&-1)+4>>2]|0}else{ap=J;aq=m;ar=t}J=ar;k=5;G=aq;do{E=8-(J&7)|0;Q=(k|0)<(E|0)?k:E;k=k-Q|0;u=(J>>3)+(b+39840+(G*48&-1)+8)|0;a[u]=(ap>>k<<E-Q|(d[u]|0))&255;J=Q+J|0;G=c[n>>2]|0}while((k|0)>0);c[b+39840+(G*48&-1)+4>>2]=J;k=b+304+(am*5252&-1)+4800|0;t=c[k>>2]|0;if((t|0)==14){c[k>>2]=16;k=c[n>>2]|0;as=16;at=k;au=c[b+39840+(k*48&-1)+4>>2]|0}else{as=t;at=G;au=J}t=au;k=5;F=at;do{Q=8-(t&7)|0;u=(k|0)<(Q|0)?k:Q;k=k-u|0;E=(t>>3)+(b+39840+(F*48&-1)+8)|0;a[E]=(as>>k<<Q-u|(d[E]|0))&255;t=u+t|0;F=c[n>>2]|0}while((k|0)>0);c[b+39840+(F*48&-1)+4>>2]=t;k=b+304+(am*5252&-1)+4804|0;J=c[k>>2]|0;if((J|0)==14){c[k>>2]=16;k=c[n>>2]|0;av=16;aw=k;ax=c[b+39840+(k*48&-1)+4>>2]|0}else{av=J;aw=F;ax=t}J=ax;k=5;G=aw;do{u=8-(J&7)|0;E=(k|0)<(u|0)?k:u;k=k-E|0;Q=(J>>3)+(b+39840+(G*48&-1)+8)|0;a[Q]=(av>>k<<u-E|(d[Q]|0))&255;J=E+J|0;G=c[n>>2]|0}while((k|0)>0);c[b+39840+(G*48&-1)+4>>2]=J;k=c[b+304+(am*5252&-1)+4824>>2]|0;t=J;F=4;E=G;do{Q=8-(t&7)|0;u=(F|0)<(Q|0)?F:Q;F=F-u|0;Y=(t>>3)+(b+39840+(E*48&-1)+8)|0;a[Y]=(k>>F<<Q-u|(d[Y]|0))&255;t=u+t|0;E=c[n>>2]|0}while((F|0)>0);c[b+39840+(E*48&-1)+4>>2]=t;F=c[b+304+(am*5252&-1)+4828>>2]|0;k=t;G=3;J=E;do{u=8-(k&7)|0;Y=(G|0)<(u|0)?G:u;G=G-Y|0;Q=(k>>3)+(b+39840+(J*48&-1)+8)|0;a[Q]=(F>>G<<u-Y|(d[Q]|0))&255;k=Y+k|0;J=c[n>>2]|0}while((G|0)>0);c[b+39840+(J*48&-1)+4>>2]=k;ay=J;az=k}else{G=A;F=1;E=m;do{t=8-(G&7)|0;Y=(F|0)<(t|0)?F:t;F=F-Y|0;Q=(G>>3)+(b+39840+(E*48&-1)+8)|0;a[Q]=(1>>>(F>>>0)<<t-Y|(d[Q]|0))&255;G=Y+G|0;E=c[n>>2]|0}while((F|0)>0);c[b+39840+(E*48&-1)+4>>2]=G;F=c[w>>2]|0;m=G;A=2;k=E;do{J=8-(m&7)|0;Y=(A|0)<(J|0)?A:J;A=A-Y|0;Q=(m>>3)+(b+39840+(k*48&-1)+8)|0;a[Q]=(F>>A<<J-Y|(d[Q]|0))&255;m=Y+m|0;k=c[n>>2]|0}while((A|0)>0);c[b+39840+(k*48&-1)+4>>2]=m;A=c[b+304+(am*5252&-1)+4792>>2]|0;F=m;E=1;G=k;do{w=8-(F&7)|0;Y=(E|0)<(w|0)?E:w;E=E-Y|0;Q=(F>>3)+(b+39840+(G*48&-1)+8)|0;a[Q]=(A>>E<<w-Y|(d[Q]|0))&255;F=Y+F|0;G=c[n>>2]|0}while((E|0)>0);c[b+39840+(G*48&-1)+4>>2]=F;E=b+304+(am*5252&-1)+4796|0;A=c[E>>2]|0;if((A|0)==14){c[E>>2]=16;E=c[n>>2]|0;aA=16;aB=E;aC=c[b+39840+(E*48&-1)+4>>2]|0}else{aA=A;aB=G;aC=F}A=aC;E=5;k=aB;do{m=8-(A&7)|0;Y=(E|0)<(m|0)?E:m;E=E-Y|0;Q=(A>>3)+(b+39840+(k*48&-1)+8)|0;a[Q]=(aA>>E<<m-Y|(d[Q]|0))&255;A=Y+A|0;k=c[n>>2]|0}while((E|0)>0);c[b+39840+(k*48&-1)+4>>2]=A;E=b+304+(am*5252&-1)+4800|0;F=c[E>>2]|0;if((F|0)==14){c[E>>2]=16;E=c[n>>2]|0;aD=16;aE=E;aF=c[b+39840+(E*48&-1)+4>>2]|0}else{aD=F;aE=k;aF=A}F=aF;E=5;G=aE;do{Y=8-(F&7)|0;Q=(E|0)<(Y|0)?E:Y;E=E-Q|0;m=(F>>3)+(b+39840+(G*48&-1)+8)|0;a[m]=(aD>>E<<Y-Q|(d[m]|0))&255;F=Q+F|0;G=c[n>>2]|0}while((E|0)>0);c[b+39840+(G*48&-1)+4>>2]=F;E=c[b+304+(am*5252&-1)+4808>>2]|0;A=F;k=3;Q=G;do{m=8-(A&7)|0;Y=(k|0)<(m|0)?k:m;k=k-Y|0;w=(A>>3)+(b+39840+(Q*48&-1)+8)|0;a[w]=(E>>k<<m-Y|(d[w]|0))&255;A=Y+A|0;Q=c[n>>2]|0}while((k|0)>0);c[b+39840+(Q*48&-1)+4>>2]=A;k=c[b+304+(am*5252&-1)+4812>>2]|0;E=A;G=3;F=Q;do{Y=8-(E&7)|0;w=(G|0)<(Y|0)?G:Y;G=G-w|0;m=(E>>3)+(b+39840+(F*48&-1)+8)|0;a[m]=(k>>G<<Y-w|(d[m]|0))&255;E=w+E|0;F=c[n>>2]|0}while((G|0)>0);c[b+39840+(F*48&-1)+4>>2]=E;G=c[b+304+(am*5252&-1)+4816>>2]|0;k=E;Q=3;A=F;do{w=8-(k&7)|0;m=(Q|0)<(w|0)?Q:w;Q=Q-m|0;Y=(k>>3)+(b+39840+(A*48&-1)+8)|0;a[Y]=(G>>Q<<w-m|(d[Y]|0))&255;k=m+k|0;A=c[n>>2]|0}while((Q|0)>0);c[b+39840+(A*48&-1)+4>>2]=k;ay=A;az=k}Q=c[b+304+(am*5252&-1)+4836>>2]|0;G=az;F=1;E=ay;do{m=8-(G&7)|0;Y=(F|0)<(m|0)?F:m;F=F-Y|0;w=(G>>3)+(b+39840+(E*48&-1)+8)|0;a[w]=(Q>>F<<m-Y|(d[w]|0))&255;G=Y+G|0;E=c[n>>2]|0}while((F|0)>0);c[b+39840+(E*48&-1)+4>>2]=G;F=c[b+304+(am*5252&-1)+4840>>2]|0;Q=G;k=1;A=E;do{Y=8-(Q&7)|0;w=(k|0)<(Y|0)?k:Y;k=k-w|0;m=(Q>>3)+(b+39840+(A*48&-1)+8)|0;a[m]=(F>>k<<Y-w|(d[m]|0))&255;Q=w+Q|0;A=c[n>>2]|0}while((k|0)>0);c[b+39840+(A*48&-1)+4>>2]=Q;k=am+1|0;if((k|0)<(c[r>>2]|0)){am=k;an=A;ao=Q}else{ai=A;break}}}}while(0);if((c[p>>2]|0)==0){aG=ai}else{be(b,b+39840+(ai*48&-1)+8|0);aG=c[n>>2]|0}ai=aG+1&255;c[n>>2]=ai;c[b+39840+(ai*48&-1)>>2]=(c[b+39840+(aG*48&-1)>>2]|0)+o;aG=b+52132|0;if((c[n>>2]|0)==(c[aG>>2]|0)){bO(b,59080,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0)}n=c[l>>2]<<3;ai=b+72|0;do{if((c[g>>2]|0)==1){p=b+300|0;ao=b+296|0;an=b+292|0;am=b+284|0;ay=b+21464|0;az=0;aD=0;aE=c[ai>>2]|0;while(1){if((aE|0)>0){aF=az;aA=0;while(1){aB=b+304+(aD*10504&-1)+(aA*5252&-1)|0;aC=c[b+304+(aD*10504&-1)+(aA*5252&-1)+4784>>2]|0;av=c[9904+(aC<<2)>>2]|0;aw=c[9840+(aC<<2)>>2]|0;ax=b+304+(aD*10504&-1)+(aA*5252&-1)+4868|0;as=c[ax>>2]|0;L418:do{if((as|0)>0){if((aC-4|0)>>>0<12){aH=0;aI=0;aJ=as}else{at=0;au=0;while(1){ap=((c[b+304+(aD*10504&-1)+(aA*5252&-1)+4608+(au<<2)>>2]|0)==-1?0:av)+at|0;aq=au+1|0;if((aq|0)<(as|0)){at=ap;au=aq}else{aK=ap;aL=as;break L418}}}while(1){au=c[b+304+(aD*10504&-1)+(aA*5252&-1)+4608+(aI<<2)>>2]|0;if((au|0)==-1){aM=aH;aN=aJ}else{at=av;do{ap=c[p>>2]|0;if((ap|0)==0){c[p>>2]=8;aq=(c[ao>>2]|0)+1|0;c[ao>>2]=aq;ar=c[aG>>2]|0;if((c[b+39840+(ar*48&-1)>>2]|0)==(c[an>>2]|0)){al=(c[am>>2]|0)+aq|0;aj=b+39840+(ar*48&-1)+8|0;ar=c[l>>2]|0;bU(al|0,aj|0,ar)|0;ar=c[l>>2]|0;aj=(c[ao>>2]|0)+ar|0;c[ao>>2]=aj;c[an>>2]=(c[an>>2]|0)+(ar<<3);c[aG>>2]=(c[aG>>2]|0)+1&255;aO=aj}else{aO=aq}a[(c[am>>2]|0)+aO|0]=0;aP=c[p>>2]|0}else{aP=ap}ap=(at|0)<(aP|0)?at:aP;at=at-ap|0;aq=aP-ap|0;c[p>>2]=aq;aj=(c[am>>2]|0)+(c[ao>>2]|0)|0;a[aj]=(au>>at<<aq|(d[aj]|0))&255;c[an>>2]=(c[an>>2]|0)+ap;}while((at|0)>0);aM=aH+av|0;aN=c[ax>>2]|0}at=aI+1|0;if((at|0)<(aN|0)){aH=aM;aI=at;aJ=aN}else{aK=aM;aL=at;break}}}else{aK=0;aL=0}}while(0);ax=b+304+(aD*10504&-1)+(aA*5252&-1)+4860|0;av=c[ax>>2]|0;if((aL|0)<(av|0)){as=aK;s=aL;z=av;while(1){av=c[b+304+(aD*10504&-1)+(aA*5252&-1)+4608+(s<<2)>>2]|0;if((av|0)==-1){aQ=as;aR=z}else{if((aC|0)==4|(aC|0)==0){aS=z}else{at=aw;do{au=c[p>>2]|0;if((au|0)==0){c[p>>2]=8;ap=(c[ao>>2]|0)+1|0;c[ao>>2]=ap;aj=c[aG>>2]|0;if((c[b+39840+(aj*48&-1)>>2]|0)==(c[an>>2]|0)){aq=(c[am>>2]|0)+ap|0;ar=b+39840+(aj*48&-1)+8|0;aj=c[l>>2]|0;bU(aq|0,ar|0,aj)|0;aj=c[l>>2]|0;ar=(c[ao>>2]|0)+aj|0;c[ao>>2]=ar;c[an>>2]=(c[an>>2]|0)+(aj<<3);c[aG>>2]=(c[aG>>2]|0)+1&255;aT=ar}else{aT=ap}a[(c[am>>2]|0)+aT|0]=0;aU=c[p>>2]|0}else{aU=au}au=(at|0)<(aU|0)?at:aU;at=at-au|0;ap=aU-au|0;c[p>>2]=ap;ar=(c[am>>2]|0)+(c[ao>>2]|0)|0;a[ar]=(av>>at<<ap|(d[ar]|0))&255;c[an>>2]=(c[an>>2]|0)+au;}while((at|0)>0);aS=c[ax>>2]|0}aQ=as+aw|0;aR=aS}at=s+1|0;if((at|0)<(aR|0)){as=aQ;s=at;z=aR}else{aV=aQ;break}}}else{aV=aK}if((c[b+304+(aD*10504&-1)+(aA*5252&-1)+4788>>2]|0)==2){z=(c[ay>>2]|0)*3&-1;s=b+304+(aD*10504&-1)+(aA*5252&-1)+4772|0;as=c[s>>2]|0;aw=(z|0)>(as|0)?as:z;z=bk(b,c[b+304+(aD*10504&-1)+(aA*5252&-1)+4796>>2]|0,0,aw,aB)|0;aW=(bk(b,c[b+304+(aD*10504&-1)+(aA*5252&-1)+4800>>2]|0,aw,c[s>>2]|0,aB)|0)+z|0}else{z=c[b+304+(aD*10504&-1)+(aA*5252&-1)+4772>>2]|0;s=c[b+304+(aD*10504&-1)+(aA*5252&-1)+4824>>2]|0;aw=c[b+21360+(s+1<<2)>>2]|0;as=c[b+21360+(s+2+(c[b+304+(aD*10504&-1)+(aA*5252&-1)+4828>>2]|0)<<2)>>2]|0;s=(aw|0)>(z|0)?z:aw;aw=(as|0)>(z|0)?z:as;as=bk(b,c[b+304+(aD*10504&-1)+(aA*5252&-1)+4796>>2]|0,0,s,aB)|0;ax=(bk(b,c[b+304+(aD*10504&-1)+(aA*5252&-1)+4800>>2]|0,s,aw,aB)|0)+as|0;aW=ax+(bk(b,c[b+304+(aD*10504&-1)+(aA*5252&-1)+4804>>2]|0,aw,z,aB)|0)|0}z=aV+aF+aW+(bj(b,aB)|0)|0;aw=aA+1|0;ax=c[ai>>2]|0;if((aw|0)<(ax|0)){aF=z;aA=aw}else{aX=z;aY=ax;break}}}else{aX=az;aY=aE}aA=aD+1|0;if((aA|0)<2){az=aX;aD=aA;aE=aY}else{aZ=aX;break}}}else{if((c[ai>>2]|0)<=0){aZ=0;break}aE=b+300|0;aD=b+296|0;az=b+292|0;ay=b+284|0;an=b+21464|0;ao=0;am=0;while(1){p=b+304+(am*5252&-1)|0;aA=b+304+(am*5252&-1)+5188|0;if((c[b+304+(am*5252&-1)+4788>>2]|0)==2){aF=0;A=0;Q=0;while(1){ax=c[(c[aA>>2]|0)+(aF<<2)>>2]|0;z=(ax|0)/3&-1;aw=c[b+304+(am*5252&-1)+5192+(aF<<2)>>2]|0;if((ax|0)>2){ax=(aw|0)>0;as=(z|0)>1?z:1;s=0;aC=Q;while(1){at=aC*3&-1;av=c[b+304+(am*5252&-1)+4608+(at<<2)>>2]|0;au=(av|0)>0?av:0;if(ax){av=aw;do{ar=c[aE>>2]|0;if((ar|0)==0){c[aE>>2]=8;ap=(c[aD>>2]|0)+1|0;c[aD>>2]=ap;aj=c[aG>>2]|0;if((c[b+39840+(aj*48&-1)>>2]|0)==(c[az>>2]|0)){aq=(c[ay>>2]|0)+ap|0;al=b+39840+(aj*48&-1)+8|0;aj=c[l>>2]|0;bU(aq|0,al|0,aj)|0;aj=c[l>>2]|0;al=(c[aD>>2]|0)+aj|0;c[aD>>2]=al;c[az>>2]=(c[az>>2]|0)+(aj<<3);c[aG>>2]=(c[aG>>2]|0)+1&255;a_=al}else{a_=ap}a[(c[ay>>2]|0)+a_|0]=0;a$=c[aE>>2]|0}else{a$=ar}ar=(av|0)<(a$|0)?av:a$;av=av-ar|0;ap=a$-ar|0;c[aE>>2]=ap;al=(c[ay>>2]|0)+(c[aD>>2]|0)|0;a[al]=(au>>av<<ap|(d[al]|0))&255;a0=(c[az>>2]|0)+ar|0;c[az>>2]=a0;}while((av|0)>0);av=c[b+304+(am*5252&-1)+4608+(at+1<<2)>>2]|0;au=(av|0)>0?av:0;av=aw;ar=a0;do{al=c[aE>>2]|0;if((al|0)==0){c[aE>>2]=8;ap=(c[aD>>2]|0)+1|0;c[aD>>2]=ap;aj=c[aG>>2]|0;if((c[b+39840+(aj*48&-1)>>2]|0)==(ar|0)){aq=(c[ay>>2]|0)+ap|0;ak=b+39840+(aj*48&-1)+8|0;aj=c[l>>2]|0;bU(aq|0,ak|0,aj)|0;aj=c[l>>2]|0;ak=(c[aD>>2]|0)+aj|0;c[aD>>2]=ak;c[az>>2]=(c[az>>2]|0)+(aj<<3);c[aG>>2]=(c[aG>>2]|0)+1&255;a1=ak}else{a1=ap}a[(c[ay>>2]|0)+a1|0]=0;a2=c[aE>>2]|0}else{a2=al}al=(av|0)<(a2|0)?av:a2;av=av-al|0;ap=a2-al|0;c[aE>>2]=ap;ak=(c[ay>>2]|0)+(c[aD>>2]|0)|0;a[ak]=(au>>av<<ap|(d[ak]|0))&255;ar=(c[az>>2]|0)+al|0;c[az>>2]=ar;}while((av|0)>0);av=c[b+304+(am*5252&-1)+4608+(at+2<<2)>>2]|0;au=(av|0)>0?av:0;av=aw;al=ar;do{ak=c[aE>>2]|0;if((ak|0)==0){c[aE>>2]=8;ap=(c[aD>>2]|0)+1|0;c[aD>>2]=ap;aj=c[aG>>2]|0;if((c[b+39840+(aj*48&-1)>>2]|0)==(al|0)){aq=(c[ay>>2]|0)+ap|0;x=b+39840+(aj*48&-1)+8|0;aj=c[l>>2]|0;bU(aq|0,x|0,aj)|0;aj=c[l>>2]|0;x=(c[aD>>2]|0)+aj|0;c[aD>>2]=x;c[az>>2]=(c[az>>2]|0)+(aj<<3);c[aG>>2]=(c[aG>>2]|0)+1&255;a3=x}else{a3=ap}a[(c[ay>>2]|0)+a3|0]=0;a4=c[aE>>2]|0}else{a4=ak}ak=(av|0)<(a4|0)?av:a4;av=av-ak|0;ap=a4-ak|0;c[aE>>2]=ap;x=(c[ay>>2]|0)+(c[aD>>2]|0)|0;a[x]=(au>>av<<ap|(d[x]|0))&255;al=(c[az>>2]|0)+ak|0;c[az>>2]=al;}while((av|0)>0)}av=s+1|0;if((av|0)<(z|0)){s=av;aC=aC+1|0}else{break}}a5=(aa(aw*3&-1,as)|0)+A|0;a6=as+Q|0}else{a5=A;a6=Q}aC=aF+1|0;if((aC|0)<4){aF=aC;A=a5;Q=a6}else{break}}Q=(c[an>>2]|0)*3&-1;A=b+304+(am*5252&-1)+4772|0;aF=c[A>>2]|0;aC=(Q|0)>(aF|0)?aF:Q;Q=bk(b,c[b+304+(am*5252&-1)+4796>>2]|0,0,aC,p)|0;a7=(bk(b,c[b+304+(am*5252&-1)+4800>>2]|0,aC,c[A>>2]|0,p)|0)+Q|0;a8=a5}else{Q=0;A=0;aC=0;while(1){aF=c[(c[aA>>2]|0)+(Q<<2)>>2]|0;s=c[b+304+(am*5252&-1)+5192+(Q<<2)>>2]|0;if((aF|0)>0){if((s|0)>0){z=0;ax=aC;while(1){aB=c[b+304+(am*5252&-1)+4608+(ax<<2)>>2]|0;av=(aB|0)>0?aB:0;aB=s;do{al=c[aE>>2]|0;if((al|0)==0){c[aE>>2]=8;au=(c[aD>>2]|0)+1|0;c[aD>>2]=au;ar=c[aG>>2]|0;if((c[b+39840+(ar*48&-1)>>2]|0)==(c[az>>2]|0)){at=(c[ay>>2]|0)+au|0;ak=b+39840+(ar*48&-1)+8|0;ar=c[l>>2]|0;bU(at|0,ak|0,ar)|0;ar=c[l>>2]|0;ak=(c[aD>>2]|0)+ar|0;c[aD>>2]=ak;c[az>>2]=(c[az>>2]|0)+(ar<<3);c[aG>>2]=(c[aG>>2]|0)+1&255;a9=ak}else{a9=au}a[(c[ay>>2]|0)+a9|0]=0;ba=c[aE>>2]|0}else{ba=al}al=(aB|0)<(ba|0)?aB:ba;aB=aB-al|0;au=ba-al|0;c[aE>>2]=au;ak=(c[ay>>2]|0)+(c[aD>>2]|0)|0;a[ak]=(av>>aB<<au|(d[ak]|0))&255;c[az>>2]=(c[az>>2]|0)+al;}while((aB|0)>0);aB=z+1|0;if((aB|0)<(aF|0)){z=aB;ax=ax+1|0}else{break}}}bb=(aa(s,aF)|0)+A|0;bc=aF+aC|0}else{bb=A;bc=aC}ax=Q+1|0;if((ax|0)<4){Q=ax;A=bb;aC=bc}else{break}}aC=c[b+304+(am*5252&-1)+4772>>2]|0;A=c[b+304+(am*5252&-1)+4824>>2]|0;Q=c[b+21360+(A+1<<2)>>2]|0;aA=c[b+21360+(A+2+(c[b+304+(am*5252&-1)+4828>>2]|0)<<2)>>2]|0;A=(Q|0)>(aC|0)?aC:Q;Q=(aA|0)>(aC|0)?aC:aA;aA=bk(b,c[b+304+(am*5252&-1)+4796>>2]|0,0,A,p)|0;ax=(bk(b,c[b+304+(am*5252&-1)+4800>>2]|0,A,Q,p)|0)+aA|0;a7=ax+(bk(b,c[b+304+(am*5252&-1)+4804>>2]|0,Q,aC,p)|0)|0;a8=bb}aC=a8+ao+a7+(bj(b,p)|0)|0;Q=am+1|0;if((Q|0)<(c[ai>>2]|0)){ao=aC;am=Q}else{aZ=aC;break}}}}while(0);ai=b+21324|0;bg(b,c[ai>>2]|0);a7=aZ+n+(c[ai>>2]|0)|0;c[h>>2]=(c[h>>2]|0)+((o-a7|0)/8&-1);n=bf(b,f)|0;f=b+52140|0;if((n|0)==(c[f>>2]|0)){bd=n}else{bO(b,59680,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);bd=c[f>>2]|0}n=c[h>>2]<<3;if((n|0)!=(bd|0)){aZ=c[ai>>2]|0;ai=c[j>>2]|0;j=c[l>>2]<<3;bO(b,59360,(v=i,i=i+72|0,c[v>>2]=n,c[v+8>>2]=bd,c[v+16>>2]=aZ,c[v+24>>2]=ai,c[v+32>>2]=j,c[v+40>>2]=a7-aZ-j,c[v+48>>2]=a7,c[v+56>>2]=(a7|0)%8&-1,c[v+64>>2]=o,v)|0);bO(b,59304,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);bO(b,59224,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);bO(b,59176,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);bO(b,59136,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);c[f>>2]=c[h>>2]<<3}h=b+292|0;f=c[h>>2]|0;if((f|0)>1e9){bh=0}else{i=e;return 0}do{o=b+39840+(bh*48&-1)|0;c[o>>2]=(c[o>>2]|0)-f;bh=bh+1|0;}while((bh|0)<256);c[h>>2]=0;i=e;return 0}function bi(a,e,f,h){a=a|0;e=e|0;f=f|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0.0,I=0.0,J=0;j=i;i=i+9272|0;k=j|0;l=j+40|0;m=j+48|0;n=j+56|0;o=a+296|0;p=c[o>>2]|0;q=p+1|0;if((p|0)<0){r=0;i=j;return r|0}if((f|0)!=0&(q|0)>(f|0)){r=-1;i=j;return r|0}f=c[a+284>>2]|0;bU(e|0,f|0,q)|0;c[o>>2]=-1;c[a+300>>2]=0;if((h|0)==0){r=q;i=j;return r|0}h=a+85752|0;if((q|0)>0){o=0;f=b[h>>1]|0;do{f=(c[57816+((((d[e+o|0]|0)^f)&255)<<2)>>2]^(f&65535)>>>8)&65535;b[h>>1]=f;o=o+1|0;}while((o|0)<(q|0))}o=a+85788|0;c[o>>2]=(c[o>>2]|0)+q;o=n;if((c[a+136>>2]|0)==0){r=q;i=j;return r|0}f=a+85676|0;h=a+85808|0;p=n|0;s=n+4608|0;t=a+132|0;u=a+128|0;v=a+72|0;w=a+85684|0;a=s;x=q;L491:while(1){y=c[h>>2]|0;if((y|0)==0){z=0}else{z=bz(y,e,x,o,a,k,l,m,47424,9216,4,2)|0}y=(z|0)==-1?0:z;do{if((y|0)>0){do{if((c[t>>2]|0)!=0){A=0;B=+g[w>>2];while(1){C=+g[n+(A<<2)>>2];do{if(C>B){g[w>>2]=C;D=C}else{E=-0.0-C;if(B>=E){D=B;break}g[w>>2]=E;D=E}}while(0);F=A+1|0;if((F|0)<(y|0)){A=F;B=D}else{break}}if((c[v>>2]|0)>1){G=0;H=D}else{break}while(1){B=+g[n+4608+(G<<2)>>2];do{if(B>H){g[w>>2]=B;I=B}else{C=-0.0-B;if(H>=C){I=H;break}g[w>>2]=C;I=C}}while(0);A=G+1|0;if((A|0)<(y|0)){G=A;H=I}else{break}}}}while(0);if((c[u>>2]|0)==0){break}if((bp(c[f>>2]|0,p,s,y,c[v>>2]|0)|0)==0){r=-6;J=343;break L491}}}while(0);if((y|0)==0){r=q;J=342;break}else{x=0}}if((J|0)==342){i=j;return r|0}else if((J|0)==343){i=j;return r|0}return 0}function bj(b,f){b=b|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;h=(c[f+4840>>2]|0)+32|0;i=c[f+4772>>2]|0;j=(c[f+4776>>2]|0)-i|0;if((j|0)<=3){k=0;return k|0}l=c[46888+(h<<4)>>2]|0;m=c[46892+(h<<4)>>2]|0;h=b+300|0;n=b+296|0;o=b+52132|0;p=b+292|0;q=b+284|0;r=b+24|0;s=(j|0)/4&-1;j=0;t=f+2304+(i<<2)|0;u=f+(i<<2)|0;while(1){do{if((c[t>>2]|0)==0){v=0;w=0}else{if(+g[u>>2]>=0.0){v=8;w=0;break}v=8;w=1}}while(0);do{if((c[t+4>>2]|0)==0){x=v;y=w}else{i=v|4;f=w<<1;if(+g[u+4>>2]>=0.0){x=i;y=f;break}x=i;y=f|1}}while(0);do{if((c[t+8>>2]|0)==0){z=x;A=y}else{f=x+2|0;i=y<<1;if(+g[u+8>>2]>=0.0){z=f;A=i;break}z=f;A=i|1}}while(0);do{if((c[t+12>>2]|0)==0){B=z;C=A}else{i=z+1|0;f=A<<1;if(+g[u+12>>2]>=0.0){B=i;C=f;break}B=i;C=f|1}}while(0);f=t+16|0;i=u+16|0;D=(e[l+(B<<1)>>1]|0)+C|0;E=m+B|0;F=a[E]|0;if(F<<24>>24==0){G=0}else{H=F&255;do{F=c[h>>2]|0;if((F|0)==0){c[h>>2]=8;I=(c[n>>2]|0)+1|0;c[n>>2]=I;J=c[o>>2]|0;if((c[b+39840+(J*48&-1)>>2]|0)==(c[p>>2]|0)){K=(c[q>>2]|0)+I|0;L=b+39840+(J*48&-1)+8|0;J=c[r>>2]|0;bU(K|0,L|0,J)|0;J=c[r>>2]|0;L=(c[n>>2]|0)+J|0;c[n>>2]=L;c[p>>2]=(c[p>>2]|0)+(J<<3);c[o>>2]=(c[o>>2]|0)+1&255;M=L}else{M=I}a[(c[q>>2]|0)+M|0]=0;N=c[h>>2]|0}else{N=F}F=(H|0)<(N|0)?H:N;H=H-F|0;I=N-F|0;c[h>>2]=I;L=(c[q>>2]|0)+(c[n>>2]|0)|0;a[L]=(D>>H<<I|(d[L]|0))&255;c[p>>2]=(c[p>>2]|0)+F;}while((H|0)>0);G=d[E]|0}H=G+j|0;D=s-1|0;if((D|0)>0){s=D;j=H;t=f;u=i}else{k=H;break}}return k|0}function bk(b,f,h,i,j){b=b|0;f=f|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,ab=0,ac=0,ad=0,ae=0;k=c[46880+(f<<4)>>2]|0;if(!((f|0)!=0&(h|0)<(i|0))){l=0;return l|0}m=f>>>0>15;n=k&65535;o=c[46892+(f<<4)>>2]|0;p=c[46888+(f<<4)>>2]|0;f=b+300|0;q=b+296|0;r=b+52132|0;s=b+292|0;t=b+284|0;u=b+24|0;v=0;w=h;while(1){h=c[j+2304+(w<<2)>>2]|0;x=w+1|0;y=c[j+2304+(x<<2)>>2]|0;if((h|0)==0){z=0;A=0}else{z=+g[j+(w<<2)>>2]<0.0&1;A=-1}do{if(m){if(h>>>0>14){B=15;C=z|(h<<1)+131042&131070;D=n}else{B=h;C=z;D=0}if(y>>>0<=14){E=B;F=C;G=16;H=D;I=383;break}J=(D&65535)+k&65535;K=16;L=C<<k|y+65521&65535;M=B;N=15;I=384}else{E=h;F=z;G=k;H=0;I=383}}while(0);if((I|0)==383){I=0;if((y|0)==0){O=F;P=A;Q=H;R=G;S=E;T=0}else{J=H;K=G;L=F;M=E;N=y;I=384}}if((I|0)==384){I=0;O=+g[j+(x<<2)>>2]<0.0&1|L<<1;P=A-1&65535;Q=J;R=K;S=M;T=N}h=(aa(R,S)|0)+T|0;U=Q-P&65535;V=(d[o+h|0]|0)+P&65535;W=e[p+(h<<1)>>1]|0;h=V<<16>>16;if(V<<16>>16>0){V=h;do{X=c[f>>2]|0;if((X|0)==0){c[f>>2]=8;Y=(c[q>>2]|0)+1|0;c[q>>2]=Y;Z=c[r>>2]|0;if((c[b+39840+(Z*48&-1)>>2]|0)==(c[s>>2]|0)){_=(c[t>>2]|0)+Y|0;$=b+39840+(Z*48&-1)+8|0;Z=c[u>>2]|0;bU(_|0,$|0,Z)|0;Z=c[u>>2]|0;$=(c[q>>2]|0)+Z|0;c[q>>2]=$;c[s>>2]=(c[s>>2]|0)+(Z<<3);c[r>>2]=(c[r>>2]|0)+1&255;ab=$}else{ab=Y}a[(c[t>>2]|0)+ab|0]=0;ac=c[f>>2]|0}else{ac=X}X=(V|0)<(ac|0)?V:ac;V=V-X|0;Y=ac-X|0;c[f>>2]=Y;$=(c[t>>2]|0)+(c[q>>2]|0)|0;a[$]=(W>>>(V>>>0)<<Y|(d[$]|0))&255;c[s>>2]=(c[s>>2]|0)+X;}while((V|0)>0)}V=U&65535;if(Q<<16>>16!=P<<16>>16){W=V;do{x=c[f>>2]|0;if((x|0)==0){c[f>>2]=8;y=(c[q>>2]|0)+1|0;c[q>>2]=y;X=c[r>>2]|0;if((c[b+39840+(X*48&-1)>>2]|0)==(c[s>>2]|0)){$=(c[t>>2]|0)+y|0;Y=b+39840+(X*48&-1)+8|0;X=c[u>>2]|0;bU($|0,Y|0,X)|0;X=c[u>>2]|0;Y=(c[q>>2]|0)+X|0;c[q>>2]=Y;c[s>>2]=(c[s>>2]|0)+(X<<3);c[r>>2]=(c[r>>2]|0)+1&255;ad=Y}else{ad=y}a[(c[t>>2]|0)+ad|0]=0;ae=c[f>>2]|0}else{ae=x}x=(W|0)<(ae|0)?W:ae;W=W-x|0;y=ae-x|0;c[f>>2]=y;Y=(c[t>>2]|0)+(c[q>>2]|0)|0;a[Y]=(O>>W<<y|(d[Y]|0))&255;c[s>>2]=(c[s>>2]|0)+x;}while((W|0)>0)}W=V+v+h|0;U=w+2|0;if((U|0)<(i|0)){v=W;w=U}else{l=W;break}}return l|0}function bl(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0.0,L=0.0,M=0,N=0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0,U=0.0,V=0.0,W=0,X=0,Y=0,Z=0.0,_=0.0,$=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0,an=0,ao=0,ap=0,aq=0,ar=0;j=i;i=i+20064|0;k=j|0;l=j+8056|0;m=j+16112|0;n=j+18064|0;o=j+20016|0;p=j+20024|0;q=j+20056|0;r=q;s=i;i=i+16|0;t=i;i=i+16|0;u=i;i=i+8|0;v=u;w=i;i=i+8|0;c[q>>2]=1056964608;c[q+4>>2]=1056964608;bT(s|0,0,16);bT(t|0,0,16);x=o|0;c[x>>2]=b;c[o+4>>2]=d;y=a+4|0;if((c[y>>2]|0)==0){z=a+76|0;A=c[z>>2]|0;B=A*576&-1;c[y>>2]=1;bT(k|0,0,8056);bT(l|0,0,8056);y=B+862|0;if((y|0)>0){C=a+72|0;D=0;E=0;while(1){do{if((D|0)<(B|0)){g[k+(D<<2)>>2]=0.0;if((c[C>>2]|0)!=2){F=E;break}g[l+(D<<2)>>2]=0.0;F=E}else{g[k+(D<<2)>>2]=+g[b+(E<<2)>>2];if((c[C>>2]|0)==2){g[l+(D<<2)>>2]=+g[d+(E<<2)>>2]}F=E+1|0}}while(0);G=D+1|0;if((G|0)<(y|0)){D=G;E=F}else{break}}}if((A|0)>0){F=a+72|0;E=0;D=c[F>>2]|0;y=A;while(1){if((D|0)>0){A=0;do{c[a+304+(E*10504&-1)+(A*5252&-1)+4788>>2]=2;A=A+1|0;H=c[F>>2]|0;}while((A|0)<(H|0));I=H;J=c[z>>2]|0}else{I=D;J=y}A=E+1|0;if((A|0)<(J|0)){E=A;D=I;y=J}else{break}}}bA(a,k|0,l|0)}l=a+84752|0;c[l>>2]=0;k=a+39836|0;J=(c[k>>2]|0)-(c[a+39832>>2]|0)|0;c[k>>2]=J;if((J|0)<0){c[k>>2]=(c[a+64>>2]|0)+J;c[l>>2]=1}c[u>>2]=0;c[u+4>>2]=0;l=a+76|0;J=c[l>>2]|0;if((J|0)>0){k=a+72|0;y=u;u=m|0;I=n|0;D=w|0;E=a+180|0;z=0;H=c[k>>2]|0;while(1){if((H|0)>0){F=(z*576&-1)+304|0;A=0;do{c[v+(A<<2)>>2]=(c[o+(A<<2)>>2]|0)+(F<<2);A=A+1|0;}while((A|0)<(H|0))}bC(a,y,z,u,I,s+(z<<3)|0,t+(z<<3)|0,p+(z<<4)|0,D)|0;do{if((c[E>>2]|0)==1){K=+g[p+(z<<4)+12>>2];L=+g[p+(z<<4)+8>>2]+K;A=r+(z<<2)|0;g[A>>2]=L;if(L<=0.0){break}g[A>>2]=K/L}}while(0);A=c[k>>2]|0;if((A|0)>0){F=0;while(1){c[a+304+(z*10504&-1)+(F*5252&-1)+4788>>2]=c[w+(F<<2)>>2];c[a+304+(z*10504&-1)+(F*5252&-1)+4792>>2]=0;C=F+1|0;b=c[k>>2]|0;if((C|0)<(b|0)){F=C}else{M=b;break}}}else{M=A}F=z+1|0;b=c[l>>2]|0;if((F|0)<(b|0)){z=F;H=M}else{N=b;break}}}else{N=J}J=a+85796|0;M=c[J>>2]|0;do{if((c[M>>2]|0)==0){g[M+8>>2]=1.0}else{L=+g[a+27804>>2];K=+g[a+27812>>2];if((c[a+72>>2]|0)==2){O=+g[a+27816>>2];P=+g[a+27808>>2]}else{O=K;P=L}Q=K+O;K=L+P;if((N|0)==2){R=K>Q?K:Q}else{R=K}K=R*.5*+g[M+4>>2];if(K>.03125){H=M+8|0;Q=+g[H>>2];do{if(Q<1.0){L=+g[M+12>>2];if(Q>=L){break}g[H>>2]=L}else{g[H>>2]=1.0}}while(0);g[(c[J>>2]|0)+12>>2]=1.0;break}Q=K*31.98+625.0e-6;H=M+8|0;L=+g[H>>2];do{if(L<Q){S=+g[M+12>>2];if(S>=Q){g[H>>2]=Q;break}if(L>=S){break}g[H>>2]=S}else{g[H>>2]=(Q*.075+.925)*L;A=(c[J>>2]|0)+8|0;if(+g[A>>2]>=Q){break}g[A>>2]=Q}}while(0);g[(c[J>>2]|0)+12>>2]=Q}}while(0);bA(a,c[x>>2]|0,d);d=a+84756|0;c[d>>2]=0;do{if((c[a+80>>2]|0)==0){if((c[a+180>>2]|0)!=1){T=0;break}x=c[l>>2]|0;if((x|0)>0){J=c[a+72>>2]|0;M=(J|0)>0;N=0;R=0.0;P=0.0;while(1){if(M){H=0;O=R;L=P;while(1){K=O+ +g[t+(N<<3)+(H<<2)>>2];S=L+ +g[s+(N<<3)+(H<<2)>>2];A=H+1|0;if((A|0)<(J|0)){H=A;O=K;L=S}else{U=K;V=S;break}}}else{U=R;V=P}H=N+1|0;if((H|0)<(x|0)){N=H;R=U;P=V}else{break}}if(U>V){T=0;break}}N=x-1|0;if((c[a+5092>>2]|0)!=(c[a+10344>>2]|0)){T=0;break}if((c[a+304+(N*10504&-1)+4788>>2]|0)!=(c[a+304+(N*10504&-1)+10040>>2]|0)){T=0;break}c[d>>2]=2;T=1}else{c[d>>2]=2;T=1}}while(0);N=T?t:s;s=(T?n:m)|0;m=N|0;n=a+140|0;do{if((c[n>>2]|0)!=0){T=a+85804|0;if((c[T>>2]|0)==0){break}t=c[l>>2]|0;if((t|0)<=0){break}J=a+72|0;M=0;H=c[J>>2]|0;A=t;while(1){if((H|0)>0){t=r+(M<<2)|0;z=0;do{h[(c[T>>2]|0)+90904+(M<<3)>>3]=0.0;h[(c[T>>2]|0)+90920+(M<<3)>>3]=+g[t>>2];c[(c[T>>2]|0)+203288+(M<<3)+(z<<2)>>2]=c[a+304+(M*10504&-1)+(z*5252&-1)+4788>>2];h[(c[T>>2]|0)+189240+(M<<5)+(z<<3)>>3]=+g[N+(M<<3)+(z<<2)>>2];k=(c[T>>2]|0)+54040+(M*9216&-1)+(z*4608&-1)|0;w=a+304+(M*10504&-1)+(z*5252&-1)|0;bU(k|0,w|0,2304)|0;if((c[d>>2]|0)==2){w=z+2|0;k=c[T>>2]|0;h[k+197144+(M<<5)+(z<<3)>>3]=+h[k+197144+(M<<5)+(w<<3)>>3];k=c[T>>2]|0;p=k+123704+(M<<15)+(z<<13)|0;E=k+123704+(M<<15)+(w<<13)|0;bU(p|0,E|0,8192)|0}z=z+1|0;W=c[J>>2]|0;}while((z|0)<(W|0));X=W;Y=c[l>>2]|0}else{X=H;Y=A}z=M+1|0;if((z|0)<(Y|0)){M=z;H=X;A=Y}else{break}}}}while(0);Y=c[a+104>>2]|0;do{if((Y|0)==0|(Y|0)==3){X=a+39760|0;V=+g[X>>2];g[a+39756>>2]=V;W=a+39764|0;U=+g[W>>2];g[X>>2]=U;X=a+39768|0;P=+g[X>>2];g[W>>2]=P;W=a+39772|0;R=+g[W>>2];g[X>>2]=R;X=a+39776|0;Q=+g[X>>2];g[W>>2]=Q;W=a+39780|0;L=+g[W>>2];g[X>>2]=L;X=a+39784|0;O=+g[X>>2];g[W>>2]=O;W=a+39788|0;S=+g[W>>2];g[X>>2]=S;X=a+39792|0;K=+g[X>>2];g[W>>2]=K;W=a+39796|0;Z=+g[W>>2];g[X>>2]=Z;X=a+39800|0;_=+g[X>>2];g[W>>2]=_;W=a+39804|0;$=+g[W>>2];g[X>>2]=$;X=a+39808|0;ab=+g[X>>2];g[W>>2]=ab;W=a+39812|0;ac=+g[W>>2];g[X>>2]=ac;X=a+39816|0;ad=+g[X>>2];g[W>>2]=ad;W=a+39820|0;ae=+g[W>>2];g[X>>2]=ae;X=a+39824|0;af=+g[X>>2];g[W>>2]=af;W=a+39828|0;ag=+g[W>>2];g[X>>2]=ag;X=c[l>>2]|0;r=(X|0)>0;A=c[a+72>>2]|0;if(r){H=(A|0)>0;M=0;ah=0.0;while(1){if(H){J=0;ai=ah;while(1){aj=ai+ +g[N+(M<<3)+(J<<2)>>2];T=J+1|0;if((T|0)<(A|0)){J=T;ai=aj}else{ak=aj;break}}}else{ak=ah}J=M+1|0;if((J|0)<(X|0)){M=J;ah=ak}else{al=ak;break}}}else{al=0.0}g[W>>2]=al;ah=+(aa(X*3350&-1,A)|0)/(Z+(V+al)*-.10394349694252014+(U+ag)*-.18920649588108063+(P+af)*-.21623599529266357+(R+ae)*-.1559150069952011+(Q+ad)*3.8980449615198e-17+(L+ac)*.23387250304222107+(O+ab)*.5045499801635742+(S+$)*.7568249702453613+(K+_)*.9354900121688843);if(!r){break}M=(A|0)>0;H=0;do{if(M){J=0;do{T=N+(H<<3)+(J<<2)|0;g[T>>2]=ah*+g[T>>2];J=J+1|0;}while((J|0)<(A|0))}H=H+1|0;}while((H|0)<(X|0))}}while(0);aZ[c[a+85812>>2]&1](a,m,q,s);bh(a)|0;q=bi(a,e,f,1)|0;do{if((c[a+156>>2]|0)!=0){f=c[58840+(c[a+16>>2]<<6)+(c[a+84744>>2]<<2)>>2]|0;e=a+85784|0;c[e>>2]=(c[e>>2]|0)+1;e=a+85760|0;m=(c[e>>2]|0)+f|0;c[e>>2]=m;e=a+85764|0;f=(c[e>>2]|0)+1|0;c[e>>2]=f;N=a+85768|0;if((f|0)<(c[N>>2]|0)){break}f=a+85772|0;Y=c[f>>2]|0;X=a+85776|0;H=c[X>>2]|0;if((Y|0)<(H|0)){c[(c[a+85780>>2]|0)+(Y<<2)>>2]=m;m=(c[f>>2]|0)+1|0;c[f>>2]=m;c[e>>2]=0;am=m;an=c[X>>2]|0}else{am=Y;an=H}if((am|0)!=(an|0)){break}if((an|0)>1){H=a+85780|0;Y=1;do{m=c[H>>2]|0;c[m+(((Y|0)/2&-1)<<2)>>2]=c[m+(Y<<2)>>2];Y=Y+2|0;}while((Y|0)<(c[X>>2]|0));ao=c[f>>2]|0}else{ao=an}c[N>>2]=c[N>>2]<<1;c[f>>2]=(ao|0)/2&-1}}while(0);do{if((c[n>>2]|0)!=0){ao=a+85804|0;if((c[ao>>2]|0)==0){break}an=(c[l>>2]|0)*576&-1;am=a+72|0;if((c[am>>2]|0)>0){X=0;do{Y=0;do{H=c[ao>>2]|0;h[H+24+(X*12800&-1)+(Y<<3)>>3]=+h[H+24+(X*12800&-1)+(Y+an<<3)>>3];Y=Y+1|0;}while((Y|0)<272);Y=c[o+(X<<2)>>2]|0;H=272;do{h[(c[ao>>2]|0)+24+(X*12800&-1)+(H<<3)>>3]=+g[Y+(H-272<<2)>>2];H=H+1|0;}while((H|0)<1600);X=X+1|0;}while((X|0)<(c[am>>2]|0))}g[a+84908>>2]=1.0;bI(a,s)}}while(0);s=a+84748|0;c[s>>2]=(c[s>>2]|0)+1;s=a+84744|0;o=a+84040+((c[s>>2]|0)*20&-1)+16|0;c[o>>2]=(c[o>>2]|0)+1;o=a+84356|0;c[o>>2]=(c[o>>2]|0)+1;o=a+72|0;if((c[o>>2]|0)==2){n=a+84040+((c[s>>2]|0)*20&-1)+(c[d>>2]<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=a+84340+(c[d>>2]<<2)|0;c[n>>2]=(c[n>>2]|0)+1}n=c[l>>2]|0;if((n|0)<=0){i=j;return q|0}d=a+84740|0;am=0;X=c[o>>2]|0;ao=n;while(1){if((X|0)>0){n=0;do{an=(c[a+304+(am*10504&-1)+(n*5252&-1)+4792>>2]|0)==0?c[a+304+(am*10504&-1)+(n*5252&-1)+4788>>2]|0:4;f=a+84360+((c[s>>2]|0)*24&-1)+(an<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=a+84360+((c[s>>2]|0)*24&-1)+20|0;c[f>>2]=(c[f>>2]|0)+1;f=a+84720+(an<<2)|0;c[f>>2]=(c[f>>2]|0)+1;c[d>>2]=(c[d>>2]|0)+1;n=n+1|0;ap=c[o>>2]|0;}while((n|0)<(ap|0));aq=ap;ar=c[l>>2]|0}else{aq=X;ar=ao}n=am+1|0;if((n|0)<(ar|0)){am=n;X=aq;ao=ar}else{break}}i=j;return q|0}function bm(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;if((c|0)==0){return}e=d+4|0;f=d+8|0;h=d+12|0;i=d+16|0;j=d+20|0;k=d+24|0;l=d+28|0;m=d+32|0;n=d+36|0;o=d+40|0;p=d+44|0;q=d+48|0;r=d+52|0;s=d+56|0;t=d+60|0;u=d+64|0;v=d+68|0;w=d+72|0;x=d+76|0;y=d+80|0;z=b;b=c;c=a;while(1){a=b-1|0;g[z>>2]=+g[c>>2]*+g[d>>2]+1.0e-10- +g[z-4>>2]*+g[e>>2]+ +g[c-4>>2]*+g[f>>2]- +g[z-8>>2]*+g[h>>2]+ +g[c-8>>2]*+g[i>>2]- +g[z-12>>2]*+g[j>>2]+ +g[c-12>>2]*+g[k>>2]- +g[z-16>>2]*+g[l>>2]+ +g[c-16>>2]*+g[m>>2]- +g[z-20>>2]*+g[n>>2]+ +g[c-20>>2]*+g[o>>2]- +g[z-24>>2]*+g[p>>2]+ +g[c-24>>2]*+g[q>>2]- +g[z-28>>2]*+g[r>>2]+ +g[c-28>>2]*+g[s>>2]- +g[z-32>>2]*+g[t>>2]+ +g[c-32>>2]*+g[u>>2]- +g[z-36>>2]*+g[v>>2]+ +g[c-36>>2]*+g[w>>2]- +g[z-40>>2]*+g[x>>2]+ +g[c-40>>2]*+g[y>>2];if((a|0)==0){break}else{z=z+4|0;b=a;c=c+4|0}}return}function bn(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0;h=f+(e<<2)|0;e=a+85820|0;a=0;f=b;while(1){i=a+1|0;j=(aa(i,12582912)|0)>>16;k=31;l=b+(a<<10)+512|0;while(1){m=d[9968+(k<<2)|0]|0;n=m+j|0;o=c[h>>2]|0;p=+g[8+(m<<2)>>2]*+g[o+(n<<2)>>2];q=+g[8+(127-m<<2)>>2]*+g[o+(n+128<<2)>>2];r=p-q;s=p+q;q=+g[8+(m+64<<2)>>2]*+g[o+(n+64<<2)>>2];p=+g[8+(63-m<<2)>>2]*+g[o+(n+192<<2)>>2];t=q-p;u=q+p;o=l-16|0;g[o>>2]=s+u;g[l-8>>2]=s-u;g[l-12>>2]=r+t;g[l-4>>2]=r-t;v=c[h>>2]|0;t=+g[8+(m+1<<2)>>2]*+g[v+(n+1<<2)>>2];r=+g[8+(126-m<<2)>>2]*+g[v+(n+129<<2)>>2];u=t-r;s=t+r;r=+g[8+(m+65<<2)>>2]*+g[v+(n+65<<2)>>2];t=+g[8+(62-m<<2)>>2]*+g[v+(n+193<<2)>>2];p=r-t;q=r+t;g[l+496>>2]=s+q;g[l+504>>2]=s-q;g[l+500>>2]=u+p;g[l+508>>2]=u-p;if((k|0)>0){k=k-1|0;l=o}else{break}}aU[c[e>>2]&3](f|0,128);if((i|0)<3){a=i;f=f+1024|0}else{break}}return}function bo(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0;h=f+(e<<2)|0;e=b+2048|0;f=127;while(1){i=d[9968+f|0]|0;j=c[h>>2]|0;k=+g[520+(i<<2)>>2]*+g[j+(i<<2)>>2];l=i|512;m=+g[520+(l<<2)>>2]*+g[j+(l<<2)>>2];n=k-m;o=k+m;l=i|256;m=+g[520+(l<<2)>>2]*+g[j+(l<<2)>>2];l=i|768;k=+g[520+(l<<2)>>2]*+g[j+(l<<2)>>2];p=m-k;q=m+k;l=e-16|0;g[l>>2]=o+q;g[e-8>>2]=o-q;g[e-12>>2]=n+p;g[e-4>>2]=n-p;j=i+1|0;r=c[h>>2]|0;p=+g[520+(j<<2)>>2]*+g[r+(j<<2)>>2];j=i+513|0;n=+g[520+(j<<2)>>2]*+g[r+(j<<2)>>2];q=p-n;o=p+n;j=i+257|0;n=+g[520+(j<<2)>>2]*+g[r+(j<<2)>>2];j=i+769|0;p=+g[520+(j<<2)>>2]*+g[r+(j<<2)>>2];k=n-p;m=n+p;g[e+2032>>2]=o+m;g[e+2040>>2]=o-m;g[e+2036>>2]=q+k;g[e+2044>>2]=q-k;if((f|0)>0){e=l;f=f-1|0}else{break}}aU[c[a+85820>>2]&3](b,512);return}function bp(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0,af=0,ag=0;if((e|0)==0){i=1;return i|0}if((f|0)==1){j=b}else if((f|0)==2){j=d}else{i=0;return i|0}d=e>>>0<10;f=a+40|0;k=b;if(d){l=e<<2;bU(f|0,k|0,l)|0;m=a+19420|0;n=j;bU(m|0,n|0,l)|0}else{bU(f|0,k|0,40)|0;f=a+19420|0;l=j;bU(f|0,l|0,40)|0}l=a+38760|0;f=a+38764|0;n=a+80|0;m=a+19460|0;o=a+9728|0;p=a+38784|0;q=a+29108|0;r=a+19376|0;s=a+38756|0;t=a+38768|0;u=a+38776|0;v=a+9732|0;w=a+29112|0;x=a+84|0;y=a+19464|0;z=0;A=e;while(1){if((A|0)<=0){break}B=c[f>>2]|0;C=(c[l>>2]|0)-B|0;D=(A|0)>(C|0)?C:A;if((z|0)<10){C=10-z|0;E=(D|0)>(C|0)?C:D;F=c[m>>2]|0;G=c[n>>2]|0}else{E=D;F=j;G=b}bm(G+(z<<2)|0,(c[o>>2]|0)+(B<<2)|0,E,60208+((c[p>>2]|0)*84&-1)|0);bm(F+(z<<2)|0,(c[q>>2]|0)+(c[f>>2]<<2)|0,E,60208+((c[p>>2]|0)*84&-1)|0);B=c[f>>2]|0;D=c[p>>2]|0;C=(E|0)==0;do{if(C){H=B;I=545}else{J=+g[60968+(D*20&-1)>>2];K=+g[60972+(D*20&-1)>>2];L=+g[60976+(D*20&-1)>>2];M=+g[60980+(D*20&-1)>>2];N=+g[60984+(D*20&-1)>>2];O=(c[r>>2]|0)+(B<<2)|0;P=E;Q=(c[o>>2]|0)+(B<<2)|0;while(1){R=P-1|0;g[O>>2]=+g[Q>>2]*J- +g[O-4>>2]*K+ +g[Q-4>>2]*L- +g[O-8>>2]*M+ +g[Q-8>>2]*N;if((R|0)==0){break}else{O=O+4|0;P=R;Q=Q+4|0}}Q=c[f>>2]|0;P=c[p>>2]|0;if(C){H=Q;I=545;break}N=+g[60968+(P*20&-1)>>2];M=+g[60972+(P*20&-1)>>2];L=+g[60976+(P*20&-1)>>2];K=+g[60980+(P*20&-1)>>2];J=+g[60984+(P*20&-1)>>2];P=(c[s>>2]|0)+(Q<<2)|0;O=E;R=(c[q>>2]|0)+(Q<<2)|0;while(1){Q=O-1|0;g[P>>2]=+g[R>>2]*N- +g[P-4>>2]*M+ +g[R-4>>2]*L- +g[P-8>>2]*K+ +g[R-8>>2]*J;if((Q|0)==0){break}else{P=P+4|0;O=Q;R=R+4|0}}R=c[f>>2]|0;O=c[r>>2]|0;P=O+(R<<2)|0;Q=c[s>>2]|0;S=Q+(R<<2)|0;T=(E|0)%8&-1;if((T|0)==0){U=P;V=S;W=R;break}X=R+T|0;Y=Q+(X<<2)|0;Q=P;P=S;S=T;J=+h[t>>3];K=+h[u>>3];while(1){T=S-1|0;L=+g[Q>>2];M=J+L*L;h[t>>3]=M;L=+g[P>>2];N=K+L*L;h[u>>3]=N;if((T|0)==0){break}else{Q=Q+4|0;P=P+4|0;S=T;J=M;K=N}}U=O+(X<<2)|0;V=Y;W=R}}while(0);if((I|0)==545){I=0;U=(c[r>>2]|0)+(H<<2)|0;V=(c[s>>2]|0)+(H<<2)|0;W=H}if((E+7|0)>>>0>=15){C=U;B=V;D=(E|0)/8&-1;K=+h[t>>3];J=+h[u>>3];while(1){S=D-1|0;N=+g[C>>2];M=+g[C+4>>2];L=+g[C+8>>2];Z=+g[C+12>>2];_=+g[C+16>>2];$=+g[C+20>>2];aa=+g[C+24>>2];ab=+g[C+28>>2];ac=K+(N*N+M*M+L*L+Z*Z+_*_+$*$+aa*aa+ab*ab);h[t>>3]=ac;ab=+g[B>>2];aa=+g[B+4>>2];$=+g[B+8>>2];_=+g[B+12>>2];Z=+g[B+16>>2];L=+g[B+20>>2];M=+g[B+24>>2];N=+g[B+28>>2];ad=J+(ab*ab+aa*aa+$*$+_*_+Z*Z+L*L+M*M+N*N);h[u>>3]=ad;if((S|0)==0){break}else{C=C+32|0;B=B+32|0;D=S;K=ac;J=ad}}}D=A-E|0;B=E+z|0;C=W+E|0;c[f>>2]=C;S=c[l>>2]|0;if((C|0)==(S|0)){J=+aD(+((+h[t>>3]+ +h[u>>3])/+(C|0)*.5+1.0e-37))*1.0e3;if(J>0.0){ae=~~J}else{ae=0}P=a+38792+((ae>>>0>11999?11999:ae)<<2)|0;c[P>>2]=(c[P>>2]|0)+1;bT(t|0,0,16);P=c[f>>2]|0;bV(v|0,a+9732+(P<<2)|0,40);bV(w|0,a+29112+(P<<2)|0,40);bV(x|0,a+84+(P<<2)|0,40);bV(y|0,a+19464+(P<<2)|0,40);c[f>>2]=0;af=0;ag=c[l>>2]|0}else{af=C;ag=S}if((af|0)>(ag|0)){i=0;I=564;break}else{z=B;A=D}}if((I|0)==564){return i|0}I=a;if(d){d=10-e|0;A=d<<2;bV(I|0,a+(e<<2)|0,A|0);bV(a+19380|0,a+19380+(e<<2)|0,A|0);A=a+(d<<2)|0;z=e<<2;bU(A|0,k|0,z)|0;k=a+19380+(d<<2)|0;d=j;bU(k|0,d|0,z)|0;i=1;return i|0}else{z=e-10|0;e=b+(z<<2)|0;bU(I|0,e|0,40)|0;e=a+19380|0;a=j+(z<<2)|0;bU(e|0,a|0,40)|0;i=1;return i|0}return 0}function bq(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;f=i;i=i+8|0;g=f|0;if((b|0)==0){h=0;i=f;return h|0}if(e>>>0<128){h=128;i=f;return h|0}e=c[b+288>>2]|0;if((e|0)==0|(d|0)==0){h=0;i=f;return h|0}b=c[e+85696>>2]|0;if((b&9|0)!=1){h=0;i=f;return h|0}a[d]=84;a[d+1|0]=65;a[d+2|0]=71;j=b<<1&32;b=c[e+85704>>2]|0;k=d+3|0;d=30;L850:while(1){l=(b|0)==0;m=k;n=d;while(1){o=n-1|0;if(!l){p=a[b]|0;if(p<<24>>24!=0){break}}q=m+1|0;a[m]=j;if((o|0)==0){r=q;break L850}else{m=q;n=o}}n=m+1|0;a[m]=p;if((o|0)==0){r=n;break}else{b=b+1|0;k=n;d=o}}o=c[e+85708>>2]|0;d=r;r=30;L859:while(1){k=(o|0)==0;b=d;p=r;while(1){s=p-1|0;if(!k){t=a[o]|0;if(t<<24>>24!=0){break}}n=b+1|0;a[b]=j;if((s|0)==0){u=n;break L859}else{b=n;p=s}}p=b+1|0;a[b]=t;if((s|0)==0){u=p;break}else{o=o+1|0;d=p;r=s}}s=c[e+85712>>2]|0;r=u;u=30;L868:while(1){d=(s|0)==0;o=r;t=u;while(1){w=t-1|0;if(!d){x=a[s]|0;if(x<<24>>24!=0){break}}p=o+1|0;a[o]=j;if((w|0)==0){y=p;break L868}else{o=p;t=w}}t=o+1|0;a[o]=x;if((w|0)==0){y=t;break}else{s=s+1|0;r=t;u=w}}w=g|0;g=e+85700|0;aC(w|0,59072,(v=i,i=i+8|0,c[v>>2]=c[g>>2],v)|0)|0;u=(c[g>>2]|0)!=0?w:0;w=y;y=4;L877:while(1){g=(u|0)==0;r=w;s=y;while(1){z=s-1|0;if(!g){A=a[u]|0;if(A<<24>>24!=0){break}}x=r+1|0;a[r]=j;if((z|0)==0){B=x;break L877}else{r=x;s=z}}s=r+1|0;a[r]=A;if((z|0)==0){B=s;break}else{u=u+1|0;w=s;y=z}}z=e+85720|0;y=c[e+85716>>2]|0;w=B;B=(c[z>>2]|0)!=0?28:30;L886:while(1){u=(y|0)==0;A=w;s=B;while(1){C=s-1|0;if(!u){D=a[y]|0;if(D<<24>>24!=0){break}}g=A+1|0;a[A]=j;if((C|0)==0){E=g;break L886}else{A=g;s=C}}s=A+1|0;a[A]=D;if((C|0)==0){E=s;break}else{y=y+1|0;w=s;B=C}}if((c[z>>2]|0)==0){F=E}else{a[E]=0;a[E+1|0]=c[z>>2]&255;F=E+2|0}a[F]=c[e+85724>>2]&255;h=128;i=f;return h|0}function br(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=i;i=i+128|0;f=e|0;g=c[b+288>>2]|0;h=bq(b,f|0,128)|0;if(h>>>0>128|(h|0)==0){j=0;i=e;return j|0}b=g+300|0;k=g+296|0;l=g+284|0;m=g+292|0;n=0;while(1){o=d[f+n|0]|0;p=8;while(1){q=c[b>>2]|0;if((q|0)==0){c[b>>2]=8;r=(c[k>>2]|0)+1|0;c[k>>2]=r;a[(c[l>>2]|0)+r|0]=0;s=c[b>>2]|0}else{s=q}q=(p|0)<(s|0)?p:s;r=p-q|0;t=s-q|0;c[b>>2]=t;u=(c[l>>2]|0)+(c[k>>2]|0)|0;a[u]=(o>>>(r>>>0)<<t|(d[u]|0))&255;c[m>>2]=(c[m>>2]|0)+q;if((r|0)>0){p=r}else{v=0;break}}do{p=g+39840+(v*48&-1)|0;c[p>>2]=(c[p>>2]|0)+8;v=v+1|0;}while((v|0)<256);p=n+1|0;if(p>>>0<h>>>0){n=p}else{j=h;break}}i=e;return j|0}function bs(a,b,d,e,f,h,j,k,l){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0;m=i;i=i+32|0;n=m|0;o=m+8|0;p=m+16|0;q=m+24|0;if((a|0)==0){r=-3;i=m;return r|0}if((c[a>>2]|0)!=-487877){r=-3;i=m;return r|0}s=c[a+288>>2]|0;if((s|0)==0){r=-3;i=m;return r|0}a=s|0;if((c[a>>2]|0)!=-487877){r=-3;i=m;return r|0}if((e|0)==0){r=0;i=m;return r|0}t=s+52152|0;u=c[t>>2]|0;do{if((u|0)==0){w=630}else{if((c[s+52148>>2]|0)<(e|0)){bQ(u);w=630;break}else{x=u;y=c[s+52156>>2]|0;w=633;break}}}while(0);if((w|0)==630){u=s+52156|0;z=c[u>>2]|0;if((z|0)!=0){bQ(z)}c[t>>2]=bR(e,4)|0;z=bR(e,4)|0;c[u>>2]=z;c[s+52148>>2]=e;A=c[t>>2]|0;if((A|0)==0){B=u;C=z}else{x=A;y=z;w=633}}do{if((w|0)==633){z=s+52156|0;if((y|0)==0){bQ(x);B=z;C=c[z>>2]|0;break}A=(b|0)==0;do{if((c[s+68>>2]|0)>1){if(A|(d|0)==0){r=0;i=m;return r|0}else{bv(s,b,d,e,j,k,l);break}}else{if(A){r=0;i=m;return r|0}else{bv(s,b,b,e,j,k,l);break}}}while(0);A=s+76|0;u=c[A>>2]|0;D=u*576&-1;E=(c[a>>2]|0)!=-487877;if(E){r=E?-3:0;i=m;return r|0}E=s+296|0;F=c[E>>2]|0;G=F+1|0;do{if((F|0)<0){H=0;I=u}else{if((h|0)!=0&(G|0)>(h|0)){r=-1;i=m;return r|0}J=c[s+284>>2]|0;bU(f|0,J|0,G)|0;c[E>>2]=-1;c[s+300>>2]=0;if((G|0)<0){r=G;i=m;return r|0}else{H=G;I=c[A>>2]|0;break}}}while(0);A=c[t>>2]|0;G=c[z>>2]|0;E=(I*576&-1)+752|0;u=n|0;c[u>>2]=s+52160;F=n+4|0;c[F>>2]=s+68096;J=o|0;K=o+4|0;L=s+128|0;M=s+72|0;N=s+84036|0;O=s+84032|0;P=s+136|0;Q=s+85676|0;R=(h|0)==0;S=A;A=G;G=e;T=f+H|0;U=H;L967:while(1){V=S;W=A;X=G;while(1){if((X|0)<=0){r=U;w=678;break L967}c[p>>2]=0;c[q>>2]=0;c[J>>2]=V;c[K>>2]=W;bM(s,u,J,X,p,q);do{if((c[L>>2]|0)!=0){if((c[P>>2]|0)!=0){break}Y=c[N>>2]|0;if((bp(c[Q>>2]|0,(c[u>>2]|0)+(Y<<2)|0,(c[F>>2]|0)+(Y<<2)|0,c[q>>2]|0,c[M>>2]|0)|0)==0){r=-6;w=679;break L967}}}while(0);Y=c[p>>2]|0;Z=X-Y|0;_=V+(Y<<2)|0;if((c[M>>2]|0)==2){$=W+(Y<<2)|0}else{$=W}Y=c[q>>2]|0;aa=(c[N>>2]|0)+Y|0;c[N>>2]=aa;ab=c[O>>2]|0;if((ab|0)<1){c[O>>2]=1728;ac=1728}else{ac=ab}c[O>>2]=ac+Y;if((aa|0)<(E|0)){V=_;W=$;X=Z}else{break}}X=bl(s,c[u>>2]|0,c[F>>2]|0,T,R?0:h-U|0)|0;if((X|0)<0){r=X;w=680;break}W=T+X|0;V=X+U|0;X=(c[N>>2]|0)-D|0;c[N>>2]=X;c[O>>2]=(c[O>>2]|0)-D;aa=c[M>>2]|0;if((aa|0)>0){ad=0;ae=X;af=aa}else{S=_;A=$;G=Z;T=W;U=V;continue}while(1){if((ae|0)>0){aa=c[n+(ad<<2)>>2]|0;X=0;do{g[aa+(X<<2)>>2]=+g[aa+(X+D<<2)>>2];X=X+1|0;ag=c[N>>2]|0;}while((X|0)<(ag|0));ah=ag;ai=c[M>>2]|0}else{ah=ae;ai=af}X=ad+1|0;if((X|0)<(ai|0)){ad=X;ae=ah;af=ai}else{S=_;A=$;G=Z;T=W;U=V;continue L967}}}if((w|0)==678){i=m;return r|0}else if((w|0)==679){i=m;return r|0}else if((w|0)==680){i=m;return r|0}}}while(0);if((C|0)!=0){bQ(C)}c[t>>2]=0;c[B>>2]=0;c[s+52148>>2]=0;bO(s,59032,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);r=-2;i=m;return r|0}function bt(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return bs(a,b,c,d,e,f,3,1,32767.0)|0}function bu(a){a=a|0;var b=0,d=0,e=0,f=0,h=0.0,i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0;b=a+85680|0;do{if((c[a+128>>2]|0)!=0){d=c[a+85676>>2]|0;e=0;f=0;do{e=(c[d+38792+(f<<2)>>2]|0)+e|0;f=f+1|0;}while(f>>>0<12e3);if((e|0)==0){h=-24601.0}else{f=~~+$(+(+(e>>>0>>>0)*.050000000000000044));i=12e3;j=0;while(1){k=i-1|0;if((i|0)==0){break}l=(c[d+38792+(k<<2)>>2]|0)+j|0;if(l>>>0<f>>>0){i=k;j=l}else{break}}h=64.81999969482422- +(k>>>0>>>0)/100.0}j=0;do{i=d+38792+(j<<2)|0;f=d+86792+(j<<2)|0;c[f>>2]=(c[f>>2]|0)+(c[i>>2]|0);c[i>>2]=0;j=j+1|0;}while(j>>>0<12e3);bT(d|0,0,40);bT(d+84|0,0,40);bT(d+9732|0,0,40);bT(d+19380|0,0,40);bT(d+19464|0,0,40);bT(d+29112|0,0,40);bT(d+38764|0,0,20);m=h;n=+P(+h);o=+P(+(h+24601.0));if(n>24601.0){if(o>n*9.999999974752427e-7){p=695}else{p=696}}else{if(o>.024600999937888446){p=695}else{p=696}}if((p|0)==695){c[a+85688>>2]=~~+O(+(m*10.0+.5));break}else if((p|0)==696){c[a+85688>>2]=0;break}}}while(0);if((c[a+132>>2]|0)==0){return}p=a+85684|0;k=~~+$(+(+aD(+(+g[p>>2]/32767.0))*20.0*10.0));c[a+85692>>2]=k;if((k|0)>0){g[b>>2]=+O(+(32767.0/+g[p>>2]*100.0))/100.0;return}else{g[b>>2]=-1.0;return}}function bv(a,d,e,f,i,j,k){a=a|0;d=d|0;e=e|0;f=f|0;i=i|0;j=j|0;k=+k;var l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0.0,u=0;l=c[a+52152>>2]|0;m=c[a+52156>>2]|0;n=+g[a+264>>2]*k;o=+g[a+268>>2]*k;p=+g[a+272>>2]*k;q=+g[a+276>>2]*k;if((i|0)==0){if((f|0)<=0){return}a=0;r=e;s=d;while(1){k=+(b[s>>1]|0);t=+(b[r>>1]|0);g[l+(a<<2)>>2]=n*k+o*t;g[m+(a<<2)>>2]=p*k+q*t;u=a+1|0;if((u|0)<(f|0)){a=u;r=r+(j<<1)|0;s=s+(j<<1)|0}else{break}}return}else if((i|0)==1){if((f|0)<=0){return}s=0;r=e;a=d;while(1){t=+(c[a>>2]|0);k=+(c[r>>2]|0);g[l+(s<<2)>>2]=n*t+o*k;g[m+(s<<2)>>2]=p*t+q*k;u=s+1|0;if((u|0)<(f|0)){s=u;r=r+(j<<2)|0;a=a+(j<<2)|0}else{break}}return}else if((i|0)==2){if((f|0)<=0){return}a=0;r=e;s=d;while(1){k=+(c[s>>2]|0);t=+(c[r>>2]|0);g[l+(a<<2)>>2]=n*k+o*t;g[m+(a<<2)>>2]=p*k+q*t;u=a+1|0;if((u|0)<(f|0)){a=u;r=r+(j<<2)|0;s=s+(j<<2)|0}else{break}}return}else if((i|0)==3){if((f|0)<=0){return}s=d;r=e;a=0;while(1){t=+g[s>>2];k=+g[r>>2];g[l+(a<<2)>>2]=n*t+o*k;g[m+(a<<2)>>2]=p*t+q*k;u=a+1|0;if((u|0)<(f|0)){s=s+(j<<2)|0;r=r+(j<<2)|0;a=u}else{break}}return}else if((i|0)==4){if((f|0)<=0){return}i=d;d=e;e=0;while(1){k=+h[i>>3];t=+h[d>>3];g[l+(e<<2)>>2]=n*k+o*t;g[m+(e<<2)>>2]=p*k+q*t;a=e+1|0;if((a|0)<(f|0)){i=i+(j<<3)|0;d=d+(j<<3)|0;e=a}else{break}}return}else{return}}function bw(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0.0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+4616|0;f=e|0;g=e+8|0;if((a|0)==0){h=-3;i=e;return h|0}if((c[a>>2]|0)!=-487877){h=-3;i=e;return h|0}j=c[a+288>>2]|0;if((j|0)==0){h=-3;i=e;return h|0}if((c[j>>2]|0)!=-487877){h=-3;i=e;return h|0}k=j+84032|0;l=c[k>>2]|0;if((l|0)<1){h=0;i=e;return h|0}m=(c[j+76>>2]|0)*576&-1;n=m+752|0;o=l-1152|0;l=g;bT(l|0,0,4608);p=c[j+64>>2]|0;q=+(p|0);r=c[j+60>>2]|0;if((r|0)<(~~(q*.9994999766349792)|0)){s=740}else{if((~~(q*1.000499963760376)|0)<(r|0)){s=740}else{t=1.0;u=o}}if((s|0)==740){q=+(r|0)/+(p|0);t=q;u=~~(+(o|0)+16.0/q)}o=m-((u|0)%(m|0)&-1)|0;p=((o|0)<576?m:0)+o|0;c[j+84764>>2]=p;o=(p+u|0)/(m|0)&-1;do{if((o|0)>0){m=j+84748|0;u=j+84036|0;p=(d|0)==0;r=g+2304|0;s=o;v=0;w=b;x=c[m>>2]|0;while(1){y=~~(t*+(n-(c[u>>2]|0)|0));z=(y|0)>1152?1152:y;A=bs(a,l,r,(z|0)<1?1:z,w,p?0:d-v|0,0,1,1.0)|0;B=w+A|0;C=A+v|0;z=c[m>>2]|0;y=s-((x|0)!=(z|0)&1)|0;if((y|0)>0&(A|0)>-1){s=y;v=C;w=B;x=z}else{break}}c[k>>2]=0;if((A|0)<0){h=A}else{D=B;E=C;break}i=e;return h|0}else{c[k>>2]=0;D=b;E=0}}while(0);b=(d|0)==0;k=bf(j,f)|0;if((k|0)>=0){bg(j,k);c[j+52140>>2]=0;c[j+21312>>2]=0}k=bi(j,D,b?0:d-E|0,1)|0;bu(j);if((k|0)<0){h=k;i=e;return h|0}f=D+k|0;D=k+E|0;E=b?0:d-D|0;if((c[a+68>>2]|0)==0){h=D;i=e;return h|0}br(a)|0;a=j+296|0;h=c[a>>2]|0;d=h+1|0;if((h|0)<0){F=0;G=(F|0)<0;H=G?0:D;I=H+F|0;i=e;return I|0}if((E|0)!=0&(d|0)>(E|0)){F=-1;G=(F|0)<0;H=G?0:D;I=H+F|0;i=e;return I|0}E=c[j+284>>2]|0;bU(f|0,E|0,d)|0;c[a>>2]=-1;c[j+300>>2]=0;F=d;G=(F|0)<0;H=G?0:D;I=H+F|0;i=e;return I|0}function bx(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;if((a|0)==0){b=0;return b|0}d=a|0;if((c[d>>2]|0)!=-487877){b=0;return b|0}e=a+288|0;f=c[e>>2]|0;c[d>>2]=0;if((f|0)==0){g=-3}else{d=f|0;h=(c[d>>2]|0)==-487877?0:-3;c[d>>2]=0;bL(f);c[e>>2]=0;g=h}h=a+284|0;if((c[h>>2]|0)==0){b=g;return b|0}c[h>>2]=0;bQ(a);b=g;return b|0}function by(){var b=0,d=0,e=0;if(!(a[46872]|0)){b=0;do{g[44816+(b<<2)>>2]=+_(+(+(b|0)*.001953125+1.0))/.6931471805599453;b=b+1|0;}while((b|0)<513)}a[46872]=1;b=bR(1,304)|0;if((b|0)==0){d=0;return d|0}bT(b|0,0,304);c[b>>2]=-487877;e=bR(1,85840)|0;c[b+288>>2]=e;if((e|0)==0){bQ(b);d=0;return d|0}else{c[b+124>>2]=2;c[b+48>>2]=4;c[b+108>>2]=1;c[b+12>>2]=44100;c[b+8>>2]=2;c[b+4>>2]=-1;c[b+36>>2]=1;c[b+44>>2]=-1;c[b+240>>2]=-1;c[b+88>>2]=-1;c[b+184>>2]=0;c[b+188>>2]=0;c[b+192>>2]=-1;c[b+196>>2]=-1;c[b+156>>2]=0;c[b+164>>2]=4;g[b+224>>2]=-1.0;c[b+168>>2]=128;c[b+172>>2]=0;c[b+176>>2]=0;c[b+180>>2]=0;c[e+112>>2]=1;c[e+116>>2]=13;c[b+132>>2]=-1;c[b+136>>2]=-1;g[b+252>>2]=-1.0;c[e+84920>>2]=180;c[e+84924>>2]=180;c[e+84928>>2]=4;c[e+84932>>2]=4;g[e+84908>>2]=1.0;g[b+264>>2]=-1.0;g[b+268>>2]=-1.0;g[b+20>>2]=1.0;g[b+24>>2]=1.0;g[b+28>>2]=1.0;c[b+232>>2]=-1;c[b+220>>2]=-1;g[b+236>>2]=0.0;c[b+244>>2]=-1;g[b+248>>2]=-1.0;c[e+84032>>2]=1728;c[e+84764>>2]=0;c[e+84036>>2]=528;c[b+60>>2]=0;c[b+64>>2]=0;c[e+136>>2]=0;c[e+128>>2]=0;c[e+132>>2]=0;c[e+85688>>2]=0;c[e+85692>>2]=0;g[e+85680>>2]=-1.0;c[b+292>>2]=1;c[b+296>>2]=1;c[b+300>>2]=1;c[b+152>>2]=0;c[b+68>>2]=1;c[b+276>>2]=2;c[b+280>>2]=2;c[b+272>>2]=2;c[b+284>>2]=1;d=b;return d|0}return 0}function bz(a,d,e,f,h,j,k,l,m,p,q,r){a=a|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;s=i;i=i+8|0;t=s|0;u=j|0;c[u>>2]=0;v=aV[r&3](a,d,e,m,p,t)|0;p=a+60|0;do{if((c[a+24>>2]|0)==0){if((c[p>>2]|0)>0){w=790;break}if((c[a+48>>2]|0)>0){w=790}}else{w=790}}while(0);do{if((w|0)==790){c[u>>2]=1;c[j+4>>2]=c[a+68>>2];e=c[o+(c[a+100>>2]<<2)>>2]|0;c[j+8>>2]=e;c[j+16>>2]=c[a+112>>2];c[j+20>>2]=c[a+116>>2];d=a+88|0;r=a+76|0;x=c[57784+(c[r>>2]<<4)+(c[d>>2]<<2)>>2]|0;c[j+24>>2]=x;y=c[p>>2]|0;do{if((y|0)>0){c[j+12>>2]=~~(+(aa(e,(y<<3)+32|0)|0)/(+(x|0)*1.0e3)+.5)}else{z=c[a+48>>2]|0;if((z|0)>0){c[j+12>>2]=~~(+(aa(e,(z<<3)+32|0)|0)/(+(x|0)*1.0e3)+.5);break}else{c[j+12>>2]=c[n+((c[r>>2]|0)*192&-1)+((c[d>>2]|0)-1<<6)+(c[a+96>>2]<<2)>>2];break}}}while(0);d=a+12|0;r=c[d>>2]|0;if((r|0)<=0){break}c[j+32>>2]=r;c[j+28>>2]=aa(c[d>>2]|0,x)|0;c[k>>2]=c[a+16>>2];c[l>>2]=c[a+20>>2]}}while(0);if((v|0)==0){l=c[a+68>>2]|0;if((l|0)==1){a=(c[t>>2]|0)/(q|0)&-1;k=(a|0)>0;if((q|0)==2){if(!k){A=a;i=s;return A|0}j=0;p=f;u=m;while(1){b[p>>1]=b[u>>1]|0;w=j+1|0;if((w|0)<(a|0)){j=w;p=p+2|0;u=u+2|0}else{A=a;break}}i=s;return A|0}else{if(!k){A=a;i=s;return A|0}k=0;u=f;p=m;while(1){g[u>>2]=+g[p>>2];j=k+1|0;if((j|0)<(a|0)){k=j;u=u+4|0;p=p+4|0}else{A=a;break}}i=s;return A|0}}else if((l|0)==2){l=((c[t>>2]|0)/(q|0)&-1)>>1;t=(l|0)>0;if((q|0)==2){if(!t){A=l;i=s;return A|0}q=0;a=f;p=h;u=m;while(1){b[a>>1]=b[u>>1]|0;b[p>>1]=b[u+2>>1]|0;k=q+1|0;if((k|0)<(l|0)){q=k;a=a+2|0;p=p+2|0;u=u+4|0}else{A=l;break}}i=s;return A|0}else{if(!t){A=l;i=s;return A|0}t=0;u=f;f=h;h=m;while(1){g[u>>2]=+g[h>>2];g[f>>2]=+g[h+4>>2];m=t+1|0;if((m|0)<(l|0)){t=m;u=u+4|0;f=f+4|0;h=h+8|0}else{A=l;break}}i=s;return A|0}}else{A=-1;i=s;return A|0}}else if((v|0)==(-1|0)){A=-1;i=s;return A|0}else if((v|0)==1){A=0;i=s;return A|0}else{A=-1;i=s;return A|0}return 0}function bA(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0.0,Q=0,R=0,S=0,T=0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0;e=i;i=i+72|0;f=e|0;h=a+72|0;if((c[h>>2]|0)<=0){i=e;return}j=a+76|0;k=f|0;l=f+68|0;m=f+36|0;n=f+60|0;o=f+44|0;p=f+56|0;q=f+48|0;r=f+32|0;s=f+4|0;t=f+28|0;u=f+8|0;v=f+24|0;w=f+12|0;x=f+20|0;y=f+16|0;z=f+64|0;A=f+40|0;B=f+52|0;C=b;b=0;while(1){do{if((c[j>>2]|0)>0){D=C+1144|0;E=0;while(1){F=1-E|0;G=a+27824+(b*4608&-1)+(F*2304&-1)|0;H=D;I=0;while(1){bB(H,G);bB(H+128|0,G+128|0);J=G+132|0;g[J>>2]=+g[J>>2]*-1.0;J=G+140|0;g[J>>2]=+g[J>>2]*-1.0;J=G+148|0;g[J>>2]=+g[J>>2]*-1.0;J=G+156|0;g[J>>2]=+g[J>>2]*-1.0;J=G+164|0;g[J>>2]=+g[J>>2]*-1.0;J=G+172|0;g[J>>2]=+g[J>>2]*-1.0;J=G+180|0;g[J>>2]=+g[J>>2]*-1.0;J=G+188|0;g[J>>2]=+g[J>>2]*-1.0;J=G+196|0;g[J>>2]=+g[J>>2]*-1.0;J=G+204|0;g[J>>2]=+g[J>>2]*-1.0;J=G+212|0;g[J>>2]=+g[J>>2]*-1.0;J=G+220|0;g[J>>2]=+g[J>>2]*-1.0;J=G+228|0;g[J>>2]=+g[J>>2]*-1.0;J=G+236|0;g[J>>2]=+g[J>>2]*-1.0;J=G+244|0;g[J>>2]=+g[J>>2]*-1.0;J=G+252|0;g[J>>2]=+g[J>>2]*-1.0;J=I+1|0;if((J|0)<9){G=G+256|0;H=H+256|0;I=J}else{break}}I=a+304+(E*10504&-1)+(b*5252&-1)+4788|0;H=a+304+(E*10504&-1)+(b*5252&-1)+4792|0;G=a+304+(E*10504&-1)+(b*5252&-1)|0;J=0;while(1){K=c[44648+(J<<2)>>2]|0;L=(c[H>>2]|0)!=0&(J|0)<2?0:c[I>>2]|0;M=a+37040+(J<<2)|0;N=+g[M>>2];do{if(N<1.0e-12){bT(G|0,0,72)}else{L1217:do{if(N<1.0){O=0;P=N;while(1){Q=a+27824+(b*4608&-1)+(F*2304&-1)+((O<<5)+K<<2)|0;g[Q>>2]=P*+g[Q>>2];Q=O+1|0;if((Q|0)>=18){break L1217}O=Q;P=+g[M>>2]}}}while(0);if((L|0)!=2){O=-9;do{Q=O+9|0;R=(Q<<5)+K|0;S=(8-O<<5)+K|0;P=+g[4616+(L*144&-1)+(O+27<<2)>>2]*+g[a+27824+(b*4608&-1)+(F*2304&-1)+(R<<2)>>2]+ +g[4616+(L*144&-1)+(O+36<<2)>>2]*+g[a+27824+(b*4608&-1)+(F*2304&-1)+(S<<2)>>2];T=O+18|0;U=+g[4616+(L*144&-1)+(Q<<2)>>2]*+g[a+27824+(b*4608&-1)+(E*2304&-1)+(R<<2)>>2]- +g[4616+(L*144&-1)+(T<<2)>>2]*+g[a+27824+(b*4608&-1)+(E*2304&-1)+(S<<2)>>2];V=+g[4904+(O+12<<2)>>2];g[f+(Q<<2)>>2]=P-V*U;g[f+(T<<2)>>2]=U+P*V;O=O+1|0;}while((O|0)<0);V=+g[l>>2]- +g[m>>2];P=+g[n>>2]- +g[o>>2];U=+g[p>>2]- +g[q>>2];W=+g[k>>2]+ +g[r>>2];X=+g[s>>2]+ +g[t>>2];Y=+g[u>>2]+ +g[v>>2];Z=+g[w>>2]+ +g[x>>2];_=W+Y-Z;g[G+68>>2]=_-(X- +g[y>>2]);$=_*.5+(X- +g[y>>2]);_=(V-P-U)*.8660253882408142;g[G+20>>2]=_+$;g[G+24>>2]=_-$;$=(+g[z>>2]- +g[A>>2])*.8660253882408142;_=X*.5+ +g[y>>2];X=U*.3420201539993286+(P*.6427876353263855+(V*.9848077297210693+$));aa=Z*.9396926164627075+(W*.1736481785774231+_-Y*-.7660444378852844);g[G+4>>2]=X+aa;g[G+8>>2]=X-aa;aa=U*.9848077297210693+(V*.6427876353263855-$-P*.3420201539993286);X=Z*-.1736481785774231+(W*.7660444378852844+_-Y*.9396926164627075);g[G+36>>2]=aa+X;g[G+40>>2]=aa-X;X=P*.9848077297210693+(V*.3420201539993286-$)-U*.6427876353263855;U=Y*-.1736481785774231+(W*.9396926164627075-_)-Z*-.7660444378852844;g[G+52>>2]=X+U;g[G+56>>2]=X-U;U=+g[r>>2]- +g[k>>2];X=+g[v>>2]- +g[u>>2];Z=+g[x>>2]- +g[w>>2];_=+g[l>>2]+ +g[m>>2];W=+g[z>>2]+ +g[A>>2];Y=+g[n>>2]+ +g[o>>2];$=+g[p>>2]+ +g[q>>2];V=_+Y+$;g[G>>2]=V+(W+ +g[B>>2]);P=V*.5-(W+ +g[B>>2]);V=(U-X+Z)*.8660253882408142;g[G+44>>2]=V+P;g[G+48>>2]=P-V;V=(+g[t>>2]- +g[s>>2])*.8660253882408142;P=+g[B>>2]-W*.5;W=$*-.7660444378852844+(Y*-.1736481785774231+(_*.9396926164627075-P));aa=Z*.6427876353263855+(X*.9848077297210693+(U*.3420201539993286+V));g[G+12>>2]=W+aa;g[G+16>>2]=W-aa;aa=_*.7660444378852844+P-Y*.9396926164627075-$*-.1736481785774231;W=U*.6427876353263855+V-X*.3420201539993286-Z*.9848077297210693;g[G+28>>2]=aa+W;g[G+32>>2]=aa-W;W=_*.1736481785774231+P-Y*-.7660444378852844-$*.9396926164627075;$=X*.6427876353263855+(U*.9848077297210693-V)-Z*.3420201539993286;g[G+60>>2]=W+$;g[G+64>>2]=W-$;break}O=K+288|0;T=K+480|0;Q=-3;while(1){S=Q+3|0;$=+g[4904+(S<<2)>>2];R=Q<<5;ab=O+R|0;ac=(8-Q<<5)+K|0;ad=Q*3&-1;g[G+(ad+9<<2)>>2]=$*+g[a+27824+(b*4608&-1)+(E*2304&-1)+(ab<<2)>>2]- +g[a+27824+(b*4608&-1)+(E*2304&-1)+(ac<<2)>>2];ae=a+27824+(b*4608&-1)+(E*2304&-1)+((14-Q<<5)+K<<2)|0;af=a+27824+(b*4608&-1)+(E*2304&-1)+(T+R<<2)|0;g[G+(ad+18<<2)>>2]=$*+g[ae>>2]+ +g[af>>2];g[G+(ad+10<<2)>>2]=$*+g[af>>2]- +g[ae>>2];ae=a+27824+(b*4608&-1)+(F*2304&-1)+((2-Q<<5)+K<<2)|0;af=a+27824+(b*4608&-1)+(F*2304&-1)+((S<<5)+K<<2)|0;g[G+(ad+19<<2)>>2]=$*+g[ae>>2]+ +g[af>>2];g[G+(ad+11<<2)>>2]=$*+g[af>>2]- +g[ae>>2];g[G+(ad+20<<2)>>2]=$*+g[a+27824+(b*4608&-1)+(F*2304&-1)+(ac<<2)>>2]+ +g[a+27824+(b*4608&-1)+(F*2304&-1)+(ab<<2)>>2];ab=Q+1|0;if((ab|0)<0){Q=ab}else{ag=0;ah=G;break}}while(1){Q=ah+24|0;$=+g[Q>>2];T=ah+60|0;W=+g[T>>2];Z=$*.13165250420570374-W;V=+g[ah>>2];O=ah+36|0;U=+g[O>>2];X=V*.7673270106315613-U;Y=$+W*.13165250420570374;W=V+U*.7673270106315613;U=Y+W;ab=ah+12|0;V=+g[ab>>2];ac=ah+48|0;$=+g[ac>>2];P=Z+X;_=(V*.4142135679721832-$)*2.069978111953089e-11;g[ah>>2]=P*1.90752519173728e-11+_;aa=(V+$*.4142135679721832)*2.069978111953089e-11;g[T>>2]=(-0.0-U)*1.90752519173728e-11+aa;$=(Z-X)*.8660254037844387*1.907525191737281e-11;X=U*.5*1.907525191737281e-11+aa;g[ab>>2]=$-X;g[Q>>2]=$+X;X=P*.5*1.907525191737281e-11-_;_=(W-Y)*.8660254037844387*1.907525191737281e-11;g[O>>2]=_+X;g[ac>>2]=X-_;ac=ag+1|0;if((ac|0)<3){ag=ac;ah=ah+4|0}else{break}}}}while(0);L1232:do{if(!((L|0)==2|(J|0)==0)){K=7;while(1){M=G+(K<<2)|0;N=+g[M>>2];_=+g[4904+(K+20<<2)>>2];ac=G+((K^-1)<<2)|0;X=+g[ac>>2];Y=+g[4904+(K+28<<2)>>2];g[ac>>2]=N*_+X*Y;g[M>>2]=N*Y-_*X;if((K|0)<=0){break L1232}K=K-1|0}}}while(0);L=J+1|0;if((L|0)<32){G=G+72|0;J=L}else{break}}J=E+1|0;ai=c[j>>2]|0;if((J|0)<(ai|0)){D=D+2304|0;E=J}else{break}}if((ai|0)!=1){break}E=a+27824+(b*4608&-1)|0;D=a+27824+(b*4608&-1)+2304|0;bU(E|0,D|0,2304)|0}}while(0);D=b+1|0;if((D|0)<(c[h>>2]|0)){C=d;b=D}else{break}}i=e;return}function bB(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0,L=0.0,M=0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0,S=0,T=0,U=0,V=0.0,W=0.0,X=0,Y=0,Z=0.0,_=0.0,$=0,aa=0,ab=0.0,ac=0.0,ad=0,ae=0,af=0.0,ag=0.0,ah=0,ai=0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0;c=a-248|0;d=56680;e=-15;f=a;while(1){h=+g[d-40>>2];i=+g[d-36>>2];j=+g[d-32>>2];k=+g[d-28>>2];l=+g[d-24>>2];m=+g[d-20>>2];n=+g[d-16>>2];o=+g[d-12>>2];p=+g[d-8>>2];q=+g[d-4>>2];r=+g[d>>2];s=+g[d+4>>2];t=+g[d+8>>2];u=+g[d+12>>2];v=+g[d+16>>2];w=+g[d+20>>2];x=h*+g[f+896>>2]+i*+g[f+640>>2]+j*+g[f+384>>2]+k*+g[f+128>>2]+l*+g[f-128>>2]+m*+g[f-384>>2]+n*+g[f-640>>2]+o*+g[f-896>>2]-p*+g[c+1024>>2]-q*+g[c+768>>2]-r*+g[c+512>>2]-s*+g[c+256>>2]-t*+g[c>>2]-u*+g[c-256>>2]-v*+g[c-512>>2]-w*+g[c-768>>2];y=(h*+g[c-896>>2]+i*+g[c-640>>2]+j*+g[c-384>>2]+k*+g[c-128>>2]+l*+g[c+128>>2]+m*+g[c+384>>2]+n*+g[c+640>>2]+o*+g[c+896>>2]+p*+g[f-1024>>2]+q*+g[f-768>>2]+r*+g[f-512>>2]+s*+g[f-256>>2]+t*+g[f>>2]+u*+g[f+256>>2]+v*+g[f+512>>2]+w*+g[f+768>>2])*+g[d+24>>2];z=e<<1;g[b+(z+30<<2)>>2]=x+y;g[b+(z+31<<2)>>2]=+g[d+28>>2]*(x-y);z=e+1|0;if((z|0)<0){c=c+4|0;d=d+72|0;e=z;f=f-4|0}else{break}}y=+g[a-124>>2]*10612.802734375+(+g[a-252>>2]- +g[a+4>>2])*5302.158203125+(+g[a-380>>2]+ +g[a+132>>2])*929.7763061523438+(+g[a-508>>2]- +g[a+260>>2])*728.8010864257812+(+g[a-636>>2]+ +g[a+388>>2])*288.09765625+(+g[a-764>>2]- +g[a+516>>2])*64.91738891601562+(+g[a-892>>2]+ +g[a+644>>2])*30.125003814697266+(+g[a-1020>>2]- +g[a+772>>2])*4.101456642150879;x=+g[a-188>>2]*12804.7978515625+ +g[a-444>>2]*1945.5516357421875+ +g[a-700>>2]*313.42449951171875+ +g[a-956>>2]*20.801593780517578- +g[a+68>>2]*1995.1556396484375- +g[a+324>>2]*9.000839233398438- +g[a+580>>2]*-29.202180862426758- +g[a+836>>2];w=x-y;v=x+y;a=b+56|0;y=+g[a>>2];f=b+60|0;x=+g[f>>2]-y;u=y+v;t=w+x;s=w-x;x=v-y;e=b+112|0;y=+g[e>>2];v=+g[b>>2];w=y+v;r=(y-v)*1.9615705013275146;d=b+116|0;v=+g[d>>2];c=b+4|0;y=+g[c>>2];q=v+y;p=(v-y)*1.9615705013275146;z=b+104|0;y=+g[z>>2];A=b+8|0;v=+g[A>>2];o=y+v;n=(y-v)*1.8477590084075928;B=b+108|0;v=+g[B>>2];C=b+12|0;y=+g[C>>2];m=v+y;l=(v-y)*1.8477590084075928;D=b+96|0;y=+g[D>>2];E=b+16|0;v=+g[E>>2];k=y+v;j=(y-v)*1.662939190864563;F=b+100|0;v=+g[F>>2];G=b+20|0;y=+g[G>>2];i=v+y;h=(v-y)*1.662939190864563;H=b+88|0;y=+g[H>>2];I=b+24|0;v=+g[I>>2];J=y+v;K=b+92|0;L=+g[K>>2];M=b+28|0;N=+g[M>>2];O=L+N;P=O-J;Q=(y-v)*1.4142135623730951-P;v=(L-N)*1.4142135623730951-O-Q;O=u-J;N=J+u;u=t-P;J=P+t;t=s-Q;P=Q+s;s=x-v;Q=v+x;R=b+80|0;x=+g[R>>2];S=b+32|0;v=+g[S>>2];L=x+v;y=(x-v)*1.111140489578247;T=b+84|0;v=+g[T>>2];U=b+36|0;x=+g[U>>2];V=v+x;W=(v-x)*1.111140489578247;X=b+72|0;x=+g[X>>2];Y=b+40|0;v=+g[Y>>2];Z=x+v;_=(x-v)*.7653668522834778;$=b+76|0;v=+g[$>>2];aa=b+44|0;x=+g[aa>>2];ab=v+x;ac=(v-x)*.7653668522834778;ad=b+64|0;x=+g[ad>>2];ae=b+48|0;v=+g[ae>>2];af=x+v;ag=(x-v)*.39018064737319946;ah=b+68|0;v=+g[ah>>2];ai=b+52|0;x=+g[ai>>2];aj=v+x;ak=(v-x)*.39018064737319946;x=y+j;v=(j-y)*.7653668522834778;y=W+h;j=(h-W)*.7653668522834778;W=k+L;h=(k-L)*.7653668522834778;L=i+V;k=(i-V)*.7653668522834778;V=w+af;i=(w-af)*1.8477590084075928;af=q+aj;w=(q-aj)*1.8477590084075928;aj=ag+r;q=(ag-r)*1.8477590084075928;r=ak+p;ag=(p-ak)*1.8477590084075928;ak=o+Z;p=m+ab;al=_+n;am=ac+l;an=am-p;ao=p-ak;p=N-ak;ap=ak+N;N=(m-ab)*1.4142135623730951-an;ab=al-ao;m=J-ao;ak=ao+J;J=an-ab;an=P-ab;ao=ab+P;P=(o-Z)*1.4142135623730951-J;Z=Q-J;o=J+Q;Q=N-P;J=s-P;ab=P+s;s=(n-_)*1.4142135623730951-al-Q;al=t-Q;_=Q+t;t=(l-ac)*1.4142135623730951-am-N-s;N=u-s;am=s+u;u=O-t;s=t+O;O=V+W;t=af+L;ac=aj+x;l=r+y;Q=h+i;n=k+w;P=j+ag;aq=v-q;ar=aq-ac;as=(aj-x)*1.4142135623730951-ar;x=P-l;aj=(r-y)*1.4142135623730951-x;y=l-t;l=n-y;r=x-l;x=(af-L)*1.4142135623730951-r;L=aj-x;af=(k-w)*-1.4142135623730951-n-L;n=t-O;t=ac-n;ac=y-t;y=Q-ac;w=l-y;l=ar-w;ar=r-l;r=(V-W)*1.4142135623730951-ar;W=x-r;x=as-W;V=L-x;L=(h-i)*-1.4142135623730951-Q-V;Q=af-L;i=(v+q)*-1.4142135623730951-aq-as-Q;as=(j-ag)*-1.4142135623730951-P-aj-af-i;g[b>>2]=O+ap;g[b+124>>2]=ap-O;g[c>>2]=n+ak;g[b+120>>2]=ak-n;g[ad>>2]=t+ao;g[f>>2]=ao-t;g[ah>>2]=ac+o;g[a>>2]=o-ac;g[S>>2]=y+ab;g[K>>2]=ab-y;g[U>>2]=w+_;g[H>>2]=_-w;g[D>>2]=l+am;g[M>>2]=am-l;g[F>>2]=ar+s;g[I>>2]=s-ar;g[E>>2]=r+u;g[B>>2]=u-r;g[G>>2]=W+N;g[z>>2]=N-W;g[R>>2]=x+al;g[aa>>2]=al-x;g[T>>2]=V+J;g[Y>>2]=J-V;g[ae>>2]=L+Z;g[$>>2]=Z-L;g[ai>>2]=Q+an;g[X>>2]=an-Q;g[e>>2]=i+m;g[C>>2]=m-i;g[d>>2]=as+p;g[A>>2]=p-as;return}function bC(b,e,f,j,l,m,n,o,p){b=b|0;e=e|0;f=f|0;j=j|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,Q=0,S=0,T=0,U=0,V=0.0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0.0,aL=0,aM=0.0,aN=0.0,aO=0,aP=0.0,aQ=0.0,aR=0.0,aS=0.0,aT=0.0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0.0,a$=0.0,a0=0.0,a1=0,a2=0.0,a3=0.0,a4=0.0,a5=0.0,a6=0,a7=0.0,a8=0,a9=0,ba=0.0,bb=0.0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0.0,bi=0.0,bj=0,bk=0.0,bl=0.0,bm=0.0,bp=0.0,bq=0.0,br=0.0,bs=0,bt=0,bu=0,bv=0.0,bw=0.0,bx=0.0,by=0.0,bz=0,bA=0.0,bB=0.0,bC=0,bF=0.0,bG=0,bH=0,bI=0.0,bJ=0,bK=0,bL=0.0,bM=0,bN=0,bO=0,bP=0.0,bQ=0.0,bR=0,bS=0.0,bV=0.0,bW=0.0,bX=0,bY=0,bZ=0,b_=0.0,b$=0.0,b0=0.0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0.0,b9=0.0,ca=0.0,cb=0.0,cc=0.0;q=i;i=i+26584|0;r=q|0;s=q+64|0;t=q+320|0;u=q+576|0;v=q+648|0;w=q+704|0;x=q+760|0;y=q+5368|0;z=q+5416|0;A=q+5464|0;B=q+5480|0;C=q+6456|0;D=q+8512|0;E=q+10064|0;F=q+18256|0;G=q+24400|0;H=q+25424|0;I=q+26448|0;J=q+26496|0;K=q+26560|0;L=q+26568|0;M=L;N=b+85800|0;O=c[N>>2]|0;Q=b+140|0;S=(c[Q>>2]|0)==0;if(S){T=0}else{T=c[b+85804>>2]|0}U=b+192|0;if(+g[U>>2]>0.0){V=+g[b+200>>2]*+g[(c[b+85796>>2]|0)+8>>2]}else{V=1.0}W=G|0;bT(J|0,0,64);X=b+180|0;Y=(c[X>>2]|0)==1;if(Y){Z=4}else{Z=c[b+72>>2]|0}_=B;$=b+25660|0;bU(_|0,$|0,976)|0;$=K|0;_=A;if(S){aa=0}else{aa=c[b+85804>>2]|0}S=b+72|0;ab=c[S>>2]|0;ac=Y?4:ab;bT(x|0,0,4608);if((ab|0)>0){Y=(ac|0)>2;ad=0;do{ae=c[e+(ad<<2)>>2]|0;af=0;do{g[x+(ad*2304&-1)+(af<<2)>>2]=+g[ae+(af+407<<2)>>2]+(+g[ae+(af+397<<2)>>2]+ +g[ae+(af+418<<2)>>2])*-1.7303260184043527e-17+(+g[ae+(af+399<<2)>>2]+ +g[ae+(af+416<<2)>>2])*-1.3495279640235235e-17+(+g[ae+(af+401<<2)>>2]+ +g[ae+(af+414<<2)>>2])*-6.732779685849225e-17+(+g[ae+(af+403<<2)>>2]+ +g[ae+(af+412<<2)>>2])*-3.0835000291318875e-17+(+g[ae+(af+405<<2)>>2]+ +g[ae+(af+410<<2)>>2])*-1.1044240253100168e-16+((+g[ae+(af+398<<2)>>2]+ +g[ae+(af+417<<2)>>2])*-.017031719908118248+0.0+(+g[ae+(af+400<<2)>>2]+ +g[ae+(af+415<<2)>>2])*.04180720075964928+(+g[ae+(af+402<<2)>>2]+ +g[ae+(af+413<<2)>>2])*-.08763240277767181+(+g[ae+(af+404<<2)>>2]+ +g[ae+(af+411<<2)>>2])*.1863476037979126+(+g[ae+(af+406<<2)>>2]+ +g[ae+(af+409<<2)>>2])*-.6276379823684692);af=af+1|0;}while((af|0)<576);af=j+(f*976&-1)+(ad*488&-1)+244|0;ae=b+26636+(ad*244&-1)|0;bU(af|0,ae|0,244)|0;ae=j+(f*976&-1)+(ad*488&-1)|0;af=b+25660+(ad*244&-1)|0;bU(ae|0,af|0,244)|0;if(Y){af=ad+2|0;ae=l+(f*976&-1)+(ad*488&-1)+244|0;ag=b+26636+(af*244&-1)|0;bU(ae|0,ag|0,244)|0;ag=l+(f*976&-1)+(ad*488&-1)|0;ae=b+25660+(af*244&-1)|0;bU(ag|0,ae|0,244)|0}ad=ad+1|0;}while((ad|0)<(ab|0))}if((ac|0)>0){ab=A|0;ad=(aa|0)==0;Y=K+4|0;ae=y|0;ag=z|0;af=z+4|0;ah=y+4|0;ai=z+8|0;aj=y+8|0;ak=z+12|0;al=z+16|0;am=z+20|0;an=z+24|0;ao=z+28|0;ap=z+32|0;aq=z+36|0;ar=z+40|0;as=z+44|0;at=A+4|0;au=A+8|0;av=A+12|0;aw=y+12|0;ax=y+16|0;ay=y+20|0;az=y+24|0;aA=y+28|0;aB=y+32|0;aC=y+36|0;aD=y+40|0;aE=y+44|0;aF=0;do{bT(_|0,0,16);aG=x+((aF&1)*2304&-1)|0;if((aF|0)==2){aH=576;aI=0;while(1){aJ=x+(aI<<2)|0;aK=+g[aJ>>2];aL=x+2304+(aI<<2)|0;aM=+g[aL>>2];g[aJ>>2]=aK+aM;g[aL>>2]=aK-aM;aL=aH-1|0;if((aL|0)>0){aH=aL;aI=aI+1|0}else{break}}}aM=+g[b+27636+(aF*36&-1)+24>>2];g[ag>>2]=aM;g[ae>>2]=aM/+g[b+27636+(aF*36&-1)+16>>2];aK=+g[b+27636+(aF*36&-1)+28>>2];g[af>>2]=aK;g[ah>>2]=aK/+g[b+27636+(aF*36&-1)+20>>2];aN=+g[b+27636+(aF*36&-1)+32>>2];g[ai>>2]=aN;g[aj>>2]=aN/aM;g[ab>>2]=aM+0.0+aK+aN;aI=aG;aH=0;while(1){aL=aI+256|0;aJ=aI;aN=1.0;do{aK=+P(+(+g[aJ>>2]));aN=aN<aK?aK:aN;aJ=aJ+4|0;}while(aJ>>>0<aL>>>0);aL=aH+3|0;g[z+(aL<<2)>>2]=aN;g[b+27636+(aF*36&-1)+(aH<<2)>>2]=aN;aO=A+(((aH|0)/3&-1)+1<<2)|0;g[aO>>2]=aN+ +g[aO>>2];aO=aH+1|0;aK=+g[z+(aO<<2)>>2];do{if(aN>aK){aP=aN/aK}else{aM=aN*10.0;if(aK<=aM){aP=0.0;break}aP=aK/aM}}while(0);g[y+(aL<<2)>>2]=aP;if((aO|0)<9){aI=aJ;aH=aO}else{break}}aK=+g[al>>2];aN=+g[am>>2];aM=+g[ak>>2]+aK+aN;do{if(aN*6.0<aM){if(aK*6.0>=aM){aQ=.5;break}aQ=.25}else{aQ=1.0}}while(0);g[I+(aF*12&-1)>>2]=aQ;aM=+g[ao>>2];aK=+g[ap>>2];aN=+g[an>>2]+aM+aK;do{if(aK*6.0<aN){if(aM*6.0>=aN){aR=.5;break}aR=.25}else{aR=1.0}}while(0);g[I+(aF*12&-1)+4>>2]=aR;aN=+g[ar>>2];aM=+g[as>>2];aK=+g[aq>>2]+aN+aM;do{if(aM*6.0<aK){if(aN*6.0>=aK){aS=.5;break}aS=.25}else{aS=1.0}}while(0);g[I+(aF*12&-1)+8>>2]=aS;if(!ad){aK=+g[ae>>2];aN=+g[ah>>2];aM=aK<aN?aN:aK;aK=+g[aj>>2];aN=aM<aK?aK:aM;aM=+g[aw>>2];aK=aN<aM?aM:aN;aN=+g[ax>>2];aM=aK<aN?aN:aK;aK=+g[ay>>2];aN=aM<aK?aK:aM;aM=+g[az>>2];aK=aN<aM?aM:aN;aN=+g[aA>>2];aM=aK<aN?aN:aK;aK=+g[aB>>2];aN=aM<aK?aK:aM;aM=+g[aC>>2];aK=aN<aM?aM:aN;aN=+g[aD>>2];aM=aK<aN?aN:aK;aK=+g[aE>>2];aH=aa+197112+(aF<<3)|0;h[aa+197144+(f<<5)+(aF<<3)>>3]=+h[aH>>3];h[aH>>3]=aM<aK?aK:aM}aM=+g[(c[N>>2]|0)+6480+(aF<<2)>>2];aH=0;do{aI=J+(aF<<4)+(((aH|0)/3&-1)<<2)|0;do{if((c[aI>>2]|0)==0){if(+g[y+(aH<<2)>>2]<=aM){break}c[aI>>2]=((aH|0)%3&-1)+1}}while(0);aH=aH+1|0;}while((aH|0)<12);aH=J+(aF<<4)|0;aM=+g[ab>>2];aK=+g[at>>2];aN=aK*1.7000000476837158;if((aM>aK?aM:aK)<4.0e4&aM<aN&aK<aM*1.7000000476837158){aI=J+(aF<<4)+4|0;if((c[aH>>2]|0)<=(c[aI>>2]|0)){c[aH>>2]=0}c[aI>>2]=0}aM=+g[au>>2];aT=aM*1.7000000476837158;if((aK>aM?aK:aM)<4.0e4&aK<aT&aM<aN){c[J+(aF<<4)+8>>2]=0}aN=+g[av>>2];if((aM>aN?aM:aN)<4.0e4&aM<aN*1.7000000476837158&aN<aT){c[J+(aF<<4)+12>>2]=0}aI=c[aH>>2]|0;aO=c[b+27780+(aF<<2)>>2]|0;if((aI|0)>(aO|0)){aU=aI}else{c[aH>>2]=0;aU=0}aH=J+(aF<<4)+4|0;aI=c[aH>>2]|0;if((aO|0)==3){aV=905}else{if((aI+aU+(c[J+(aF<<4)+8>>2]|0)|0)==(-(c[J+(aF<<4)+12>>2]|0)|0)){aW=1}else{aV=905}}do{if((aV|0)==905){aV=0;do{if((aI|0)==0){aX=0}else{if((aU|0)==0){aX=aI;break}c[aH>>2]=0;aX=0}}while(0);aO=J+(aF<<4)+8|0;if((c[aO>>2]|0)==0){aW=0;break}if((aX|0)!=0){c[aO>>2]=0;aW=0;break}aO=J+(aF<<4)+12|0;if((c[aO>>2]|0)==0){aW=0;break}c[aO>>2]=0;aW=0}}while(0);do{if((aF|0)<2){c[K+(aF<<2)>>2]=aW}else{if((aW|0)!=0){break}c[Y>>2]=0;c[$>>2]=0}}while(0);g[o+(aF<<2)>>2]=+g[b+27620+(aF<<2)>>2];aF=aF+1|0;}while((aF|0)<(ac|0))}ac=c[b+184>>2]|0;do{if((ac|0)==1){aF=K+4|0;if((c[$>>2]|0)!=0){if((c[aF>>2]|0)!=0){break}}c[aF>>2]=0;c[$>>2]=0}}while(0);aF=c[S>>2]|0;if((aF|0)>0){o=0;do{if((ac|0)==2){c[K+(o<<2)>>2]=1}else if((ac|0)==3){c[K+(o<<2)>>2]=0}o=o+1|0;}while((o|0)<(aF|0))}aF=(Z|0)>0;if(aF){o=C|0;ac=b+85796|0;Y=u|0;aW=s|0;aX=t|0;aU=s+4|0;av=b+84908|0;au=t+4|0;at=b+85804|0;ab=0;do{y=ab&1;aa=E+(y<<12)|0;if((c[Q>>2]|0)==0){aY=0}else{aY=c[at>>2]|0}aE=(ab|0)<2;do{if(aE){bo(b,aa|0,ab,e)}else{if((ab|0)!=2){break}aD=y+1|0;aC=1023;while(1){aB=E+(y<<12)+(aC<<2)|0;aS=+g[aB>>2];aA=E+(aD<<12)+(aC<<2)|0;aR=+g[aA>>2];g[aB>>2]=(aS+aR)*.7071067690849304;g[aA>>2]=(aS-aR)*.7071067690849304;if((aC|0)>0){aC=aC-1|0}else{break}}}}while(0);aR=+g[aa>>2];g[o>>2]=aR*aR;aC=511;while(1){aD=512-aC|0;aR=+g[E+(y<<12)+(aD<<2)>>2];aS=+g[E+(y<<12)+(aC+512<<2)>>2];g[C+(aD<<2)>>2]=(aR*aR+aS*aS)*.5;if((aC|0)>0){aC=aC-1|0}else{aZ=11;a_=0.0;break}}do{a_=a_+ +g[C+(aZ<<2)>>2];aZ=aZ+1|0;}while((aZ|0)<513);g[b+27620+(ab<<2)>>2]=a_;if((aY|0)!=0){aC=0;do{aa=aY+90936+(ab<<13)+(aC<<3)|0;h[aY+123704+(f<<15)+(ab<<13)+(aC<<3)>>3]=+h[aa>>3];h[aa>>3]=+g[C+(aC<<2)>>2];aC=aC+1|0;}while((aC|0)<513)}if(aE){aC=b+27612+(ab<<2)|0;g[b+27804+(f<<3)+(ab<<2)>>2]=+g[aC>>2];aa=c[ac>>2]|0;aD=0;aS=0.0;do{aS=aS+ +g[C+(aD<<2)>>2]*+g[aa+724+(aD<<2)>>2];aD=aD+1|0;}while((aD|0)<512);g[aC>>2]=aS*8.974871343596633e-12}aD=c[N>>2]|0;aa=aD+2148|0;aE=c[aa>>2]|0;aA=(aE|0)>0;if(aA){aB=0;az=0;while(1){ay=c[aD+1716+(az<<2)>>2]|0;if((ay|0)>0){ax=aB;aR=0.0;aQ=0.0;aw=0;while(1){aP=+g[C+(ax<<2)>>2];a$=aR+aP;a0=aQ<aP?aP:aQ;aj=aw+1|0;if((aj|0)<(ay|0)){ax=ax+1|0;aR=a$;aQ=a0;aw=aj}else{break}}a1=((ay|0)>1?ay:1)+aB|0;a2=a$;a3=a0}else{a1=aB;a2=0.0;a3=0.0}g[G+(ab<<8)+(az<<2)>>2]=a2;g[s+(az<<2)>>2]=a3;g[t+(az<<2)>>2]=a2*+g[aD+512+(az<<2)>>2];aw=az+1|0;if((aw|0)<(aE|0)){aB=a1;az=aw}else{break}}a4=+g[aX>>2];a5=+g[au>>2]}else{a4=0.0;a5=0.0}aS=a5+a4;if(aS>0.0){aQ=+g[aW>>2];aR=+g[aU>>2];az=~~(((aQ<aR?aR:aQ)*2.0-aS)*20.0/(aS*+((c[aD+1716>>2]|0)-1+(c[aD+1720>>2]|0)|0)));a6=(az|0)>8?8:az&255}else{a6=0}a[Y]=a6;az=aE-1|0;aS=+g[au>>2];aQ=a4+aS;if((az|0)>1){aB=(az|0)>2;aC=1;aw=0;aR=aQ;aP=aS;while(1){ax=aC+1|0;aS=+g[t+(ax<<2)>>2];aT=aR+aS;if(aT>0.0){aN=+g[s+(aw<<2)>>2];aM=+g[s+(aC<<2)>>2];aK=aN<aM?aM:aN;aN=+g[s+(ax<<2)>>2];aj=~~(((aK<aN?aN:aK)*3.0-aT)*20.0/(aT*+((c[aD+1716+(aw<<2)>>2]|0)-1+(c[aD+1716+(aC<<2)>>2]|0)+(c[aD+1716+(ax<<2)>>2]|0)|0)));a[u+aC|0]=(aj|0)>8?8:aj&255}else{a[u+aC|0]=0}a7=aP+aS;if((ax|0)<(az|0)){aw=aC;aC=ax;aR=a7;aP=aS}else{break}}aC=aB?az:2;a8=aC;a9=aC-1|0;ba=a7}else{a8=1;a9=0;ba=aQ}if(ba>0.0){aP=+g[s+(a9<<2)>>2];aR=+g[s+(a8<<2)>>2];aC=~~(((aP<aR?aR:aP)*2.0-ba)*20.0/(ba*+((c[aD+1716+(a9<<2)>>2]|0)-1+(c[aD+1716+(a8<<2)>>2]|0)|0)));a[u+a8|0]=(aC|0)>8?8:aC&255}else{a[u+a8|0]=0}if(aA){aC=aD+2156|0;aw=b+27796+(y<<2)|0;aE=0;ax=0;while(1){aP=+g[aD+(aE<<2)>>2]*+g[av>>2];aj=c[aD+1204+(aE<<3)>>2]|0;ah=c[aD+1204+(aE<<3)+4>>2]|0;ae=c[5232+((d[u+aE|0]|0)<<2)>>2]|0;ad=d[u+aj|0]|0;aq=c[aC>>2]|0;aR=+g[aq+(ax<<2)>>2]*+g[G+(ab<<8)+(aj<<2)>>2]*+g[5272+(ad<<2)>>2];as=ax+1|0;ar=aj+1|0;if((ar|0)>(ah|0)){bb=aR;bc=ad;bd=2;be=as}else{aS=+g[11200];aT=+g[11202];aK=aR;aj=ad;ad=1;an=as;as=ar;while(1){ar=d[u+as|0]|0;bf=ar+aj|0;bg=ad+1|0;aR=+g[aq+(an<<2)>>2]*+g[G+(ab<<8)+(as<<2)>>2]*+g[5272+(ar<<2)>>2];ar=as-aE|0;aN=aK<0.0?0.0:aK;aM=aR<0.0?0.0:aR;do{if(aN>0.0){if(aM<=0.0){bh=aN;break}ap=aM>aN;if(ap){bi=aM/aN}else{bi=aN/aM}if((((ar|0)>-1?ar:-ar|0)|0)>(ae|0)){if(bi<aS){bh=aN+aM;break}else{bh=ap?aM:aN;break}}else{if(bi<aT){ap=(g[k>>2]=bi,c[k>>2]|0);aR=+(ap&16383|0)*6103515625.0e-14;ao=ap>>>14&511;bh=(aN+aM)*+g[5192+(~~((+((ap>>>23&255)-127|0)+((1.0-aR)*+g[44816+(ao<<2)>>2]+aR*+g[44816+(ao+1<<2)>>2]))*4.816479930623698)<<2)>>2];break}else{bh=aN+aM;break}}}else{bh=aM}}while(0);bj=an+1|0;ar=as+1|0;if((ar|0)>(ah|0)){break}else{aK=bh;aj=bf;ad=bg;an=bj;as=ar}}bb=bh;bc=bf;bd=bg<<1;be=bj}aK=+g[5272+(((bc<<1|1|0)/(bd|0)&-1)<<2)>>2]*.5;aT=bb*aK;as=c[aw>>2]|0;do{if((as|0)==2){aS=+g[b+21564+(ab<<8)+(aE<<2)>>2];aM=aS*2.0;if(aM>0.0){aN=aT<aM?aT:aM;g[H+(ab<<8)+(aE<<2)>>2]=aN;bk=aS;bl=aN;break}else{aN=aT;aM=+g[G+(ab<<8)+(aE<<2)>>2]*.3;aR=aN<aM?aN:aM;g[H+(ab<<8)+(aE<<2)>>2]=aR;bk=aS;bl=aR;break}}else{aR=+g[b+22588+(ab<<8)+(aE<<2)>>2]*16.0;aS=+g[b+21564+(ab<<8)+(aE<<2)>>2];aM=aS*2.0;aN=aR>0.0?aR:aT;aR=aM>0.0?aM:aT;if((as|0)==0){bm=aR<aN?aR:aN}else{bm=aR}aR=aT<bm?aT:bm;g[H+(ab<<8)+(aE<<2)>>2]=aR;bk=aS;bl=aR}}while(0);g[b+22588+(ab<<8)+(aE<<2)>>2]=bk;g[b+21564+(ab<<8)+(aE<<2)>>2]=aT;aR=aK*+g[s+(aE<<2)>>2]*+g[aD+256+(aE<<2)>>2];as=H+(ab<<8)+(aE<<2)|0;if(bl>aR){g[as>>2]=aR;bp=aR}else{bp=bl}if(aP>1.0){aR=aP*bp;g[as>>2]=aR;bq=aR}else{bq=bp}aR=+g[G+(ab<<8)+(aE<<2)>>2];if(bq>aR){g[as>>2]=aR;br=aR}else{br=bq}if(aP<1.0){g[as>>2]=aP*br}bs=aE+1|0;if((bs|0)<(c[aa>>2]|0)){aE=bs;ax=be}else{break}}if((bs|0)<64){bt=bs;aV=976}}else{bt=0;aV=976}if((aV|0)==976){aV=0;ax=bt+1|0;aE=((ax|0)>64?ax:64)-bt<<2;bT(G+(ab<<8)+(bt<<2)|0,0,aE|0);bT(H+(ab<<8)+(bt<<2)|0,0,aE|0)}ab=ab+1|0;}while((ab|0)<(Z|0))}do{if((c[X>>2]|0)==1){if(((c[K+4>>2]|0)+(c[$>>2]|0)|0)!=2){break}bD(W,H|0,O+768|0,(c[b+85796>>2]|0)+212|0,V,+g[U>>2],c[O+2148>>2]|0)}}while(0);ab=v|0;bt=w|0;if(aF){bs=0;do{be=G+(bs<<8)|0;bd=H+(bs<<8)|0;bE(c[N>>2]|0,be,bd,b+26636+(bs*244&-1)|0,b+25660+(bs*244&-1)|0);bE((c[N>>2]|0)+4320|0,be,bd,ab,bt);bd=0;do{br=+g[v+(bd<<2)>>2];bq=+g[w+(bd<<2)>>2]*.015625;g[b+26636+(bs*244&-1)+88+(bd*12&-1)>>2]=br;g[b+25660+(bs*244&-1)+88+(bd*12&-1)>>2]=bq;g[b+26636+(bs*244&-1)+88+(bd*12&-1)+4>>2]=br;g[b+25660+(bs*244&-1)+88+(bd*12&-1)+4>>2]=bq;g[b+26636+(bs*244&-1)+88+(bd*12&-1)+8>>2]=br;g[b+25660+(bs*244&-1)+88+(bd*12&-1)+8>>2]=bq;bd=bd+1|0;}while((bd|0)<13);bs=bs+1|0;}while((bs|0)<(Z|0))}bs=c[$>>2]|0;$=-(c[K+4>>2]|0)|0;bd=H|0;be=O+2928|0;bc=b+85796|0;bj=O+4308|0;O=(c[(c[N>>2]|0)+6500>>2]|0)==0;bg=v+4|0;bf=w+4|0;u=v+8|0;av=w+8|0;a8=v+12|0;a9=w+12|0;au=v+16|0;a6=w+16|0;Y=v+20|0;aU=w+20|0;aW=v+24|0;aX=w+24|0;a1=v+28|0;C=w+28|0;ac=v+32|0;aY=w+32|0;aZ=v+36|0;E=w+36|0;o=v+40|0;at=w+40|0;Q=v+44|0;aE=w+44|0;ax=v+48|0;v=w+48|0;w=s;aa=t;aD=r|0;aw=s|0;aC=s+4|0;y=b+84908|0;aA=t|0;az=t+4|0;aB=0;do{if(aF){as=(aB|0)==0;an=D+(aB*516&-1)|0;ad=0;do{aj=ad&1;do{if((c[K+(aj<<2)>>2]|0)!=0&O){if(!as){break}ah=c[(c[N>>2]|0)+4308>>2]|0;if((ah|0)>0){bu=0}else{break}do{g[b+24636+(ad<<8)+(bu<<2)>>2]=+g[b+23612+(ad<<8)+(bu<<2)>>2];bu=bu+1|0;}while((bu|0)<(ah|0))}else{if(as&(ad|0)<2){bn(b,F+(aj*3072&-1)|0,ad,e)}if((ad|0)==2){ah=aj+1|0;ae=255;while(1){aq=F+(aj*3072&-1)+(aB<<10)+(ae<<2)|0;bq=+g[aq>>2];ay=F+(ah*3072&-1)+(aB<<10)+(ae<<2)|0;br=+g[ay>>2];g[aq>>2]=(bq+br)*.7071067690849304;g[ay>>2]=(bq-br)*.7071067690849304;if((ae|0)>0){ae=ae-1|0}else{break}}}br=+g[F+(aj*3072&-1)+(aB<<10)>>2];g[an>>2]=br*br;ae=127;while(1){ah=128-ae|0;br=+g[F+(aj*3072&-1)+(aB<<10)+(ah<<2)>>2];bq=+g[F+(aj*3072&-1)+(aB<<10)+(ae+128<<2)>>2];g[D+(aB*516&-1)+(ah<<2)>>2]=(br*br+bq*bq)*.5;if((ae|0)>0){ae=ae-1|0}else{break}}ae=c[N>>2]|0;bT(w|0,0,256);bT(aa|0,0,256);ah=ae+4308|0;ay=c[ah>>2]|0;aq=(ay|0)>0;if(aq){ar=0;ao=0;while(1){ap=c[ae+3876+(ar<<2)>>2]|0;if((ap|0)>0){bq=0.0;br=0.0;ak=ao;am=0;while(1){bp=+g[D+(aB*516&-1)+(ak<<2)>>2];bv=br+bp;bw=bq<bp?bp:bq;al=am+1|0;if((al|0)<(ap|0)){bq=bw;br=bv;ak=ak+1|0;am=al}else{break}}bx=bw;by=bv;bz=ap+ao|0}else{bx=0.0;by=0.0;bz=ao}g[G+(ad<<8)+(ar<<2)>>2]=by;g[s+(ar<<2)>>2]=bx;g[t+(ar<<2)>>2]=by*+g[ae+2672+(ar<<2)>>2];am=ar+1|0;if((am|0)<(ay|0)){ar=am;ao=bz}else{break}}bA=+g[aA>>2];bB=+g[az>>2]}else{bA=0.0;bB=0.0}br=bB+bA;if(br>0.0){bq=+g[aw>>2];bp=+g[aC>>2];ao=~~(((bq<bp?bp:bq)*2.0-br)*20.0/(br*+((c[ae+3876>>2]|0)-1+(c[ae+3880>>2]|0)|0)));bC=(ao|0)>8?8:ao&255}else{bC=0}a[aD]=bC;ao=ay-1|0;br=bA+bB;if((ao|0)>1){ar=(ao|0)>2;am=1;ak=0;bq=br;bp=bB;while(1){al=am+1|0;bl=+g[t+(al<<2)>>2];bk=bq+bl;if(bk>0.0){bm=+g[s+(ak<<2)>>2];bb=+g[s+(am<<2)>>2];bh=bm<bb?bb:bm;bm=+g[s+(al<<2)>>2];z=~~(((bh<bm?bm:bh)*3.0-bk)*20.0/(bk*+((c[ae+3876+(ak<<2)>>2]|0)-1+(c[ae+3876+(am<<2)>>2]|0)+(c[ae+3876+(al<<2)>>2]|0)|0)));a[r+am|0]=(z|0)>8?8:z&255}else{a[r+am|0]=0}bF=bp+bl;if((al|0)<(ao|0)){ak=am;am=al;bq=bF;bp=bl}else{break}}am=ar?ao:2;bG=am;bH=am-1|0;bI=bF}else{bG=1;bH=0;bI=br}if(bI>0.0){bp=+g[s+(bH<<2)>>2];bq=+g[s+(bG<<2)>>2];am=~~(((bp<bq?bq:bp)*2.0-bI)*20.0/(bI*+((c[ae+3876+(bH<<2)>>2]|0)-1+(c[ae+3876+(bG<<2)>>2]|0)|0)));a[r+bG|0]=(am|0)>8?8:am&255}else{a[r+bG|0]=0}if(aq){am=ae+4316|0;ak=0;ay=0;while(1){al=c[ae+3364+(ak<<3)>>2]|0;z=c[ae+3364+(ak<<3)+4>>2]|0;A=c[5232+((d[r+ak|0]|0)<<2)>>2]|0;bp=+g[ae+2160+(ak<<2)>>2]*+g[y>>2];ai=d[r+al|0]|0;af=c[am>>2]|0;bq=+g[af+(ay<<2)>>2]*+g[G+(ad<<8)+(al<<2)>>2]*+g[5272+(ai<<2)>>2];ag=ay+1|0;x=al+1|0;if((x|0)>(z|0)){bJ=ai;bK=2;bL=bq;bM=ag}else{bl=+g[11200];bk=+g[11202];al=ai;ai=1;bh=bq;_=ag;ag=x;while(1){x=d[r+ag|0]|0;bN=x+al|0;bO=ai+1|0;bq=+g[af+(_<<2)>>2]*+g[G+(ad<<8)+(ag<<2)>>2]*+g[5272+(x<<2)>>2];x=ag-ak|0;bm=bh<0.0?0.0:bh;bb=bq<0.0?0.0:bq;do{if(bm>0.0){if(bb<=0.0){bP=bm;break}aH=bb>bm;if(aH){bQ=bb/bm}else{bQ=bm/bb}if((((x|0)>-1?x:-x|0)|0)>(A|0)){if(bQ<bl){bP=bm+bb;break}else{bP=aH?bb:bm;break}}else{if(bQ<bk){aH=(g[k>>2]=bQ,c[k>>2]|0);bq=+(aH&16383|0)*6103515625.0e-14;aI=aH>>>14&511;bP=(bm+bb)*+g[5192+(~~((+((aH>>>23&255)-127|0)+((1.0-bq)*+g[44816+(aI<<2)>>2]+bq*+g[44816+(aI+1<<2)>>2]))*4.816479930623698)<<2)>>2];break}else{bP=bm+bb;break}}}else{bP=bb}}while(0);bR=_+1|0;x=ag+1|0;if((x|0)>(z|0)){break}else{al=bN;ai=bO;bh=bP;_=bR;ag=x}}bJ=bN;bK=bO<<1;bL=bP;bM=bR}bh=+g[5272+(((bJ<<1|1|0)/(bK|0)&-1)<<2)>>2]*.5;bk=bL*bh;ag=H+(ad<<8)+(ak<<2)|0;g[ag>>2]=bk;_=b+23612+(ad<<8)+(ak<<2)|0;g[b+24636+(ad<<8)+(ak<<2)>>2]=+g[_>>2];g[_>>2]=bk;bl=bh*+g[s+(ak<<2)>>2]*+g[ae+2416+(ak<<2)>>2];if(bk>bl){g[ag>>2]=bl;bS=bl}else{bS=bk}if(bp>1.0){bk=bp*bS;g[ag>>2]=bk;bV=bk}else{bV=bS}bk=+g[G+(ad<<8)+(ak<<2)>>2];if(bV>bk){g[ag>>2]=bk;bW=bk}else{bW=bV}if(bp<1.0){g[ag>>2]=bp*bW}bX=ak+1|0;if((bX|0)<(c[ah>>2]|0)){ak=bX;ay=bM}else{break}}if((bX|0)<64){bY=bX}else{break}}else{bY=0}ay=bY+1|0;ak=((ay|0)>64?ay:64)-bY<<2;bT(G+(ad<<8)+(bY<<2)|0,0,ak|0);bT(H+(ad<<8)+(bY<<2)|0,0,ak|0)}}while(0);ad=ad+1|0;}while((ad|0)<(Z|0))}if(!((c[X>>2]|0)!=1|(bs|0)!=($|0))){bD(W,bd,be,(c[bc>>2]|0)+468|0,V,+g[U>>2],c[bj>>2]|0)}if(aF){ad=0;do{if(!((c[K+((ad&1)<<2)>>2]|0)!=0&O)){bE((c[N>>2]|0)+2160|0,G+(ad<<8)|0,H+(ad<<8)|0,ab,bt);g[b+26636+(ad*244&-1)+88+(aB<<2)>>2]=+g[ab>>2];g[b+25660+(ad*244&-1)+88+(aB<<2)>>2]=+g[bt>>2];g[b+26636+(ad*244&-1)+100+(aB<<2)>>2]=+g[bg>>2];g[b+25660+(ad*244&-1)+100+(aB<<2)>>2]=+g[bf>>2];g[b+26636+(ad*244&-1)+112+(aB<<2)>>2]=+g[u>>2];g[b+25660+(ad*244&-1)+112+(aB<<2)>>2]=+g[av>>2];g[b+26636+(ad*244&-1)+124+(aB<<2)>>2]=+g[a8>>2];g[b+25660+(ad*244&-1)+124+(aB<<2)>>2]=+g[a9>>2];g[b+26636+(ad*244&-1)+136+(aB<<2)>>2]=+g[au>>2];g[b+25660+(ad*244&-1)+136+(aB<<2)>>2]=+g[a6>>2];g[b+26636+(ad*244&-1)+148+(aB<<2)>>2]=+g[Y>>2];g[b+25660+(ad*244&-1)+148+(aB<<2)>>2]=+g[aU>>2];g[b+26636+(ad*244&-1)+160+(aB<<2)>>2]=+g[aW>>2];g[b+25660+(ad*244&-1)+160+(aB<<2)>>2]=+g[aX>>2];g[b+26636+(ad*244&-1)+172+(aB<<2)>>2]=+g[a1>>2];g[b+25660+(ad*244&-1)+172+(aB<<2)>>2]=+g[C>>2];g[b+26636+(ad*244&-1)+184+(aB<<2)>>2]=+g[ac>>2];g[b+25660+(ad*244&-1)+184+(aB<<2)>>2]=+g[aY>>2];g[b+26636+(ad*244&-1)+196+(aB<<2)>>2]=+g[aZ>>2];g[b+25660+(ad*244&-1)+196+(aB<<2)>>2]=+g[E>>2];g[b+26636+(ad*244&-1)+208+(aB<<2)>>2]=+g[o>>2];g[b+25660+(ad*244&-1)+208+(aB<<2)>>2]=+g[at>>2];g[b+26636+(ad*244&-1)+220+(aB<<2)>>2]=+g[Q>>2];g[b+25660+(ad*244&-1)+220+(aB<<2)>>2]=+g[aE>>2];g[b+26636+(ad*244&-1)+232+(aB<<2)>>2]=+g[ax>>2];g[b+25660+(ad*244&-1)+232+(aB<<2)>>2]=+g[v>>2]}ad=ad+1|0;}while((ad|0)<(Z|0))}aB=aB+1|0;}while((aB|0)<3);do{if(aF){aB=L|0;v=0;do{ax=b+27780+(v<<2)|0;aE=0;do{Q=b+25660+(v*244&-1)+88+(aE*12&-1)|0;at=B+(v*244&-1)+88+(aE*12&-1)+4|0;o=B+(v*244&-1)+88+(aE*12&-1)+8|0;E=0;do{V=+g[b+25660+(v*244&-1)+88+(aE*12&-1)+(E<<2)>>2]*.8;aZ=(E|0)>0;if(aZ){bZ=L+(E-1<<2)|0}else{bZ=o}bW=+g[bZ>>2];aY=c[J+(v<<4)+(E<<2)>>2]|0;if((aY|0)>1){aV=1095}else{if((c[J+(v<<4)+(E+1<<2)>>2]|0)==1){aV=1095}else{b_=V}}do{if((aV|0)==1095){aV=0;if(V<=0.0){b_=0.0;break}b_=V*+R(+(bW/V),.36000001430511475)}}while(0);bp=b_<V?b_:V;L1602:do{if((aY|0)==1){if(bp<=0.0){b$=0.0;break}b$=bp*+R(+(bW/bp),.18000000715255737)}else{if((E|0)==0){if((c[ax>>2]|0)==3){aV=1105}else{aV=1102}}else{aV=1102}do{if((aV|0)==1102){aV=0;if(!aZ){b$=V;break L1602}if((c[J+(v<<4)+(E-1<<2)>>2]|0)!=3){b$=V;break L1602}if((E|0)==0){aV=1105;break}else if((E|0)==1){b0=+g[o>>2];break}else if((E|0)==2){b0=+g[aB>>2];break}else{b0=bW;break}}}while(0);if((aV|0)==1105){aV=0;b0=+g[at>>2]}if(bp<=0.0){b$=0.0;break}b$=bp*+R(+(b0/bp),.18000000715255737)}}while(0);g[L+(E<<2)>>2]=+g[I+(v*12&-1)+(E<<2)>>2]*(b$<bp?b$:bp);E=E+1|0;}while((E|0)<3);c[Q>>2]=c[M>>2];c[Q+4>>2]=c[M+4>>2];c[Q+8>>2]=c[M+8>>2];aE=aE+1|0;}while((aE|0)<13);v=v+1|0;}while((v|0)<(Z|0));if(aF){b1=0}else{break}do{c[b+27780+(b1<<2)>>2]=c[J+(b1<<4)+8>>2];b1=b1+1|0;}while((b1|0)<(Z|0))}}while(0);b1=c[S>>2]|0;L1626:do{if((b1|0)>0){S=0;J=bs;while(1){M=b+27796+(S<<2)|0;I=c[M>>2]|0;do{if((J|0)==0){if((I|0)==0){c[M>>2]=1;b2=2;b3=1;break}else if((I|0)==3){c[M>>2]=2;b2=2;b3=2;break}else{b2=2;b3=I;break}}else{b2=(I|0)==2?3:0;b3=I}}while(0);c[p+(S<<2)>>2]=b3;c[M>>2]=b2;I=S+1|0;if((I|0)>=(b1|0)){break L1626}S=I;J=c[K+(I<<2)>>2]|0}}}while(0);if(!aF){i=q;return 0}aF=n-8|0;n=p+4|0;K=(T|0)==0;b1=0;do{if((b1|0)>1){if((c[p>>2]|0)==2){aV=1127}else{if((c[n>>2]|0)==2){aV=1127}else{b4=0}}if((aV|0)==1127){aV=0;b4=2}b5=l+(f*976&-1)+((b1-2|0)*488&-1)|0;b6=b4;b7=aF}else{b5=j+(f*976&-1)+(b1*488&-1)|0;b6=c[p+(b1<<2)>>2]|0;b7=m}b$=+g[y>>2];if((b6|0)==2){b2=0;b0=309.07000732421875;while(1){b3=44512+(b2<<2)|0;b_=+g[b5+88+(b2*12&-1)>>2];do{if(b_>0.0){bW=b$*b_;V=+g[b5+332+(b2*12&-1)>>2];if(V<=bW){b8=b0;break}bV=+g[b3>>2];if(V>bW*1.0e10){b8=b0+bV*23.02585092994046;break}else{b=(g[k>>2]=V/bW,c[k>>2]|0);bW=+(b&16383|0)*6103515625.0e-14;bs=b>>>14&511;b8=b0+bV*(+((b>>>23&255)-127|0)+(+g[44816+(bs+1<<2)>>2]*bW+ +g[44816+(bs<<2)>>2]*(1.0-bW)))*.30102999566398114;break}}else{b8=b0}}while(0);b_=+g[b5+88+(b2*12&-1)+4>>2];do{if(b_>0.0){bW=b$*b_;bV=+g[b5+332+(b2*12&-1)+4>>2];if(bV<=bW){b9=b8;break}V=+g[b3>>2];if(bV>bW*1.0e10){b9=b8+V*23.02585092994046;break}else{M=(g[k>>2]=bV/bW,c[k>>2]|0);bW=+(M&16383|0)*6103515625.0e-14;bs=M>>>14&511;b9=b8+V*(+((M>>>23&255)-127|0)+(+g[44816+(bs+1<<2)>>2]*bW+ +g[44816+(bs<<2)>>2]*(1.0-bW)))*.30102999566398114;break}}else{b9=b8}}while(0);b_=+g[b5+88+(b2*12&-1)+8>>2];do{if(b_>0.0){bW=b$*b_;V=+g[b5+332+(b2*12&-1)+8>>2];if(V<=bW){ca=b9;break}bV=+g[b3>>2];if(V>bW*1.0e10){ca=b9+bV*23.02585092994046;break}else{bs=(g[k>>2]=V/bW,c[k>>2]|0);bW=+(bs&16383|0)*6103515625.0e-14;M=bs>>>14&511;ca=b9+bV*(+((bs>>>23&255)-127|0)+(+g[44816+(M+1<<2)>>2]*bW+ +g[44816+(M<<2)>>2]*(1.0-bW)))*.30102999566398114;break}}else{ca=b9}}while(0);b3=b2+1|0;if(b3>>>0<12){b2=b3;b0=ca}else{break}}g[b7+(b1<<2)>>2]=ca;cb=ca}else{b2=0;b0=281.0574951171875;while(1){b_=+g[b5+(b2<<2)>>2];do{if(b_>0.0){bW=b$*b_;bV=+g[b5+244+(b2<<2)>>2];if(bV<=bW){cc=b0;break}V=+g[44560+(b2<<2)>>2];if(bV>bW*1.0e10){cc=b0+V*23.02585092994046;break}else{b3=(g[k>>2]=bV/bW,c[k>>2]|0);bW=+(b3&16383|0)*6103515625.0e-14;M=b3>>>14&511;cc=b0+V*(+((b3>>>23&255)-127|0)+(+g[44816+(M+1<<2)>>2]*bW+ +g[44816+(M<<2)>>2]*(1.0-bW)))*.30102999566398114;break}}else{cc=b0}}while(0);M=b2+1|0;if(M>>>0<21){b2=M;b0=cc}else{break}}g[b7+(b1<<2)>>2]=cc;cb=cc}if(!K){h[T+189240+(f<<5)+(b1<<3)>>3]=cb}b1=b1+1|0;}while((b1|0)<(Z|0));i=q;return 0}function bD(a,b,c,d,e,f,h){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;f=+f;h=h|0;var i=0.0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0;i=f*2.0;if((h|0)<=0){return}j=f>0.0;k=0;do{f=+g[a+512+(k<<2)>>2];l=+g[a+768+(k<<2)>>2];m=+g[b+(k<<2)>>2];n=+g[b+256+(k<<2)>>2];o=b+512+(k<<2)|0;p=+g[o>>2];q=b+768+(k<<2)|0;r=+g[q>>2];if(m>n*1.5800000429153442|n>m*1.5800000429153442){s=r;t=p}else{u=+g[c+(k<<2)>>2];v=l*u;w=f*u;u=r<v?r:v;v=p<w?p:w;s=r>v?r:v;t=p>u?p:u}if(j){u=+g[d+(k<<2)>>2]*e;p=m>u?m:u;m=n>u?n:u;n=t>u?t:u;v=s>u?s:u;u=n+v;do{if(u>0.0){r=i*(p<m?p:m);if(r>=u){x=n;y=v;break}w=r/u;x=n*w;y=v*w}else{x=n;y=v}}while(0);z=y<s?y:s;A=x<t?x:t}else{z=s;A=t}g[o>>2]=A>f?f:A;g[q>>2]=z>l?l:z;k=k+1|0;}while((k|0)<(h|0));return}function bE(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0,B=0;h=c[a+2152>>2]|0;L1710:do{if((h|0)>0){i=a+2148|0;j=0;k=0;l=0.0;m=0.0;while(1){n=c[a+2060+(k<<2)>>2]|0;o=c[i>>2]|0;p=(n|0)<(o|0)?n:o;if((j|0)<(p|0)){q=n^-1;n=o^-1;r=(q|0)>(n|0)?q:n;n=j;s=l;t=m;do{t=t+ +g[b+(n<<2)>>2];s=s+ +g[d+(n<<2)>>2];n=n+1|0;}while((n|0)<(p|0));u=r^-1;v=s;w=t}else{u=j;v=l;w=m}if((u|0)>=(o|0)){break}x=+g[a+1112+(k<<2)>>2];y=1.0-x;p=b+(u<<2)|0;n=d+(u<<2)|0;z=v+x*+g[n>>2];g[e+(k<<2)>>2]=w+x*+g[p>>2];g[f+(k<<2)>>2]=z;q=k+1|0;if((q|0)<(h|0)){j=u+1|0;k=q;l=y*+g[n>>2];m=y*+g[p>>2]}else{A=q;break L1710}}g[e+(k<<2)>>2]=w;g[f+(k<<2)>>2]=v;A=k+1|0}else{A=0}}while(0);if((A|0)<(h|0)){B=A}else{return}do{g[e+(B<<2)>>2]=0.0;g[f+(B<<2)>>2]=0.0;B=B+1|0;}while((B|0)<(h|0));return}function bF(a,b,d,e){a=+a;b=+b;d=+d;e=+e;var f=0.0,h=0,i=0,j=0.0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0;f=e<1.0?94.82444763183594:e;h=(g[k>>2]=b,c[k>>2]|0);b=+(h&16383|0)*6103515625.0e-14;i=h>>>14&511;e=a*a;a=(+((h>>>23&255)-127|0)+((1.0-b)*+g[44816+(i<<2)>>2]+b*+g[44816+(i+1<<2)>>2]))*3.0102999566398116-d;if(e<=9.999999682655225e-21){j=0.0;l=j<0.0;m=l?0.0:j;n=a*m;o=d+90.30873107910156;p=o-f;q=p+n;r=q*.10000000149011612;s=+R(10.0,+r);return+s}i=(g[k>>2]=e,c[k>>2]|0);e=+(i&16383|0)*6103515625.0e-14;h=i>>>14&511;j=(+((i>>>23&255)-127|0)+((1.0-e)*+g[44816+(h<<2)>>2]+e*+g[44816+(h+1<<2)>>2]))*.03333343265598758+1.0;l=j<0.0;m=l?0.0:j;n=a*m;o=d+90.30873107910156;p=o-f;q=p+n;r=q*.10000000149011612;s=+R(10.0,+r);return+s}function bG(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0.0,F=0,G=0.0,H=0.0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,Q=0,R=0,S=0.0,T=0.0,U=0.0,V=0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0,ai=0.0,aj=0.0,ak=0.0,al=0.0;h=c[b+85796>>2]|0;i=e+4856|0;if((c[i>>2]|0)>0){j=h+8|0;k=h+20|0;l=b+224|0;m=0;n=0;o=0;p=f;while(1){q=+bF(+g[j>>2],+g[h+24+(o<<2)>>2],+g[k>>2],+g[l>>2]);r=+g[b+84768+(o<<2)>>2];s=q*r;t=c[e+4872+(o<<2)>>2]|0;q=s/+(t|0);if((t|0)>0){u=0;v=2.220446049250313e-16;w=0.0;x=n;while(1){y=+g[e+(x<<2)>>2];z=y*y;A=w+z;B=v+(z<q?z:q);C=u+1|0;if((C|0)<(t|0)){u=C;v=B;w=A;x=x+1|0}else{break}}D=B;E=A;F=n+t|0}else{D=2.220446049250313e-16;E=0.0;F=n}x=(E>s&1)+m|0;if(E<s){G=E}else{G=D<s?s:D}w=+g[d+244+(o<<2)>>2];do{if(w>9.999999960041972e-13){v=E*+g[d+(o<<2)>>2]/w*r;if(G>=v){H=G;break}H=v}else{H=G}}while(0);r=H>2.220446049250313e-16?H:2.220446049250313e-16;a[e+5212+o|0]=E>r+9.9999998245167e-15&1;t=p+4|0;g[p>>2]=r;u=o+1|0;if((u|0)<(c[i>>2]|0)){m=x;n=F;o=u;p=t}else{I=x;J=F;K=u;L=t;break}}}else{I=0;J=0;K=0;L=f}f=575;while(1){if((f|0)<=0){M=0;break}if(+P(+(+g[e+(f<<2)>>2]))>9.999999960041972e-13){M=f;break}else{f=f-1|0}}f=(c[e+4788>>2]|0)==2;if(f){N=M+5-((M|0)%6&-1)|0}else{N=M|1}do{if((c[b+85092>>2]|0)==0){M=c[b+64>>2]|0;if((M|0)>=44e3){O=N;break}F=(M|0)<8001;if(f){Q=(c[b+21452+((F?9:12)<<2)>>2]|0)*3&-1}else{Q=c[b+21360+((F?17:21)<<2)>>2]|0}F=Q-1|0;O=(N|0)>(F|0)?F:N}else{O=N}}while(0);c[e+5208>>2]=O;O=e+4864|0;if((K|0)>=(c[O>>2]|0)){R=I;return R|0}N=h+8|0;Q=h+20|0;f=b+224|0;F=b+92|0;M=b+85800|0;p=I;I=J;J=K;K=c[e+4852>>2]|0;o=L;n=L+8|0;while(1){E=+bF(+g[N>>2],+g[h+112+(K<<2)>>2],+g[Q>>2],+g[f>>2]);L=b+84856+(K<<2)|0;H=+g[L>>2];G=E*H;m=c[e+4872+(J<<2)>>2]|0;E=G/+(m|0);i=(m|0)>0;if(i){l=0;D=0.0;k=I;A=2.220446049250313e-16;while(1){B=+g[e+(k<<2)>>2];r=B*B;S=D+r;T=A+(r<E?r:E);j=l+1|0;if((j|0)<(m|0)){l=j;D=S;k=k+1|0;A=T}else{break}}U=S;V=m+I|0;W=T}else{U=0.0;V=I;W=2.220446049250313e-16}k=(U>G&1)+p|0;if(U<G){X=U}else{X=W<G?G:W}A=+g[d+332+(K*12&-1)>>2];do{if(A>9.999999960041972e-13){D=U*+g[d+88+(K*12&-1)>>2]/A*H;if(X>=D){Y=X;break}Y=D}else{Y=X}}while(0);H=Y>2.220446049250313e-16?Y:2.220446049250313e-16;a[e+5212+J|0]=U>H+9.9999998245167e-15&1;l=o+4|0;g[o>>2]=H;if(i){x=0;H=0.0;j=V;A=2.220446049250313e-16;while(1){D=+g[e+(j<<2)>>2];r=D*D;Z=H+r;_=A+(r<E?r:E);t=x+1|0;if((t|0)<(m|0)){x=t;H=Z;j=j+1|0;A=_}else{break}}$=Z;aa=m+V|0;ab=_}else{$=0.0;aa=V;ab=2.220446049250313e-16}j=($>G&1)+k|0;if($<G){ac=$}else{ac=ab<G?G:ab}A=+g[d+332+(K*12&-1)+4>>2];do{if(A>9.999999960041972e-13){H=$*+g[d+88+(K*12&-1)+4>>2]/A*+g[L>>2];if(ac>=H){ad=ac;break}ad=H}else{ad=ac}}while(0);A=ad>2.220446049250313e-16?ad:2.220446049250313e-16;a[J+1+(e+5212)|0]=$>A+9.9999998245167e-15&1;k=o+8|0;g[l>>2]=A;if(i){x=0;A=0.0;t=aa;H=2.220446049250313e-16;while(1){r=+g[e+(t<<2)>>2];D=r*r;ae=A+D;af=H+(D<E?D:E);u=x+1|0;if((u|0)<(m|0)){x=u;A=ae;t=t+1|0;H=af}else{break}}ag=ae;ah=m+aa|0;ai=af}else{ag=0.0;ah=aa;ai=2.220446049250313e-16}t=(ag>G&1)+j|0;if(ag<G){aj=ag}else{aj=ai<G?G:ai}H=+g[d+332+(K*12&-1)+8>>2];do{if(H>9.999999960041972e-13){A=ag*+g[d+88+(K*12&-1)+8>>2]/H*+g[L>>2];if(aj>=A){ak=aj;break}ak=A}else{ak=aj}}while(0);H=ak>2.220446049250313e-16?ak:2.220446049250313e-16;a[J+2+(e+5212)|0]=ag>H+9.9999998245167e-15&1;g[k>>2]=H;L=o+12|0;do{if((c[F>>2]|0)!=0){H=+g[n-8>>2];j=n-4|0;G=+g[j>>2];if(H>G){A=G+(H-G)*+g[(c[M>>2]|0)+6496>>2];g[j>>2]=A;al=A}else{al=G}G=+g[n>>2];if(al<=G){break}g[n>>2]=G+(al-G)*+g[(c[M>>2]|0)+6496>>2]}}while(0);k=J+3|0;if((k|0)<(c[O>>2]|0)){p=t;I=ah;J=k;K=K+1|0;o=L;n=n+12|0}else{R=t;break}}return R|0}function bH(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,j=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0,K=0,L=0,M=0,N=0,O=0,Q=0,R=0.0,S=0,T=0.0,U=0.0,V=0,W=0.0,X=0,Y=0,Z=0,_=0,$=0.0,ab=0,ac=0,ad=0.0,ae=0,af=0.0,ag=0.0,ah=0.0,ai=0,aj=0.0,ak=0,al=0.0,am=0.0,an=0,ao=0.0,ap=0,aq=0.0,ar=0,as=0.0,at=0,au=0.0;h=i;i=i+8|0;j=h|0;l=e+16|0;c[l>>2]=0;m=a+4864|0;if((c[m>>2]|0)<=0){n=0.0;o=0.0;p=-20.0;q=0;r=e+12|0;c[r>>2]=q;s=e+4|0;g[s>>2]=o;t=e|0;g[t>>2]=n;u=e+8|0;g[u>>2]=p;i=h;return q|0}v=a+4780|0;w=a+4832|0;x=a+4836|0;y=(f|0)!=0;z=f|0;A=a+5208|0;B=a+4776|0;C=a+4772|0;D=j|0;E=j+4|0;F=0;G=0.0;H=0.0;I=-20.0;J=a+4608|0;K=0;L=0;M=d;d=b;while(1){b=J+4|0;if((c[w>>2]|0)==0){N=0}else{N=c[10096+(L<<2)>>2]|0}O=(c[v>>2]|0)-(N+(c[J>>2]|0)<<(c[x>>2]|0)+1)-(c[a+4808+(c[a+5028+(L<<2)>>2]<<2)>>2]<<3)|0;Q=d+4|0;R=1.0/+g[d>>2];do{if(y){if((c[f+8+(L<<2)>>2]|0)!=(O|0)){S=1258;break}T=+g[f+320+(L<<2)>>2];U=R*+g[f+164+(L<<2)>>2];V=(c[a+4872+(L<<2)>>2]|0)+F|0;S=1276}else{S=1258}}while(0);do{if((S|0)==1258){S=0;W=+g[43016+(O+116<<2)>>2];X=c[a+4872+(L<<2)>>2]|0;Y=c[A>>2]|0;if((X+F|0)>(Y|0)){Z=Y-F+1|0;_=(Z|0)>0?Z>>1:0}else{_=X>>1}do{if((F|0)>(c[B>>2]|0)){if((_|0)==0){$=0.0;ab=F;break}else{ac=F;ad=0.0;ae=_}while(1){X=ae-1|0;af=+g[a+(ac<<2)>>2];ag=+g[a+(ac+1<<2)>>2];ah=ad+af*af+ag*ag;if((X|0)==0){break}else{ac=ac+2|0;ad=ah;ae=X}}$=ah;ab=(_<<1)+F|0}else{if((F|0)>(c[C>>2]|0)){g[D>>2]=0.0;g[E>>2]=W;if((_|0)==0){$=0.0;ab=F;break}else{ai=F;aj=0.0;ak=_}while(1){X=ak-1|0;ag=+P(+(+g[a+(ai<<2)>>2]));af=ag- +g[j+(c[a+2304+(ai<<2)>>2]<<2)>>2];Z=ai+1|0;ag=+P(+(+g[a+(Z<<2)>>2]));al=ag- +g[j+(c[a+2304+(Z<<2)>>2]<<2)>>2];am=aj+af*af+al*al;if((X|0)==0){break}else{ai=ai+2|0;aj=am;ak=X}}$=am;ab=(_<<1)+F|0;break}else{if((_|0)==0){$=0.0;ab=F;break}else{an=F;ao=0.0;ap=_}while(1){X=ap-1|0;al=+P(+(+g[a+(an<<2)>>2]));af=al-W*+g[10184+(c[a+2304+(an<<2)>>2]<<2)>>2];Z=an+1|0;al=+P(+(+g[a+(Z<<2)>>2]));ag=al-W*+g[10184+(c[a+2304+(Z<<2)>>2]<<2)>>2];aq=ao+af*af+ag*ag;if((X|0)==0){break}else{an=an+2|0;ao=aq;ap=X}}$=aq;ab=(_<<1)+F|0;break}}}while(0);if(y){c[f+8+(L<<2)>>2]=O;g[f+164+(L<<2)>>2]=$}W=R*$;X=W>9.999999682655225e-21?(g[k>>2]=W,c[k>>2]|0):507307272;ag=+(X&16383|0)*6103515625.0e-14;Z=X>>>14&511;af=(+((X>>>23&255)-127|0)+((1.0-ag)*+g[44816+(Z<<2)>>2]+ag*+g[44816+(Z+1<<2)>>2]))*.30102999566398114;if(y){g[f+320+(L<<2)>>2]=af;T=af;U=W;V=ab;S=1276;break}else{g[M>>2]=W;ar=ab;as=af;break}}}while(0);if((S|0)==1276){S=0;g[M>>2]=U;c[z>>2]=c[v>>2];ar=V;as=T}R=H+as;if(as>0.0){O=~~(as*10.0+.5);Z=(O|0)>1?O:1;O=aa(Z,Z)|0;c[l>>2]=(c[l>>2]|0)+O;at=K+1|0;au=G+as}else{at=K;au=G}af=I>as?I:as;O=L+1|0;if((O|0)<(c[m>>2]|0)){F=ar;G=au;H=R;I=af;J=b;K=at;L=O;M=M+4|0;d=Q}else{n=au;o=R;p=af;q=at;break}}r=e+12|0;c[r>>2]=q;s=e+4|0;g[s>>2]=o;t=e|0;g[t>>2]=n;u=e+8|0;g[u>>2]=p;i=h;return q|0}function bI(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0.0,L=0,M=0,N=0.0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0.0,V=0.0,W=0.0,X=0,Y=0,Z=0.0,_=0.0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0.0,ak=0,al=0,am=0.0,an=0.0,ao=0.0,ap=0,aq=0,ar=0,as=0;d=i;i=i+504|0;e=d|0;f=d+160|0;j=d+320|0;k=a+76|0;l=c[k>>2]|0;if((l|0)<=0){i=d;return}m=a+72|0;n=d+344|0;o=e|0;p=f|0;q=a+85804|0;r=a+212|0;s=a+85796|0;t=a+216|0;u=j+12|0;v=j+8|0;w=j|0;x=j+4|0;y=j+16|0;z=0;A=c[m>>2]|0;B=l;while(1){if((A|0)>0){l=(z|0)==1;C=0;do{D=a+304+(z*10504&-1)+(C*5252&-1)|0;E=a+304+(z*10504&-1)+(C*5252&-1)+4608|0;bU(n|0,E|0,156)|0;do{if(l){F=a+10808+(C*5252&-1)+4848|0;G=c[F>>2]|0;if((G|0)>0){H=0;I=G}else{break}while(1){G=a+10808+(C*5252&-1)+4608+(H<<2)|0;if((c[G>>2]|0)<0){c[G>>2]=c[a+304+(C*5252&-1)+4608+(H<<2)>>2];J=c[F>>2]|0}else{J=I}G=H+1|0;if((G|0)<(J|0)){H=G;I=J}else{break}}}}while(0);K=(c[a+304+(z*10504&-1)+(C*5252&-1)+4836>>2]|0)==0?.5:1.0;bG(a,b+(z*976&-1)+(C*488&-1)|0,D,o)|0;bH(D,o,p,j,0)|0;F=c[a+304+(z*10504&-1)+(C*5252&-1)+4848>>2]|0;G=a+304+(z*10504&-1)+(C*5252&-1)+4788|0;L=c[G>>2]|0;if((L|0)==2){M=F}else{M=(c[a+304+(z*10504&-1)+(C*5252&-1)+4792>>2]|0)==0?22:F}if((M|0)>0){F=a+304+(z*10504&-1)+(C*5252&-1)+4832|0;N=-0.0-K;O=0;P=0;while(1){Q=P+1|0;R=c[a+21360+(Q<<2)>>2]|0;S=R-(c[a+21360+(P<<2)>>2]|0)|0;if((O|0)<(R|0)){T=O;U=0.0;while(1){V=+g[a+304+(z*10504&-1)+(C*5252&-1)+(T<<2)>>2];W=U+V*V;X=T+1|0;if((X|0)<(R|0)){T=X;U=W}else{Y=R;Z=W;break}}}else{Y=O;Z=0.0}U=+(S|0);W=Z/U;h[(c[q>>2]|0)+190712+(z*704&-1)+(C*176&-1)+(P<<3)>>3]=W*999999986991104.0;h[(c[q>>2]|0)+201208+(z*352&-1)+(C*176&-1)+(P<<3)>>3]=+g[e+(P<<2)>>2]*999999986991104.0*+g[f+(P<<2)>>2]/U;U=+g[b+(z*976&-1)+(C*488&-1)+244+(P<<2)>>2];do{if(U>0.0){if((c[r>>2]|0)!=0){_=0.0;break}_=W/U}else{_=0.0}}while(0);U=_*+g[b+(z*976&-1)+(C*488&-1)+(P<<2)>>2];W=+g[(c[s>>2]|0)+24+(P<<2)>>2];h[(c[q>>2]|0)+189304+(z*704&-1)+(C*176&-1)+(P<<3)>>3]=(U>W?U:W)*999999986991104.0;h[(c[q>>2]|0)+199160+(z*352&-1)+(C*176&-1)+(P<<3)>>3]=0.0;if((c[F>>2]|0)!=0&(P|0)>10){h[(c[q>>2]|0)+199160+(z*352&-1)+(C*176&-1)+(P<<3)>>3]=+(c[10096+(P<<2)>>2]|0)*N}if((P|0)<21){S=(c[q>>2]|0)+199160+(z*352&-1)+(C*176&-1)+(P<<3)|0;h[S>>3]=+h[S>>3]-K*+(c[a+304+(z*10504&-1)+(C*5252&-1)+4608+(P<<2)>>2]|0)}if((Q|0)<(M|0)){O=Y;P=Q}else{break}}$=Y;aa=M;ab=c[G>>2]|0}else{$=0;aa=0;ab=L}do{if((ab|0)==2){P=c[a+304+(z*10504&-1)+(C*5252&-1)+4852>>2]|0;if((P|0)<13){ac=$;ad=aa;ae=P}else{break}while(1){P=c[a+21452+(ae<<2)>>2]|0;O=ae+1|0;F=c[a+21452+(O<<2)>>2]|0;D=F-P|0;S=(P|0)<(F|0);N=+(D|0);R=ae*3&-1;T=(ae|0)<12;X=ac;af=0;ag=ad;while(1){if(S){ah=X;ai=P;W=0.0;while(1){U=+g[a+304+(z*10504&-1)+(C*5252&-1)+(ah<<2)>>2];aj=W+U*U;ak=ai+1|0;if((ak|0)<(F|0)){ah=ah+1|0;ai=ak;W=aj}else{break}}al=X+D|0;am=aj}else{al=X;am=0.0}W=am/N;U=W>1.0e-20?W:9.999999682655225e-21;ai=af+R|0;h[(c[q>>2]|0)+194616+(z*1248&-1)+(C*312&-1)+(ai<<3)>>3]=U*999999986991104.0;h[(c[q>>2]|0)+201912+(z*624&-1)+(C*312&-1)+(ai<<3)>>3]=+g[e+(ag<<2)>>2]*999999986991104.0*+g[f+(ag<<2)>>2]/N;W=+g[b+(z*976&-1)+(C*488&-1)+332+(ae*12&-1)+(af<<2)>>2];if(W>0.0){an=U/W}else{an=0.0}if((c[r>>2]|0)==0){if((c[t>>2]|0)==0){ao=an}else{ap=1318}}else{ap=1318}if((ap|0)==1318){ap=0;ao=0.0}W=ao*+g[b+(z*976&-1)+(C*488&-1)+88+(ae*12&-1)+(af<<2)>>2];U=+g[(c[s>>2]|0)+112+(ae<<2)>>2];h[(c[q>>2]|0)+192120+(z*1248&-1)+(C*312&-1)+(ai<<3)>>3]=(W>U?W:U)*999999986991104.0;h[(c[q>>2]|0)+199864+(z*624&-1)+(C*312&-1)+(ai<<3)>>3]=+(c[a+304+(z*10504&-1)+(C*5252&-1)+4808+(af<<2)>>2]|0)*-2.0;if(T){ah=(c[q>>2]|0)+199864+(z*624&-1)+(C*312&-1)+(ai<<3)|0;h[ah>>3]=+h[ah>>3]-K*+(c[a+304+(z*10504&-1)+(C*5252&-1)+4608+(ag<<2)>>2]|0)}ah=af+1|0;if((ah|0)<3){X=al;af=ah;ag=ag+1|0}else{break}}if((O|0)<13){ac=al;ad=ad+3|0;ae=O}else{break}}}}while(0);c[(c[q>>2]|0)+201112+(z<<3)+(C<<2)>>2]=c[a+304+(z*10504&-1)+(C*5252&-1)+4780>>2];L=a+304+(z*10504&-1)+(C*5252&-1)+4844|0;c[(c[q>>2]|0)+203400+(z<<3)+(C<<2)>>2]=(c[L>>2]|0)+(c[a+304+(z*10504&-1)+(C*5252&-1)+4768>>2]|0);c[(c[q>>2]|0)+203416+(z<<3)+(C<<2)>>2]=c[L>>2];c[(c[q>>2]|0)+203160+(z<<3)+(C<<2)>>2]=c[u>>2];h[(c[q>>2]|0)+203208+(z<<4)+(C<<3)>>3]=+g[v>>2]*10.0;h[(c[q>>2]|0)+203240+(z<<4)+(C<<3)>>3]=+g[w>>2]*10.0;h[(c[q>>2]|0)+203176+(z<<4)+(C<<3)>>3]=+g[x>>2]*10.0;c[(c[q>>2]|0)+203272+(z<<3)+(C<<2)>>2]=c[y>>2];bU(E|0,n|0,156)|0;C=C+1|0;aq=c[m>>2]|0;}while((C|0)<(aq|0));ar=aq;as=c[k>>2]|0}else{ar=A;as=B}C=z+1|0;if((C|0)<(as|0)){z=C;A=ar;B=as}else{break}}i=d;return}function bJ(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+85704|0;d=c[b>>2]|0;if((d|0)!=0){bQ(d);c[b>>2]=0}b=a+85708|0;d=c[b>>2]|0;if((d|0)!=0){bQ(d);c[b>>2]=0}b=a+85712|0;d=c[b>>2]|0;if((d|0)!=0){bQ(d);c[b>>2]=0}b=a+85716|0;d=c[b>>2]|0;if((d|0)!=0){bQ(d);c[b>>2]=0}b=a+85728|0;d=c[b>>2]|0;if((d|0)!=0){bQ(d);c[b>>2]=0;c[a+85732>>2]=0;c[a+85740>>2]=0}b=a+85744|0;d=c[b>>2]|0;if((d|0)==0){return}else{e=d}while(1){d=c[e+24>>2]|0;f=c[e>>2]|0;bQ(c[e+12>>2]|0);bQ(d);bQ(e);if((f|0)==0){break}else{e=f}}c[b>>2]=0;c[a+85748>>2]=0;return}function bK(){return 59216|0}function bL(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=0;do{d=a+37192+(b<<2)|0;e=c[d>>2]|0;if((e|0)!=0){bQ(e);c[d>>2]=0}b=b+1|0;}while((b|0)<641);b=a+37184|0;d=c[b>>2]|0;if((d|0)!=0){bQ(d);c[b>>2]=0}b=a+37188|0;d=c[b>>2]|0;if((d|0)!=0){bQ(d);c[b>>2]=0}b=a+284|0;d=c[b>>2]|0;if((d|0)!=0){bQ(d);c[b>>2]=0}b=a+85780|0;d=c[b>>2]|0;if((d|0)!=0){bQ(d);c[b>>2]=0;c[a+85776>>2]=0}b=c[a+85796>>2]|0;if((b|0)!=0){bQ(b)}b=c[a+85676>>2]|0;if((b|0)!=0){bQ(b)}b=c[a+52152>>2]|0;if((b|0)!=0){bQ(b)}b=c[a+52156>>2]|0;if((b|0)!=0){bQ(b)}bJ(a);b=a+85808|0;d=c[b>>2]|0;do{if((d|0)==0){if((a|0)!=0){break}f=a;bQ(f);return}else{aG(d|0);bQ(d);c[b>>2]=0}}while(0);b=a+85800|0;d=c[b>>2]|0;if((d|0)==0){f=a;bQ(f);return}e=c[d+2156>>2]|0;if((e|0)==0){g=d}else{bQ(e);g=c[b>>2]|0}e=c[g+4316>>2]|0;if((e|0)==0){h=g}else{bQ(e);h=c[b>>2]|0}bQ(h);c[b>>2]=0;f=a;bQ(f);return}function bM(a,b,d,e,f,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,Q=0,R=0.0,U=0,V=0.0,W=0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0;j=c[a+84036>>2]|0;k=(c[a+76>>2]|0)*576&-1;l=c[a+72>>2]|0;m=a+64|0;n=c[m>>2]|0;o=+(n|0);p=a+60|0;q=c[p>>2]|0;do{if((q|0)>=(~~(o*.9994999766349792)|0)){if((~~(o*1.000499963760376)|0)<(q|0)){break}r=(k|0)<(e|0)?k:e;s=r<<2;t=0;do{u=(c[b+(t<<2)>>2]|0)+(j<<2)|0;v=c[d+(t<<2)>>2]|0;bU(u|0,v|0,s)|0;t=t+1|0;}while((t|0)<(l|0));c[i>>2]=r;c[f>>2]=r;return}}while(0);t=a+12|0;s=a+37184|0;v=a+37188|0;u=a+37168|0;w=(k|0)>0;x=0;y=q;q=n;while(1){n=c[b+(x<<2)>>2]|0;z=c[d+(x<<2)>>2]|0;o=+(y|0)/+(q|0);if((y|0)==0){A=q}else{B=q;C=y;while(1){D=(B|0)%(C|0)&-1;if((D|0)==0){A=C;break}else{B=C;C=D}}}C=(q|0)/(A|0)&-1;B=(C|0)>320?320:C;E=1.0/o;r=E>1.0;D=+P(+(o- +O(+(o+.5))))<1.0e-4?32:31;F=D+1|0;if((c[t>>2]|0)==0){c[s>>2]=bR(F,4)|0;c[v>>2]=bR(F,4)|0;G=B<<1;if((G|0)<0){bT(u|0,0,16);H=0}else{I=0;do{c[a+37192+(I<<2)>>2]=bR(F,4)|0;I=I+1|0;}while((I|0)<=(G|0));bT(u|0,0,16);J=+(B|0)*2.0;K=r?3.1415927410125732:E*3.141592653589793;L=+(D|0);M=K/3.141592653589793;N=L*K;K=+(D|0)*3.141592653589793;I=(C|0)<320;Q=0;do{R=+(Q-B|0)/J;U=a+37192+(Q<<2)|0;V=0.0;W=0;while(1){X=(+(W|0)-R)/L;Y=X<0.0?0.0:X;X=Y>1.0?1.0:Y;Y=X+-.5;if(+P(+Y)<1.0e-9){Z=M}else{_=+S(+(X*2.0*3.141592653589793));$=.42-_*.5+ +S(+(X*4.0*3.141592653589793))*.08;Z=+T(+(N*Y))*$/(K*Y)}Y=Z;g[(c[U>>2]|0)+(W<<2)>>2]=Y;aa=V+Y;ab=W+1|0;if((ab|0)>(D|0)){ac=0;break}else{V=aa;W=ab}}do{W=(c[U>>2]|0)+(ac<<2)|0;g[W>>2]=+g[W>>2]/aa;ac=ac+1|0;}while((ac|0)<=(D|0));Q=Q+1|0;}while((Q|0)<=(G|0));H=I?C<<1|1:641}c[t>>2]=1;ad=H}else{ad=0}G=c[a+37184+(x<<2)>>2]|0;L2034:do{if(w){Q=a+37168+(x<<3)|0;r=D>>>1;U=D-r|0;K=+(D&1|0)*.5;N=+(B|0);W=0;while(1){M=o*+(W|0)- +h[Q>>3];ab=~~+O(+M);if((ab+U|0)>=(e|0)){ae=ab;af=W;ag=U;ah=Q;break L2034}ai=ab-r|0;aj=c[a+37192+(~~+O(+(N+N*(M-(K+ +(ab|0)))*2.0+.5))<<2)>>2]|0;ak=0;M=0.0;do{al=ak+ai|0;if((al|0)<0){am=G+(al+F<<2)|0}else{am=z+(al<<2)|0}M=M+ +g[am>>2]*+g[aj+(ak<<2)>>2];ak=ak+1|0;}while((ak|0)<=(D|0));g[n+(W+j<<2)>>2]=M;ak=W+1|0;if((ak|0)<(k|0)){W=ak}else{ae=ab;af=ak;ag=U;ah=Q;break}}}else{ae=ad;af=0;ag=D-(D>>>1)|0;ah=a+37168+(x<<3)|0}}while(0);n=ae+ag|0;B=(n|0)>(e|0)?e:n;c[f>>2]=B;h[ah>>3]=+h[ah>>3]+(+(B|0)-o*+(af|0));B=c[f>>2]|0;do{if((B|0)<(F|0)){n=F-B|0;do{if((n|0)>0){g[G>>2]=+g[G+(B<<2)>>2];if((n|0)>1){an=1}else{ao=1;break}while(1){g[G+(an<<2)>>2]=+g[G+(an+(c[f>>2]|0)<<2)>>2];C=an+1|0;if((C|0)<(n|0)){an=C}else{ao=n;break}}}else{ao=0}}while(0);if((ao|0)<(F|0)){ap=0;aq=ao}else{break}while(1){g[G+(aq<<2)>>2]=+g[z+(ap<<2)>>2];n=aq+1|0;if((n|0)<(F|0)){ap=ap+1|0;aq=n}else{break}}}else{n=D^-1;g[G>>2]=+g[z+(B+n<<2)>>2];if(F>>>0>1){ar=1}else{break}do{g[G+(ar<<2)>>2]=+g[z+((c[f>>2]|0)+n+ar<<2)>>2];ar=ar+1|0;}while((ar|0)<(F|0))}}while(0);F=x+1|0;if((F|0)>=(l|0)){break}x=F;y=c[p>>2]|0;q=c[m>>2]|0}c[i>>2]=af;return}function bN(a,b){a=a|0;b=b|0;aL(c[m>>2]|0,a|0,b|0)|0;at(c[m>>2]|0)|0;return}function bO(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e|0;if((a|0)==0){i=e;return}g=a+85836|0;if((c[g>>2]|0)==0){i=e;return}a=f;c[a>>2]=d;c[a+4>>2]=0;aU[c[g>>2]&3](b,f|0);i=e;return}function bP(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aG=0,aI=0,aJ=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[14934]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=59776+(h<<2)|0;j=59776+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[14934]=e&(1<<g^-1)}else{if(l>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{ar();return 0;return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[14936]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=59776+(p<<2)|0;m=59776+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[14934]=e&(1<<r^-1)}else{if(l>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{ar();return 0;return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[14936]|0;if((l|0)!=0){q=c[14939]|0;d=l>>>3;l=d<<1;f=59776+(l<<2)|0;k=c[14934]|0;h=1<<d;do{if((k&h|0)==0){c[14934]=k|h;s=f;t=59776+(l+2<<2)|0}else{d=59776+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[14938]|0)>>>0){s=g;t=d;break}ar();return 0;return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[14936]=m;c[14939]=e;n=i;return n|0}l=c[14935]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[60040+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[14938]|0;if(r>>>0<i>>>0){ar();return 0;return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){ar();return 0;return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){ar();return 0;return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){ar();return 0;return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){ar();return 0;return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{ar();return 0;return 0}}}while(0);L2151:do{if((e|0)!=0){f=d+28|0;i=60040+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[14935]=c[14935]&(1<<c[f>>2]^-1);break L2151}else{if(e>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L2151}}}while(0);if(v>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[14936]|0;if((f|0)!=0){e=c[14939]|0;i=f>>>3;f=i<<1;q=59776+(f<<2)|0;k=c[14934]|0;g=1<<i;do{if((k&g|0)==0){c[14934]=k|g;y=q;z=59776+(f+2<<2)|0}else{i=59776+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[14938]|0)>>>0){y=l;z=i;break}ar();return 0;return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[14936]=p;c[14939]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[14935]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[60040+(A<<2)>>2]|0;L2199:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L2199}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[60040+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[14936]|0)-g|0)>>>0){o=g;break}q=K;m=c[14938]|0;if(q>>>0<m>>>0){ar();return 0;return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){ar();return 0;return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){ar();return 0;return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){ar();return 0;return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){ar();return 0;return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{ar();return 0;return 0}}}while(0);L2249:do{if((e|0)!=0){i=K+28|0;m=60040+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[14935]=c[14935]&(1<<c[i>>2]^-1);break L2249}else{if(e>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L2249}}}while(0);if(L>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=59776+(e<<2)|0;r=c[14934]|0;j=1<<i;do{if((r&j|0)==0){c[14934]=r|j;O=m;P=59776+(e+2<<2)|0}else{i=59776+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[14938]|0)>>>0){O=d;P=i;break}ar();return 0;return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=60040+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[14935]|0;l=1<<Q;if((m&l|0)==0){c[14935]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=1581;break}else{l=l<<1;m=j}}if((T|0)==1581){if(S>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[14938]|0;if(m>>>0<i>>>0){ar();return 0;return 0}if(j>>>0<i>>>0){ar();return 0;return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[14936]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[14939]|0;if(S>>>0>15){R=J;c[14939]=R+o;c[14936]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[14936]=0;c[14939]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[14937]|0;if(o>>>0<J>>>0){S=J-o|0;c[14937]=S;J=c[14940]|0;K=J;c[14940]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[11194]|0)==0){J=aF(8)|0;if((J-1&J|0)==0){c[11196]=J;c[11195]=J;c[11197]=-1;c[11198]=2097152;c[11199]=0;c[15045]=0;c[11194]=(aH(0)|0)&-16^1431655768;break}else{ar();return 0;return 0}}}while(0);J=o+48|0;S=c[11196]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[15044]|0;do{if((O|0)!=0){P=c[15042]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L2341:do{if((c[15045]&4|0)==0){O=c[14940]|0;L2343:do{if((O|0)==0){T=1611}else{L=O;P=60184;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=1611;break L2343}else{P=M}}if((P|0)==0){T=1611;break}L=R-(c[14937]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=aO(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=1620}}while(0);do{if((T|0)==1611){O=aO(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[11195]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[15042]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[15044]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=aO($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=1620}}while(0);L2363:do{if((T|0)==1620){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=1631;break L2341}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[11196]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((aO(O|0)|0)==-1){aO(m|0)|0;W=Y;break L2363}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=1631;break L2341}}}while(0);c[15045]=c[15045]|4;ad=W;T=1628}else{ad=0;T=1628}}while(0);do{if((T|0)==1628){if(S>>>0>=2147483647){break}W=aO(S|0)|0;Z=aO(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=1631}}}while(0);do{if((T|0)==1631){ad=(c[15042]|0)+aa|0;c[15042]=ad;if(ad>>>0>(c[15043]|0)>>>0){c[15043]=ad}ad=c[14940]|0;L2383:do{if((ad|0)==0){S=c[14938]|0;if((S|0)==0|ab>>>0<S>>>0){c[14938]=ab}c[15046]=ab;c[15047]=aa;c[15049]=0;c[14943]=c[11194];c[14942]=-1;S=0;do{Y=S<<1;ac=59776+(Y<<2)|0;c[59776+(Y+3<<2)>>2]=ac;c[59776+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[14940]=ab+ae;c[14937]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[14941]=c[11198]}else{S=60184;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=1643;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==1643){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[14940]|0;Y=(c[14937]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[14940]=Z+ai;c[14937]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[14941]=c[11198];break L2383}}while(0);if(ab>>>0<(c[14938]|0)>>>0){c[14938]=ab}S=ab+aa|0;Y=60184;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=1653;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==1653){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[14940]|0)){J=(c[14937]|0)+K|0;c[14937]=J;c[14940]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[14939]|0)){J=(c[14936]|0)+K|0;c[14936]=J;c[14939]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L2428:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=59776+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}if((c[U+12>>2]|0)==(Z|0)){break}ar();return 0;return 0}}while(0);if((Q|0)==(U|0)){c[14934]=c[14934]&(1<<V^-1);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}ar();return 0;return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){ar();return 0;return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{ar();return 0;return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=60040+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[14935]=c[14935]&(1<<c[P>>2]^-1);break L2428}else{if(m>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L2428}}}while(0);if(an>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa)|0;as=$+K|0}else{aq=Z;as=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=as|1;c[ab+(as+W)>>2]=as;J=as>>>3;if(as>>>0<256){V=J<<1;X=59776+(V<<2)|0;P=c[14934]|0;m=1<<J;do{if((P&m|0)==0){c[14934]=P|m;at=X;au=59776+(V+2<<2)|0}else{J=59776+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[14938]|0)>>>0){at=U;au=J;break}ar();return 0;return 0}}while(0);c[au>>2]=_;c[at+12>>2]=_;c[ab+(W+8)>>2]=at;c[ab+(W+12)>>2]=X;break}V=ac;m=as>>>8;do{if((m|0)==0){av=0}else{if(as>>>0>16777215){av=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;av=as>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=60040+(av<<2)|0;c[ab+(W+28)>>2]=av;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[14935]|0;Q=1<<av;if((X&Q|0)==0){c[14935]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((av|0)==31){aw=0}else{aw=25-(av>>>1)|0}Q=as<<aw;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(as|0)){break}ax=X+16+(Q>>>31<<2)|0;m=c[ax>>2]|0;if((m|0)==0){T=1726;break}else{Q=Q<<1;X=m}}if((T|0)==1726){if(ax>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}else{c[ax>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[14938]|0;if(X>>>0<$>>>0){ar();return 0;return 0}if(m>>>0<$>>>0){ar();return 0;return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=60184;while(1){ay=c[W>>2]|0;if(ay>>>0<=Y>>>0){az=c[W+4>>2]|0;aA=ay+az|0;if(aA>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ay+(az-39)|0;if((W&7|0)==0){aB=0}else{aB=-W&7}W=ay+(az-47+aB)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aC=0}else{aC=-_&7}_=aa-40-aC|0;c[14940]=ab+aC;c[14937]=_;c[ab+(aC+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[14941]=c[11198];c[ac+4>>2]=27;c[W>>2]=c[15046];c[W+4>>2]=c[60188>>2];c[W+8>>2]=c[60192>>2];c[W+12>>2]=c[60196>>2];c[15046]=ab;c[15047]=aa;c[15049]=0;c[15048]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<aA>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<aA>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=59776+(K<<2)|0;S=c[14934]|0;m=1<<W;do{if((S&m|0)==0){c[14934]=S|m;aD=Z;aE=59776+(K+2<<2)|0}else{W=59776+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[14938]|0)>>>0){aD=Q;aE=W;break}ar();return 0;return 0}}while(0);c[aE>>2]=ad;c[aD+12>>2]=ad;c[ad+8>>2]=aD;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aG=0}else{if(_>>>0>16777215){aG=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aG=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=60040+(aG<<2)|0;c[ad+28>>2]=aG;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[14935]|0;Q=1<<aG;if((Z&Q|0)==0){c[14935]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aG|0)==31){aI=0}else{aI=25-(aG>>>1)|0}Q=_<<aI;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aJ=Z+16+(Q>>>31<<2)|0;m=c[aJ>>2]|0;if((m|0)==0){T=1761;break}else{Q=Q<<1;Z=m}}if((T|0)==1761){if(aJ>>>0<(c[14938]|0)>>>0){ar();return 0;return 0}else{c[aJ>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[14938]|0;if(Z>>>0<m>>>0){ar();return 0;return 0}if(_>>>0<m>>>0){ar();return 0;return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[14937]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[14937]=_;ad=c[14940]|0;Q=ad;c[14940]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(aP()|0)>>2]=12;n=0;return n|0}function bQ(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[14938]|0;if(b>>>0<e>>>0){ar()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){ar()}h=f&-8;i=a+(h-8)|0;j=i;L2600:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){ar()}if((n|0)==(c[14939]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[14936]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=59776+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){ar()}if((c[k+12>>2]|0)==(n|0)){break}ar()}}while(0);if((s|0)==(k|0)){c[14934]=c[14934]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){ar()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}ar()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){ar()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){ar()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){ar()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{ar()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=60040+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[14935]=c[14935]&(1<<c[v>>2]^-1);q=n;r=o;break L2600}else{if(p>>>0<(c[14938]|0)>>>0){ar()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L2600}}}while(0);if(A>>>0<(c[14938]|0)>>>0){ar()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[14938]|0)>>>0){ar()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[14938]|0)>>>0){ar()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){ar()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){ar()}do{if((e&2|0)==0){if((j|0)==(c[14940]|0)){B=(c[14937]|0)+r|0;c[14937]=B;c[14940]=q;c[q+4>>2]=B|1;if((q|0)==(c[14939]|0)){c[14939]=0;c[14936]=0}if(B>>>0<=(c[14941]|0)>>>0){return}bS(0)|0;return}if((j|0)==(c[14939]|0)){B=(c[14936]|0)+r|0;c[14936]=B;c[14939]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L2705:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=59776+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[14938]|0)>>>0){ar()}if((c[u+12>>2]|0)==(j|0)){break}ar()}}while(0);if((g|0)==(u|0)){c[14934]=c[14934]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[14938]|0)>>>0){ar()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}ar()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[14938]|0)>>>0){ar()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[14938]|0)>>>0){ar()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){ar()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{ar()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=60040+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[14935]=c[14935]&(1<<c[t>>2]^-1);break L2705}else{if(f>>>0<(c[14938]|0)>>>0){ar()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L2705}}}while(0);if(E>>>0<(c[14938]|0)>>>0){ar()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[14938]|0)>>>0){ar()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[14938]|0)>>>0){ar()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[14939]|0)){H=B;break}c[14936]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=59776+(d<<2)|0;A=c[14934]|0;E=1<<r;do{if((A&E|0)==0){c[14934]=A|E;I=e;J=59776+(d+2<<2)|0}else{r=59776+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[14938]|0)>>>0){I=h;J=r;break}ar()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=60040+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[14935]|0;d=1<<K;do{if((r&d|0)==0){c[14935]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=1940;break}else{A=A<<1;J=E}}if((N|0)==1940){if(M>>>0<(c[14938]|0)>>>0){ar()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[14938]|0;if(J>>>0<E>>>0){ar()}if(B>>>0<E>>>0){ar()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[14942]|0)-1|0;c[14942]=q;if((q|0)==0){O=60192}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[14942]=-1;return}function bR(a,b){a=a|0;b=b|0;var d=0,e=0;do{if((a|0)==0){d=0}else{e=aa(b,a)|0;if((b|a)>>>0<=65535){d=e;break}d=((e>>>0)/(a>>>0)>>>0|0)==(b|0)?e:-1}}while(0);b=bP(d)|0;if((b|0)==0){return b|0}if((c[b-4>>2]&3|0)==0){return b|0}bT(b|0,0,d|0);return b|0}function bS(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[11194]|0)==0){b=aF(8)|0;if((b-1&b|0)==0){c[11196]=b;c[11195]=b;c[11197]=-1;c[11198]=2097152;c[11199]=0;c[15045]=0;c[11194]=(aH(0)|0)&-16^1431655768;break}else{ar();return 0;return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[14940]|0;if((b|0)==0){d=0;return d|0}e=c[14937]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[11196]|0;g=aa((((-40-a-1+e+f|0)>>>0)/(f>>>0)>>>0)-1|0,f)|0;h=b;i=60184;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=aO(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=aO(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=aO(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[15042]=(c[15042]|0)-j;h=c[14940]|0;m=(c[14937]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[14940]=j+o;c[14937]=n;c[j+(o+4)>>2]=n|1;c[j+(m+4)>>2]=40;c[14941]=c[11198];d=(i|0)!=(l|0)&1;return d|0}}while(0);if((c[14937]|0)>>>0<=(c[14941]|0)>>>0){d=0;return d|0}c[14941]=-1;d=0;return d|0}function bT(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function bU(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function bV(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{bU(b,c,d)|0}}function bW(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function bX(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return aB(a|0,b|0,c|0,d|0,e|0,f|0)|0}function bY(a,b){a=a|0;b=b|0;aT[a&1](b|0)}function bZ(a,b,c){a=a|0;b=b|0;c=c|0;aU[a&3](b|0,c|0)}function b_(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;return aV[a&3](b|0,c|0,d|0,e|0,f|0,g|0)|0}function b$(a,b){a=a|0;b=b|0;return aW[a&1](b|0)|0}function b0(a){a=a|0;aX[a&1]()}function b1(a,b,c){a=a|0;b=b|0;c=c|0;return aY[a&1](b|0,c|0)|0}function b2(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;aZ[a&1](b|0,c|0,d|0,e|0)}function b3(a){a=a|0;ab(0)}function b4(a,b){a=a|0;b=b|0;ab(1)}function b5(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ab(2);return 0}function b6(a){a=a|0;ab(3);return 0}function b7(){ab(4)}function b8(a,b){a=a|0;b=b|0;ab(5);return 0}function b9(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ab(6)}
// EMSCRIPTEN_END_FUNCS
var aT=[b3,b3];var aU=[b4,b4,bN,b4];var aV=[b5,b5,bX,b5];var aW=[b6,b6];var aX=[b7,b7];var aY=[b8,b8];var aZ=[b9,b9];return{_strlen:bW,_free:bQ,_lame_close:bx,_memmove:bV,_memset:bT,_malloc:bP,_memcpy:bU,_lame_init:by,_lame_encode_buffer_ieee_float:bt,_get_lame_version:bK,_lame_encode_flush:bw,_calloc:bR,stackAlloc:a_,stackSave:a$,stackRestore:a0,setThrew:a1,setTempRet0:a4,setTempRet1:a5,setTempRet2:a6,setTempRet3:a7,setTempRet4:a8,setTempRet5:a9,setTempRet6:ba,setTempRet7:bb,setTempRet8:bc,setTempRet9:bd,dynCall_vi:bY,dynCall_vii:bZ,dynCall_iiiiiii:b_,dynCall_ii:b$,dynCall_v:b0,dynCall_iii:b1,dynCall_viiii:b2}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiiiiii": invoke_iiiiiii, "invoke_ii": invoke_ii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_llvm_va_end": _llvm_va_end, "_llvm_lifetime_end": _llvm_lifetime_end, "_fabsf": _fabsf, "_snprintf": _snprintf, "_abort": _abort, "_fprintf": _fprintf, "_fflush": _fflush, "_llvm_pow_f32": _llvm_pow_f32, "_log": _log, "_fabs": _fabs, "_floor": _floor, "___setErrNo": ___setErrNo, "__reallyNegative": __reallyNegative, "_send": _send, "_decodeMP3_unclipped": _decodeMP3_unclipped, "_sprintf": _sprintf, "_log10": _log10, "_sin": _sin, "_sysconf": _sysconf, "_ExitMP3": _ExitMP3, "_time": _time, "__formatString": __formatString, "_ceil": _ceil, "_floorf": _floorf, "_vfprintf": _vfprintf, "_cos": _cos, "_pwrite": _pwrite, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_llvm_lifetime_start": _llvm_lifetime_start, "_write": _write, "_fwrite": _fwrite, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr, "_tabsel_123": _tabsel_123, "_freqs": _freqs }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _lame_close = Module["_lame_close"] = asm["_lame_close"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _lame_init = Module["_lame_init"] = asm["_lame_init"];
var _lame_encode_buffer_ieee_float = Module["_lame_encode_buffer_ieee_float"] = asm["_lame_encode_buffer_ieee_float"];
var _get_lame_version = Module["_get_lame_version"] = asm["_get_lame_version"];
var _lame_encode_flush = Module["_lame_encode_flush"] = asm["_lame_encode_flush"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = asm["dynCall_iiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
// libmp3lame function wrappers
var BUFSIZE = 8192;
return {
	STEREO: 0, 
	JOINT_STEREO: 1, 
	MONO: 3,
	get_version: Module.cwrap('get_lame_version', 'string'),
	init: Module.cwrap('lame_init', 'number'),
	//init_params: Module.cwrap('lame_init_params', 'number', [ 'number' ]),
	//set_mode: Module.cwrap('lame_set_mode', 'number', [ 'number', 'number' ]),
	//get_mode: Module.cwrap('lame_get_mode', 'number', [ 'number' ]),
	//set_num_samples: Module.cwrap('lame_set_num_samples', 'number', [ 'number', 'number' ]),
	//get_num_samples: Module.cwrap('lame_get_num_samples', 'number', [ 'number' ]),
	//set_num_channels: Module.cwrap('lame_set_num_channels', 'number', [ 'number', 'number' ]),
	//get_num_channels: Module.cwrap('lame_get_num_channels', 'number', [ 'number' ]),
	//set_in_samplerate: Module.cwrap('lame_set_in_samplerate', 'number', [ 'number', 'number' ]),
	//get_in_samplerate: Module.cwrap('lame_get_in_samplerate', 'number', [ 'number' ]),
	//set_out_samplerate: Module.cwrap('lame_set_out_samplerate', 'number', [ 'number', 'number' ]),
	//get_out_samplerate: Module.cwrap('lame_get_out_samplerate', 'number', [ 'number' ]),
	//set_bitrate: Module.cwrap('lame_set_brate', 'number', [ 'number', 'number' ]),
	//get_bitrate: Module.cwrap('lame_get_brate', 'number', [ 'number' ]),
	encode_buffer_ieee_float: function(handle, channel_l, channel_r) {
		var outbuf = _malloc(BUFSIZE);
		var inbuf_l = _malloc(channel_l.length * 4);
		var inbuf_r = _malloc(channel_r.length * 4);
		for (var i=0;i<channel_l.length;i++) {
			setValue(inbuf_l + (i*4), channel_l[i], 'float');
		}
		for (var i=0;i<channel_r.length;i++) {
			setValue(inbuf_r + (i*4), channel_r[i], 'float');
		}
		var nread = Module.ccall('lame_encode_buffer_ieee_float', 'number', [ 'number', 'number', 'number', 'number', 'number', 'number' ], [ handle, inbuf_l, inbuf_r, channel_l.length, outbuf, BUFSIZE ]);
		var arraybuf = new ArrayBuffer(nread);
		var retdata = new Uint8Array(arraybuf);
		retdata.set(HEAPU8.subarray(outbuf, outbuf + nread));
		_free(outbuf);
		_free(inbuf_l);
		_free(inbuf_r);
		return { size: nread, data: retdata };
	},
	encode_flush: function(handle) {
		var outbuf = _malloc(BUFSIZE);
		var nread = Module.ccall('lame_encode_flush', 'number', [ 'number', 'number', 'number' ], [ handle, outbuf, BUFSIZE ]);
		var arraybuf = new ArrayBuffer(nread);
		var retdata = new Uint8Array(arraybuf);
		retdata.set(HEAPU8.subarray(outbuf, outbuf + nread));
		_free(outbuf);
		return { size: nread, data: retdata };
	},
	close: Module.cwrap('lame_close', 'number', [ 'number' ])
};
})();
