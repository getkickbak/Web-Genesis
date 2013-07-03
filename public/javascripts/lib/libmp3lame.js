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
STATICTOP = STATIC_BASE + 22160;
var _stderr;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,27,134,42,204,204,52,43,33,78,132,43,252,247,157,43,88,156,166,43,252,247,157,43,33,78,132,43,204,204,52,43,0,27,134,42,83,248,191,44,254,169,171,44,146,50,149,44,159,129,122,44,239,29,73,44,62,186,23,44,116,173,207,43,133,159,107,43,183,89,146,42,83,248,191,172,254,169,171,172,146,50,149,172,159,129,122,172,239,29,73,172,62,186,23,172,116,173,207,171,133,159,107,171,183,89,146,170,0,27,134,170,204,204,52,171,33,78,132,171,252,247,157,171,88,156,166,171,252,247,157,171,33,78,132,171,204,204,52,171,0,27,134,170,0,27,134,42,204,204,52,43,33,78,132,43,252,247,157,43,88,156,166,43,252,247,157,43,33,78,132,43,204,204,52,43,0,27,134,42,83,248,191,44,254,169,171,44,146,50,149,44,159,129,122,44,239,29,73,44,62,186,23,44,116,173,207,43,133,159,107,43,183,89,146,42,37,39,192,172,51,37,173,172,234,209,152,172,227,84,131,172,249,175,89,172,11,14,43,172,102,34,244,171,201,49,137,171,74,123,157,170,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,144,128,170,174,79,227,170,5,174,113,170,234,207,6,62,205,19,212,62,139,111,68,63,255,175,139,63,23,208,166,63,117,235,200,63,190,226,245,63,122,130,26,64,105,251,74,64,185,87,144,64,107,16,243,64,233,58,183,65,92,28,124,63,187,141,36,63,68,29,175,62,178,143,112,63,212,208,49,190,125,27,68,191,215,179,93,63,0,0,0,63,254,181,3,191,218,134,241,190,2,115,160,190,116,71,58,190,29,176,193,189,135,203,39,189,29,161,104,188,70,123,114,187,168,132,91,63,216,185,97,63,221,26,115,63,129,186,123,63,65,218,126,63,253,200,127,63,101,249,127,63,141,255,127,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,144,128,42,174,79,227,42,5,174,113,42,37,39,192,44,51,37,173,44,234,209,152,44,227,84,131,44,249,175,89,44,11,14,43,44,102,34,244,43,201,49,137,43,74,123,157,42,83,248,191,172,254,169,171,172,146,50,149,172,159,129,122,172,239,29,73,172,62,186,23,172,116,173,207,171,133,159,107,171,183,89,146,170,0,27,134,170,204,204,52,171,33,78,132,171,252,247,157,171,88,156,166,171,252,247,157,171,33,78,132,171,204,204,52,171,0,27,134,170,137,158,227,63,229,83,236,63,167,94,245,63,155,20,249,63,14,217,252,63,123,143,234,63,218,151,217,63,226,132,191,63,124,145,168,63,0,0,128,63,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,128,63,54,89,75,63,152,134,33,63,152,134,33,63,152,134,33,63,152,134,33,63,152,134,33,63,250,155,128,62,153,158,240,61,0,0,0,0,3,4,6,7,9,10,4,5,6,7,8,10,5,6,7,8,9,10,7,7,8,9,9,10,8,8,9,9,10,11,9,9,10,10,11,11,0,0,0,0,7,0,5,0,9,0,14,0,15,0,7,0,6,0,4,0,5,0,5,0,6,0,7,0,7,0,6,0,8,0,8,0,8,0,5,0,15,0,6,0,9,0,10,0,5,0,1,0,11,0,7,0,9,0,6,0,4,0,1,0,14,0,4,0,6,0,2,0,6,0,0,0,2,4,7,9,9,10,4,4,6,10,10,10,7,6,8,10,10,11,9,10,10,11,11,12,9,9,10,11,12,12,10,10,11,11,13,13,0,0,0,0,3,0,4,0,6,0,18,0,12,0,5,0,5,0,1,0,2,0,16,0,9,0,3,0,7,0,3,0,5,0,14,0,7,0,3,0,19,0,17,0,15,0,13,0,10,0,4,0,13,0,5,0,8,0,11,0,5,0,1,0,12,0,4,0,4,0,1,0,1,0,0,0,1,4,7,9,9,10,4,6,8,9,9,10,7,7,9,10,10,11,8,9,10,11,11,11,8,9,10,11,11,12,9,10,11,12,12,12,0,0,0,0,1,0,2,0,10,0,19,0,16,0,10,0,3,0,3,0,7,0,10,0,5,0,3,0,11,0,4,0,13,0,17,0,8,0,4,0,12,0,11,0,18,0,15,0,11,0,2,0,7,0,6,0,9,0,14,0,3,0,1,0,6,0,4,0,5,0,3,0,2,0,0,0,3,4,6,8,4,4,6,7,5,6,7,8,7,7,8,9,7,0,3,0,5,0,1,0,6,0,2,0,3,0,2,0,5,0,4,0,4,0,1,0,3,0,3,0,2,0,0,0,1,4,7,8,4,5,8,9,7,8,9,10,8,8,9,10,1,0,2,0,6,0,5,0,3,0,1,0,4,0,4,0,7,0,5,0,7,0,1,0,6,0,1,0,1,0,0,0,2,3,7,4,4,7,6,7,8,0,0,0,0,0,0,0,3,0,2,0,1,0,1,0,1,0,1,0,3,0,2,0,0,0,0,0,0,0,0,0,4,5,5,6,5,6,6,7,5,6,6,7,6,7,7,8,15,0,28,0,26,0,48,0,22,0,40,0,36,0,64,0,14,0,24,0,20,0,32,0,12,0,16,0,8,0,0,0,1,5,5,7,5,8,7,9,5,7,7,9,7,9,9,10,1,0,10,0,8,0,20,0,12,0,20,0,16,0,32,0,14,0,12,0,24,0,0,0,28,0,16,0,24,0,16,0,1,4,7,4,5,7,6,7,8,0,0,0,0,0,0,0,1,0,2,0,1,0,3,0,1,0,1,0,3,0,2,0,0,0,0,0,0,0,0,0,4,5,7,8,9,10,10,11,11,12,12,12,12,12,13,10,5,6,7,8,9,10,10,11,11,11,12,12,12,12,12,10,7,7,8,9,9,10,10,11,11,11,11,12,12,12,13,9,8,8,9,9,10,10,10,11,11,11,11,12,12,12,12,9,9,9,9,10,10,10,10,11,11,11,12,12,12,12,13,9,10,9,10,10,10,10,11,11,11,11,12,12,12,12,12,9,10,10,10,10,10,11,11,11,11,12,12,12,12,12,13,9,11,10,10,10,11,11,11,11,12,12,12,12,12,13,13,10,11,11,11,11,11,11,11,11,11,12,12,12,12,13,13,10,11,11,11,11,11,11,11,12,12,12,12,12,13,13,13,10,12,11,11,11,11,12,12,12,12,12,12,13,13,13,13,10,12,12,11,11,11,12,12,12,12,12,12,13,13,13,13,10,12,12,12,12,12,12,12,12,12,12,13,13,13,13,13,10,12,12,12,12,12,12,12,12,13,13,13,13,13,13,13,10,13,12,12,12,12,12,12,13,13,13,13,13,13,13,13,10,9,9,9,9,9,9,9,9,9,9,9,10,10,10,10,6,15,0,13,0,46,0,80,0,146,0,6,1,248,0,178,1,170,1,157,2,141,2,137,2,109,2,5,2,8,4,88,0,14,0,12,0,21,0,38,0,71,0,130,0,122,0,216,0,209,0,198,0,71,1,89,1,63,1,41,1,23,1,42,0,47,0,22,0,41,0,74,0,68,0,128,0,120,0,221,0,207,0,194,0,182,0,84,1,59,1,39,1,29,2,18,0,81,0,39,0,75,0,70,0,134,0,125,0,116,0,220,0,204,0,190,0,178,0,69,1,55,1,37,1,15,1,16,0,147,0,72,0,69,0,135,0,127,0,118,0,112,0,210,0,200,0,188,0,96,1,67,1,50,1,29,1,28,2,14,0,7,1,66,0,129,0,126,0,119,0,114,0,214,0,202,0,192,0,180,0,85,1,61,1,45,1,25,1,6,1,12,0,249,0,123,0,121,0,117,0,113,0,215,0,206,0,195,0,185,0,91,1,74,1,52,1,35,1,16,1,8,2,10,0,179,1,115,0,111,0,109,0,211,0,203,0,196,0,187,0,97,1,76,1,57,1,42,1,27,1,19,2,125,1,17,0,171,1,212,0,208,0,205,0,201,0,193,0,186,0,177,0,169,0,64,1,47,1,30,1,12,1,2,2,121,1,16,0,79,1,199,0,197,0,191,0,189,0,181,0,174,0,77,1,65,1,49,1,33,1,19,1,9,2,123,1,115,1,11,0,156,2,184,0,183,0,179,0,175,0,88,1,75,1,58,1,48,1,34,1,21,1,18,2,127,1,117,1,110,1,10,0,140,2,90,1,171,0,168,0,164,0,62,1,53,1,43,1,31,1,20,1,7,1,1,2,119,1,112,1,106,1,6,0,136,2,66,1,60,1,56,1,51,1,46,1,36,1,28,1,13,1,5,1,0,2,120,1,114,1,108,1,103,1,4,0,108,2,44,1,40,1,38,1,32,1,26,1,17,1,10,1,3,2,124,1,118,1,113,1,109,1,105,1,101,1,2,0,9,4,24,1,22,1,18,1,11,1,8,1,3,1,126,1,122,1,116,1,111,1,107,1,104,1,102,1,100,1,0,0,43,0,20,0,19,0,17,0,15,0,13,0,11,0,9,0,7,0,6,0,4,0,7,0,5,0,3,0,1,0,3,0,1,4,3,5,0,0,0,0,1,0,1,0,1,0,0,0,1,5,7,9,10,10,11,11,12,12,12,13,13,13,14,10,4,6,8,9,10,11,11,11,12,12,12,13,14,13,14,10,7,8,9,10,11,11,12,12,13,12,13,13,13,14,14,11,9,9,10,11,11,12,12,12,13,13,14,14,14,15,15,12,10,10,11,11,12,12,13,13,13,14,14,14,15,15,15,11,10,10,11,11,12,13,13,14,13,14,14,15,15,15,16,12,11,11,11,12,13,13,13,13,14,14,14,14,15,15,16,12,11,11,12,12,13,13,13,14,14,15,15,15,15,17,17,12,11,12,12,13,13,13,14,14,15,15,15,15,16,16,16,12,12,12,12,13,13,14,14,15,15,15,15,16,15,16,15,13,12,13,12,13,14,14,14,14,15,16,16,16,17,17,16,12,13,13,13,13,14,14,15,16,16,16,16,16,16,15,16,13,13,14,14,14,14,15,15,15,15,17,16,16,16,16,18,13,15,14,14,14,15,15,16,16,16,18,17,17,17,19,17,13,14,15,13,14,16,16,15,16,16,17,18,17,19,17,16,13,10,10,10,11,11,12,12,12,13,13,13,13,13,13,13,10,1,5,7,9,10,10,11,11,12,12,12,13,13,13,14,11,4,6,8,9,10,11,11,11,12,12,12,13,14,13,14,11,7,8,9,10,11,11,12,12,13,12,13,13,13,14,14,12,9,9,10,11,11,12,12,12,13,13,14,14,14,15,15,13,10,10,11,11,12,12,13,13,13,14,14,14,15,15,15,12,10,10,11,11,12,13,13,14,13,14,14,15,15,15,16,13,11,11,11,12,13,13,13,13,14,14,14,14,15,15,16,13,11,11,12,12,13,13,13,14,14,15,15,15,15,17,17,13,11,12,12,13,13,13,14,14,15,15,15,15,16,16,16,13,12,12,12,13,13,14,14,15,15,15,15,16,15,16,15,14,12,13,12,13,14,14,14,14,15,16,16,16,17,17,16,13,13,13,13,13,14,14,15,16,16,16,16,16,16,15,16,14,13,14,14,14,14,15,15,15,15,17,16,16,16,16,18,14,15,14,14,14,15,15,16,16,16,18,17,17,17,19,17,14,14,15,13,14,16,16,15,16,16,17,18,17,19,17,16,14,11,11,11,12,12,13,13,13,14,14,14,14,14,14,14,12,1,0,5,0,14,0,44,0,74,0,63,0,110,0,93,0,172,0,149,0,138,0,242,0,225,0,195,0,120,1,17,0,3,0,4,0,12,0,20,0,35,0,62,0,53,0,47,0,83,0,75,0,68,0,119,0,201,0,107,0,207,0,9,0,15,0,13,0,23,0,38,0,67,0,58,0,103,0,90,0,161,0,72,0,127,0,117,0,110,0,209,0,206,0,16,0,45,0,21,0,39,0,69,0,64,0,114,0,99,0,87,0,158,0,140,0,252,0,212,0,199,0,131,1,109,1,26,0,75,0,36,0,68,0,65,0,115,0,101,0,179,0,164,0,155,0,8,1,246,0,226,0,139,1,126,1,106,1,9,0,66,0,30,0,59,0,56,0,102,0,185,0,173,0,9,1,142,0,253,0,232,0,144,1,132,1,122,1,189,1,16,0,111,0,54,0,52,0,100,0,184,0,178,0,160,0,133,0,1,1,244,0,228,0,217,0,129,1,110,1,203,2,10,0,98,0,48,0,91,0,88,0,165,0,157,0,148,0,5,1,248,0,151,1,141,1,116,1,124,1,121,3,116,3,8,0,85,0,84,0,81,0,159,0,156,0,143,0,4,1,249,0,171,1,145,1,136,1,127,1,215,2,201,2,196,2,7,0,154,0,76,0,73,0,141,0,131,0,0,1,245,0,170,1,150,1,138,1,128,1,223,2,103,1,198,2,96,1,11,0,139,0,129,0,67,0,125,0,247,0,233,0,229,0,219,0,137,1,231,2,225,2,208,2,117,3,114,3,183,1,4,0,243,0,120,0,118,0,115,0,227,0,223,0,140,1,234,2,230,2,224,2,209,2,200,2,194,2,223,0,180,1,6,0,202,0,224,0,222,0,218,0,216,0,133,1,130,1,125,1,108,1,120,3,187,1,195,2,184,1,181,1,192,6,4,0,235,2,211,0,210,0,208,0,114,1,123,1,222,2,211,2,202,2,199,6,115,3,109,3,108,3,131,13,97,3,2,0,121,1,113,1,102,0,187,0,214,2,210,2,102,1,199,2,197,2,98,3,198,6,103,3,130,13,102,3,178,1,0,0,12,0,10,0,7,0,11,0,10,0,17,0,11,0,9,0,13,0,12,0,10,0,7,0,5,0,3,0,1,0,3,0,3,5,6,8,8,9,10,10,10,11,11,12,12,12,13,14,5,5,7,8,9,9,10,10,10,11,11,12,12,12,13,13,6,7,7,8,9,9,10,10,10,11,11,12,12,13,13,13,7,8,8,9,9,10,10,11,11,11,12,12,12,13,13,13,8,8,9,9,10,10,11,11,11,11,12,12,12,13,13,13,9,9,9,10,10,10,11,11,11,11,12,12,13,13,13,14,10,9,10,10,10,11,11,11,11,12,12,12,13,13,14,14,10,10,10,11,11,11,11,12,12,12,12,12,13,13,13,14,10,10,10,11,11,11,11,12,12,12,12,13,13,14,14,14,10,10,11,11,11,11,12,12,12,13,13,13,13,14,14,14,11,11,11,11,12,12,12,12,12,13,13,13,13,14,15,14,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,15,12,12,11,12,12,12,13,13,13,13,13,13,14,14,15,15,12,12,12,12,12,13,13,13,13,14,14,14,14,14,15,15,13,13,13,13,13,13,13,13,14,14,14,14,15,15,14,15,13,13,13,13,13,13,13,14,14,14,14,14,15,15,15,15,7,0,12,0,18,0,53,0,47,0,76,0,124,0,108,0,89,0,123,0,108,0,119,0,107,0,81,0,122,0,63,0,13,0,5,0,16,0,27,0,46,0,36,0,61,0,51,0,42,0,70,0,52,0,83,0,65,0,41,0,59,0,36,0,19,0,17,0,15,0,24,0,41,0,34,0,59,0,48,0,40,0,64,0,50,0,78,0,62,0,80,0,56,0,33,0,29,0,28,0,25,0,43,0,39,0,63,0,55,0,93,0,76,0,59,0,93,0,72,0,54,0,75,0,50,0,29,0,52,0,22,0,42,0,40,0,67,0,57,0,95,0,79,0,72,0,57,0,89,0,69,0,49,0,66,0,46,0,27,0,77,0,37,0,35,0,66,0,58,0,52,0,91,0,74,0,62,0,48,0,79,0,63,0,90,0,62,0,40,0,38,0,125,0,32,0,60,0,56,0,50,0,92,0,78,0,65,0,55,0,87,0,71,0,51,0,73,0,51,0,70,0,30,0,109,0,53,0,49,0,94,0,88,0,75,0,66,0,122,0,91,0,73,0,56,0,42,0,64,0,44,0,21,0,25,0,90,0,43,0,41,0,77,0,73,0,63,0,56,0,92,0,77,0,66,0,47,0,67,0,48,0,53,0,36,0,20,0,71,0,34,0,67,0,60,0,58,0,49,0,88,0,76,0,67,0,106,0,71,0,54,0,38,0,39,0,23,0,15,0,109,0,53,0,51,0,47,0,90,0,82,0,58,0,57,0,48,0,72,0,57,0,41,0,23,0,27,0,62,0,9,0,86,0,42,0,40,0,37,0,70,0,64,0,52,0,43,0,70,0,55,0,42,0,25,0,29,0,18,0,11,0,11,0,118,0,68,0,30,0,55,0,50,0,46,0,74,0,65,0,49,0,39,0,24,0,16,0,22,0,13,0,14,0,7,0,91,0,44,0,39,0,38,0,34,0,63,0,52,0,45,0,31,0,52,0,28,0,19,0,14,0,8,0,9,0,3,0,123,0,60,0,58,0,53,0,47,0,43,0,32,0,22,0,37,0,24,0,17,0,12,0,15,0,10,0,2,0,1,0,71,0,37,0,34,0,30,0,28,0,20,0,17,0,26,0,21,0,16,0,10,0,6,0,8,0,6,0,2,0,0,0,1,5,7,8,9,10,10,11,10,11,12,12,13,13,14,14,4,6,8,9,10,10,11,11,11,11,12,12,13,14,14,14,7,8,9,10,11,11,12,12,11,12,12,13,13,14,15,15,8,9,10,11,11,12,12,12,12,13,13,13,13,14,15,15,9,9,11,11,12,12,13,13,12,13,13,14,14,15,15,16,10,10,11,12,12,12,13,13,13,13,14,13,15,15,16,16,10,11,12,12,13,13,13,13,13,14,14,14,15,15,16,16,11,11,12,13,13,13,14,14,14,14,15,15,15,16,18,18,10,10,11,12,12,13,13,14,14,14,14,15,15,16,17,17,11,11,12,12,13,13,13,15,14,15,15,16,16,16,18,17,11,12,12,13,13,14,14,15,14,15,16,15,16,17,18,19,12,12,12,13,14,14,14,14,15,15,15,16,17,17,17,18,12,13,13,14,14,15,14,15,16,16,17,17,17,18,18,18,13,13,14,15,15,15,16,16,16,16,16,17,18,17,18,18,14,14,14,15,15,15,17,16,16,19,17,17,17,19,18,18,13,14,15,16,16,16,17,16,17,17,18,18,21,20,21,18,1,0,5,0,14,0,21,0,34,0,51,0,46,0,71,0,42,0,52,0,68,0,52,0,67,0,44,0,43,0,19,0,3,0,4,0,12,0,19,0,31,0,26,0,44,0,33,0,31,0,24,0,32,0,24,0,31,0,35,0,22,0,14,0,15,0,13,0,23,0,36,0,59,0,49,0,77,0,65,0,29,0,40,0,30,0,40,0,27,0,33,0,42,0,16,0,22,0,20,0,37,0,61,0,56,0,79,0,73,0,64,0,43,0,76,0,56,0,37,0,26,0,31,0,25,0,14,0,35,0,16,0,60,0,57,0,97,0,75,0,114,0,91,0,54,0,73,0,55,0,41,0,48,0,53,0,23,0,24,0,58,0,27,0,50,0,96,0,76,0,70,0,93,0,84,0,77,0,58,0,79,0,29,0,74,0,49,0,41,0,17,0,47,0,45,0,78,0,74,0,115,0,94,0,90,0,79,0,69,0,83,0,71,0,50,0,59,0,38,0,36,0,15,0,72,0,34,0,56,0,95,0,92,0,85,0,91,0,90,0,86,0,73,0,77,0,65,0,51,0,44,0,43,0,42,0,43,0,20,0,30,0,44,0,55,0,78,0,72,0,87,0,78,0,61,0,46,0,54,0,37,0,30,0,20,0,16,0,53,0,25,0,41,0,37,0,44,0,59,0,54,0,81,0,66,0,76,0,57,0,54,0,37,0,18,0,39,0,11,0,35,0,33,0,31,0,57,0,42,0,82,0,72,0,80,0,47,0,58,0,55,0,21,0,22,0,26,0,38,0,22,0,53,0,25,0,23,0,38,0,70,0,60,0,51,0,36,0,55,0,26,0,34,0,23,0,27,0,14,0,9,0,7,0,34,0,32,0,28,0,39,0,49,0,75,0,30,0,52,0,48,0,40,0,52,0,28,0,18,0,17,0,9,0,5,0,45,0,21,0,34,0,64,0,56,0,50,0,49,0,45,0,31,0,19,0,12,0,15,0,10,0,7,0,6,0,3,0,48,0,23,0,20,0,39,0,36,0,35,0,53,0,21,0,16,0,23,0,13,0,10,0,6,0,1,0,4,0,2,0,16,0,15,0,17,0,27,0,25,0,20,0,29,0,11,0,17,0,12,0,16,0,8,0,1,0,1,0,0,0,1,0,4,4,6,8,9,10,10,10,4,5,6,7,9,9,10,10,6,6,7,8,9,10,9,10,7,7,8,8,9,10,10,10,8,8,9,9,10,10,10,11,9,9,10,10,10,11,10,11,9,9,9,10,10,11,11,12,10,10,10,11,11,11,11,12,9,0,6,0,16,0,33,0,41,0,39,0,38,0,26,0,7,0,5,0,6,0,9,0,23,0,16,0,26,0,11,0,17,0,7,0,11,0,14,0,21,0,30,0,10,0,7,0,17,0,10,0,15,0,12,0,18,0,28,0,14,0,5,0,32,0,13,0,22,0,19,0,18,0,16,0,9,0,5,0,40,0,17,0,31,0,29,0,17,0,13,0,4,0,2,0,27,0,12,0,11,0,15,0,10,0,7,0,4,0,1,0,27,0,12,0,8,0,12,0,6,0,3,0,1,0,0,0,2,4,6,8,9,10,9,10,4,5,6,8,10,10,9,10,6,7,8,9,10,11,10,10,8,8,9,11,10,12,10,11,9,10,10,11,11,12,11,12,9,10,11,12,12,13,12,13,9,9,9,10,11,12,12,12,9,9,10,11,12,12,12,12,3,0,4,0,10,0,24,0,34,0,33,0,21,0,15,0,5,0,3,0,4,0,10,0,32,0,17,0,11,0,10,0,11,0,7,0,13,0,18,0,30,0,31,0,20,0,5,0,25,0,11,0,19,0,59,0,27,0,18,0,12,0,5,0,35,0,33,0,31,0,58,0,30,0,16,0,7,0,5,0,28,0,26,0,32,0,19,0,17,0,15,0,8,0,14,0,14,0,12,0,9,0,13,0,14,0,9,0,4,0,1,0,11,0,4,0,6,0,6,0,6,0,3,0,2,0,0,0,1,4,7,9,10,10,10,11,4,6,8,9,10,11,10,10,7,8,9,10,11,12,11,11,8,9,10,11,12,12,11,12,9,10,11,12,12,12,12,12,10,11,12,12,13,13,12,13,9,10,11,12,12,12,13,13,10,10,11,12,12,13,13,13,1,0,2,0,10,0,23,0,35,0,30,0,12,0,17,0,3,0,3,0,8,0,12,0,18,0,21,0,12,0,7,0,11,0,9,0,15,0,21,0,32,0,40,0,19,0,6,0,14,0,13,0,22,0,34,0,46,0,23,0,18,0,7,0,20,0,19,0,33,0,47,0,27,0,22,0,9,0,3,0,31,0,22,0,41,0,26,0,21,0,20,0,5,0,3,0,14,0,13,0,10,0,11,0,16,0,6,0,5,0,1,0,9,0,8,0,7,0,8,0,4,0,4,0,2,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,0,128,64,192,32,160,96,224,16,144,80,208,48,176,112,240,8,136,72,200,40,168,104,232,24,152,88,216,56,184,120,248,4,132,68,196,36,164,100,228,20,148,84,212,52,180,116,244,12,140,76,204,44,172,108,236,28,156,92,220,60,188,124,252,2,130,66,194,34,162,98,226,18,146,82,210,50,178,114,242,10,138,74,202,42,170,106,234,26,154,90,218,58,186,122,250,6,134,70,198,38,166,102,230,22,150,86,214,54,182,118,246,14,142,78,206,46,174,110,238,30,158,94,222,62,190,126,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0,205,204,60,65,154,153,89,65,154,153,137,65,0,0,0,66,0,0,58,66,51,51,77,66,0,0,102,66,51,51,134,66,0,0,143,66,51,51,169,66,51,51,195,66,0,0,2,67,154,153,217,64,154,153,185,64,154,153,185,64,205,204,204,64,0,0,208,64,102,102,30,65,154,153,65,65,102,102,102,65,0,0,112,65,51,51,151,65,205,204,172,65,51,51,215,65,205,204,8,66,205,204,32,66,51,51,59,66,0,0,98,66,205,204,114,66,205,204,147,66,102,102,171,66,205,204,186,66,51,51,252,66,0,0,0,0,0,0,0,0,1,0,0,0,16,0,0,0,17,0,0,0,8,0,0,0,9,0,0,0,24,0,0,0,25,0,0,0,4,0,0,0,5,0,0,0,20,0,0,0,21,0,0,0,12,0,0,0,13,0,0,0,28,0,0,0,29,0,0,0,2,0,0,0,3,0,0,0,18,0,0,0,19,0,0,0,10,0,0,0,11,0,0,0,26,0,0,0,27,0,0,0,6,0,0,0,7,0,0,0,22,0,0,0,23,0,0,0,14,0,0,0,15,0,0,0,30,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,40,8,0,0,32,8,0,0,3,0,0,0,0,0,0,0,8,5,0,0,248,4,0,0,3,0,0,0,0,0,0,0,128,4,0,0,112,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,80,4,0,0,64,4,0,0,4,0,0,0,0,0,0,0,32,4,0,0,16,4,0,0,6,0,0,0,0,0,0,0,200,3,0,0,160,3,0,0,6,0,0,0,0,0,0,0,88,3,0,0,48,3,0,0,6,0,0,0,0,0,0,0,232,2,0,0,192,2,0,0,8,0,0,0,0,0,0,0,240,19,0,0,176,19,0,0,8,0,0,0,0,0,0,0,48,19,0,0,240,18,0,0,8,0,0,0,0,0,0,0,112,18,0,0,48,18,0,0,16,0,0,0,0,0,0,0,48,16,0,0,48,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,9,0,0,16,0,0,0,0,0,0,0,48,13,0,0,48,12,0,0,1,0,0,0,1,0,0,0,48,10,0,0,48,8,0,0,2,0,0,0,3,0,0,0,48,10,0,0,48,8,0,0,3,0,0,0,7,0,0,0,48,10,0,0,48,8,0,0,4,0,0,0,15,0,0,0,48,10,0,0,48,8,0,0,6,0,0,0,63,0,0,0,48,10,0,0,48,8,0,0,8,0,0,0,255,0,0,0,48,10,0,0,48,8,0,0,10,0,0,0,255,3,0,0,48,10,0,0,48,8,0,0,13,0,0,0,255,31,0,0,48,10,0,0,48,8,0,0,4,0,0,0,15,0,0,0,32,6,0,0,32,5,0,0,5,0,0,0,31,0,0,0,32,6,0,0,32,5,0,0,6,0,0,0,63,0,0,0,32,6,0,0,32,5,0,0,7,0,0,0,127,0,0,0,32,6,0,0,32,5,0,0,8,0,0,0,255,0,0,0,32,6,0,0,32,5,0,0,9,0,0,0,255,1,0,0,32,6,0,0,32,5,0,0,11,0,0,0,255,7,0,0,32,6,0,0,32,5,0,0,13,0,0,0,255,31,0,0,32,6,0,0,32,5,0,0,0,0,0,0,0,0,0,0,216,4,0,0,200,4,0,0,0,0,0,0,0,0,0,0,168,4,0,0,152,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,121,207,23,190,138,59,1,66,164,51,148,67,155,200,92,68,202,167,45,70,175,40,132,68,192,222,152,67,129,155,246,65,199,156,118,64,77,183,109,66,194,101,49,68,74,15,165,69,82,45,182,197,71,104,76,196,73,213,153,194,66,4,147,192,94,6,104,63,54,189,72,62,3,97,30,190,44,76,9,66,68,231,150,67,96,102,76,68,47,215,52,70,17,168,147,68,117,204,160,67,46,219,249,65,68,124,109,64,146,154,86,66,183,10,43,68,136,68,163,69,35,243,198,197,129,62,99,196,80,169,179,194,43,42,173,192,1,24,82,63,194,197,199,62,223,144,36,190,144,150,16,66,32,15,152,67,140,47,55,68,113,86,59,70,101,128,162,68,120,164,167,67,193,231,251,65,149,237,87,64,209,237,60,66,46,47,35,68,80,99,160,69,178,232,215,197,240,127,122,196,100,62,207,194,121,91,195,192,207,220,61,63,49,160,20,63,61,91,42,190,177,1,23,66,106,129,151,67,98,254,28,68,14,27,65,70,229,136,176,68,246,95,173,67,75,201,252,65,52,59,74,64,173,80,34,66,178,10,26,68,170,126,156,69,83,240,232,197,121,249,136,196,253,124,236,194,231,48,218,192,193,13,43,63,21,239,67,63,139,188,47,190,75,118,28,66,177,43,149,67,81,195,251,67,92,30,70,70,161,146,189,68,23,254,177,67,116,41,251,65,165,166,58,64,77,48,7,66,62,185,15,68,225,169,151,69,144,236,249,197,102,184,148,196,253,164,5,195,130,12,247,192,196,112,25,63,234,90,113,63,120,177,52,190,11,224,32,66,197,255,144,67,75,169,179,67,9,89,74,70,63,131,201,68,227,108,181,67,12,94,248,65,73,159,52,64,49,233,215,65,148,121,4,68,250,250,145,69,153,95,5,198,224,82,160,196,230,149,21,195,193,75,10,193,185,213,8,63,218,57,142,63,244,54,185,190,93,45,36,66,238,197,138,67,123,163,67,67,193,197,77,70,150,52,212,68,118,180,183,67,208,116,244,65,169,3,34,64,173,143,160,65,68,192,240,67,195,135,139,69,122,165,13,198,28,180,171,196,130,42,38,195,136,83,25,193,112,40,242,62,153,103,162,63,55,74,189,190,167,146,37,66,148,165,130,67,182,247,78,65,135,96,80,70,71,144,221,68,247,225,184,67,182,2,238,65,153,191,25,64,113,224,84,65,226,71,215,67,116,104,132,69,186,183,21,198,32,182,182,196,153,32,55,195,248,124,43,193,205,19,212,62,243,4,181,63,187,232,192,190,91,122,38,66,227,13,113,67,88,242,59,195,65,40,82,70,237,132,229,68,213,190,184,67,201,3,232,65,16,147,4,64,105,242,216,64,110,227,188,67,47,102,121,69,214,134,29,198,81,62,193,196,85,96,72,195,235,212,61,193,80,50,183,62,3,228,197,63,71,16,196,190,73,155,36,66,18,122,88,67,23,20,203,195,140,28,83,70,216,249,235,68,185,166,183,67,247,22,225,65,11,250,244,63,71,16,196,62,69,237,161,67,91,2,105,69,239,4,37,198,124,38,203,196,16,160,89,195,54,63,80,193,66,80,155,62,49,219,212,63,46,15,21,191,242,108,33,66,98,51,60,67,83,17,32,196,220,60,83,70,70,243,240,68,238,104,181,67,38,192,215,65,112,137,223,63,88,12,180,192,157,166,134,67,47,214,87,69,149,32,44,198,6,85,212,196,16,196,106,195,193,157,98,193,212,63,128,62,152,197,225,63,57,182,22,191,234,239,28,66,206,194,27,67,244,79,94,196,226,141,82,70,182,97,244,68,249,56,178,67,221,40,207,65,124,229,200,63,57,233,50,193,16,207,86,67,160,18,70,69,73,205,50,198,21,165,220,196,104,176,123,195,1,246,119,193,175,175,75,62,94,131,236,63,230,143,74,191,36,147,21,66,35,102,239,66,16,227,143,196,201,17,81,70,166,76,246,68,130,2,174,67,22,218,197,65,28,72,177,63,12,95,131,193,224,12,33,67,81,229,51,69,247,251,56,198,140,255,227,196,139,36,134,195,184,137,134,193,100,229,23,62,11,250,244,63,223,202,75,191,201,237,12,66,223,9,160,66,174,0,178,196,45,207,78,70,187,185,246,68,213,254,168,67,51,80,186,65,197,91,178,63,32,204,168,193,139,247,216,66,54,123,33,69,232,158,62,198,230,72,234,196,148,31,142,195,218,232,144,193,220,181,201,61,190,20,251,63,15,177,127,191,152,64,2,66,94,213,19,66,106,66,213,196,38,205,75,70,66,172,245,68,70,55,163,67,112,102,177,65,251,108,153,63,81,248,202,193,231,35,102,66,180,6,15,69,179,170,67,198,226,90,239,196,151,161,149,195,66,6,155,193,60,57,73,61,109,196,254,63,54,211,37,70,68,177,165,69,175,113,104,68,69,51,54,68,128,12,144,67,180,213,129,66,2,0,241,65,34,63,131,64,49,19,72,70,167,49,243,68,86,182,156,67,170,105,166,65,251,100,249,68,112,3,16,65,17,158,233,193,0,0,0,0,0,0,0,0,193,192,0,0,129,193,0,0,64,1,0,0,1,195,0,0,192,3,0,0,128,2,0,0,65,194,0,0,1,198,0,0,192,6,0,0,128,7,0,0,65,199,0,0,0,5,0,0,193,197,0,0,129,196,0,0,64,4,0,0,1,204,0,0,192,12,0,0,128,13,0,0,65,205,0,0,0,15,0,0,193,207,0,0,129,206,0,0,64,14,0,0,0,10,0,0,193,202,0,0,129,203,0,0,64,11,0,0,1,201,0,0,192,9,0,0,128,8,0,0,65,200,0,0,1,216,0,0,192,24,0,0,128,25,0,0,65,217,0,0,0,27,0,0,193,219,0,0,129,218,0,0,64,26,0,0,0,30,0,0,193,222,0,0,129,223,0,0,64,31,0,0,1,221,0,0,192,29,0,0,128,28,0,0,65,220,0,0,0,20,0,0,193,212,0,0,129,213,0,0,64,21,0,0,1,215,0,0,192,23,0,0,128,22,0,0,65,214,0,0,1,210,0,0,192,18,0,0,128,19,0,0,65,211,0,0,0,17,0,0,193,209,0,0,129,208,0,0,64,16,0,0,1,240,0,0,192,48,0,0,128,49,0,0,65,241,0,0,0,51,0,0,193,243,0,0,129,242,0,0,64,50,0,0,0,54,0,0,193,246,0,0,129,247,0,0,64,55,0,0,1,245,0,0,192,53,0,0,128,52,0,0,65,244,0,0,0,60,0,0,193,252,0,0,129,253,0,0,64,61,0,0,1,255,0,0,192,63,0,0,128,62,0,0,65,254,0,0,1,250,0,0,192,58,0,0,128,59,0,0,65,251,0,0,0,57,0,0,193,249,0,0,129,248,0,0,64,56,0,0,0,40,0,0,193,232,0,0,129,233,0,0,64,41,0,0,1,235,0,0,192,43,0,0,128,42,0,0,65,234,0,0,1,238,0,0,192,46,0,0,128,47,0,0,65,239,0,0,0,45,0,0,193,237,0,0,129,236,0,0,64,44,0,0,1,228,0,0,192,36,0,0,128,37,0,0,65,229,0,0,0,39,0,0,193,231,0,0,129,230,0,0,64,38,0,0,0,34,0,0,193,226,0,0,129,227,0,0,64,35,0,0,1,225,0,0,192,33,0,0,128,32,0,0,65,224,0,0,1,160,0,0,192,96,0,0,128,97,0,0,65,161,0,0,0,99,0,0,193,163,0,0,129,162,0,0,64,98,0,0,0,102,0,0,193,166,0,0,129,167,0,0,64,103,0,0,1,165,0,0,192,101,0,0,128,100,0,0,65,164,0,0,0,108,0,0,193,172,0,0,129,173,0,0,64,109,0,0,1,175,0,0,192,111,0,0,128,110,0,0,65,174,0,0,1,170,0,0,192,106,0,0,128,107,0,0,65,171,0,0,0,105,0,0,193,169,0,0,129,168,0,0,64,104,0,0,0,120,0,0,193,184,0,0,129,185,0,0,64,121,0,0,1,187,0,0,192,123,0,0,128,122,0,0,65,186,0,0,1,190,0,0,192,126,0,0,128,127,0,0,65,191,0,0,0,125,0,0,193,189,0,0,129,188,0,0,64,124,0,0,1,180,0,0,192,116,0,0,128,117,0,0,65,181,0,0,0,119,0,0,193,183,0,0,129,182,0,0,64,118,0,0,0,114,0,0,193,178,0,0,129,179,0,0,64,115,0,0,1,177,0,0,192,113,0,0,128,112,0,0,65,176,0,0,0,80,0,0,193,144,0,0,129,145,0,0,64,81,0,0,1,147,0,0,192,83,0,0,128,82,0,0,65,146,0,0,1,150,0,0,192,86,0,0,128,87,0,0,65,151,0,0,0,85,0,0,193,149,0,0,129,148,0,0,64,84,0,0,1,156,0,0,192,92,0,0,128,93,0,0,65,157,0,0,0,95,0,0,193,159,0,0,129,158,0,0,64,94,0,0,0,90,0,0,193,154,0,0,129,155,0,0,64,91,0,0,1,153,0,0,192,89,0,0,128,88,0,0,65,152,0,0,1,136,0,0,192,72,0,0,128,73,0,0,65,137,0,0,0,75,0,0,193,139,0,0,129,138,0,0,64,74,0,0,0,78,0,0,193,142,0,0,129,143,0,0,64,79,0,0,1,141,0,0,192,77,0,0,128,76,0,0,65,140,0,0,0,68,0,0,193,132,0,0,129,133,0,0,64,69,0,0,1,135,0,0,192,71,0,0,128,70,0,0,65,134,0,0,1,130,0,0,192,66,0,0,128,67,0,0,65,131,0,0,0,65,0,0,193,129,0,0,129,128,0,0,64,64,0,0,0,0,0,0,8,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,80,0,0,0,96,0,0,0,112,0,0,0,128,0,0,0,144,0,0,0,160,0,0,0,255,255,255,255,0,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,80,0,0,0,96,0,0,0,112,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,1,0,0,64,1,0,0,255,255,255,255,0,0,0,0,8,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,69,114,114,111,114,58,32,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,105,110,95,98,117,102,102,101,114,32,98,117,102,102,101,114,10,0,37,100,0,0,0,0,0,0,69,114,114,111,114,58,32,77,65,88,95,72,69,65,68,69,82,95,66,85,70,32,116,111,111,32,115,109,97,108,108,32,105,110,32,98,105,116,115,116,114,101,97,109,46,99,32,10,0,0,0,0,0,0,0,0,32,49,37,37,32,32,98,117,103,32,105,110,32,76,65,77,69,32,101,110,99,111,100,105,110,103,32,108,105,98,114,97,114,121,0,0,0,0,0,0,32,57,37,37,32,32,89,111,117,114,32,115,121,115,116,101,109,32,105,115,32,111,118,101,114,99,108,111,99,107,101,100,0,0,0,0,0,0,0,0,51,46,57,57,46,53,0,0,57,48,37,37,32,32,76,65,77,69,32,99,111,109,112,105,108,101,100,32,119,105,116,104,32,98,117,103,103,121,32,118,101,114,115,105,111,110,32,111,102,32,103,99,99,32,117,115,105,110,103,32,97,100,118,97,110,99,101,100,32,111,112,116,105,109,105,122,97,116,105,111,110,115,0,0,0,0,0,0,84,104,105,115,32,105,115,32,97,32,102,97,116,97,108,32,101,114,114,111,114,46,32,32,73,116,32,104,97,115,32,115,101,118,101,114,97,108,32,112,111,115,115,105,98,108,101,32,99,97,117,115,101,115,58,0,98,105,116,32,114,101,115,101,114,118,111,105,114,32,101,114,114,111,114,58,32,10,108,51,95,115,105,100,101,45,62,109,97,105,110,95,100,97,116,97,95,98,101,103,105,110,58,32,37,105,32,10,82,101,115,118,111,105,114,32,115,105,122,101,58,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,10,114,101,115,118,32,100,114,97,105,110,32,40,112,111,115,116,41,32,32,32,32,32,32,32,32,32,37,105,32,10])
.concat([114,101,115,118,32,100,114,97,105,110,32,40,112,114,101,41,32,32,32,32,32,32,32,32,32,32,37,105,32,10,104,101,97,100,101,114,32,97,110,100,32,115,105,100,101,105,110,102,111,58,32,32,32,32,32,32,37,105,32,10,100,97,116,97,32,98,105,116,115,58,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,10,116,111,116,97,108,32,98,105,116,115,58,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,40,114,101,109,97,105,110,100,101,114,58,32,37,105,41,32,10,98,105,116,115,112,101,114,102,114,97,109,101,58,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,10,0,0,115,116,114,97,110,103,101,32,101,114,114,111,114,32,102,108,117,115,104,105,110,103,32,98,117,102,102,101,114,32,46,46,46,32,10,0,0,0,0,0,73,110,116,101,114,110,97,108,32,98,117,102,102,101,114,32,105,110,99,111,110,115,105,115,116,101,110,99,121,46,32,102,108,117,115,104,98,105,116,115,32,60,62,32,82,101,115,118,83,105,122,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,221,1,30,61,115,47,118,192,47,250,176,188,158,20,250,64,153,188,161,186,158,119,53,193,81,220,194,184,116,225,80,65,83,153,135,188,1,154,68,193,129,18,177,60,29,186,23,65,225,231,169,188,42,236,187,192,86,189,194,59,84,76,48,64,23,210,72,59,21,174,94,191,117,48,252,56,166,136,14,62,45,12,61,59,187,242,93,61,21,159,94,192,66,120,238,188,39,159,203,64,116,13,11,188,159,194,8,193,122,116,11,188,136,161,23,65,15,206,8,188,48,10,13,193,54,239,183,60,24,84,219,64,42,177,212,188,119,161,140,192,227,27,133,60,46,141,12,64,204,220,29,187,91,68,64,191,179,14,221,59,38,166,6,62,18,27,246,186,98,72,30,62,88,65,24,192,146,25,191,189,204,80,54,64,198,233,127,189,83,84,41,192,195,60,177,60,160,42,15,64,141,230,100,189,27,243,213,191,107,217,67,61,72,195,128,63,221,177,17,59,30,72,235,190,198,2,2,61,96,182,39,62,140,213,99,188,41,29,78,189,32,117,213,59,250,86,192,60,8,103,16,188,195,30,155,62,254,109,206,191,55,145,103,190,17,54,138,63,79,222,175,189,44,92,131,190,5,120,6,61,113,172,38,190,93,7,22,188,128,210,103,190,162,171,193,188,106,76,200,62,186,131,191,187,206,177,98,190,217,136,128,61,99,84,56,61,14,238,10,183,195,81,164,60,229,233,6,59,220,52,70,59,209,172,241,188,164,63,172,62,202,209,191,191,12,238,130,190,224,157,95,63,198,63,242,189,120,245,249,61,39,37,244,61,171,200,78,191,74,115,160,189,61,4,245,62,155,0,154,187,253,11,255,189,221,42,193,187,240,154,38,189,226,118,106,61,225,172,170,61,116,82,8,60,208,143,45,189,111,248,133,188,144,228,243,60,148,49,144,188,83,247,229,62,31,210,32,191,69,246,18,190,75,222,151,62,236,79,105,190,172,192,190,190,13,131,104,188,76,24,12,59,175,11,39,61,83,49,215,190,21,234,253,189,13,83,99,62,22,214,39,61,196,1,201,59,137,153,214,61,247,48,138,61,143,176,152,188,61,242,108,61,134,205,2,189,7,1,4,61,132,146,177,59,35,242,16,63,249,36,134,191,99,48,65,191,195,71,149,62,202,81,38,62,41,63,137,190,8,118,43,62,71,89,6,60,108,141,65,190,36,174,230,62,232,94,158,62,59,32,169,190,83,31,141,190,179,5,138,61,91,28,212,59,139,246,67,189,211,25,177,61,92,87,134,60,98,50,27,189,45,15,148,60,22,191,192,187,190,188,20,63,131,166,2,191,181,32,8,191,54,36,163,190,218,83,18,190,249,108,79,190,122,105,51,62,249,208,22,62,32,205,194,60,1,112,199,62,138,81,31,62,88,186,110,190,236,195,129,190,127,224,86,189,85,103,133,60,212,73,205,188,47,187,141,61,242,19,200,60,237,111,24,189,6,255,148,60,149,162,245,187,69,87,9,63,94,65,128,190,239,223,215,190,42,39,221,190,85,217,52,187,98,70,12,189,146,207,46,61,213,159,63,189,79,51,209,189,227,53,135,62,214,104,21,62,42,194,26,62,27,131,201,188,75,199,51,190,101,108,229,189,100,191,64,190,139,76,38,189,16,94,96,61,204,36,68,61,80,177,64,61,130,177,181,188,0,0,0,0,98,120,124,63,40,114,252,191,98,120,252,191,59,253,120,63,98,120,124,63,19,41,124,63,180,33,252,191,19,41,252,191,229,96,120,63,19,41,124,63,66,185,122,63,86,171,250,191,66,185,250,191,92,142,117,63,66,185,122,63,120,174,121,63,129,154,249,191,120,174,249,191,222,132,115,63,120,174,121,63,91,33,121,63,194,9,249,191,91,33,249,191,234,113,114,63,91,33,121,63,110,236,118,63,58,195,246,191,110,236,246,191,69,43,110,63,110,236,118,63,141,200,117,63,87,148,245,191,141,200,245,191,134,249,107,63,141,200,117,63,202,100,117,63,133,44,245,191,202,100,245,191,31,58,107,63,202,100,117,63,138,43,114,63,214,203,241,191,138,43,242,191,124,22,101,63,138,43,114,63,0,0,0,0])
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
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
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
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stderr|0;var n=+env.NaN;var o=+env.Infinity;var p=0;var q=0;var r=0;var s=0;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=env.abort;var aa=env.assert;var ab=env.asmPrintInt;var ac=env.asmPrintFloat;var ad=env.min;var ae=env.invoke_vi;var af=env.invoke_vii;var ag=env.invoke_ii;var ah=env.invoke_v;var ai=env.invoke_iii;var aj=env.invoke_viiii;var ak=env._llvm_va_end;var al=env._llvm_lifetime_end;var am=env._malloc;var an=env._fabsf;var ao=env._snprintf;var ap=env._abort;var aq=env._fprintf;var ar=env._fflush;var as=env._llvm_pow_f32;var at=env._log;var au=env._fabs;var av=env._floor;var aw=env.___setErrNo;var ax=env.__reallyNegative;var ay=env._send;var az=env._decodeMP3_unclipped;var aA=env._sprintf;var aB=env._log10;var aC=env._sin;var aD=env._sysconf;var aE=env._ExitMP3;var aF=env._time;var aG=env.__formatString;var aH=env._ceil;var aI=env._floorf;var aJ=env._vfprintf;var aK=env._cos;var aL=env._pwrite;var aM=env._sbrk;var aN=env.___errno_location;var aO=env._llvm_lifetime_start;var aP=env._write;var aQ=env._fwrite;
// EMSCRIPTEN_START_FUNCS
function aX(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function aY(){return i|0}function aZ(a){a=a|0;i=a}function a_(a,b){a=a|0;b=b|0;if((p|0)==0){p=a;q=b}}function a$(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function a0(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function a1(a){a=a|0;C=a}function a2(a){a=a|0;D=a}function a3(a){a=a|0;E=a}function a4(a){a=a|0;F=a}function a5(a){a=a|0;G=a}function a6(a){a=a|0;H=a}function a7(a){a=a|0;I=a}function a8(a){a=a|0;J=a}function a9(a){a=a|0;K=a}function ba(a){a=a|0;L=a}function bb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;e=c[a+52132>>2]|0;f=c[a+52128>>2]|0;g=(f|0)==0?255:f-1|0;f=(c[a+39840+(g*48&-1)>>2]|0)-(c[a+292>>2]|0)|0;c[b>>2]=f;if((f|0)>-1){h=1-e+g|0;j=f-(_(((g|0)<(e|0)?h+256|0:h)<<3,c[a+24>>2]|0)|0)|0}else{j=f}h=a+16|0;e=c[a+84744>>2]|0;if((e|0)==0){k=a+120|0;l=c[h>>2]|0}else{g=c[h>>2]|0;k=19856+(g<<6)+(e<<2)|0;l=g}g=c[a+84752>>2]|0;e=c[a+64>>2]|0;h=((_((l*72e3&-1)+72e3|0,c[k>>2]|0)|0)/(e|0)&-1)+g<<3;g=h+j|0;j=h+f|0;f=((j&7|0)!=0&1)+((j|0)/8&-1)|0;c[b>>2]=f;c[b>>2]=(c[a+296>>2]|0)+1+f;if((g|0)>=0){i=d;return g|0}bw(a,20656,(t=i,i=i+1|0,i=i+7>>3<<3,c[t>>2]=0,t)|0);i=d;return g|0}function bc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;do{if((e|0)>7){f=b+300|0;g=b+296|0;h=b+52132|0;i=b+292|0;j=b+284|0;k=b+24|0;l=8;do{m=c[f>>2]|0;if((m|0)==0){c[f>>2]=8;n=(c[g>>2]|0)+1|0;c[g>>2]=n;o=c[h>>2]|0;if((c[b+39840+(o*48&-1)>>2]|0)==(c[i>>2]|0)){p=(c[j>>2]|0)+n|0;q=b+39840+(o*48&-1)+8|0;o=c[k>>2]|0;bA(p|0,q|0,o)|0;o=c[k>>2]|0;q=(c[g>>2]|0)+o|0;c[g>>2]=q;c[i>>2]=(c[i>>2]|0)+(o<<3);c[h>>2]=(c[h>>2]|0)+1&255;r=q}else{r=n}a[(c[j>>2]|0)+r|0]=0;s=c[f>>2]|0}else{s=m}m=(l|0)<(s|0)?l:s;l=l-m|0;n=s-m|0;c[f>>2]=n;q=(c[j>>2]|0)+(c[g>>2]|0)|0;a[q]=(76>>>(l>>>0)<<n|d[q])&255;t=(c[i>>2]|0)+m|0;c[i>>2]=t;}while((l|0)>0);l=e-8|0;if((l|0)>7){u=8;v=t}else{w=l;break}do{l=c[f>>2]|0;if((l|0)==0){c[f>>2]=8;m=(c[g>>2]|0)+1|0;c[g>>2]=m;q=c[h>>2]|0;if((c[b+39840+(q*48&-1)>>2]|0)==(v|0)){n=(c[j>>2]|0)+m|0;o=b+39840+(q*48&-1)+8|0;q=c[k>>2]|0;bA(n|0,o|0,q)|0;q=c[k>>2]|0;o=(c[g>>2]|0)+q|0;c[g>>2]=o;c[i>>2]=(c[i>>2]|0)+(q<<3);c[h>>2]=(c[h>>2]|0)+1&255;x=o}else{x=m}a[(c[j>>2]|0)+x|0]=0;y=c[f>>2]|0}else{y=l}l=(u|0)<(y|0)?u:y;u=u-l|0;m=y-l|0;c[f>>2]=m;o=(c[j>>2]|0)+(c[g>>2]|0)|0;a[o]=(65>>>(u>>>0)<<m|d[o])&255;v=(c[i>>2]|0)+l|0;c[i>>2]=v;}while((u|0)>0);l=e-16|0;if((l|0)>7){z=8;A=v}else{w=l;break}do{l=c[f>>2]|0;if((l|0)==0){c[f>>2]=8;o=(c[g>>2]|0)+1|0;c[g>>2]=o;m=c[h>>2]|0;if((c[b+39840+(m*48&-1)>>2]|0)==(A|0)){q=(c[j>>2]|0)+o|0;n=b+39840+(m*48&-1)+8|0;m=c[k>>2]|0;bA(q|0,n|0,m)|0;m=c[k>>2]|0;n=(c[g>>2]|0)+m|0;c[g>>2]=n;c[i>>2]=(c[i>>2]|0)+(m<<3);c[h>>2]=(c[h>>2]|0)+1&255;B=n}else{B=o}a[(c[j>>2]|0)+B|0]=0;C=c[f>>2]|0}else{C=l}l=(z|0)<(C|0)?z:C;z=z-l|0;o=C-l|0;c[f>>2]=o;n=(c[j>>2]|0)+(c[g>>2]|0)|0;a[n]=(77>>>(z>>>0)<<o|d[n])&255;A=(c[i>>2]|0)+l|0;c[i>>2]=A;}while((z|0)>0);l=e-24|0;if((l|0)>7){D=8;E=A}else{w=l;break}do{l=c[f>>2]|0;if((l|0)==0){c[f>>2]=8;n=(c[g>>2]|0)+1|0;c[g>>2]=n;o=c[h>>2]|0;if((c[b+39840+(o*48&-1)>>2]|0)==(E|0)){m=(c[j>>2]|0)+n|0;q=b+39840+(o*48&-1)+8|0;o=c[k>>2]|0;bA(m|0,q|0,o)|0;o=c[k>>2]|0;q=(c[g>>2]|0)+o|0;c[g>>2]=q;c[i>>2]=(c[i>>2]|0)+(o<<3);c[h>>2]=(c[h>>2]|0)+1&255;F=q}else{F=n}a[(c[j>>2]|0)+F|0]=0;G=c[f>>2]|0}else{G=l}l=(D|0)<(G|0)?D:G;D=D-l|0;n=G-l|0;c[f>>2]=n;q=(c[j>>2]|0)+(c[g>>2]|0)|0;a[q]=(69>>>(D>>>0)<<n|d[q])&255;E=(c[i>>2]|0)+l|0;c[i>>2]=E;}while((D|0)>0);l=e-32|0;if((l|0)<=31){w=l;break}q=e-40|0;n=(q>>>0<40?q&-8^-8:-48)+e|0;q=0;o=l;l=E;while(1){m=a[20232+q|0]|0;p=8;H=l;do{I=c[f>>2]|0;if((I|0)==0){c[f>>2]=8;J=(c[g>>2]|0)+1|0;c[g>>2]=J;K=c[h>>2]|0;if((c[b+39840+(K*48&-1)>>2]|0)==(H|0)){L=(c[j>>2]|0)+J|0;M=b+39840+(K*48&-1)+8|0;K=c[k>>2]|0;bA(L|0,M|0,K)|0;K=c[k>>2]|0;M=(c[g>>2]|0)+K|0;c[g>>2]=M;c[i>>2]=(c[i>>2]|0)+(K<<3);c[h>>2]=(c[h>>2]|0)+1&255;N=M}else{N=J}a[(c[j>>2]|0)+N|0]=0;O=c[f>>2]|0}else{O=I}I=(p|0)<(O|0)?p:O;p=p-I|0;J=O-I|0;c[f>>2]=J;M=(c[j>>2]|0)+(c[g>>2]|0)|0;a[M]=(m>>p<<J|d[M])&255;H=(c[i>>2]|0)+I|0;c[i>>2]=H;}while((p|0)>0);p=o-8|0;m=q+1|0;if((m|0)<6&(p|0)>7){q=m;o=p;l=H}else{break}}w=n-32|0}else{w=e}}while(0);if((w|0)<=0){return}e=b+52136|0;O=b+300|0;N=b+296|0;E=b+52132|0;D=b+292|0;G=b+284|0;F=b+24|0;A=b+144|0;z=w;w=c[e>>2]|0;do{C=1;do{B=c[O>>2]|0;if((B|0)==0){c[O>>2]=8;v=(c[N>>2]|0)+1|0;c[N>>2]=v;u=c[E>>2]|0;if((c[b+39840+(u*48&-1)>>2]|0)==(c[D>>2]|0)){y=(c[G>>2]|0)+v|0;x=b+39840+(u*48&-1)+8|0;u=c[F>>2]|0;bA(y|0,x|0,u)|0;u=c[F>>2]|0;x=(c[N>>2]|0)+u|0;c[N>>2]=x;c[D>>2]=(c[D>>2]|0)+(u<<3);c[E>>2]=(c[E>>2]|0)+1&255;P=x}else{P=v}a[(c[G>>2]|0)+P|0]=0;Q=c[O>>2]|0}else{Q=B}B=(C|0)<(Q|0)?C:Q;C=C-B|0;v=Q-B|0;c[O>>2]=v;x=(c[G>>2]|0)+(c[N>>2]|0)|0;a[x]=(w>>C<<v|d[x])&255;c[D>>2]=(c[D>>2]|0)+B;}while((C|0)>0);w=(c[A>>2]|0)==0&1^c[e>>2];c[e>>2]=w;z=z-1|0;}while((z|0)>0);return}function bd(a,e,f){a=a|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0.0,K=0.0,L=0,M=0.0,N=0.0,O=0;h=i;i=i+9224|0;j=h|0;k=h+8|0;l=a+296|0;m=c[l>>2]|0;n=m+1|0;if((m|0)<0){o=0;i=h;return o|0}if((f|0)!=0&(n|0)>(f|0)){o=-1;i=h;return o|0}f=c[a+284>>2]|0;bA(e|0,f|0,n)|0;c[l>>2]=-1;c[a+300>>2]=0;l=a+85752|0;if((n|0)>0){f=0;m=b[l>>1]|0;do{m=(c[18832+((((d[e+f|0]|0)^m)&255)<<2)>>2]^(m&65535)>>>8)&65535;b[l>>1]=m;f=f+1|0;}while((f|0)<(n|0))}f=a+85788|0;c[f>>2]=(c[f>>2]|0)+n;if((c[a+136>>2]|0)==0){o=n;i=h;return o|0}f=a+85676|0;m=a+85808|0;l=k|0;p=k+4608|0;q=a+132|0;r=a+128|0;s=a+72|0;t=a+85684|0;a=n;L95:while(1){u=c[m>>2]|0;do{if((u|0)==0){v=0}else{w=az(u|0,e|0,a|0,8472,9216,j|0)|0;if((w|0)==0){x=c[u+68>>2]|0;if((x|0)==1){y=c[j>>2]|0;z=(y|0)/4&-1;if((y|0)>3){A=0;B=l;C=8472}else{v=z;break}while(1){g[B>>2]=+g[C>>2];y=A+1|0;if((y|0)<(z|0)){A=y;B=B+4|0;C=C+4|0}else{v=z;break}}}else if((x|0)==2){z=((c[j>>2]|0)/4&-1)>>1;if((z|0)>0){D=0;E=l;F=p;G=8472}else{v=z;break}while(1){g[E>>2]=+g[G>>2];g[F>>2]=+g[G+4>>2];y=D+1|0;if((y|0)<(z|0)){D=y;E=E+4|0;F=F+4|0;G=G+8|0}else{v=z;break}}}else{v=-1;break}}else if((w|0)==(-1|0)){v=-1;break}else if((w|0)==1){v=0;break}else{v=-1;break}}}while(0);u=(v|0)==-1?0:v;do{if((u|0)>0){do{if((c[q>>2]|0)!=0){z=0;H=+g[t>>2];while(1){I=+g[k+(z<<2)>>2];do{if(I>H){g[t>>2]=I;J=I}else{K=-0.0-I;if(H>=K){J=H;break}g[t>>2]=K;J=K}}while(0);x=z+1|0;if((x|0)<(u|0)){z=x;H=J}else{break}}if((c[s>>2]|0)>1){L=0;M=J}else{break}while(1){H=+g[k+4608+(L<<2)>>2];do{if(H>M){g[t>>2]=H;N=H}else{I=-0.0-H;if(M>=I){N=M;break}g[t>>2]=I;N=I}}while(0);z=L+1|0;if((z|0)<(u|0)){L=z;M=N}else{break}}}}while(0);if((c[r>>2]|0)==0){break}if((bi(c[f>>2]|0,l,p,u,c[s>>2]|0)|0)==0){o=-6;O=92;break L95}}}while(0);if((u|0)==0){o=n;O=93;break}else{a=0}}if((O|0)==92){i=h;return o|0}else if((O|0)==93){i=h;return o|0}return 0}function be(b,f){b=b|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;h=(c[f+4840>>2]|0)+32|0;i=c[f+4772>>2]|0;j=(c[f+4776>>2]|0)-i|0;if((j|0)<=3){k=0;return k|0}l=c[7936+(h<<4)>>2]|0;m=c[7940+(h<<4)>>2]|0;h=b+300|0;n=b+296|0;o=b+52132|0;p=b+292|0;q=b+284|0;r=b+24|0;s=(j|0)/4&-1;j=0;t=f+2304+(i<<2)|0;u=f+(i<<2)|0;while(1){do{if((c[t>>2]|0)==0){v=0;w=0}else{if(+g[u>>2]>=0.0){v=8;w=0;break}v=8;w=1}}while(0);do{if((c[t+4>>2]|0)==0){x=v;y=w}else{i=v|4;f=w<<1;if(+g[u+4>>2]>=0.0){x=i;y=f;break}x=i;y=f|1}}while(0);do{if((c[t+8>>2]|0)==0){z=x;A=y}else{f=x+2|0;i=y<<1;if(+g[u+8>>2]>=0.0){z=f;A=i;break}z=f;A=i|1}}while(0);do{if((c[t+12>>2]|0)==0){B=z;C=A}else{i=z+1|0;f=A<<1;if(+g[u+12>>2]>=0.0){B=i;C=f;break}B=i;C=f|1}}while(0);f=t+16|0;i=u+16|0;D=(e[l+(B<<1)>>1]|0)+C|0;E=m+B|0;F=a[E]|0;if(F<<24>>24==0){G=0}else{H=F&255;do{F=c[h>>2]|0;if((F|0)==0){c[h>>2]=8;I=(c[n>>2]|0)+1|0;c[n>>2]=I;J=c[o>>2]|0;if((c[b+39840+(J*48&-1)>>2]|0)==(c[p>>2]|0)){K=(c[q>>2]|0)+I|0;L=b+39840+(J*48&-1)+8|0;J=c[r>>2]|0;bA(K|0,L|0,J)|0;J=c[r>>2]|0;L=(c[n>>2]|0)+J|0;c[n>>2]=L;c[p>>2]=(c[p>>2]|0)+(J<<3);c[o>>2]=(c[o>>2]|0)+1&255;M=L}else{M=I}a[(c[q>>2]|0)+M|0]=0;N=c[h>>2]|0}else{N=F}F=(H|0)<(N|0)?H:N;H=H-F|0;I=N-F|0;c[h>>2]=I;L=(c[q>>2]|0)+(c[n>>2]|0)|0;a[L]=(D>>H<<I|(d[L]|0))&255;c[p>>2]=(c[p>>2]|0)+F;}while((H|0)>0);G=d[E]|0}H=G+j|0;D=s-1|0;if((D|0)>0){s=D;j=H;t=f;u=i}else{k=H;break}}return k|0}function bf(b,f,h,i,j){b=b|0;f=f|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0;k=c[7928+(f<<4)>>2]|0;if(!((f|0)!=0&(h|0)<(i|0))){l=0;return l|0}m=f>>>0>15;n=k&65535;o=c[7940+(f<<4)>>2]|0;p=c[7936+(f<<4)>>2]|0;f=b+300|0;q=b+296|0;r=b+52132|0;s=b+292|0;t=b+284|0;u=b+24|0;v=0;w=h;while(1){h=c[j+2304+(w<<2)>>2]|0;x=w+1|0;y=c[j+2304+(x<<2)>>2]|0;if((h|0)==0){z=0;A=0}else{z=+g[j+(w<<2)>>2]<0.0&1;A=-1}do{if(m){if(h>>>0>14){B=15;C=z|(h<<1)+131042&131070;D=n}else{B=h;C=z;D=0}if(y>>>0<=14){E=B;F=C;G=16;H=D;I=132;break}J=(D&65535)+k&65535;K=16;L=C<<k|y+65521&65535;M=B;N=15;I=133}else{E=h;F=z;G=k;H=0;I=132}}while(0);if((I|0)==132){I=0;if((y|0)==0){O=F;P=A;Q=H;R=G;S=E;T=0}else{J=H;K=G;L=F;M=E;N=y;I=133}}if((I|0)==133){I=0;O=+g[j+(x<<2)>>2]<0.0&1|L<<1;P=A-1&65535;Q=J;R=K;S=M;T=N}h=(_(R,S)|0)+T|0;U=Q-P&65535;V=(d[o+h|0]|0)+P&65535;W=e[p+(h<<1)>>1]|0;h=V<<16>>16;if(V<<16>>16>0){V=h;do{X=c[f>>2]|0;if((X|0)==0){c[f>>2]=8;Y=(c[q>>2]|0)+1|0;c[q>>2]=Y;Z=c[r>>2]|0;if((c[b+39840+(Z*48&-1)>>2]|0)==(c[s>>2]|0)){$=(c[t>>2]|0)+Y|0;aa=b+39840+(Z*48&-1)+8|0;Z=c[u>>2]|0;bA($|0,aa|0,Z)|0;Z=c[u>>2]|0;aa=(c[q>>2]|0)+Z|0;c[q>>2]=aa;c[s>>2]=(c[s>>2]|0)+(Z<<3);c[r>>2]=(c[r>>2]|0)+1&255;ab=aa}else{ab=Y}a[(c[t>>2]|0)+ab|0]=0;ac=c[f>>2]|0}else{ac=X}X=(V|0)<(ac|0)?V:ac;V=V-X|0;Y=ac-X|0;c[f>>2]=Y;aa=(c[t>>2]|0)+(c[q>>2]|0)|0;a[aa]=(W>>>(V>>>0)<<Y|(d[aa]|0))&255;c[s>>2]=(c[s>>2]|0)+X;}while((V|0)>0)}V=U&65535;if(Q<<16>>16!=P<<16>>16){W=V;do{x=c[f>>2]|0;if((x|0)==0){c[f>>2]=8;y=(c[q>>2]|0)+1|0;c[q>>2]=y;X=c[r>>2]|0;if((c[b+39840+(X*48&-1)>>2]|0)==(c[s>>2]|0)){aa=(c[t>>2]|0)+y|0;Y=b+39840+(X*48&-1)+8|0;X=c[u>>2]|0;bA(aa|0,Y|0,X)|0;X=c[u>>2]|0;Y=(c[q>>2]|0)+X|0;c[q>>2]=Y;c[s>>2]=(c[s>>2]|0)+(X<<3);c[r>>2]=(c[r>>2]|0)+1&255;ad=Y}else{ad=y}a[(c[t>>2]|0)+ad|0]=0;ae=c[f>>2]|0}else{ae=x}x=(W|0)<(ae|0)?W:ae;W=W-x|0;y=ae-x|0;c[f>>2]=y;Y=(c[t>>2]|0)+(c[q>>2]|0)|0;a[Y]=(O>>W<<y|(d[Y]|0))&255;c[s>>2]=(c[s>>2]|0)+x;}while((W|0)>0)}W=V+v+h|0;U=w+2|0;if((U|0)<(i|0)){v=W;w=U}else{l=W;break}}return l|0}function bg(b,e,f,j,l){b=b|0;e=e|0;f=f|0;j=j|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,O=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aT=0,aU=0,aV=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bq=0,br=0,bv=0,bx=0,by=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0.0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0.0,b2=0,b3=0.0,b4=0.0,b5=0,b6=0.0,b7=0.0,b8=0.0,b9=0.0,ca=0.0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0.0,cj=0.0,ck=0,cl=0,cm=0.0,cn=0,co=0.0,cp=0.0,cq=0,cr=0,cs=0.0,ct=0.0,cu=0.0,cv=0.0,cw=0,cx=0.0,cy=0.0,cz=0.0,cA=0,cB=0,cC=0.0,cD=0,cE=0,cF=0,cG=0,cH=0,cI=0,cJ=0.0,cK=0,cL=0,cM=0,cN=0,cO=0,cP=0,cQ=0.0,cR=0,cS=0.0,cT=0,cU=0,cV=0.0,cW=0.0,cX=0.0,cY=0.0,cZ=0.0,c_=0.0,c$=0,c0=0,c1=0,c2=0.0,c3=0.0,c4=0.0,c5=0.0,c6=0.0,c7=0,c8=0.0,c9=0.0,da=0,db=0.0,dc=0.0,dd=0.0,de=0,df=0,dg=0.0,dh=0,di=0,dj=0,dk=0,dl=0,dm=0,dn=0.0,dp=0,dq=0,dr=0,ds=0,dt=0.0,du=0,dv=0.0,dw=0,dx=0,dy=0.0,dz=0.0,dA=0.0,dB=0,dC=0,dD=0,dE=0.0,dF=0.0,dG=0.0,dH=0,dI=0,dJ=0,dK=0,dL=0,dM=0,dN=0.0,dO=0.0,dP=0.0,dQ=0.0,dR=0.0,dS=0,dT=0,dU=0,dV=0.0,dW=0.0,dX=0.0,dY=0,dZ=0.0,d_=0.0,d$=0,d0=0,d1=0,d2=0.0,d3=0.0,d4=0,d5=0,d6=0,d7=0,d8=0,d9=0,ea=0,eb=0,ec=0,ed=0,ee=0,ef=0,eg=0,eh=0,ei=0,ej=0,ek=0,el=0,em=0,en=0,eo=0,ep=0,eq=0,er=0,es=0,et=0,eu=0,ev=0,ew=0,ex=0,ey=0,ez=0,eA=0,eB=0,eC=0,eD=0,eE=0,eF=0,eG=0,eH=0,eI=0,eJ=0,eK=0,eL=0,eM=0,eN=0,eO=0,eP=0,eQ=0,eR=0,eS=0,eT=0,eU=0,eV=0,eW=0,eX=0,eY=0,eZ=0,e_=0,e$=0,e0=0,e1=0,e2=0,e3=0,e4=0,e5=0,e6=0,e7=0,e8=0,e9=0,fa=0,fb=0,fc=0,fd=0,fe=0,ff=0,fg=0,fh=0,fi=0,fj=0,fk=0,fl=0,fm=0,fn=0,fo=0,fp=0,fq=0,fr=0,fs=0,ft=0,fu=0,fv=0,fw=0,fx=0,fy=0,fz=0,fA=0,fB=0,fC=0,fD=0.0,fE=0.0,fF=0.0,fG=0.0,fH=0,fI=0.0,fJ=0.0,fK=0,fL=0,fM=0,fN=0,fO=0,fP=0,fQ=0,fR=0,fS=0.0,fT=0.0,fU=0.0,fV=0,fW=0.0,fX=0.0,fY=0.0,fZ=0.0,f_=0.0,f$=0.0,f0=0,f1=0.0,f2=0.0,f3=0.0,f4=0.0,f5=0.0,f6=0.0,f7=0,f8=0.0,f9=0.0,ga=0.0,gb=0.0,gc=0,gd=0,ge=0.0,gf=0,gg=0,gh=0.0,gi=0,gj=0.0,gk=0,gl=0.0,gm=0,gn=0.0,go=0,gp=0.0,gq=0,gr=0.0,gs=0.0,gt=0,gu=0.0,gv=0,gw=0.0,gx=0.0,gy=0.0,gz=0.0,gA=0,gB=0,gC=0,gD=0,gE=0.0,gF=0.0,gG=0,gH=0,gI=0,gJ=0,gK=0,gL=0,gM=0.0,gN=0,gO=0.0,gP=0.0,gQ=0.0,gR=0,gS=0,gT=0,gU=0,gV=0,gW=0;m=i;i=i+47144|0;n=m|0;o=m+8|0;p=m+168|0;q=m+328|0;r=m+488|0;s=m+496|0;u=m+560|0;v=m+816|0;w=m+1072|0;x=m+1144|0;y=m+1200|0;z=m+1256|0;A=m+5864|0;B=m+5912|0;C=m+5960|0;D=m+5976|0;E=m+6952|0;F=m+9008|0;G=m+10560|0;H=m+18752|0;I=m+24896|0;J=m+25920|0;K=m+26944|0;L=m+26992|0;M=m+27056|0;O=m+27064|0;Q=m+27080|0;R=m+35136|0;S=m+43192|0;T=m+45144|0;U=m+47096|0;V=m+47104|0;W=m+47136|0;X=W;Y=i;i=i+16|0;Z=i;i=i+16|0;$=i;i=i+8|0;aa=$;ab=i;i=i+8|0;c[W>>2]=1056964608;c[W+4>>2]=1056964608;bz(Y|0,0,16);bz(Z|0,0,16);ac=U|0;c[ac>>2]=e;c[U+4>>2]=f;ad=b+4|0;if((c[ad>>2]|0)==0){ae=b+76|0;af=c[ae>>2]|0;ag=af*576&-1;c[ad>>2]=1;bz(Q|0,0,8056);bz(R|0,0,8056);ad=ag+862|0;if((ad|0)>0){ah=b+72|0;ai=0;aj=0;while(1){do{if((ai|0)<(ag|0)){g[Q+(ai<<2)>>2]=0.0;if((c[ah>>2]|0)!=2){ak=aj;break}g[R+(ai<<2)>>2]=0.0;ak=aj}else{g[Q+(ai<<2)>>2]=+g[e+(aj<<2)>>2];if((c[ah>>2]|0)==2){g[R+(ai<<2)>>2]=+g[f+(aj<<2)>>2]}ak=aj+1|0}}while(0);al=ai+1|0;if((al|0)<(ad|0)){ai=al;aj=ak}else{break}}}if((af|0)>0){ak=b+72|0;aj=0;ai=c[ak>>2]|0;ad=af;while(1){if((ai|0)>0){af=0;do{c[b+304+(aj*10504&-1)+(af*5252&-1)+4788>>2]=2;af=af+1|0;am=c[ak>>2]|0;}while((af|0)<(am|0));an=am;ao=c[ae>>2]|0}else{an=ai;ao=ad}af=aj+1|0;if((af|0)<(ao|0)){aj=af;ai=an;ad=ao}else{break}}}bp(b,Q|0,R|0)}R=b+84752|0;c[R>>2]=0;Q=b+39836|0;ao=(c[Q>>2]|0)-(c[b+39832>>2]|0)|0;c[Q>>2]=ao;if((ao|0)<0){c[Q>>2]=(c[b+64>>2]|0)+ao;c[R>>2]=1}c[$>>2]=0;c[$+4>>2]=0;ao=b+76|0;Q=c[ao>>2]|0;if((Q|0)>0){ad=b+72|0;an=$;$=ab|0;ai=b+180|0;aj=D;ae=L;am=O;ak=b+85800|0;af=b+140|0;ah=b+192|0;e=b+200|0;ag=b+85796|0;al=I|0;ap=b+25660|0;aq=M|0;ar=z;as=C;at=C|0;au=M+4|0;av=A|0;aw=B|0;ax=B+4|0;ay=A+4|0;az=B+8|0;aA=A+8|0;aB=B+12|0;aC=B+16|0;aD=B+20|0;aE=B+24|0;aF=B+28|0;aG=B+32|0;aH=B+36|0;aI=B+40|0;aJ=B+44|0;aK=C+4|0;aL=C+8|0;aM=C+12|0;aN=A+12|0;aO=A+16|0;aP=A+20|0;aQ=A+24|0;aR=A+28|0;aT=A+32|0;aU=A+36|0;aV=A+40|0;aX=A+44|0;aY=b+184|0;aZ=E|0;a_=u;a$=v;a0=w|0;a1=u|0;a2=v|0;a3=u+4|0;a4=b+84908|0;a5=v+4|0;a6=b+85804|0;a7=b+85820|0;a8=J|0;a9=x|0;ba=y|0;bg=x+4|0;bh=y+4|0;bi=x+8|0;bj=y+8|0;bk=x+12|0;bl=y+12|0;bm=x+16|0;bn=y+16|0;bo=x+20|0;bq=y+20|0;br=x+24|0;bv=y+24|0;bx=x+28|0;by=y+28|0;bB=x+32|0;bC=y+32|0;bD=x+36|0;bE=y+36|0;bF=x+40|0;bG=y+40|0;bH=x+44|0;bI=y+44|0;bJ=x+48|0;bK=y+48|0;bL=s|0;bM=O|0;bN=ab+4|0;bO=0;bP=c[ad>>2]|0;while(1){bQ=(bP|0)>0;if(bQ){bR=(bO*576&-1)+304|0;bS=0;do{c[aa+(bS<<2)>>2]=(c[U+(bS<<2)>>2]|0)+(bR<<2);bS=bS+1|0;}while((bS|0)<(bP|0))}bS=Y+(bO<<3)|0;bR=c[ak>>2]|0;bT=(c[af>>2]|0)==0;if(bT){bU=0}else{bU=c[a6>>2]|0}if(+g[ah>>2]>0.0){bV=+g[e>>2]*+g[(c[ag>>2]|0)+8>>2]}else{bV=1.0}bz(ae|0,0,64);bW=(c[ai>>2]|0)==1;bX=bW?4:bP;bA(aj|0,ap|0,976)|0;if(bT){bY=0}else{bY=c[a6>>2]|0}bT=bW?4:bP;bz(ar|0,0,4608);if(bQ){bW=(bT|0)>2;bZ=0;do{b_=c[an+(bZ<<2)>>2]|0;b$=0;do{g[z+(bZ*2304&-1)+(b$<<2)>>2]=+g[b_+(b$+407<<2)>>2]+(+g[b_+(b$+397<<2)>>2]+ +g[b_+(b$+418<<2)>>2])*-1.7303260184043527e-17+(+g[b_+(b$+399<<2)>>2]+ +g[b_+(b$+416<<2)>>2])*-1.3495279640235235e-17+(+g[b_+(b$+401<<2)>>2]+ +g[b_+(b$+414<<2)>>2])*-6.732779685849225e-17+(+g[b_+(b$+403<<2)>>2]+ +g[b_+(b$+412<<2)>>2])*-3.0835000291318875e-17+(+g[b_+(b$+405<<2)>>2]+ +g[b_+(b$+410<<2)>>2])*-1.1044240253100168e-16+((+g[b_+(b$+398<<2)>>2]+ +g[b_+(b$+417<<2)>>2])*-.017031719908118248+0.0+(+g[b_+(b$+400<<2)>>2]+ +g[b_+(b$+415<<2)>>2])*.04180720075964928+(+g[b_+(b$+402<<2)>>2]+ +g[b_+(b$+413<<2)>>2])*-.08763240277767181+(+g[b_+(b$+404<<2)>>2]+ +g[b_+(b$+411<<2)>>2])*.1863476037979126+(+g[b_+(b$+406<<2)>>2]+ +g[b_+(b$+409<<2)>>2])*-.6276379823684692);b$=b$+1|0;}while((b$|0)<576);b$=S+(bO*976&-1)+(bZ*488&-1)+244|0;b_=b+26636+(bZ*244&-1)|0;bA(b$|0,b_|0,244)|0;b_=S+(bO*976&-1)+(bZ*488&-1)|0;b$=b+25660+(bZ*244&-1)|0;bA(b_|0,b$|0,244)|0;if(bW){b$=bZ+2|0;b_=T+(bO*976&-1)+(bZ*488&-1)+244|0;b0=b+26636+(b$*244&-1)|0;bA(b_|0,b0|0,244)|0;b0=T+(bO*976&-1)+(bZ*488&-1)|0;b_=b+25660+(b$*244&-1)|0;bA(b0|0,b_|0,244)|0}bZ=bZ+1|0;}while((bZ|0)<(bP|0))}if((bT|0)>0){bZ=(bY|0)==0;bW=0;do{bz(as|0,0,16);bQ=z+((bW&1)*2304&-1)|0;if((bW|0)==2){b_=576;b0=0;while(1){b$=z+(b0<<2)|0;b1=+g[b$>>2];b2=z+2304+(b0<<2)|0;b3=+g[b2>>2];g[b$>>2]=b1+b3;g[b2>>2]=b1-b3;b2=b_-1|0;if((b2|0)>0){b_=b2;b0=b0+1|0}else{break}}}b3=+g[b+27636+(bW*36&-1)+24>>2];g[aw>>2]=b3;g[av>>2]=b3/+g[b+27636+(bW*36&-1)+16>>2];b1=+g[b+27636+(bW*36&-1)+28>>2];g[ax>>2]=b1;g[ay>>2]=b1/+g[b+27636+(bW*36&-1)+20>>2];b4=+g[b+27636+(bW*36&-1)+32>>2];g[az>>2]=b4;g[aA>>2]=b4/b3;g[at>>2]=b3+0.0+b1+b4;b0=bQ;b_=0;while(1){b2=b0+256|0;b$=b0;b4=1.0;do{b1=+N(+(+g[b$>>2]));b4=b4<b1?b1:b4;b$=b$+4|0;}while(b$>>>0<b2>>>0);b2=b_+3|0;g[B+(b2<<2)>>2]=b4;g[b+27636+(bW*36&-1)+(b_<<2)>>2]=b4;b5=C+(((b_|0)/3&-1)+1<<2)|0;g[b5>>2]=b4+ +g[b5>>2];b5=b_+1|0;b1=+g[B+(b5<<2)>>2];do{if(b4>b1){b6=b4/b1}else{b3=b4*10.0;if(b1<=b3){b6=0.0;break}b6=b1/b3}}while(0);g[A+(b2<<2)>>2]=b6;if((b5|0)<9){b0=b$;b_=b5}else{break}}b1=+g[aC>>2];b4=+g[aD>>2];b3=+g[aB>>2]+b1+b4;do{if(b4*6.0<b3){if(b1*6.0>=b3){b7=.5;break}b7=.25}else{b7=1.0}}while(0);g[K+(bW*12&-1)>>2]=b7;b3=+g[aF>>2];b1=+g[aG>>2];b4=+g[aE>>2]+b3+b1;do{if(b1*6.0<b4){if(b3*6.0>=b4){b8=.5;break}b8=.25}else{b8=1.0}}while(0);g[K+(bW*12&-1)+4>>2]=b8;b4=+g[aI>>2];b3=+g[aJ>>2];b1=+g[aH>>2]+b4+b3;do{if(b3*6.0<b1){if(b4*6.0>=b1){b9=.5;break}b9=.25}else{b9=1.0}}while(0);g[K+(bW*12&-1)+8>>2]=b9;if(!bZ){b1=+g[av>>2];b4=+g[ay>>2];b3=b1<b4?b4:b1;b1=+g[aA>>2];b4=b3<b1?b1:b3;b3=+g[aN>>2];b1=b4<b3?b3:b4;b4=+g[aO>>2];b3=b1<b4?b4:b1;b1=+g[aP>>2];b4=b3<b1?b1:b3;b3=+g[aQ>>2];b1=b4<b3?b3:b4;b4=+g[aR>>2];b3=b1<b4?b4:b1;b1=+g[aT>>2];b4=b3<b1?b1:b3;b3=+g[aU>>2];b1=b4<b3?b3:b4;b4=+g[aV>>2];b3=b1<b4?b4:b1;b1=+g[aX>>2];b_=bY+197112+(bW<<3)|0;h[bY+197144+(bO<<5)+(bW<<3)>>3]=+h[b_>>3];h[b_>>3]=b3<b1?b1:b3}b3=+g[(c[ak>>2]|0)+6480+(bW<<2)>>2];b_=0;do{b0=L+(bW<<4)+(((b_|0)/3&-1)<<2)|0;do{if((c[b0>>2]|0)==0){if(+g[A+(b_<<2)>>2]<=b3){break}c[b0>>2]=((b_|0)%3&-1)+1}}while(0);b_=b_+1|0;}while((b_|0)<12);b_=L+(bW<<4)|0;b3=+g[at>>2];b1=+g[aK>>2];b4=b1*1.7000000476837158;if((b3>b1?b3:b1)<4.0e4&b3<b4&b1<b3*1.7000000476837158){b0=L+(bW<<4)+4|0;if((c[b_>>2]|0)<=(c[b0>>2]|0)){c[b_>>2]=0}c[b0>>2]=0}b3=+g[aL>>2];ca=b3*1.7000000476837158;if((b1>b3?b1:b3)<4.0e4&b1<ca&b3<b4){c[L+(bW<<4)+8>>2]=0}b4=+g[aM>>2];if((b3>b4?b3:b4)<4.0e4&b3<b4*1.7000000476837158&b4<ca){c[L+(bW<<4)+12>>2]=0}b0=c[b_>>2]|0;b5=c[b+27780+(bW<<2)>>2]|0;if((b0|0)>(b5|0)){cb=b0}else{c[b_>>2]=0;cb=0}b_=L+(bW<<4)+4|0;b0=c[b_>>2]|0;if((b5|0)==3){cc=218}else{if((b0+cb+(c[L+(bW<<4)+8>>2]|0)|0)==(-(c[L+(bW<<4)+12>>2]|0)|0)){cd=1}else{cc=218}}do{if((cc|0)==218){cc=0;do{if((b0|0)==0){ce=0}else{if((cb|0)==0){ce=b0;break}c[b_>>2]=0;ce=0}}while(0);b5=L+(bW<<4)+8|0;if((c[b5>>2]|0)==0){cd=0;break}if((ce|0)!=0){c[b5>>2]=0;cd=0;break}b5=L+(bW<<4)+12|0;if((c[b5>>2]|0)==0){cd=0;break}c[b5>>2]=0;cd=0}}while(0);do{if((bW|0)<2){c[M+(bW<<2)>>2]=cd}else{if((cd|0)!=0){break}c[au>>2]=0;c[aq>>2]=0}}while(0);g[V+(bO<<4)+(bW<<2)>>2]=+g[b+27620+(bW<<2)>>2];bW=bW+1|0;}while((bW|0)<(bT|0))}bT=c[aY>>2]|0;do{if((bT|0)==1){if((c[aq>>2]|0)!=0){if((c[au>>2]|0)!=0){break}}c[au>>2]=0;c[aq>>2]=0}}while(0);bW=c[ad>>2]|0;if((bW|0)>0){bZ=0;do{if((bT|0)==2){c[M+(bZ<<2)>>2]=1}else if((bT|0)==3){c[M+(bZ<<2)>>2]=0}bZ=bZ+1|0;}while((bZ|0)<(bW|0))}bW=(bX|0)>0;if(bW){bZ=0;do{bT=bZ&1;b_=G+(bT<<12)|0;if((c[af>>2]|0)==0){cf=0}else{cf=c[a6>>2]|0}b0=(bZ|0)<2;do{if(b0){b5=b_|0;b$=an+(bZ<<2)|0;b2=G+(bT<<12)+2048|0;bQ=127;while(1){cg=d[5360+bQ|0]|0;ch=c[b$>>2]|0;ca=+g[ch+(cg<<2)>>2]*0.0;b4=+g[ch+((cg|512)<<2)>>2]*0.0;b3=ca-b4;b1=ca+b4;b4=+g[ch+((cg|256)<<2)>>2]*0.0;ca=+g[ch+((cg|768)<<2)>>2]*0.0;ci=b4-ca;cj=b4+ca;ch=b2-16|0;g[ch>>2]=b1+cj;g[b2-8>>2]=b1-cj;g[b2-12>>2]=b3+ci;g[b2-4>>2]=b3-ci;ck=c[b$>>2]|0;ci=+g[ck+(cg+1<<2)>>2]*0.0;b3=+g[ck+(cg+513<<2)>>2]*0.0;cj=ci-b3;b1=ci+b3;b3=+g[ck+(cg+257<<2)>>2]*0.0;ci=+g[ck+(cg+769<<2)>>2]*0.0;ca=b3-ci;b4=b3+ci;g[b2+2032>>2]=b1+b4;g[b2+2040>>2]=b1-b4;g[b2+2036>>2]=cj+ca;g[b2+2044>>2]=cj-ca;if((bQ|0)<=0){break}b2=ch;bQ=bQ-1|0}aS[c[a7>>2]&3](b5,512)}else{if((bZ|0)!=2){break}bQ=bT+1|0;b2=1023;while(1){b$=G+(bT<<12)+(b2<<2)|0;ca=+g[b$>>2];ch=G+(bQ<<12)+(b2<<2)|0;cj=+g[ch>>2];g[b$>>2]=(ca+cj)*.7071067690849304;g[ch>>2]=(ca-cj)*.7071067690849304;if((b2|0)>0){b2=b2-1|0}else{break}}}}while(0);cj=+g[b_>>2];g[aZ>>2]=cj*cj;b2=511;while(1){bQ=512-b2|0;cj=+g[G+(bT<<12)+(bQ<<2)>>2];ca=+g[G+(bT<<12)+(b2+512<<2)>>2];g[E+(bQ<<2)>>2]=(cj*cj+ca*ca)*.5;if((b2|0)>0){b2=b2-1|0}else{cl=11;cm=0.0;break}}do{cm=cm+ +g[E+(cl<<2)>>2];cl=cl+1|0;}while((cl|0)<513);g[b+27620+(bZ<<2)>>2]=cm;if((cf|0)!=0){b2=0;do{b_=cf+90936+(bZ<<13)+(b2<<3)|0;h[cf+123704+(bO<<15)+(bZ<<13)+(b2<<3)>>3]=+h[b_>>3];h[b_>>3]=+g[E+(b2<<2)>>2];b2=b2+1|0;}while((b2|0)<513)}if(b0){b2=b+27612+(bZ<<2)|0;g[b+27804+(bO<<3)+(bZ<<2)>>2]=+g[b2>>2];b_=c[ag>>2]|0;bQ=0;ca=0.0;do{ca=ca+ +g[E+(bQ<<2)>>2]*+g[b_+724+(bQ<<2)>>2];bQ=bQ+1|0;}while((bQ|0)<512);g[b2>>2]=ca*8.974871343596633e-12}bQ=c[ak>>2]|0;b_=bQ+2148|0;b0=c[b_>>2]|0;b5=(b0|0)>0;if(b5){ch=0;b$=0;while(1){cg=c[bQ+1716+(b$<<2)>>2]|0;if((cg|0)>0){ck=ch;cj=0.0;b4=0.0;cn=0;while(1){b1=+g[E+(ck<<2)>>2];co=cj+b1;cp=b4<b1?b1:b4;cq=cn+1|0;if((cq|0)<(cg|0)){ck=ck+1|0;cj=co;b4=cp;cn=cq}else{break}}cr=((cg|0)>1?cg:1)+ch|0;cs=co;ct=cp}else{cr=ch;cs=0.0;ct=0.0}g[I+(bZ<<8)+(b$<<2)>>2]=cs;g[u+(b$<<2)>>2]=ct;g[v+(b$<<2)>>2]=cs*+g[bQ+512+(b$<<2)>>2];cn=b$+1|0;if((cn|0)<(b0|0)){ch=cr;b$=cn}else{break}}cu=+g[a2>>2];cv=+g[a5>>2]}else{cu=0.0;cv=0.0}ca=cv+cu;if(ca>0.0){b4=+g[a1>>2];cj=+g[a3>>2];b$=~~(((b4<cj?cj:b4)*2.0-ca)*20.0/(ca*+((c[bQ+1716>>2]|0)-1+(c[bQ+1720>>2]|0)|0)));cw=(b$|0)>8?8:b$&255}else{cw=0}a[a0]=cw;b$=b0-1|0;ca=+g[a5>>2];b4=cu+ca;if((b$|0)>1){ch=(b$|0)>2;b2=1;cn=0;cj=b4;b1=ca;while(1){ck=b2+1|0;ca=+g[v+(ck<<2)>>2];ci=cj+ca;if(ci>0.0){b3=+g[u+(cn<<2)>>2];cx=+g[u+(b2<<2)>>2];cy=b3<cx?cx:b3;b3=+g[u+(ck<<2)>>2];cq=~~(((cy<b3?b3:cy)*3.0-ci)*20.0/(ci*+((c[bQ+1716+(cn<<2)>>2]|0)-1+(c[bQ+1716+(b2<<2)>>2]|0)+(c[bQ+1716+(ck<<2)>>2]|0)|0)));a[w+b2|0]=(cq|0)>8?8:cq&255}else{a[w+b2|0]=0}cz=b1+ca;if((ck|0)<(b$|0)){cn=b2;b2=ck;cj=cz;b1=ca}else{break}}b2=ch?b$:2;cA=b2;cB=b2-1|0;cC=cz}else{cA=1;cB=0;cC=b4}if(cC>0.0){b1=+g[u+(cB<<2)>>2];cj=+g[u+(cA<<2)>>2];b2=~~(((b1<cj?cj:b1)*2.0-cC)*20.0/(cC*+((c[bQ+1716+(cB<<2)>>2]|0)-1+(c[bQ+1716+(cA<<2)>>2]|0)|0)));a[w+cA|0]=(b2|0)>8?8:b2&255}else{a[w+cA|0]=0}if(b5){b2=bQ+2156|0;cn=b+27796+(bT<<2)|0;b0=0;ck=0;while(1){b1=+g[bQ+(b0<<2)>>2]*+g[a4>>2];cq=c[bQ+1204+(b0<<3)>>2]|0;cD=c[bQ+1204+(b0<<3)+4>>2]|0;cE=c[624+((d[w+b0|0]|0)<<2)>>2]|0;cF=d[w+cq|0]|0;cG=c[b2>>2]|0;cj=+g[cG+(ck<<2)>>2]*+g[I+(bZ<<8)+(cq<<2)>>2]*+g[664+(cF<<2)>>2];cH=ck+1|0;cI=cq+1|0;if((cI|0)>(cD|0)){cJ=cj;cK=cF;cL=2;cM=cH}else{ca=cj;cq=cF;cF=1;cN=cH;cH=cI;while(1){cI=d[w+cH|0]|0;cO=cI+cq|0;cP=cF+1|0;cj=+g[cG+(cN<<2)>>2]*+g[I+(bZ<<8)+(cH<<2)>>2]*+g[664+(cI<<2)>>2];cI=cH-b0|0;ci=ca<0.0?0.0:ca;cy=cj<0.0?0.0:cj;do{if(ci>0.0){if(cy<=0.0){cQ=ci;break}cR=cy>ci;if(cR){cS=cy/ci}else{cS=ci/cy}if((((cI|0)>-1?cI:-cI|0)|0)>(cE|0)){if(cS<0.0){cQ=ci+cy;break}else{cQ=cR?cy:ci;break}}else{if(cS<0.0){cR=(g[k>>2]=cS,c[k>>2]|0);cj=+(cR&16383|0)*6103515625.0e-14;cT=cR>>>14&511;cQ=(ci+cy)*+g[584+(~~((+((cR>>>23&255)-127|0)+((1.0-cj)*+g[5864+(cT<<2)>>2]+cj*+g[5864+(cT+1<<2)>>2]))*4.816479930623698)<<2)>>2];break}else{cQ=ci+cy;break}}}else{cQ=cy}}while(0);cU=cN+1|0;cI=cH+1|0;if((cI|0)>(cD|0)){break}else{ca=cQ;cq=cO;cF=cP;cN=cU;cH=cI}}cJ=cQ;cK=cO;cL=cP<<1;cM=cU}ca=+g[664+(((cK<<1|1|0)/(cL|0)&-1)<<2)>>2]*.5;cy=cJ*ca;cH=c[cn>>2]|0;do{if((cH|0)==2){ci=+g[b+21564+(bZ<<8)+(b0<<2)>>2];cj=ci*2.0;if(cj>0.0){b3=cy<cj?cy:cj;g[J+(bZ<<8)+(b0<<2)>>2]=b3;cV=ci;cW=b3;break}else{b3=cy;cj=+g[I+(bZ<<8)+(b0<<2)>>2]*.3;cx=b3<cj?b3:cj;g[J+(bZ<<8)+(b0<<2)>>2]=cx;cV=ci;cW=cx;break}}else{cx=+g[b+22588+(bZ<<8)+(b0<<2)>>2]*16.0;ci=+g[b+21564+(bZ<<8)+(b0<<2)>>2];cj=ci*2.0;b3=cx>0.0?cx:cy;cx=cj>0.0?cj:cy;if((cH|0)==0){cX=cx<b3?cx:b3}else{cX=cx}cx=cy<cX?cy:cX;g[J+(bZ<<8)+(b0<<2)>>2]=cx;cV=ci;cW=cx}}while(0);g[b+22588+(bZ<<8)+(b0<<2)>>2]=cV;g[b+21564+(bZ<<8)+(b0<<2)>>2]=cy;cx=ca*+g[u+(b0<<2)>>2]*+g[bQ+256+(b0<<2)>>2];cH=J+(bZ<<8)+(b0<<2)|0;if(cW>cx){g[cH>>2]=cx;cY=cx}else{cY=cW}if(b1>1.0){cx=b1*cY;g[cH>>2]=cx;cZ=cx}else{cZ=cY}cx=+g[I+(bZ<<8)+(b0<<2)>>2];if(cZ>cx){g[cH>>2]=cx;c_=cx}else{c_=cZ}if(b1<1.0){g[cH>>2]=b1*c_}c$=b0+1|0;if((c$|0)<(c[b_>>2]|0)){b0=c$;ck=cM}else{break}}if((c$|0)<64){c0=c$;cc=291}}else{c0=0;cc=291}if((cc|0)==291){cc=0;ck=c0+1|0;b0=((ck|0)>64?ck:64)-c0<<2;bz(I+(bZ<<8)+(c0<<2)|0,0,b0|0);bz(J+(bZ<<8)+(c0<<2)|0,0,b0|0)}bZ=bZ+1|0;}while((bZ|0)<(bX|0))}do{if((c[ai>>2]|0)==1){if(((c[au>>2]|0)+(c[aq>>2]|0)|0)!=2){break}bs(al,a8,bR+768|0,(c[ag>>2]|0)+212|0,bV,+g[ah>>2],c[bR+2148>>2]|0)}}while(0);if(bW){bZ=0;do{b0=I+(bZ<<8)|0;ck=J+(bZ<<8)|0;bt(c[ak>>2]|0,b0,ck,b+26636+(bZ*244&-1)|0,b+25660+(bZ*244&-1)|0);bt((c[ak>>2]|0)+4320|0,b0,ck,a9,ba);ck=0;do{b4=+g[x+(ck<<2)>>2];cx=+g[y+(ck<<2)>>2]*.015625;g[b+26636+(bZ*244&-1)+88+(ck*12&-1)>>2]=b4;g[b+25660+(bZ*244&-1)+88+(ck*12&-1)>>2]=cx;g[b+26636+(bZ*244&-1)+88+(ck*12&-1)+4>>2]=b4;g[b+25660+(bZ*244&-1)+88+(ck*12&-1)+4>>2]=cx;g[b+26636+(bZ*244&-1)+88+(ck*12&-1)+8>>2]=b4;g[b+25660+(bZ*244&-1)+88+(ck*12&-1)+8>>2]=cx;ck=ck+1|0;}while((ck|0)<13);bZ=bZ+1|0;}while((bZ|0)<(bX|0))}bZ=c[aq>>2]|0;ck=bR+2928|0;b0=bR+4308|0;b_=(c[(c[ak>>2]|0)+6500>>2]|0)==0;bQ=(bZ|0)!=(-(c[au>>2]|0)|0);cn=0;do{if(bW){b2=(cn|0)==0;bT=F+(cn*516&-1)|0;b5=0;do{b$=b5&1;do{if((c[M+(b$<<2)>>2]|0)!=0&b_){if(!b2){break}ch=c[(c[ak>>2]|0)+4308>>2]|0;if((ch|0)>0){c1=0}else{break}do{g[b+24636+(b5<<8)+(c1<<2)>>2]=+g[b+23612+(b5<<8)+(c1<<2)>>2];c1=c1+1|0;}while((c1|0)<(ch|0))}else{if(b2&(b5|0)<2){ch=an+(b5<<2)|0;cH=0;cN=H+(b$*3072&-1)|0;while(1){cF=cH+1|0;cq=(_(cF,12582912)|0)>>16;cD=31;cE=H+(b$*3072&-1)+(cH<<10)+512|0;while(1){cG=(d[5360+(cD<<2)|0]|0)+cq|0;cg=c[ch>>2]|0;cx=+g[cg+(cG<<2)>>2]*0.0;b4=+g[cg+(cG+128<<2)>>2]*0.0;ci=cx-b4;b3=cx+b4;b4=+g[cg+(cG+64<<2)>>2]*0.0;cx=+g[cg+(cG+192<<2)>>2]*0.0;cj=b4-cx;c2=b4+cx;cg=cE-16|0;g[cg>>2]=b3+c2;g[cE-8>>2]=b3-c2;g[cE-12>>2]=ci+cj;g[cE-4>>2]=ci-cj;cI=c[ch>>2]|0;cj=+g[cI+(cG+1<<2)>>2]*0.0;ci=+g[cI+(cG+129<<2)>>2]*0.0;c2=cj-ci;b3=cj+ci;ci=+g[cI+(cG+65<<2)>>2]*0.0;cj=+g[cI+(cG+193<<2)>>2]*0.0;cx=ci-cj;b4=ci+cj;g[cE+496>>2]=b3+b4;g[cE+504>>2]=b3-b4;g[cE+500>>2]=c2+cx;g[cE+508>>2]=c2-cx;if((cD|0)<=0){break}cD=cD-1|0;cE=cg}aS[c[a7>>2]&3](cN|0,128);if((cF|0)<3){cH=cF;cN=cN+1024|0}else{break}}}if((b5|0)==2){cN=b$+1|0;cH=255;while(1){ch=H+(b$*3072&-1)+(cn<<10)+(cH<<2)|0;cx=+g[ch>>2];cE=H+(cN*3072&-1)+(cn<<10)+(cH<<2)|0;c2=+g[cE>>2];g[ch>>2]=(cx+c2)*.7071067690849304;g[cE>>2]=(cx-c2)*.7071067690849304;if((cH|0)>0){cH=cH-1|0}else{break}}}c2=+g[H+(b$*3072&-1)+(cn<<10)>>2];g[bT>>2]=c2*c2;cH=127;while(1){cN=128-cH|0;c2=+g[H+(b$*3072&-1)+(cn<<10)+(cN<<2)>>2];cx=+g[H+(b$*3072&-1)+(cn<<10)+(cH+128<<2)>>2];g[F+(cn*516&-1)+(cN<<2)>>2]=(c2*c2+cx*cx)*.5;if((cH|0)>0){cH=cH-1|0}else{break}}cH=c[ak>>2]|0;bz(a_|0,0,256);bz(a$|0,0,256);cN=cH+4308|0;cE=c[cN>>2]|0;ch=(cE|0)>0;if(ch){cD=0;cq=0;while(1){cg=c[cH+3876+(cD<<2)>>2]|0;if((cg|0)>0){cx=0.0;c2=0.0;cG=cq;cI=0;while(1){b4=+g[F+(cn*516&-1)+(cG<<2)>>2];c3=c2+b4;c4=cx<b4?b4:cx;cT=cI+1|0;if((cT|0)<(cg|0)){cx=c4;c2=c3;cG=cG+1|0;cI=cT}else{break}}c5=c4;c6=c3;c7=cg+cq|0}else{c5=0.0;c6=0.0;c7=cq}g[I+(b5<<8)+(cD<<2)>>2]=c6;g[u+(cD<<2)>>2]=c5;g[v+(cD<<2)>>2]=c6*+g[cH+2672+(cD<<2)>>2];cI=cD+1|0;if((cI|0)<(cE|0)){cD=cI;cq=c7}else{break}}c8=+g[a2>>2];c9=+g[a5>>2]}else{c8=0.0;c9=0.0}c2=c9+c8;if(c2>0.0){cx=+g[a1>>2];b4=+g[a3>>2];cq=~~(((cx<b4?b4:cx)*2.0-c2)*20.0/(c2*+((c[cH+3876>>2]|0)-1+(c[cH+3880>>2]|0)|0)));da=(cq|0)>8?8:cq&255}else{da=0}a[bL]=da;cq=cE-1|0;if((cq|0)>1){cD=(cq|0)>2;cI=1;cG=0;cx=c2;b4=c9;while(1){cF=cI+1|0;b3=+g[v+(cF<<2)>>2];cj=cx+b3;if(cj>0.0){ci=+g[u+(cG<<2)>>2];db=+g[u+(cI<<2)>>2];dc=ci<db?db:ci;ci=+g[u+(cF<<2)>>2];cT=~~(((dc<ci?ci:dc)*3.0-cj)*20.0/(cj*+((c[cH+3876+(cG<<2)>>2]|0)-1+(c[cH+3876+(cI<<2)>>2]|0)+(c[cH+3876+(cF<<2)>>2]|0)|0)));a[s+cI|0]=(cT|0)>8?8:cT&255}else{a[s+cI|0]=0}dd=b4+b3;if((cF|0)<(cq|0)){cG=cI;cI=cF;cx=dd;b4=b3}else{break}}cI=cD?cq:2;de=cI;df=cI-1|0;dg=dd}else{de=1;df=0;dg=c2}if(dg>0.0){b4=+g[u+(df<<2)>>2];cx=+g[u+(de<<2)>>2];cI=~~(((b4<cx?cx:b4)*2.0-dg)*20.0/(dg*+((c[cH+3876+(df<<2)>>2]|0)-1+(c[cH+3876+(de<<2)>>2]|0)|0)));a[s+de|0]=(cI|0)>8?8:cI&255}else{a[s+de|0]=0}if(ch){cI=cH+4316|0;cG=0;cE=0;while(1){cF=c[cH+3364+(cG<<3)>>2]|0;cT=c[cH+3364+(cG<<3)+4>>2]|0;cR=c[624+((d[s+cG|0]|0)<<2)>>2]|0;b4=+g[cH+2160+(cG<<2)>>2]*+g[a4>>2];dh=d[s+cF|0]|0;di=c[cI>>2]|0;cx=+g[di+(cE<<2)>>2]*+g[I+(b5<<8)+(cF<<2)>>2]*+g[664+(dh<<2)>>2];dj=cE+1|0;dk=cF+1|0;if((dk|0)>(cT|0)){dl=dh;dm=2;dn=cx;dp=dj}else{cF=dh;dh=1;b3=cx;dq=dj;dj=dk;while(1){dk=d[s+dj|0]|0;dr=dk+cF|0;ds=dh+1|0;cx=+g[di+(dq<<2)>>2]*+g[I+(b5<<8)+(dj<<2)>>2]*+g[664+(dk<<2)>>2];dk=dj-cG|0;cj=b3<0.0?0.0:b3;dc=cx<0.0?0.0:cx;do{if(cj>0.0){if(dc<=0.0){dt=cj;break}du=dc>cj;if(du){dv=dc/cj}else{dv=cj/dc}if((((dk|0)>-1?dk:-dk|0)|0)>(cR|0)){if(dv<0.0){dt=cj+dc;break}else{dt=du?dc:cj;break}}else{if(dv<0.0){du=(g[k>>2]=dv,c[k>>2]|0);cx=+(du&16383|0)*6103515625.0e-14;dw=du>>>14&511;dt=(cj+dc)*+g[584+(~~((+((du>>>23&255)-127|0)+((1.0-cx)*+g[5864+(dw<<2)>>2]+cx*+g[5864+(dw+1<<2)>>2]))*4.816479930623698)<<2)>>2];break}else{dt=cj+dc;break}}}else{dt=dc}}while(0);dx=dq+1|0;dk=dj+1|0;if((dk|0)>(cT|0)){break}else{cF=dr;dh=ds;b3=dt;dq=dx;dj=dk}}dl=dr;dm=ds<<1;dn=dt;dp=dx}b3=+g[664+(((dl<<1|1|0)/(dm|0)&-1)<<2)>>2]*.5;dc=dn*b3;dj=J+(b5<<8)+(cG<<2)|0;g[dj>>2]=dc;dq=b+23612+(b5<<8)+(cG<<2)|0;g[b+24636+(b5<<8)+(cG<<2)>>2]=+g[dq>>2];g[dq>>2]=dc;cj=b3*+g[u+(cG<<2)>>2]*+g[cH+2416+(cG<<2)>>2];if(dc>cj){g[dj>>2]=cj;dy=cj}else{dy=dc}if(b4>1.0){dc=b4*dy;g[dj>>2]=dc;dz=dc}else{dz=dy}dc=+g[I+(b5<<8)+(cG<<2)>>2];if(dz>dc){g[dj>>2]=dc;dA=dc}else{dA=dz}if(b4<1.0){g[dj>>2]=b4*dA}dB=cG+1|0;if((dB|0)<(c[cN>>2]|0)){cG=dB;cE=dp}else{break}}if((dB|0)<64){dC=dB}else{break}}else{dC=0}cE=dC+1|0;cG=((cE|0)>64?cE:64)-dC<<2;bz(I+(b5<<8)+(dC<<2)|0,0,cG|0);bz(J+(b5<<8)+(dC<<2)|0,0,cG|0)}}while(0);b5=b5+1|0;}while((b5|0)<(bX|0))}if(!((c[ai>>2]|0)!=1|bQ)){bs(al,a8,ck,(c[ag>>2]|0)+468|0,bV,+g[ah>>2],c[b0>>2]|0)}if(bW){b5=0;do{if(!((c[M+((b5&1)<<2)>>2]|0)!=0&b_)){bt((c[ak>>2]|0)+2160|0,I+(b5<<8)|0,J+(b5<<8)|0,a9,ba);g[b+26636+(b5*244&-1)+88+(cn<<2)>>2]=+g[a9>>2];g[b+25660+(b5*244&-1)+88+(cn<<2)>>2]=+g[ba>>2];g[b+26636+(b5*244&-1)+100+(cn<<2)>>2]=+g[bg>>2];g[b+25660+(b5*244&-1)+100+(cn<<2)>>2]=+g[bh>>2];g[b+26636+(b5*244&-1)+112+(cn<<2)>>2]=+g[bi>>2];g[b+25660+(b5*244&-1)+112+(cn<<2)>>2]=+g[bj>>2];g[b+26636+(b5*244&-1)+124+(cn<<2)>>2]=+g[bk>>2];g[b+25660+(b5*244&-1)+124+(cn<<2)>>2]=+g[bl>>2];g[b+26636+(b5*244&-1)+136+(cn<<2)>>2]=+g[bm>>2];g[b+25660+(b5*244&-1)+136+(cn<<2)>>2]=+g[bn>>2];g[b+26636+(b5*244&-1)+148+(cn<<2)>>2]=+g[bo>>2];g[b+25660+(b5*244&-1)+148+(cn<<2)>>2]=+g[bq>>2];g[b+26636+(b5*244&-1)+160+(cn<<2)>>2]=+g[br>>2];g[b+25660+(b5*244&-1)+160+(cn<<2)>>2]=+g[bv>>2];g[b+26636+(b5*244&-1)+172+(cn<<2)>>2]=+g[bx>>2];g[b+25660+(b5*244&-1)+172+(cn<<2)>>2]=+g[by>>2];g[b+26636+(b5*244&-1)+184+(cn<<2)>>2]=+g[bB>>2];g[b+25660+(b5*244&-1)+184+(cn<<2)>>2]=+g[bC>>2];g[b+26636+(b5*244&-1)+196+(cn<<2)>>2]=+g[bD>>2];g[b+25660+(b5*244&-1)+196+(cn<<2)>>2]=+g[bE>>2];g[b+26636+(b5*244&-1)+208+(cn<<2)>>2]=+g[bF>>2];g[b+25660+(b5*244&-1)+208+(cn<<2)>>2]=+g[bG>>2];g[b+26636+(b5*244&-1)+220+(cn<<2)>>2]=+g[bH>>2];g[b+25660+(b5*244&-1)+220+(cn<<2)>>2]=+g[bI>>2];g[b+26636+(b5*244&-1)+232+(cn<<2)>>2]=+g[bJ>>2];g[b+25660+(b5*244&-1)+232+(cn<<2)>>2]=+g[bK>>2]}b5=b5+1|0;}while((b5|0)<(bX|0))}cn=cn+1|0;}while((cn|0)<3);if(bW){cn=0;while(1){b_=b+27780+(cn<<2)|0;b0=0;do{ck=b+25660+(cn*244&-1)+88+(b0*12&-1)|0;bQ=D+(cn*244&-1)+88+(b0*12&-1)+4|0;bR=D+(cn*244&-1)+88+(b0*12&-1)+8|0;b5=0;do{b1=+g[b+25660+(cn*244&-1)+88+(b0*12&-1)+(b5<<2)>>2]*.8;bT=(b5|0)>0;if(bT){dD=O+(b5-1<<2)|0}else{dD=bR}ca=+g[dD>>2];b2=c[L+(cn<<4)+(b5<<2)>>2]|0;if((b2|0)>1){cc=410}else{if((c[L+(cn<<4)+(b5+1<<2)>>2]|0)==1){cc=410}else{dE=b1}}do{if((cc|0)==410){cc=0;if(b1<=0.0){dE=0.0;break}dE=b1*+P(+(ca/b1),.36000001430511475)}}while(0);cy=dE<b1?dE:b1;L610:do{if((b2|0)==1){if(cy<=0.0){dF=0.0;break}dF=cy*+P(+(ca/cy),.18000000715255737)}else{if((b5|0)==0){if((c[b_>>2]|0)==3){cc=420}else{cc=417}}else{cc=417}do{if((cc|0)==417){cc=0;if(!bT){dF=b1;break L610}if((c[L+(cn<<4)+(b5-1<<2)>>2]|0)!=3){dF=b1;break L610}if((b5|0)==0){cc=420;break}else if((b5|0)==1){dG=+g[bR>>2];break}else if((b5|0)==2){dG=+g[bM>>2];break}else{dG=ca;break}}}while(0);if((cc|0)==420){cc=0;dG=+g[bQ>>2]}if(cy<=0.0){dF=0.0;break}dF=cy*+P(+(dG/cy),.18000000715255737)}}while(0);g[O+(b5<<2)>>2]=+g[K+(cn*12&-1)+(b5<<2)>>2]*(dF<cy?dF:cy);b5=b5+1|0;}while((b5|0)<3);c[ck>>2]=c[am>>2];c[ck+4>>2]=c[am+4>>2];c[ck+8>>2]=c[am+8>>2];b0=b0+1|0;}while((b0|0)<13);b0=cn+1|0;if((b0|0)<(bX|0)){cn=b0}else{dH=0;break}}do{c[b+27780+(dH<<2)>>2]=c[L+(dH<<4)+8>>2];dH=dH+1|0;}while((dH|0)<(bX|0))}cn=c[ad>>2]|0;L633:do{if((cn|0)>0){b0=0;b_=bZ;while(1){b5=b+27796+(b0<<2)|0;bQ=c[b5>>2]|0;do{if((b_|0)==0){if((bQ|0)==0){c[b5>>2]=1;dI=2;dJ=1;break}else if((bQ|0)==3){c[b5>>2]=2;dI=2;dJ=2;break}else{dI=2;dJ=bQ;break}}else{dI=(bQ|0)==2?3:0;dJ=bQ}}while(0);c[ab+(b0<<2)>>2]=dJ;c[b5>>2]=dI;bQ=b0+1|0;if((bQ|0)>=(cn|0)){break L633}b0=bQ;b_=c[M+(bQ<<2)>>2]|0}}}while(0);if(bW){cn=Z+(bO<<3)-8|0;bZ=(bU|0)==0;b_=(c[$>>2]|0)==2;b0=(c[bN>>2]|0)==2;bQ=0;do{if((bQ|0)>1){dK=T+(bO*976&-1)+((bQ-2|0)*488&-1)|0;dL=b_|b0?2:0;dM=cn}else{dK=S+(bO*976&-1)+(bQ*488&-1)|0;dL=c[ab+(bQ<<2)>>2]|0;dM=bS}ca=+g[a4>>2];if((dL|0)==2){ck=0;b1=309.07000732421875;while(1){bR=5576+(ck<<2)|0;b4=+g[dK+88+(ck*12&-1)>>2];do{if(b4>0.0){c2=ca*b4;dc=+g[dK+332+(ck*12&-1)>>2];if(dc<=c2){dN=b1;break}cj=+g[bR>>2];if(dc>c2*1.0e10){dN=b1+cj*23.02585092994046;break}else{bT=(g[k>>2]=dc/c2,c[k>>2]|0);c2=+(bT&16383|0)*6103515625.0e-14;b2=bT>>>14&511;dN=b1+cj*(+((bT>>>23&255)-127|0)+(+g[5864+(b2+1<<2)>>2]*c2+ +g[5864+(b2<<2)>>2]*(1.0-c2)))*.30102999566398114;break}}else{dN=b1}}while(0);b4=+g[dK+88+(ck*12&-1)+4>>2];do{if(b4>0.0){c2=ca*b4;cj=+g[dK+332+(ck*12&-1)+4>>2];if(cj<=c2){dO=dN;break}dc=+g[bR>>2];if(cj>c2*1.0e10){dO=dN+dc*23.02585092994046;break}else{b5=(g[k>>2]=cj/c2,c[k>>2]|0);c2=+(b5&16383|0)*6103515625.0e-14;b2=b5>>>14&511;dO=dN+dc*(+((b5>>>23&255)-127|0)+(+g[5864+(b2+1<<2)>>2]*c2+ +g[5864+(b2<<2)>>2]*(1.0-c2)))*.30102999566398114;break}}else{dO=dN}}while(0);b4=+g[dK+88+(ck*12&-1)+8>>2];do{if(b4>0.0){c2=ca*b4;dc=+g[dK+332+(ck*12&-1)+8>>2];if(dc<=c2){dP=dO;break}cj=+g[bR>>2];if(dc>c2*1.0e10){dP=dO+cj*23.02585092994046;break}else{b2=(g[k>>2]=dc/c2,c[k>>2]|0);c2=+(b2&16383|0)*6103515625.0e-14;b5=b2>>>14&511;dP=dO+cj*(+((b2>>>23&255)-127|0)+(+g[5864+(b5+1<<2)>>2]*c2+ +g[5864+(b5<<2)>>2]*(1.0-c2)))*.30102999566398114;break}}else{dP=dO}}while(0);bR=ck+1|0;if(bR>>>0<12){ck=bR;b1=dP}else{break}}g[dM+(bQ<<2)>>2]=dP;dQ=dP}else{ck=0;b1=281.0574951171875;while(1){b4=+g[dK+(ck<<2)>>2];do{if(b4>0.0){c2=ca*b4;cj=+g[dK+244+(ck<<2)>>2];if(cj<=c2){dR=b1;break}dc=+g[5624+(ck<<2)>>2];if(cj>c2*1.0e10){dR=b1+dc*23.02585092994046;break}else{bR=(g[k>>2]=cj/c2,c[k>>2]|0);c2=+(bR&16383|0)*6103515625.0e-14;b5=bR>>>14&511;dR=b1+dc*(+((bR>>>23&255)-127|0)+(+g[5864+(b5+1<<2)>>2]*c2+ +g[5864+(b5<<2)>>2]*(1.0-c2)))*.30102999566398114;break}}else{dR=b1}}while(0);b5=ck+1|0;if(b5>>>0<21){ck=b5;b1=dR}else{break}}g[dM+(bQ<<2)>>2]=dR;dQ=dR}if(!bZ){h[bU+189240+(bO<<5)+(bQ<<3)>>3]=dQ}bQ=bQ+1|0;}while((bQ|0)<(bX|0))}do{if((c[ai>>2]|0)==1){b1=+g[V+(bO<<4)+12>>2];ca=+g[V+(bO<<4)+8>>2]+b1;bX=X+(bO<<2)|0;g[bX>>2]=ca;if(ca<=0.0){break}g[bX>>2]=b1/ca}}while(0);bX=c[ad>>2]|0;if((bX|0)>0){bQ=0;while(1){c[b+304+(bO*10504&-1)+(bQ*5252&-1)+4788>>2]=c[ab+(bQ<<2)>>2];c[b+304+(bO*10504&-1)+(bQ*5252&-1)+4792>>2]=0;bZ=bQ+1|0;bS=c[ad>>2]|0;if((bZ|0)<(bS|0)){bQ=bZ}else{dS=bS;break}}}else{dS=bX}bQ=bO+1|0;bS=c[ao>>2]|0;if((bQ|0)<(bS|0)){bO=bQ;bP=dS}else{dT=bS;dU=ag;break}}}else{dT=Q;dU=b+85796|0}Q=c[dU>>2]|0;do{if((c[Q>>2]|0)==0){g[Q+8>>2]=1.0}else{dQ=+g[b+27804>>2];dR=+g[b+27812>>2];if((c[b+72>>2]|0)==2){dV=+g[b+27816>>2];dW=+g[b+27808>>2]}else{dV=dR;dW=dQ}dP=dR+dV;dR=dQ+dW;if((dT|0)==2){dX=dR>dP?dR:dP}else{dX=dR}dR=dX*.5*+g[Q+4>>2];if(dR>.03125){ag=Q+8|0;dP=+g[ag>>2];do{if(dP<1.0){dQ=+g[Q+12>>2];if(dP>=dQ){break}g[ag>>2]=dQ}else{g[ag>>2]=1.0}}while(0);g[(c[dU>>2]|0)+12>>2]=1.0;break}dP=dR*31.98+625.0e-6;ag=Q+8|0;dQ=+g[ag>>2];do{if(dQ<dP){dO=+g[Q+12>>2];if(dO>=dP){g[ag>>2]=dP;break}if(dQ>=dO){break}g[ag>>2]=dO}else{g[ag>>2]=(dP*.075+.925)*dQ;bX=(c[dU>>2]|0)+8|0;if(+g[bX>>2]>=dP){break}g[bX>>2]=dP}}while(0);g[(c[dU>>2]|0)+12>>2]=dP}}while(0);bp(b,c[ac>>2]|0,f);f=b+84756|0;c[f>>2]=0;do{if((c[b+80>>2]|0)==0){if((c[b+180>>2]|0)!=1){dY=0;break}ac=c[ao>>2]|0;if((ac|0)>0){Q=c[b+72>>2]|0;dT=(Q|0)>0;ag=0;dX=0.0;dW=0.0;while(1){if(dT){bX=0;dV=dX;dQ=dW;while(1){dR=dV+ +g[Z+(ag<<3)+(bX<<2)>>2];dO=dQ+ +g[Y+(ag<<3)+(bX<<2)>>2];dS=bX+1|0;if((dS|0)<(Q|0)){bX=dS;dV=dR;dQ=dO}else{dZ=dR;d_=dO;break}}}else{dZ=dX;d_=dW}bX=ag+1|0;if((bX|0)<(ac|0)){ag=bX;dX=dZ;dW=d_}else{break}}if(dZ>d_){dY=0;break}}ag=ac-1|0;if((c[b+5092>>2]|0)!=(c[b+10344>>2]|0)){dY=0;break}if((c[b+304+(ag*10504&-1)+4788>>2]|0)!=(c[b+304+(ag*10504&-1)+10040>>2]|0)){dY=0;break}c[f>>2]=2;dY=1}else{c[f>>2]=2;dY=1}}while(0);ag=dY?T:S;S=dY?Z:Y;Y=ag|0;Z=S|0;dY=b+140|0;do{if((c[dY>>2]|0)!=0){T=b+85804|0;if((c[T>>2]|0)==0){break}Q=c[ao>>2]|0;if((Q|0)<=0){break}dT=b+72|0;bX=0;dS=c[dT>>2]|0;bP=Q;while(1){if((dS|0)>0){Q=X+(bX<<2)|0;bO=0;do{h[(c[T>>2]|0)+90904+(bX<<3)>>3]=0.0;h[(c[T>>2]|0)+90920+(bX<<3)>>3]=+g[Q>>2];c[(c[T>>2]|0)+203288+(bX<<3)+(bO<<2)>>2]=c[b+304+(bX*10504&-1)+(bO*5252&-1)+4788>>2];h[(c[T>>2]|0)+189240+(bX<<5)+(bO<<3)>>3]=+g[S+(bX<<3)+(bO<<2)>>2];ad=(c[T>>2]|0)+54040+(bX*9216&-1)+(bO*4608&-1)|0;ab=b+304+(bX*10504&-1)+(bO*5252&-1)|0;bA(ad|0,ab|0,2304)|0;if((c[f>>2]|0)==2){ab=bO+2|0;ad=c[T>>2]|0;h[ad+197144+(bX<<5)+(bO<<3)>>3]=+h[ad+197144+(bX<<5)+(ab<<3)>>3];ad=c[T>>2]|0;V=ad+123704+(bX<<15)+(bO<<13)|0;ai=ad+123704+(bX<<15)+(ab<<13)|0;bA(V|0,ai|0,8192)|0}bO=bO+1|0;d$=c[dT>>2]|0;}while((bO|0)<(d$|0));d0=d$;d1=c[ao>>2]|0}else{d0=dS;d1=bP}bO=bX+1|0;if((bO|0)<(d1|0)){bX=bO;dS=d0;bP=d1}else{break}}}}while(0);d1=c[b+104>>2]|0;do{if((d1|0)==0|(d1|0)==3){d0=b+39760|0;d_=+g[d0>>2];g[b+39756>>2]=d_;d$=b+39764|0;dZ=+g[d$>>2];g[d0>>2]=dZ;d0=b+39768|0;dW=+g[d0>>2];g[d$>>2]=dW;d$=b+39772|0;dX=+g[d$>>2];g[d0>>2]=dX;d0=b+39776|0;dP=+g[d0>>2];g[d$>>2]=dP;d$=b+39780|0;dQ=+g[d$>>2];g[d0>>2]=dQ;d0=b+39784|0;dV=+g[d0>>2];g[d$>>2]=dV;d$=b+39788|0;dO=+g[d$>>2];g[d0>>2]=dO;d0=b+39792|0;dR=+g[d0>>2];g[d$>>2]=dR;d$=b+39796|0;dN=+g[d$>>2];g[d0>>2]=dN;d0=b+39800|0;dF=+g[d0>>2];g[d$>>2]=dF;d$=b+39804|0;dG=+g[d$>>2];g[d0>>2]=dG;d0=b+39808|0;dE=+g[d0>>2];g[d$>>2]=dE;d$=b+39812|0;bV=+g[d$>>2];g[d0>>2]=bV;d0=b+39816|0;dA=+g[d0>>2];g[d$>>2]=dA;d$=b+39820|0;dz=+g[d$>>2];g[d0>>2]=dz;d0=b+39824|0;dy=+g[d0>>2];g[d$>>2]=dy;d$=b+39828|0;dn=+g[d$>>2];g[d0>>2]=dn;d0=c[ao>>2]|0;X=(d0|0)>0;bP=c[b+72>>2]|0;if(X){dS=(bP|0)>0;bX=0;dt=0.0;while(1){if(dS){dT=0;dv=dt;while(1){dg=dv+ +g[S+(bX<<3)+(dT<<2)>>2];T=dT+1|0;if((T|0)<(bP|0)){dT=T;dv=dg}else{d2=dg;break}}}else{d2=dt}dT=bX+1|0;if((dT|0)<(d0|0)){bX=dT;dt=d2}else{d3=d2;break}}}else{d3=0.0}g[d$>>2]=d3;dt=+(_(d0*3350&-1,bP)|0)/(dN+(d_+d3)*-.10394349694252014+(dZ+dn)*-.18920649588108063+(dW+dy)*-.21623599529266357+(dX+dz)*-.1559150069952011+(dP+dA)*3.8980449615198e-17+(dQ+bV)*.23387250304222107+(dV+dE)*.5045499801635742+(dO+dG)*.7568249702453613+(dR+dF)*.9354900121688843);if(!X){break}bX=(bP|0)>0;dS=0;do{if(bX){dT=0;do{T=S+(dS<<3)+(dT<<2)|0;g[T>>2]=dt*+g[T>>2];dT=dT+1|0;}while((dT|0)<(bP|0))}dS=dS+1|0;}while((dS|0)<(d0|0))}}while(0);aW[c[b+85812>>2]&1](b,Z,W,Y);Y=b+16|0;W=b+84744|0;Z=c[W>>2]|0;if((Z|0)==0){d4=b+120|0;d5=c[Y>>2]|0}else{S=c[Y>>2]|0;d4=19856+(S<<6)+(Z<<2)|0;d5=S}S=c[R>>2]|0;Z=b+64|0;Y=c[Z>>2]|0;d1=((_((d5*72e3&-1)+72e3|0,c[d4>>2]|0)|0)/(Y|0)&-1)+S<<3;S=b+21320|0;bc(b,c[S>>2]|0);Y=b+52128|0;d4=c[Y>>2]|0;c[b+39840+(d4*48&-1)+4>>2]=0;d5=b+24|0;bz(b+39840+(d4*48&-1)+8|0,0,c[d5>>2]|0);d4=c[Y>>2]|0;d0=c[b+39840+(d4*48&-1)+4>>2]|0;if((c[Z>>2]|0)<16e3){dS=d0;bP=12;bX=d4;do{X=8-(dS&7)|0;d$=(bP|0)<(X|0)?bP:X;bP=bP-d$|0;dT=(dS>>3)+(b+39840+(bX*48&-1)+8)|0;a[dT]=(4094>>>(bP>>>0)<<X-d$|(d[dT]|0))&255;dS=d$+dS|0;bX=c[Y>>2]|0}while((bP|0)>0);c[b+39840+(bX*48&-1)+4>>2]=dS;d6=bX;d7=dS}else{dS=d0;d0=12;bX=d4;do{d4=8-(dS&7)|0;bP=(d0|0)<(d4|0)?d0:d4;d0=d0-bP|0;d$=(dS>>3)+(b+39840+(bX*48&-1)+8)|0;a[d$]=(4095>>>(d0>>>0)<<d4-bP|(d[d$]|0))&255;dS=bP+dS|0;bX=c[Y>>2]|0}while((d0|0)>0);c[b+39840+(bX*48&-1)+4>>2]=dS;d6=bX;d7=dS}dS=b+16|0;bX=c[dS>>2]|0;d0=d7;d7=1;bP=d6;do{d6=8-(d0&7)|0;d$=(d7|0)<(d6|0)?d7:d6;d7=d7-d$|0;d4=(d0>>3)+(b+39840+(bP*48&-1)+8)|0;a[d4]=(bX>>d7<<d6-d$|(d[d4]|0))&255;d0=d$+d0|0;bP=c[Y>>2]|0}while((d7|0)>0);c[b+39840+(bP*48&-1)+4>>2]=d0;d7=d0;d0=2;bX=bP;do{bP=8-(d7&7)|0;d$=(d0|0)<(bP|0)?d0:bP;d0=d0-d$|0;d4=(d7>>3)+(b+39840+(bX*48&-1)+8)|0;a[d4]=(1>>>(d0>>>0)<<bP-d$|(d[d4]|0))&255;d7=d$+d7|0;bX=c[Y>>2]|0}while((d0|0)>0);c[b+39840+(bX*48&-1)+4>>2]=d7;d0=b+160|0;d$=(c[d0>>2]|0)==0&1;d4=d7;d7=1;bP=bX;do{bX=8-(d4&7)|0;d6=(d7|0)<(bX|0)?d7:bX;d7=d7-d6|0;dT=(d4>>3)+(b+39840+(bP*48&-1)+8)|0;a[dT]=(d$>>>(d7>>>0)<<bX-d6|(d[dT]|0))&255;d4=d6+d4|0;bP=c[Y>>2]|0}while((d7|0)>0);c[b+39840+(bP*48&-1)+4>>2]=d4;d7=c[W>>2]|0;d$=d4;d4=4;d6=bP;do{bP=8-(d$&7)|0;dT=(d4|0)<(bP|0)?d4:bP;d4=d4-dT|0;bX=(d$>>3)+(b+39840+(d6*48&-1)+8)|0;a[bX]=(d7>>d4<<bP-dT|(d[bX]|0))&255;d$=dT+d$|0;d6=c[Y>>2]|0}while((d4|0)>0);c[b+39840+(d6*48&-1)+4>>2]=d$;d4=c[b+20>>2]|0;d7=d$;d$=2;dT=d6;do{d6=8-(d7&7)|0;bX=(d$|0)<(d6|0)?d$:d6;d$=d$-bX|0;bP=(d7>>3)+(b+39840+(dT*48&-1)+8)|0;a[bP]=(d4>>d$<<d6-bX|(d[bP]|0))&255;d7=bX+d7|0;dT=c[Y>>2]|0}while((d$|0)>0);c[b+39840+(dT*48&-1)+4>>2]=d7;d$=c[R>>2]|0;R=d7;d7=1;d4=dT;do{dT=8-(R&7)|0;bX=(d7|0)<(dT|0)?d7:dT;d7=d7-bX|0;bP=(R>>3)+(b+39840+(d4*48&-1)+8)|0;a[bP]=(d$>>d7<<dT-bX|(d[bP]|0))&255;R=bX+R|0;d4=c[Y>>2]|0}while((d7|0)>0);c[b+39840+(d4*48&-1)+4>>2]=R;d7=c[b+172>>2]|0;d$=R;R=1;bX=d4;do{d4=8-(d$&7)|0;bP=(R|0)<(d4|0)?R:d4;R=R-bP|0;dT=(d$>>3)+(b+39840+(bX*48&-1)+8)|0;a[dT]=(d7>>R<<d4-bP|(d[dT]|0))&255;d$=bP+d$|0;bX=c[Y>>2]|0}while((R|0)>0);c[b+39840+(bX*48&-1)+4>>2]=d$;R=c[b+180>>2]|0;d7=d$;d$=2;bP=bX;do{bX=8-(d7&7)|0;dT=(d$|0)<(bX|0)?d$:bX;d$=d$-dT|0;d4=(d7>>3)+(b+39840+(bP*48&-1)+8)|0;a[d4]=(R>>d$<<bX-dT|(d[d4]|0))&255;d7=dT+d7|0;bP=c[Y>>2]|0}while((d$|0)>0);c[b+39840+(bP*48&-1)+4>>2]=d7;d$=c[f>>2]|0;R=d7;d7=2;dT=bP;do{bP=8-(R&7)|0;d4=(d7|0)<(bP|0)?d7:bP;d7=d7-d4|0;bX=(R>>3)+(b+39840+(dT*48&-1)+8)|0;a[bX]=(d$>>d7<<bP-d4|(d[bX]|0))&255;R=d4+R|0;dT=c[Y>>2]|0}while((d7|0)>0);c[b+39840+(dT*48&-1)+4>>2]=R;d7=c[b+164>>2]|0;d$=R;R=1;d4=dT;do{dT=8-(d$&7)|0;bX=(R|0)<(dT|0)?R:dT;R=R-bX|0;bP=(d$>>3)+(b+39840+(d4*48&-1)+8)|0;a[bP]=(d7>>R<<dT-bX|(d[bP]|0))&255;d$=bX+d$|0;d4=c[Y>>2]|0}while((R|0)>0);c[b+39840+(d4*48&-1)+4>>2]=d$;R=c[b+168>>2]|0;d7=d$;d$=1;bX=d4;do{d4=8-(d7&7)|0;bP=(d$|0)<(d4|0)?d$:d4;d$=d$-bP|0;dT=(d7>>3)+(b+39840+(bX*48&-1)+8)|0;a[dT]=(R>>d$<<d4-bP|(d[dT]|0))&255;d7=bP+d7|0;bX=c[Y>>2]|0}while((d$|0)>0);c[b+39840+(bX*48&-1)+4>>2]=d7;d$=c[b+176>>2]|0;R=d7;d7=2;bP=bX;do{bX=8-(R&7)|0;dT=(d7|0)<(bX|0)?d7:bX;d7=d7-dT|0;d4=(R>>3)+(b+39840+(bP*48&-1)+8)|0;a[d4]=(d$>>d7<<bX-dT|(d[d4]|0))&255;R=dT+R|0;bP=c[Y>>2]|0}while((d7|0)>0);d7=b+39840+(bP*48&-1)+4|0;c[d7>>2]=R;if((c[d0>>2]|0)==0){d8=R}else{d$=R;R=16;do{dT=8-(d$&7)|0;d4=(R|0)<(dT|0)?R:dT;R=R-d4|0;d$=d4+d$|0;}while((R|0)>0);c[d7>>2]=d$;d8=d$}d$=b+21312|0;d7=c[d$>>2]|0;do{if((c[dS>>2]|0)==1){R=d8;d4=9;dT=bP;do{bX=8-(R&7)|0;d6=(d4|0)<(bX|0)?d4:bX;d4=d4-d6|0;X=(R>>3)+(b+39840+(dT*48&-1)+8)|0;a[X]=(d7>>d4<<bX-d6|(d[X]|0))&255;R=d6+R|0;dT=c[Y>>2]|0}while((d4|0)>0);c[b+39840+(dT*48&-1)+4>>2]=R;d4=b+72|0;d6=c[b+21316>>2]|0;if((c[d4>>2]|0)==2){X=R;bX=3;T=dT;do{ac=8-(X&7)|0;bO=(bX|0)<(ac|0)?bX:ac;bX=bX-bO|0;Q=(X>>3)+(b+39840+(T*48&-1)+8)|0;a[Q]=(d6>>bX<<ac-bO|(d[Q]|0))&255;X=bO+X|0;T=c[Y>>2]|0}while((bX|0)>0);c[b+39840+(T*48&-1)+4>>2]=X;d9=T;ea=X}else{bX=R;bO=5;Q=dT;do{ac=8-(bX&7)|0;ai=(bO|0)<(ac|0)?bO:ac;bO=bO-ai|0;V=(bX>>3)+(b+39840+(Q*48&-1)+8)|0;a[V]=(d6>>bO<<ac-ai|(d[V]|0))&255;bX=ai+bX|0;Q=c[Y>>2]|0}while((bO|0)>0);c[b+39840+(Q*48&-1)+4>>2]=bX;d9=Q;ea=bX}bO=c[d4>>2]|0;if((bO|0)>0){d6=0;dT=d9;R=ea;while(1){X=c[b+21328+(d6<<4)>>2]|0;T=R;ai=1;V=dT;do{ac=8-(T&7)|0;ab=(ai|0)<(ac|0)?ai:ac;ai=ai-ab|0;ad=(T>>3)+(b+39840+(V*48&-1)+8)|0;a[ad]=(X>>ai<<ac-ab|(d[ad]|0))&255;T=ab+T|0;V=c[Y>>2]|0}while((ai|0)>0);c[b+39840+(V*48&-1)+4>>2]=T;ai=c[b+21328+(d6<<4)+4>>2]|0;X=T;ab=1;ad=V;do{ac=8-(X&7)|0;bU=(ab|0)<(ac|0)?ab:ac;ab=ab-bU|0;dM=(X>>3)+(b+39840+(ad*48&-1)+8)|0;a[dM]=(ai>>ab<<ac-bU|(d[dM]|0))&255;X=bU+X|0;ad=c[Y>>2]|0}while((ab|0)>0);c[b+39840+(ad*48&-1)+4>>2]=X;ab=c[b+21328+(d6<<4)+8>>2]|0;ai=X;V=1;T=ad;do{bU=8-(ai&7)|0;dM=(V|0)<(bU|0)?V:bU;V=V-dM|0;ac=(ai>>3)+(b+39840+(T*48&-1)+8)|0;a[ac]=(ab>>V<<bU-dM|(d[ac]|0))&255;ai=dM+ai|0;T=c[Y>>2]|0}while((V|0)>0);c[b+39840+(T*48&-1)+4>>2]=ai;V=c[b+21328+(d6<<4)+12>>2]|0;ab=ai;ad=1;X=T;do{dM=8-(ab&7)|0;ac=(ad|0)<(dM|0)?ad:dM;ad=ad-ac|0;bU=(ab>>3)+(b+39840+(X*48&-1)+8)|0;a[bU]=(V>>ad<<dM-ac|(d[bU]|0))&255;ab=ac+ab|0;X=c[Y>>2]|0}while((ad|0)>0);c[b+39840+(X*48&-1)+4>>2]=ab;ad=d6+1|0;V=c[d4>>2]|0;if((ad|0)<(V|0)){d6=ad;dT=X;R=ab}else{eb=0;ec=V;ed=X;break}}}else{eb=0;ec=bO;ed=d9}while(1){if((ec|0)>0){R=0;dT=ed;d6=c[b+39840+(ed*48&-1)+4>>2]|0;while(1){bX=(c[b+304+(eb*10504&-1)+(R*5252&-1)+4844>>2]|0)+(c[b+304+(eb*10504&-1)+(R*5252&-1)+4768>>2]|0)|0;Q=d6;V=12;ad=dT;do{T=8-(Q&7)|0;ai=(V|0)<(T|0)?V:T;V=V-ai|0;ac=(Q>>3)+(b+39840+(ad*48&-1)+8)|0;a[ac]=(bX>>V<<T-ai|(d[ac]|0))&255;Q=ai+Q|0;ad=c[Y>>2]|0}while((V|0)>0);c[b+39840+(ad*48&-1)+4>>2]=Q;V=(c[b+304+(eb*10504&-1)+(R*5252&-1)+4772>>2]|0)/2&-1;bX=Q;ai=9;ac=ad;do{T=8-(bX&7)|0;bU=(ai|0)<(T|0)?ai:T;ai=ai-bU|0;dM=(bX>>3)+(b+39840+(ac*48&-1)+8)|0;a[dM]=(V>>ai<<T-bU|(d[dM]|0))&255;bX=bU+bX|0;ac=c[Y>>2]|0}while((ai|0)>0);c[b+39840+(ac*48&-1)+4>>2]=bX;ai=c[b+304+(eb*10504&-1)+(R*5252&-1)+4780>>2]|0;V=bX;ad=8;Q=ac;do{bU=8-(V&7)|0;dM=(ad|0)<(bU|0)?ad:bU;ad=ad-dM|0;T=(V>>3)+(b+39840+(Q*48&-1)+8)|0;a[T]=(ai>>ad<<bU-dM|(d[T]|0))&255;V=dM+V|0;Q=c[Y>>2]|0}while((ad|0)>0);c[b+39840+(Q*48&-1)+4>>2]=V;ad=c[b+304+(eb*10504&-1)+(R*5252&-1)+4784>>2]|0;ai=V;ac=4;bX=Q;do{dM=8-(ai&7)|0;T=(ac|0)<(dM|0)?ac:dM;ac=ac-T|0;bU=(ai>>3)+(b+39840+(bX*48&-1)+8)|0;a[bU]=(ad>>ac<<dM-T|(d[bU]|0))&255;ai=T+ai|0;bX=c[Y>>2]|0}while((ac|0)>0);ac=b+39840+(bX*48&-1)+4|0;c[ac>>2]=ai;ad=b+304+(eb*10504&-1)+(R*5252&-1)+4788|0;if((c[ad>>2]|0)==0){Q=ai;V=1;do{T=8-(Q&7)|0;bU=(V|0)<(T|0)?V:T;V=V-bU|0;Q=bU+Q|0;}while((V|0)>0);c[ac>>2]=Q;V=b+304+(eb*10504&-1)+(R*5252&-1)+4796|0;bU=c[V>>2]|0;if((bU|0)==14){c[V>>2]=16;V=c[Y>>2]|0;ee=16;ef=V;eg=c[b+39840+(V*48&-1)+4>>2]|0}else{ee=bU;ef=bX;eg=Q}bU=eg;V=5;T=ef;do{dM=8-(bU&7)|0;dK=(V|0)<(dM|0)?V:dM;V=V-dK|0;dL=(bU>>3)+(b+39840+(T*48&-1)+8)|0;a[dL]=(ee>>V<<dM-dK|(d[dL]|0))&255;bU=dK+bU|0;T=c[Y>>2]|0}while((V|0)>0);c[b+39840+(T*48&-1)+4>>2]=bU;V=b+304+(eb*10504&-1)+(R*5252&-1)+4800|0;Q=c[V>>2]|0;if((Q|0)==14){c[V>>2]=16;V=c[Y>>2]|0;eh=16;ei=V;ej=c[b+39840+(V*48&-1)+4>>2]|0}else{eh=Q;ei=T;ej=bU}Q=ej;V=5;ac=ei;do{dK=8-(Q&7)|0;dL=(V|0)<(dK|0)?V:dK;V=V-dL|0;dM=(Q>>3)+(b+39840+(ac*48&-1)+8)|0;a[dM]=(eh>>V<<dK-dL|(d[dM]|0))&255;Q=dL+Q|0;ac=c[Y>>2]|0}while((V|0)>0);c[b+39840+(ac*48&-1)+4>>2]=Q;V=b+304+(eb*10504&-1)+(R*5252&-1)+4804|0;bU=c[V>>2]|0;if((bU|0)==14){c[V>>2]=16;V=c[Y>>2]|0;ek=16;el=V;em=c[b+39840+(V*48&-1)+4>>2]|0}else{ek=bU;el=ac;em=Q}bU=em;V=5;T=el;do{dL=8-(bU&7)|0;dM=(V|0)<(dL|0)?V:dL;V=V-dM|0;dK=(bU>>3)+(b+39840+(T*48&-1)+8)|0;a[dK]=(ek>>V<<dL-dM|(d[dK]|0))&255;bU=dM+bU|0;T=c[Y>>2]|0}while((V|0)>0);c[b+39840+(T*48&-1)+4>>2]=bU;V=c[b+304+(eb*10504&-1)+(R*5252&-1)+4824>>2]|0;Q=bU;ac=4;dM=T;do{dK=8-(Q&7)|0;dL=(ac|0)<(dK|0)?ac:dK;ac=ac-dL|0;a4=(Q>>3)+(b+39840+(dM*48&-1)+8)|0;a[a4]=(V>>ac<<dK-dL|(d[a4]|0))&255;Q=dL+Q|0;dM=c[Y>>2]|0}while((ac|0)>0);c[b+39840+(dM*48&-1)+4>>2]=Q;ac=c[b+304+(eb*10504&-1)+(R*5252&-1)+4828>>2]|0;V=Q;T=3;bU=dM;do{dL=8-(V&7)|0;a4=(T|0)<(dL|0)?T:dL;T=T-a4|0;dK=(V>>3)+(b+39840+(bU*48&-1)+8)|0;a[dK]=(ac>>T<<dL-a4|(d[dK]|0))&255;V=a4+V|0;bU=c[Y>>2]|0}while((T|0)>0);c[b+39840+(bU*48&-1)+4>>2]=V;en=bU;eo=V}else{T=ai;ac=1;dM=bX;do{Q=8-(T&7)|0;a4=(ac|0)<(Q|0)?ac:Q;ac=ac-a4|0;dK=(T>>3)+(b+39840+(dM*48&-1)+8)|0;a[dK]=(1>>>(ac>>>0)<<Q-a4|(d[dK]|0))&255;T=a4+T|0;dM=c[Y>>2]|0}while((ac|0)>0);c[b+39840+(dM*48&-1)+4>>2]=T;ac=c[ad>>2]|0;bX=T;ai=2;V=dM;do{bU=8-(bX&7)|0;a4=(ai|0)<(bU|0)?ai:bU;ai=ai-a4|0;dK=(bX>>3)+(b+39840+(V*48&-1)+8)|0;a[dK]=(ac>>ai<<bU-a4|(d[dK]|0))&255;bX=a4+bX|0;V=c[Y>>2]|0}while((ai|0)>0);c[b+39840+(V*48&-1)+4>>2]=bX;ai=c[b+304+(eb*10504&-1)+(R*5252&-1)+4792>>2]|0;ac=bX;dM=1;T=V;do{ad=8-(ac&7)|0;a4=(dM|0)<(ad|0)?dM:ad;dM=dM-a4|0;dK=(ac>>3)+(b+39840+(T*48&-1)+8)|0;a[dK]=(ai>>dM<<ad-a4|(d[dK]|0))&255;ac=a4+ac|0;T=c[Y>>2]|0}while((dM|0)>0);c[b+39840+(T*48&-1)+4>>2]=ac;dM=b+304+(eb*10504&-1)+(R*5252&-1)+4796|0;ai=c[dM>>2]|0;if((ai|0)==14){c[dM>>2]=16;dM=c[Y>>2]|0;ep=16;eq=dM;er=c[b+39840+(dM*48&-1)+4>>2]|0}else{ep=ai;eq=T;er=ac}ai=er;dM=5;V=eq;do{bX=8-(ai&7)|0;a4=(dM|0)<(bX|0)?dM:bX;dM=dM-a4|0;dK=(ai>>3)+(b+39840+(V*48&-1)+8)|0;a[dK]=(ep>>dM<<bX-a4|(d[dK]|0))&255;ai=a4+ai|0;V=c[Y>>2]|0}while((dM|0)>0);c[b+39840+(V*48&-1)+4>>2]=ai;dM=b+304+(eb*10504&-1)+(R*5252&-1)+4800|0;ac=c[dM>>2]|0;if((ac|0)==14){c[dM>>2]=16;dM=c[Y>>2]|0;es=16;et=dM;eu=c[b+39840+(dM*48&-1)+4>>2]|0}else{es=ac;et=V;eu=ai}ac=eu;dM=5;T=et;do{a4=8-(ac&7)|0;dK=(dM|0)<(a4|0)?dM:a4;dM=dM-dK|0;bX=(ac>>3)+(b+39840+(T*48&-1)+8)|0;a[bX]=(es>>dM<<a4-dK|(d[bX]|0))&255;ac=dK+ac|0;T=c[Y>>2]|0}while((dM|0)>0);c[b+39840+(T*48&-1)+4>>2]=ac;dM=c[b+304+(eb*10504&-1)+(R*5252&-1)+4808>>2]|0;ai=ac;V=3;dK=T;do{bX=8-(ai&7)|0;a4=(V|0)<(bX|0)?V:bX;V=V-a4|0;ad=(ai>>3)+(b+39840+(dK*48&-1)+8)|0;a[ad]=(dM>>V<<bX-a4|(d[ad]|0))&255;ai=a4+ai|0;dK=c[Y>>2]|0}while((V|0)>0);c[b+39840+(dK*48&-1)+4>>2]=ai;V=c[b+304+(eb*10504&-1)+(R*5252&-1)+4812>>2]|0;dM=ai;T=3;ac=dK;do{a4=8-(dM&7)|0;ad=(T|0)<(a4|0)?T:a4;T=T-ad|0;bX=(dM>>3)+(b+39840+(ac*48&-1)+8)|0;a[bX]=(V>>T<<a4-ad|(d[bX]|0))&255;dM=ad+dM|0;ac=c[Y>>2]|0}while((T|0)>0);c[b+39840+(ac*48&-1)+4>>2]=dM;T=c[b+304+(eb*10504&-1)+(R*5252&-1)+4816>>2]|0;V=dM;dK=3;ai=ac;do{ad=8-(V&7)|0;bX=(dK|0)<(ad|0)?dK:ad;dK=dK-bX|0;a4=(V>>3)+(b+39840+(ai*48&-1)+8)|0;a[a4]=(T>>dK<<ad-bX|(d[a4]|0))&255;V=bX+V|0;ai=c[Y>>2]|0}while((dK|0)>0);c[b+39840+(ai*48&-1)+4>>2]=V;en=ai;eo=V}dK=c[b+304+(eb*10504&-1)+(R*5252&-1)+4832>>2]|0;T=eo;ac=1;dM=en;do{bX=8-(T&7)|0;a4=(ac|0)<(bX|0)?ac:bX;ac=ac-a4|0;ad=(T>>3)+(b+39840+(dM*48&-1)+8)|0;a[ad]=(dK>>ac<<bX-a4|(d[ad]|0))&255;T=a4+T|0;dM=c[Y>>2]|0}while((ac|0)>0);c[b+39840+(dM*48&-1)+4>>2]=T;ac=c[b+304+(eb*10504&-1)+(R*5252&-1)+4836>>2]|0;dK=T;V=1;ai=dM;do{a4=8-(dK&7)|0;ad=(V|0)<(a4|0)?V:a4;V=V-ad|0;bX=(dK>>3)+(b+39840+(ai*48&-1)+8)|0;a[bX]=(ac>>V<<a4-ad|(d[bX]|0))&255;dK=ad+dK|0;ai=c[Y>>2]|0}while((V|0)>0);c[b+39840+(ai*48&-1)+4>>2]=dK;V=c[b+304+(eb*10504&-1)+(R*5252&-1)+4840>>2]|0;ac=dK;dM=1;T=ai;do{ad=8-(ac&7)|0;bX=(dM|0)<(ad|0)?dM:ad;dM=dM-bX|0;a4=(ac>>3)+(b+39840+(T*48&-1)+8)|0;a[a4]=(V>>dM<<ad-bX|(d[a4]|0))&255;ac=bX+ac|0;T=c[Y>>2]|0}while((dM|0)>0);c[b+39840+(T*48&-1)+4>>2]=ac;dM=R+1|0;V=c[d4>>2]|0;if((dM|0)<(V|0)){R=dM;dT=T;d6=ac}else{ev=V;ew=T;break}}}else{ev=ec;ew=ed}d6=eb+1|0;if((d6|0)<2){eb=d6;ec=ev;ed=ew}else{ex=ew;break}}}else{d4=d8;bO=8;d6=bP;do{dT=8-(d4&7)|0;R=(bO|0)<(dT|0)?bO:dT;bO=bO-R|0;X=(d4>>3)+(b+39840+(d6*48&-1)+8)|0;a[X]=(d7>>bO<<dT-R|(d[X]|0))&255;d4=R+d4|0;d6=c[Y>>2]|0}while((bO|0)>0);bO=b+39840+(d6*48&-1)+4|0;c[bO>>2]=d4;R=c[b+21316>>2]|0;X=b+72|0;dT=c[X>>2]|0;if((dT|0)>0){ey=d4;ez=dT;eA=d6}else{c[bO>>2]=d4;ex=d6;break}do{bO=8-(ey&7)|0;dT=(ez|0)<(bO|0)?ez:bO;ez=ez-dT|0;ab=(ey>>3)+(b+39840+(eA*48&-1)+8)|0;a[ab]=(R>>ez<<bO-dT|(d[ab]|0))&255;ey=dT+ey|0;eA=c[Y>>2]|0}while((ez|0)>0);R=c[X>>2]|0;c[b+39840+(eA*48&-1)+4>>2]=ey;if((R|0)>0){eB=0;eC=eA;eD=ey}else{ex=eA;break}while(1){R=(c[b+304+(eB*5252&-1)+4844>>2]|0)+(c[b+304+(eB*5252&-1)+4768>>2]|0)|0;d6=eD;d4=12;dT=eC;do{ab=8-(d6&7)|0;bO=(d4|0)<(ab|0)?d4:ab;d4=d4-bO|0;V=(d6>>3)+(b+39840+(dT*48&-1)+8)|0;a[V]=(R>>d4<<ab-bO|(d[V]|0))&255;d6=bO+d6|0;dT=c[Y>>2]|0}while((d4|0)>0);c[b+39840+(dT*48&-1)+4>>2]=d6;d4=(c[b+304+(eB*5252&-1)+4772>>2]|0)/2&-1;R=d6;bO=9;V=dT;do{ab=8-(R&7)|0;dM=(bO|0)<(ab|0)?bO:ab;bO=bO-dM|0;ai=(R>>3)+(b+39840+(V*48&-1)+8)|0;a[ai]=(d4>>bO<<ab-dM|(d[ai]|0))&255;R=dM+R|0;V=c[Y>>2]|0}while((bO|0)>0);c[b+39840+(V*48&-1)+4>>2]=R;bO=c[b+304+(eB*5252&-1)+4780>>2]|0;d4=R;dT=8;d6=V;do{dM=8-(d4&7)|0;ai=(dT|0)<(dM|0)?dT:dM;dT=dT-ai|0;ab=(d4>>3)+(b+39840+(d6*48&-1)+8)|0;a[ab]=(bO>>dT<<dM-ai|(d[ab]|0))&255;d4=ai+d4|0;d6=c[Y>>2]|0}while((dT|0)>0);c[b+39840+(d6*48&-1)+4>>2]=d4;dT=c[b+304+(eB*5252&-1)+4784>>2]|0;bO=d4;V=9;R=d6;do{ai=8-(bO&7)|0;ab=(V|0)<(ai|0)?V:ai;V=V-ab|0;dM=(bO>>3)+(b+39840+(R*48&-1)+8)|0;a[dM]=(dT>>V<<ai-ab|(d[dM]|0))&255;bO=ab+bO|0;R=c[Y>>2]|0}while((V|0)>0);V=b+39840+(R*48&-1)+4|0;c[V>>2]=bO;dT=b+304+(eB*5252&-1)+4788|0;if((c[dT>>2]|0)==0){d6=bO;d4=1;do{ab=8-(d6&7)|0;dM=(d4|0)<(ab|0)?d4:ab;d4=d4-dM|0;d6=dM+d6|0;}while((d4|0)>0);c[V>>2]=d6;d4=b+304+(eB*5252&-1)+4796|0;dM=c[d4>>2]|0;if((dM|0)==14){c[d4>>2]=16;d4=c[Y>>2]|0;eE=16;eF=d4;eG=c[b+39840+(d4*48&-1)+4>>2]|0}else{eE=dM;eF=R;eG=d6}dM=eG;d4=5;ab=eF;do{ai=8-(dM&7)|0;dK=(d4|0)<(ai|0)?d4:ai;d4=d4-dK|0;bX=(dM>>3)+(b+39840+(ab*48&-1)+8)|0;a[bX]=(eE>>d4<<ai-dK|(d[bX]|0))&255;dM=dK+dM|0;ab=c[Y>>2]|0}while((d4|0)>0);c[b+39840+(ab*48&-1)+4>>2]=dM;d4=b+304+(eB*5252&-1)+4800|0;d6=c[d4>>2]|0;if((d6|0)==14){c[d4>>2]=16;d4=c[Y>>2]|0;eH=16;eI=d4;eJ=c[b+39840+(d4*48&-1)+4>>2]|0}else{eH=d6;eI=ab;eJ=dM}d6=eJ;d4=5;V=eI;do{dK=8-(d6&7)|0;bX=(d4|0)<(dK|0)?d4:dK;d4=d4-bX|0;ai=(d6>>3)+(b+39840+(V*48&-1)+8)|0;a[ai]=(eH>>d4<<dK-bX|(d[ai]|0))&255;d6=bX+d6|0;V=c[Y>>2]|0}while((d4|0)>0);c[b+39840+(V*48&-1)+4>>2]=d6;d4=b+304+(eB*5252&-1)+4804|0;dM=c[d4>>2]|0;if((dM|0)==14){c[d4>>2]=16;d4=c[Y>>2]|0;eK=16;eL=d4;eM=c[b+39840+(d4*48&-1)+4>>2]|0}else{eK=dM;eL=V;eM=d6}dM=eM;d4=5;ab=eL;do{bX=8-(dM&7)|0;ai=(d4|0)<(bX|0)?d4:bX;d4=d4-ai|0;dK=(dM>>3)+(b+39840+(ab*48&-1)+8)|0;a[dK]=(eK>>d4<<bX-ai|(d[dK]|0))&255;dM=ai+dM|0;ab=c[Y>>2]|0}while((d4|0)>0);c[b+39840+(ab*48&-1)+4>>2]=dM;d4=c[b+304+(eB*5252&-1)+4824>>2]|0;d6=dM;V=4;ai=ab;do{dK=8-(d6&7)|0;bX=(V|0)<(dK|0)?V:dK;V=V-bX|0;a4=(d6>>3)+(b+39840+(ai*48&-1)+8)|0;a[a4]=(d4>>V<<dK-bX|(d[a4]|0))&255;d6=bX+d6|0;ai=c[Y>>2]|0}while((V|0)>0);c[b+39840+(ai*48&-1)+4>>2]=d6;V=c[b+304+(eB*5252&-1)+4828>>2]|0;d4=d6;ab=3;dM=ai;do{bX=8-(d4&7)|0;a4=(ab|0)<(bX|0)?ab:bX;ab=ab-a4|0;dK=(d4>>3)+(b+39840+(dM*48&-1)+8)|0;a[dK]=(V>>ab<<bX-a4|(d[dK]|0))&255;d4=a4+d4|0;dM=c[Y>>2]|0}while((ab|0)>0);c[b+39840+(dM*48&-1)+4>>2]=d4;eN=dM;eO=d4}else{ab=bO;V=1;ai=R;do{d6=8-(ab&7)|0;a4=(V|0)<(d6|0)?V:d6;V=V-a4|0;dK=(ab>>3)+(b+39840+(ai*48&-1)+8)|0;a[dK]=(1>>>(V>>>0)<<d6-a4|(d[dK]|0))&255;ab=a4+ab|0;ai=c[Y>>2]|0}while((V|0)>0);c[b+39840+(ai*48&-1)+4>>2]=ab;V=c[dT>>2]|0;R=ab;bO=2;d4=ai;do{dM=8-(R&7)|0;a4=(bO|0)<(dM|0)?bO:dM;bO=bO-a4|0;dK=(R>>3)+(b+39840+(d4*48&-1)+8)|0;a[dK]=(V>>bO<<dM-a4|(d[dK]|0))&255;R=a4+R|0;d4=c[Y>>2]|0}while((bO|0)>0);c[b+39840+(d4*48&-1)+4>>2]=R;bO=c[b+304+(eB*5252&-1)+4792>>2]|0;V=R;ai=1;ab=d4;do{dT=8-(V&7)|0;a4=(ai|0)<(dT|0)?ai:dT;ai=ai-a4|0;dK=(V>>3)+(b+39840+(ab*48&-1)+8)|0;a[dK]=(bO>>ai<<dT-a4|(d[dK]|0))&255;V=a4+V|0;ab=c[Y>>2]|0}while((ai|0)>0);c[b+39840+(ab*48&-1)+4>>2]=V;ai=b+304+(eB*5252&-1)+4796|0;bO=c[ai>>2]|0;if((bO|0)==14){c[ai>>2]=16;ai=c[Y>>2]|0;eP=16;eQ=ai;eR=c[b+39840+(ai*48&-1)+4>>2]|0}else{eP=bO;eQ=ab;eR=V}bO=eR;ai=5;d4=eQ;do{R=8-(bO&7)|0;a4=(ai|0)<(R|0)?ai:R;ai=ai-a4|0;dK=(bO>>3)+(b+39840+(d4*48&-1)+8)|0;a[dK]=(eP>>ai<<R-a4|(d[dK]|0))&255;bO=a4+bO|0;d4=c[Y>>2]|0}while((ai|0)>0);c[b+39840+(d4*48&-1)+4>>2]=bO;ai=b+304+(eB*5252&-1)+4800|0;V=c[ai>>2]|0;if((V|0)==14){c[ai>>2]=16;ai=c[Y>>2]|0;eS=16;eT=ai;eU=c[b+39840+(ai*48&-1)+4>>2]|0}else{eS=V;eT=d4;eU=bO}V=eU;ai=5;ab=eT;do{a4=8-(V&7)|0;dK=(ai|0)<(a4|0)?ai:a4;ai=ai-dK|0;R=(V>>3)+(b+39840+(ab*48&-1)+8)|0;a[R]=(eS>>ai<<a4-dK|(d[R]|0))&255;V=dK+V|0;ab=c[Y>>2]|0}while((ai|0)>0);c[b+39840+(ab*48&-1)+4>>2]=V;ai=c[b+304+(eB*5252&-1)+4808>>2]|0;bO=V;d4=3;dK=ab;do{R=8-(bO&7)|0;a4=(d4|0)<(R|0)?d4:R;d4=d4-a4|0;dT=(bO>>3)+(b+39840+(dK*48&-1)+8)|0;a[dT]=(ai>>d4<<R-a4|(d[dT]|0))&255;bO=a4+bO|0;dK=c[Y>>2]|0}while((d4|0)>0);c[b+39840+(dK*48&-1)+4>>2]=bO;d4=c[b+304+(eB*5252&-1)+4812>>2]|0;ai=bO;ab=3;V=dK;do{a4=8-(ai&7)|0;dT=(ab|0)<(a4|0)?ab:a4;ab=ab-dT|0;R=(ai>>3)+(b+39840+(V*48&-1)+8)|0;a[R]=(d4>>ab<<a4-dT|(d[R]|0))&255;ai=dT+ai|0;V=c[Y>>2]|0}while((ab|0)>0);c[b+39840+(V*48&-1)+4>>2]=ai;ab=c[b+304+(eB*5252&-1)+4816>>2]|0;d4=ai;dK=3;bO=V;do{dT=8-(d4&7)|0;R=(dK|0)<(dT|0)?dK:dT;dK=dK-R|0;a4=(d4>>3)+(b+39840+(bO*48&-1)+8)|0;a[a4]=(ab>>dK<<dT-R|(d[a4]|0))&255;d4=R+d4|0;bO=c[Y>>2]|0}while((dK|0)>0);c[b+39840+(bO*48&-1)+4>>2]=d4;eN=bO;eO=d4}dK=c[b+304+(eB*5252&-1)+4836>>2]|0;ab=eO;V=1;ai=eN;do{R=8-(ab&7)|0;a4=(V|0)<(R|0)?V:R;V=V-a4|0;dT=(ab>>3)+(b+39840+(ai*48&-1)+8)|0;a[dT]=(dK>>V<<R-a4|(d[dT]|0))&255;ab=a4+ab|0;ai=c[Y>>2]|0}while((V|0)>0);c[b+39840+(ai*48&-1)+4>>2]=ab;V=c[b+304+(eB*5252&-1)+4840>>2]|0;dK=ab;d4=1;bO=ai;do{a4=8-(dK&7)|0;dT=(d4|0)<(a4|0)?d4:a4;d4=d4-dT|0;R=(dK>>3)+(b+39840+(bO*48&-1)+8)|0;a[R]=(V>>d4<<a4-dT|(d[R]|0))&255;dK=dT+dK|0;bO=c[Y>>2]|0}while((d4|0)>0);c[b+39840+(bO*48&-1)+4>>2]=dK;d4=eB+1|0;if((d4|0)<(c[X>>2]|0)){eB=d4;eC=bO;eD=dK}else{ex=bO;break}}}}while(0);if((c[d0>>2]|0)!=0){d0=d[b+39840+(ex*48&-1)+10|0]|0;eD=(d0&128|0)!=0?262140:196598;eC=(((eD^d0<<10)&65536|0)==0?eD:eD^32773)<<1;eD=(((eC^d0<<11)&65536|0)==0?eC:eC^32773)<<1;eC=(((eD^d0<<12)&65536|0)==0?eD:eD^32773)<<1;eD=(((eC^d0<<13)&65536|0)==0?eC:eC^32773)<<1;eC=(((eD^d0<<14)&65536|0)==0?eD:eD^32773)<<1;eD=(((eC^d0<<15)&65536|0)==0?eC:eC^32773)<<1;eC=d[b+39840+(ex*48&-1)+11|0]|0;eB=(((eD^d0<<16)&65536|0)==0?eD:eD^32773)<<1;eD=(((eB^eC<<9)&65536|0)==0?eB:eB^32773)<<1;eB=(((eD^eC<<10)&65536|0)==0?eD:eD^32773)<<1;eD=(((eB^eC<<11)&65536|0)==0?eB:eB^32773)<<1;eB=(((eD^eC<<12)&65536|0)==0?eD:eD^32773)<<1;eD=(((eB^eC<<13)&65536|0)==0?eB:eB^32773)<<1;eB=(((eD^eC<<14)&65536|0)==0?eD:eD^32773)<<1;eD=(((eB^eC<<15)&65536|0)==0?eB:eB^32773)<<1;eB=((eD^eC<<16)&65536|0)==0?eD:eD^32773;eD=c[d5>>2]|0;eC=eB&255;d0=eB>>>8&255;if((eD|0)>6){eN=eB;eB=6;do{eO=d[b+39840+(ex*48&-1)+8+eB|0]|0;eS=eN<<1;eT=(((eO<<9^eS)&65536|0)==0?eS:eS^32773)<<1;eS=(((eT^eO<<10)&65536|0)==0?eT:eT^32773)<<1;eT=(((eS^eO<<11)&65536|0)==0?eS:eS^32773)<<1;eS=(((eT^eO<<12)&65536|0)==0?eT:eT^32773)<<1;eT=(((eS^eO<<13)&65536|0)==0?eS:eS^32773)<<1;eS=(((eT^eO<<14)&65536|0)==0?eT:eT^32773)<<1;eT=(((eS^eO<<15)&65536|0)==0?eS:eS^32773)<<1;eN=((eT^eO<<16)&65536|0)==0?eT:eT^32773;eB=eB+1|0;}while((eB|0)<(eD|0));eV=eN>>>8&255;eW=eN&255}else{eV=d0;eW=eC}a[b+39840+(ex*48&-1)+12|0]=eV;a[b+39840+(ex*48&-1)+13|0]=eW}eW=ex+1&255;c[Y>>2]=eW;c[b+39840+(eW*48&-1)>>2]=(c[b+39840+(ex*48&-1)>>2]|0)+d1;ex=b+52132|0;if((c[Y>>2]|0)==(c[ex>>2]|0)){bw(b,20096,(t=i,i=i+1|0,i=i+7>>3<<3,c[t>>2]=0,t)|0)}Y=c[d5>>2]<<3;eW=b+72|0;do{if((c[dS>>2]|0)==1){eV=b+300|0;eC=b+296|0;d0=b+292|0;eN=b+284|0;eD=b+21464|0;eB=0;eT=0;eO=c[eW>>2]|0;while(1){if((eO|0)>0){eS=eB;eU=0;while(1){eP=b+304+(eT*10504&-1)+(eU*5252&-1)|0;eQ=c[b+304+(eT*10504&-1)+(eU*5252&-1)+4784>>2]|0;eR=c[5296+(eQ<<2)>>2]|0;eK=c[5232+(eQ<<2)>>2]|0;eL=b+304+(eT*10504&-1)+(eU*5252&-1)+4868|0;eM=c[eL>>2]|0;L1116:do{if((eM|0)>0){if((eQ-4|0)>>>0<12){eX=0;eY=0;eZ=eM}else{eH=0;eI=0;while(1){eJ=((c[b+304+(eT*10504&-1)+(eU*5252&-1)+4608+(eI<<2)>>2]|0)==-1?0:eR)+eH|0;eE=eI+1|0;if((eE|0)<(eM|0)){eH=eJ;eI=eE}else{e_=eJ;e$=eM;break L1116}}}while(1){eI=c[b+304+(eT*10504&-1)+(eU*5252&-1)+4608+(eY<<2)>>2]|0;if((eI|0)==-1){e0=eX;e1=eZ}else{eH=eR;do{eJ=c[eV>>2]|0;if((eJ|0)==0){c[eV>>2]=8;eE=(c[eC>>2]|0)+1|0;c[eC>>2]=eE;eF=c[ex>>2]|0;if((c[b+39840+(eF*48&-1)>>2]|0)==(c[d0>>2]|0)){eG=(c[eN>>2]|0)+eE|0;eA=b+39840+(eF*48&-1)+8|0;eF=c[d5>>2]|0;bA(eG|0,eA|0,eF)|0;eF=c[d5>>2]|0;eA=(c[eC>>2]|0)+eF|0;c[eC>>2]=eA;c[d0>>2]=(c[d0>>2]|0)+(eF<<3);c[ex>>2]=(c[ex>>2]|0)+1&255;e2=eA}else{e2=eE}a[(c[eN>>2]|0)+e2|0]=0;e3=c[eV>>2]|0}else{e3=eJ}eJ=(eH|0)<(e3|0)?eH:e3;eH=eH-eJ|0;eE=e3-eJ|0;c[eV>>2]=eE;eA=(c[eN>>2]|0)+(c[eC>>2]|0)|0;a[eA]=(eI>>eH<<eE|(d[eA]|0))&255;c[d0>>2]=(c[d0>>2]|0)+eJ;}while((eH|0)>0);e0=eX+eR|0;e1=c[eL>>2]|0}eH=eY+1|0;if((eH|0)<(e1|0)){eX=e0;eY=eH;eZ=e1}else{e_=e0;e$=eH;break}}}else{e_=0;e$=0}}while(0);eL=b+304+(eT*10504&-1)+(eU*5252&-1)+4860|0;eR=c[eL>>2]|0;if((e$|0)<(eR|0)){eM=e_;T=e$;ac=eR;while(1){eR=c[b+304+(eT*10504&-1)+(eU*5252&-1)+4608+(T<<2)>>2]|0;if((eR|0)==-1){e4=eM;e5=ac}else{if((eQ|0)==4|(eQ|0)==0){e6=ac}else{eH=eK;do{eI=c[eV>>2]|0;if((eI|0)==0){c[eV>>2]=8;eJ=(c[eC>>2]|0)+1|0;c[eC>>2]=eJ;eA=c[ex>>2]|0;if((c[b+39840+(eA*48&-1)>>2]|0)==(c[d0>>2]|0)){eE=(c[eN>>2]|0)+eJ|0;eF=b+39840+(eA*48&-1)+8|0;eA=c[d5>>2]|0;bA(eE|0,eF|0,eA)|0;eA=c[d5>>2]|0;eF=(c[eC>>2]|0)+eA|0;c[eC>>2]=eF;c[d0>>2]=(c[d0>>2]|0)+(eA<<3);c[ex>>2]=(c[ex>>2]|0)+1&255;e7=eF}else{e7=eJ}a[(c[eN>>2]|0)+e7|0]=0;e8=c[eV>>2]|0}else{e8=eI}eI=(eH|0)<(e8|0)?eH:e8;eH=eH-eI|0;eJ=e8-eI|0;c[eV>>2]=eJ;eF=(c[eN>>2]|0)+(c[eC>>2]|0)|0;a[eF]=(eR>>eH<<eJ|(d[eF]|0))&255;c[d0>>2]=(c[d0>>2]|0)+eI;}while((eH|0)>0);e6=c[eL>>2]|0}e4=eM+eK|0;e5=e6}eH=T+1|0;if((eH|0)<(e5|0)){eM=e4;T=eH;ac=e5}else{e9=e4;break}}}else{e9=e_}if((c[b+304+(eT*10504&-1)+(eU*5252&-1)+4788>>2]|0)==2){ac=(c[eD>>2]|0)*3&-1;T=b+304+(eT*10504&-1)+(eU*5252&-1)+4772|0;eM=c[T>>2]|0;eK=(ac|0)>(eM|0)?eM:ac;ac=bf(b,c[b+304+(eT*10504&-1)+(eU*5252&-1)+4796>>2]|0,0,eK,eP)|0;fa=(bf(b,c[b+304+(eT*10504&-1)+(eU*5252&-1)+4800>>2]|0,eK,c[T>>2]|0,eP)|0)+ac|0}else{ac=c[b+304+(eT*10504&-1)+(eU*5252&-1)+4772>>2]|0;T=c[b+304+(eT*10504&-1)+(eU*5252&-1)+4824>>2]|0;eK=c[b+21360+(T+1<<2)>>2]|0;eM=c[b+21360+(T+2+(c[b+304+(eT*10504&-1)+(eU*5252&-1)+4828>>2]|0)<<2)>>2]|0;T=(eK|0)>(ac|0)?ac:eK;eK=(eM|0)>(ac|0)?ac:eM;eM=bf(b,c[b+304+(eT*10504&-1)+(eU*5252&-1)+4796>>2]|0,0,T,eP)|0;eL=(bf(b,c[b+304+(eT*10504&-1)+(eU*5252&-1)+4800>>2]|0,T,eK,eP)|0)+eM|0;fa=eL+(bf(b,c[b+304+(eT*10504&-1)+(eU*5252&-1)+4804>>2]|0,eK,ac,eP)|0)|0}ac=e9+eS+fa+(be(b,eP)|0)|0;eK=eU+1|0;eL=c[eW>>2]|0;if((eK|0)<(eL|0)){eS=ac;eU=eK}else{fb=ac;fc=eL;break}}}else{fb=eB;fc=eO}eU=eT+1|0;if((eU|0)<2){eB=fb;eT=eU;eO=fc}else{fd=fb;break}}}else{if((c[eW>>2]|0)<=0){fd=0;break}eO=b+300|0;eT=b+296|0;eB=b+292|0;eD=b+284|0;d0=b+21464|0;eC=0;eN=0;while(1){eV=b+304+(eN*5252&-1)|0;eU=b+304+(eN*5252&-1)+5188|0;if((c[b+304+(eN*5252&-1)+4788>>2]|0)==2){eS=0;bO=0;dK=0;while(1){eL=c[(c[eU>>2]|0)+(eS<<2)>>2]|0;ac=(eL|0)/3&-1;eK=c[b+304+(eN*5252&-1)+5192+(eS<<2)>>2]|0;if((eL|0)>2){eL=(eK|0)>0;eM=(ac|0)>1?ac:1;T=0;eQ=dK;while(1){eH=eQ*3&-1;eR=c[b+304+(eN*5252&-1)+4608+(eH<<2)>>2]|0;eI=(eR|0)>0?eR:0;if(eL){eR=eK;do{eF=c[eO>>2]|0;if((eF|0)==0){c[eO>>2]=8;eJ=(c[eT>>2]|0)+1|0;c[eT>>2]=eJ;eA=c[ex>>2]|0;if((c[b+39840+(eA*48&-1)>>2]|0)==(c[eB>>2]|0)){eE=(c[eD>>2]|0)+eJ|0;eG=b+39840+(eA*48&-1)+8|0;eA=c[d5>>2]|0;bA(eE|0,eG|0,eA)|0;eA=c[d5>>2]|0;eG=(c[eT>>2]|0)+eA|0;c[eT>>2]=eG;c[eB>>2]=(c[eB>>2]|0)+(eA<<3);c[ex>>2]=(c[ex>>2]|0)+1&255;fe=eG}else{fe=eJ}a[(c[eD>>2]|0)+fe|0]=0;ff=c[eO>>2]|0}else{ff=eF}eF=(eR|0)<(ff|0)?eR:ff;eR=eR-eF|0;eJ=ff-eF|0;c[eO>>2]=eJ;eG=(c[eD>>2]|0)+(c[eT>>2]|0)|0;a[eG]=(eI>>eR<<eJ|(d[eG]|0))&255;fg=(c[eB>>2]|0)+eF|0;c[eB>>2]=fg;}while((eR|0)>0);eR=c[b+304+(eN*5252&-1)+4608+(eH+1<<2)>>2]|0;eI=(eR|0)>0?eR:0;eR=eK;eF=fg;do{eG=c[eO>>2]|0;if((eG|0)==0){c[eO>>2]=8;eJ=(c[eT>>2]|0)+1|0;c[eT>>2]=eJ;eA=c[ex>>2]|0;if((c[b+39840+(eA*48&-1)>>2]|0)==(eF|0)){eE=(c[eD>>2]|0)+eJ|0;ey=b+39840+(eA*48&-1)+8|0;eA=c[d5>>2]|0;bA(eE|0,ey|0,eA)|0;eA=c[d5>>2]|0;ey=(c[eT>>2]|0)+eA|0;c[eT>>2]=ey;c[eB>>2]=(c[eB>>2]|0)+(eA<<3);c[ex>>2]=(c[ex>>2]|0)+1&255;fh=ey}else{fh=eJ}a[(c[eD>>2]|0)+fh|0]=0;fi=c[eO>>2]|0}else{fi=eG}eG=(eR|0)<(fi|0)?eR:fi;eR=eR-eG|0;eJ=fi-eG|0;c[eO>>2]=eJ;ey=(c[eD>>2]|0)+(c[eT>>2]|0)|0;a[ey]=(eI>>eR<<eJ|(d[ey]|0))&255;eF=(c[eB>>2]|0)+eG|0;c[eB>>2]=eF;}while((eR|0)>0);eR=c[b+304+(eN*5252&-1)+4608+(eH+2<<2)>>2]|0;eI=(eR|0)>0?eR:0;eR=eK;eG=eF;do{ey=c[eO>>2]|0;if((ey|0)==0){c[eO>>2]=8;eJ=(c[eT>>2]|0)+1|0;c[eT>>2]=eJ;eA=c[ex>>2]|0;if((c[b+39840+(eA*48&-1)>>2]|0)==(eG|0)){eE=(c[eD>>2]|0)+eJ|0;ez=b+39840+(eA*48&-1)+8|0;eA=c[d5>>2]|0;bA(eE|0,ez|0,eA)|0;eA=c[d5>>2]|0;ez=(c[eT>>2]|0)+eA|0;c[eT>>2]=ez;c[eB>>2]=(c[eB>>2]|0)+(eA<<3);c[ex>>2]=(c[ex>>2]|0)+1&255;fj=ez}else{fj=eJ}a[(c[eD>>2]|0)+fj|0]=0;fk=c[eO>>2]|0}else{fk=ey}ey=(eR|0)<(fk|0)?eR:fk;eR=eR-ey|0;eJ=fk-ey|0;c[eO>>2]=eJ;ez=(c[eD>>2]|0)+(c[eT>>2]|0)|0;a[ez]=(eI>>eR<<eJ|(d[ez]|0))&255;eG=(c[eB>>2]|0)+ey|0;c[eB>>2]=eG;}while((eR|0)>0)}eR=T+1|0;if((eR|0)<(ac|0)){T=eR;eQ=eQ+1|0}else{break}}fl=(_(eK*3&-1,eM)|0)+bO|0;fm=eM+dK|0}else{fl=bO;fm=dK}eQ=eS+1|0;if((eQ|0)<4){eS=eQ;bO=fl;dK=fm}else{break}}dK=(c[d0>>2]|0)*3&-1;bO=b+304+(eN*5252&-1)+4772|0;eS=c[bO>>2]|0;eQ=(dK|0)>(eS|0)?eS:dK;dK=bf(b,c[b+304+(eN*5252&-1)+4796>>2]|0,0,eQ,eV)|0;fn=(bf(b,c[b+304+(eN*5252&-1)+4800>>2]|0,eQ,c[bO>>2]|0,eV)|0)+dK|0;fo=fl}else{dK=0;bO=0;eQ=0;while(1){eS=c[(c[eU>>2]|0)+(dK<<2)>>2]|0;T=c[b+304+(eN*5252&-1)+5192+(dK<<2)>>2]|0;if((eS|0)>0){if((T|0)>0){ac=0;eL=eQ;while(1){eP=c[b+304+(eN*5252&-1)+4608+(eL<<2)>>2]|0;eR=(eP|0)>0?eP:0;eP=T;do{eG=c[eO>>2]|0;if((eG|0)==0){c[eO>>2]=8;eI=(c[eT>>2]|0)+1|0;c[eT>>2]=eI;eF=c[ex>>2]|0;if((c[b+39840+(eF*48&-1)>>2]|0)==(c[eB>>2]|0)){eH=(c[eD>>2]|0)+eI|0;ey=b+39840+(eF*48&-1)+8|0;eF=c[d5>>2]|0;bA(eH|0,ey|0,eF)|0;eF=c[d5>>2]|0;ey=(c[eT>>2]|0)+eF|0;c[eT>>2]=ey;c[eB>>2]=(c[eB>>2]|0)+(eF<<3);c[ex>>2]=(c[ex>>2]|0)+1&255;fp=ey}else{fp=eI}a[(c[eD>>2]|0)+fp|0]=0;fq=c[eO>>2]|0}else{fq=eG}eG=(eP|0)<(fq|0)?eP:fq;eP=eP-eG|0;eI=fq-eG|0;c[eO>>2]=eI;ey=(c[eD>>2]|0)+(c[eT>>2]|0)|0;a[ey]=(eR>>eP<<eI|(d[ey]|0))&255;c[eB>>2]=(c[eB>>2]|0)+eG;}while((eP|0)>0);eP=ac+1|0;if((eP|0)<(eS|0)){ac=eP;eL=eL+1|0}else{break}}}fr=(_(T,eS)|0)+bO|0;fs=eS+eQ|0}else{fr=bO;fs=eQ}eL=dK+1|0;if((eL|0)<4){dK=eL;bO=fr;eQ=fs}else{break}}eQ=c[b+304+(eN*5252&-1)+4772>>2]|0;bO=c[b+304+(eN*5252&-1)+4824>>2]|0;dK=c[b+21360+(bO+1<<2)>>2]|0;eU=c[b+21360+(bO+2+(c[b+304+(eN*5252&-1)+4828>>2]|0)<<2)>>2]|0;bO=(dK|0)>(eQ|0)?eQ:dK;dK=(eU|0)>(eQ|0)?eQ:eU;eU=bf(b,c[b+304+(eN*5252&-1)+4796>>2]|0,0,bO,eV)|0;eL=(bf(b,c[b+304+(eN*5252&-1)+4800>>2]|0,bO,dK,eV)|0)+eU|0;fn=eL+(bf(b,c[b+304+(eN*5252&-1)+4804>>2]|0,dK,eQ,eV)|0)|0;fo=fr}eQ=fo+eC+fn+(be(b,eV)|0)|0;dK=eN+1|0;if((dK|0)<(c[eW>>2]|0)){eC=eQ;eN=dK}else{fd=eQ;break}}}}while(0);fn=b+21324|0;bc(b,c[fn>>2]|0);fo=fd+Y+(c[fn>>2]|0)|0;c[d$>>2]=(c[d$>>2]|0)+((d1-fo|0)/8&-1);Y=bb(b,r)|0;r=b+52140|0;if((Y|0)==(c[r>>2]|0)){ft=Y}else{bw(b,20696,(t=i,i=i+1|0,i=i+7>>3<<3,c[t>>2]=0,t)|0);ft=c[r>>2]|0}Y=c[d$>>2]<<3;if((Y|0)!=(ft|0)){fd=c[fn>>2]|0;fn=c[S>>2]|0;S=c[d5>>2]<<3;bw(b,20376,(t=i,i=i+72|0,c[t>>2]=Y,c[t+8>>2]=ft,c[t+16>>2]=fd,c[t+24>>2]=fn,c[t+32>>2]=S,c[t+40>>2]=fo-fd-S,c[t+48>>2]=fo,c[t+56>>2]=(fo|0)%8&-1,c[t+64>>2]=d1,t)|0);bw(b,20320,(t=i,i=i+1|0,i=i+7>>3<<3,c[t>>2]=0,t)|0);bw(b,20240,(t=i,i=i+1|0,i=i+7>>3<<3,c[t>>2]=0,t)|0);bw(b,20192,(t=i,i=i+1|0,i=i+7>>3<<3,c[t>>2]=0,t)|0);bw(b,20152,(t=i,i=i+1|0,i=i+7>>3<<3,c[t>>2]=0,t)|0);c[r>>2]=c[d$>>2]<<3}d$=b+292|0;r=c[d$>>2]|0;if((r|0)>1e9){d1=0;do{fo=b+39840+(d1*48&-1)|0;c[fo>>2]=(c[fo>>2]|0)-r;d1=d1+1|0;}while((d1|0)<256);c[d$>>2]=0}d$=bd(b,j,l)|0;do{if((c[b+156>>2]|0)!=0){l=c[19856+(c[dS>>2]<<6)+(c[W>>2]<<2)>>2]|0;j=b+85784|0;c[j>>2]=(c[j>>2]|0)+1;j=b+85760|0;d1=(c[j>>2]|0)+l|0;c[j>>2]=d1;j=b+85764|0;l=(c[j>>2]|0)+1|0;c[j>>2]=l;r=b+85768|0;if((l|0)<(c[r>>2]|0)){break}l=b+85772|0;fo=c[l>>2]|0;S=b+85776|0;fd=c[S>>2]|0;if((fo|0)<(fd|0)){c[(c[b+85780>>2]|0)+(fo<<2)>>2]=d1;d1=(c[l>>2]|0)+1|0;c[l>>2]=d1;c[j>>2]=0;fu=d1;fv=c[S>>2]|0}else{fu=fo;fv=fd}if((fu|0)!=(fv|0)){break}if((fv|0)>1){fd=b+85780|0;fo=1;do{d1=c[fd>>2]|0;c[d1+(((fo|0)/2&-1)<<2)>>2]=c[d1+(fo<<2)>>2];fo=fo+2|0;}while((fo|0)<(c[S>>2]|0));fw=c[l>>2]|0}else{fw=fv}c[r>>2]=c[r>>2]<<1;c[l>>2]=(fw|0)/2&-1}}while(0);do{if((c[dY>>2]|0)!=0){fw=b+85804|0;if((c[fw>>2]|0)==0){break}fv=c[ao>>2]|0;fu=fv*576&-1;dS=c[eW>>2]|0;if((dS|0)>0){S=0;do{fo=0;do{fd=c[fw>>2]|0;h[fd+24+(S*12800&-1)+(fo<<3)>>3]=+h[fd+24+(S*12800&-1)+(fo+fu<<3)>>3];fo=fo+1|0;}while((fo|0)<272);fo=c[U+(S<<2)>>2]|0;eV=272;do{h[(c[fw>>2]|0)+24+(S*12800&-1)+(eV<<3)>>3]=+g[fo+(eV-272<<2)>>2];eV=eV+1|0;}while((eV|0)<1600);S=S+1|0;fx=c[eW>>2]|0;}while((S|0)<(fx|0));fy=c[ao>>2]|0;fz=fx}else{fy=fv;fz=dS}g[b+84908>>2]=1.0;S=q;if((fy|0)<=0){break}fu=o|0;l=p|0;r=b+212|0;eV=b+216|0;fo=b+224|0;fd=b+85092|0;d1=b+92|0;j=b+85800|0;fn=n|0;ft=n+4|0;Y=0;d5=fz;fr=fy;while(1){if((d5|0)>0){fs=(Y|0)==1;fq=0;do{fp=b+304+(Y*10504&-1)+(fq*5252&-1)+4608|0;bA(S|0,fp|0,156)|0;do{if(fs){ex=b+10808+(fq*5252&-1)+4848|0;fl=c[ex>>2]|0;if((fl|0)>0){fA=0;fB=fl}else{break}while(1){fl=b+10808+(fq*5252&-1)+4608+(fA<<2)|0;if((c[fl>>2]|0)<0){c[fl>>2]=c[b+304+(fq*5252&-1)+4608+(fA<<2)>>2];fC=c[ex>>2]|0}else{fC=fB}fl=fA+1|0;if((fl|0)<(fC|0)){fA=fl;fB=fC}else{break}}}}while(0);cy=(c[b+304+(Y*10504&-1)+(fq*5252&-1)+4836>>2]|0)==0?.5:1.0;eS=c[dU>>2]|0;T=b+304+(Y*10504&-1)+(fq*5252&-1)+4856|0;if((c[T>>2]|0)>0){ex=eS+8|0;fl=eS+20|0;fm=0;fk=0;fj=0;fi=fu;while(1){d3=+bu(+g[ex>>2],+g[eS+24+(fj<<2)>>2],+g[fl>>2],+g[fo>>2]);d2=+g[b+84768+(fj<<2)>>2];dt=d3*d2;fh=c[b+304+(Y*10504&-1)+(fq*5252&-1)+4872+(fj<<2)>>2]|0;d3=dt/+(fh|0);if((fh|0)>0){fg=0;dF=2.220446049250313e-16;dR=0.0;ff=fk;while(1){dG=+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(ff<<2)>>2];dO=dG*dG;fD=dR+dO;fE=dF+(dO<d3?dO:d3);fe=fg+1|0;if((fe|0)<(fh|0)){fg=fe;dF=fE;dR=fD;ff=ff+1|0}else{break}}fF=fE;fG=fD;fH=fk+fh|0}else{fF=2.220446049250313e-16;fG=0.0;fH=fk}ff=(fG>dt&1)+fm|0;if(fG<dt){fI=fG}else{fI=fF<dt?dt:fF}dR=+g[ag+(Y*976&-1)+(fq*488&-1)+244+(fj<<2)>>2];do{if(dR>9.999999960041972e-13){dF=fG*+g[ag+(Y*976&-1)+(fq*488&-1)+(fj<<2)>>2]/dR*d2;if(fI>=dF){fJ=fI;break}fJ=dF}else{fJ=fI}}while(0);d2=fJ>2.220446049250313e-16?fJ:2.220446049250313e-16;a[b+304+(Y*10504&-1)+(fq*5252&-1)+5212+fj|0]=fG>d2+9.9999998245167e-15&1;fh=fi+4|0;g[fi>>2]=d2;fg=fj+1|0;if((fg|0)<(c[T>>2]|0)){fm=ff;fk=fH;fj=fg;fi=fh}else{fK=ff;fL=fH;fM=fg;fN=fh;break}}}else{fK=0;fL=0;fM=0;fN=fu}fi=575;while(1){if((fi|0)<=0){fO=0;break}if(+N(+(+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(fi<<2)>>2]))>9.999999960041972e-13){fO=fi;break}else{fi=fi-1|0}}fi=b+304+(Y*10504&-1)+(fq*5252&-1)+4788|0;fj=(c[fi>>2]|0)==2;if(fj){fP=fO+5-((fO|0)%6&-1)|0}else{fP=fO|1}do{if((c[fd>>2]|0)==0){fk=c[Z>>2]|0;if((fk|0)>=44e3){fQ=fP;break}fm=(fk|0)<8001;if(fj){fR=(c[b+21452+((fm?9:12)<<2)>>2]|0)*3&-1}else{fR=c[b+21360+((fm?17:21)<<2)>>2]|0}fm=fR-1|0;fQ=(fP|0)>(fm|0)?fm:fP}else{fQ=fP}}while(0);fj=b+304+(Y*10504&-1)+(fq*5252&-1)+5208|0;c[fj>>2]=fQ;fm=b+304+(Y*10504&-1)+(fq*5252&-1)+4864|0;fk=c[fm>>2]|0;if((fM|0)<(fk|0)){T=eS+8|0;fl=eS+20|0;ex=fK;fh=fL;fg=fM;fe=c[b+304+(Y*10504&-1)+(fq*5252&-1)+4852>>2]|0;fb=fN;fc=fN+8|0;while(1){d2=+bu(+g[T>>2],+g[eS+112+(fe<<2)>>2],+g[fl>>2],+g[fo>>2]);fa=b+84856+(fe<<2)|0;dR=+g[fa>>2];dt=d2*dR;e9=c[b+304+(Y*10504&-1)+(fq*5252&-1)+4872+(fg<<2)>>2]|0;d2=dt/+(e9|0);e_=(e9|0)>0;if(e_){e4=0;dF=0.0;e5=fh;d3=2.220446049250313e-16;while(1){dO=+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(e5<<2)>>2];dG=dO*dO;fS=dF+dG;fT=d3+(dG<d2?dG:d2);e6=e4+1|0;if((e6|0)<(e9|0)){e4=e6;dF=fS;e5=e5+1|0;d3=fT}else{break}}fU=fS;fV=e9+fh|0;fW=fT}else{fU=0.0;fV=fh;fW=2.220446049250313e-16}e5=(fU>dt&1)+ex|0;if(fU<dt){fX=fU}else{fX=fW<dt?dt:fW}d3=+g[ag+(Y*976&-1)+(fq*488&-1)+332+(fe*12&-1)>>2];do{if(d3>9.999999960041972e-13){dF=fU*+g[ag+(Y*976&-1)+(fq*488&-1)+88+(fe*12&-1)>>2]/d3*dR;if(fX>=dF){fY=fX;break}fY=dF}else{fY=fX}}while(0);dR=fY>2.220446049250313e-16?fY:2.220446049250313e-16;a[b+304+(Y*10504&-1)+(fq*5252&-1)+5212+fg|0]=fU>dR+9.9999998245167e-15&1;e4=fb+4|0;g[fb>>2]=dR;if(e_){ff=0;dR=0.0;e6=fV;d3=2.220446049250313e-16;while(1){dF=+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(e6<<2)>>2];dG=dF*dF;fZ=dR+dG;f_=d3+(dG<d2?dG:d2);e8=ff+1|0;if((e8|0)<(e9|0)){ff=e8;dR=fZ;e6=e6+1|0;d3=f_}else{break}}f$=fZ;f0=e9+fV|0;f1=f_}else{f$=0.0;f0=fV;f1=2.220446049250313e-16}e6=(f$>dt&1)+e5|0;if(f$<dt){f2=f$}else{f2=f1<dt?dt:f1}d3=+g[ag+(Y*976&-1)+(fq*488&-1)+332+(fe*12&-1)+4>>2];do{if(d3>9.999999960041972e-13){dR=f$*+g[ag+(Y*976&-1)+(fq*488&-1)+88+(fe*12&-1)+4>>2]/d3*+g[fa>>2];if(f2>=dR){f3=f2;break}f3=dR}else{f3=f2}}while(0);d3=f3>2.220446049250313e-16?f3:2.220446049250313e-16;a[fg+1+(b+304+(Y*10504&-1)+(fq*5252&-1)+5212)|0]=f$>d3+9.9999998245167e-15&1;e5=fb+8|0;g[e4>>2]=d3;if(e_){ff=0;d3=0.0;e8=f0;dR=2.220446049250313e-16;while(1){dG=+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(e8<<2)>>2];dF=dG*dG;f4=d3+dF;f5=dR+(dF<d2?dF:d2);e7=ff+1|0;if((e7|0)<(e9|0)){ff=e7;d3=f4;e8=e8+1|0;dR=f5}else{break}}f6=f4;f7=e9+f0|0;f8=f5}else{f6=0.0;f7=f0;f8=2.220446049250313e-16}e8=(f6>dt&1)+e6|0;if(f6<dt){f9=f6}else{f9=f8<dt?dt:f8}dR=+g[ag+(Y*976&-1)+(fq*488&-1)+332+(fe*12&-1)+8>>2];do{if(dR>9.999999960041972e-13){d3=f6*+g[ag+(Y*976&-1)+(fq*488&-1)+88+(fe*12&-1)+8>>2]/dR*+g[fa>>2];if(f9>=d3){ga=f9;break}ga=d3}else{ga=f9}}while(0);dR=ga>2.220446049250313e-16?ga:2.220446049250313e-16;a[fg+2+(b+304+(Y*10504&-1)+(fq*5252&-1)+5212)|0]=f6>dR+9.9999998245167e-15&1;g[e5>>2]=dR;fa=fb+12|0;do{if((c[d1>>2]|0)!=0){dR=+g[fc-8>>2];e6=fc-4|0;dt=+g[e6>>2];if(dR>dt){d3=dt+(dR-dt)*+g[(c[j>>2]|0)+6496>>2];g[e6>>2]=d3;gb=d3}else{gb=dt}dt=+g[fc>>2];if(gb<=dt){break}g[fc>>2]=dt+(gb-dt)*+g[(c[j>>2]|0)+6496>>2]}}while(0);e5=fg+3|0;e6=c[fm>>2]|0;if((e5|0)<(e6|0)){ex=e8;fh=f7;fg=e5;fe=fe+1|0;fb=fa;fc=fc+12|0}else{gc=e6;break}}}else{gc=fk}if((gc|0)>0){fc=b+304+(Y*10504&-1)+(fq*5252&-1)+4776|0;fb=b+304+(Y*10504&-1)+(fq*5252&-1)+4772|0;fe=0;dt=0.0;d3=0.0;dR=-20.0;fg=0;fh=0;ex=l;fl=fu;eS=0;while(1){T=fl+4|0;d2=1.0/+g[fl>>2];e6=c[b+304+(Y*10504&-1)+(fq*5252&-1)+4872+(fh<<2)>>2]|0;e5=c[fj>>2]|0;if((e6+fe|0)>(e5|0)){e9=e5-fe+1|0;gd=(e9|0)>0?e9>>1:0}else{gd=e6>>1}do{if((fe|0)>(c[fc>>2]|0)){if((gd|0)==0){ge=0.0;gf=fe;break}else{gg=fe;gh=0.0;gi=gd}while(1){e6=gi-1|0;dF=+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(gg<<2)>>2];dG=+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(gg+1<<2)>>2];gj=gh+dF*dF+dG*dG;if((e6|0)==0){break}else{gg=gg+2|0;gh=gj;gi=e6}}ge=gj;gf=(gd<<1)+fe|0}else{if((fe|0)>(c[fb>>2]|0)){g[fn>>2]=0.0;g[ft>>2]=0.0;if((gd|0)==0){ge=0.0;gf=fe;break}else{gk=fe;gl=0.0;gm=gd}while(1){e6=gm-1|0;dG=+N(+(+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(gk<<2)>>2]));dF=dG- +g[n+(c[b+304+(Y*10504&-1)+(fq*5252&-1)+2304+(gk<<2)>>2]<<2)>>2];e9=gk+1|0;dG=+N(+(+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(e9<<2)>>2]));dO=dG- +g[n+(c[b+304+(Y*10504&-1)+(fq*5252&-1)+2304+(e9<<2)>>2]<<2)>>2];gn=gl+dF*dF+dO*dO;if((e6|0)==0){break}else{gk=gk+2|0;gl=gn;gm=e6}}ge=gn;gf=(gd<<1)+fe|0;break}else{if((gd|0)==0){ge=0.0;gf=fe;break}else{go=fe;gp=0.0;gq=gd}while(1){e6=gq-1|0;dO=+N(+(+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(go<<2)>>2]));dF=+N(+(+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(go+1<<2)>>2]));gr=gp+dO*dO+dF*dF;if((e6|0)==0){break}else{go=go+2|0;gp=gr;gq=e6}}ge=gr;gf=(gd<<1)+fe|0;break}}}while(0);dF=d2*ge;fa=dF>9.999999682655225e-21?(g[k>>2]=dF,c[k>>2]|0):507307272;dO=+(fa&16383|0)*6103515625.0e-14;e8=fa>>>14&511;dG=(+((fa>>>23&255)-127|0)+((1.0-dO)*+g[5864+(e8<<2)>>2]+dO*+g[5864+(e8+1<<2)>>2]))*.30102999566398114;g[ex>>2]=dF;gs=d3+dG;if(dG>0.0){e8=~~(dG*10.0+.5);fa=(e8|0)>1?e8:1;gt=fg+1|0;gu=dt+dG;gv=eS+(_(fa,fa)|0)|0}else{gt=fg;gu=dt;gv=eS}gw=dR>dG?dR:dG;fa=fh+1|0;if((fa|0)<(c[fm>>2]|0)){fe=gf;dt=gu;d3=gs;dR=gw;fg=gt;fh=fa;ex=ex+4|0;fl=T;eS=gv}else{break}}gx=gu;gy=gs*10.0;gz=gw*10.0;gA=gt;gB=gv}else{gx=0.0;gy=0.0;gz=-200.0;gA=0;gB=0}eS=c[b+304+(Y*10504&-1)+(fq*5252&-1)+4848>>2]|0;fl=c[fi>>2]|0;if((fl|0)==2){gC=eS}else{gC=(c[b+304+(Y*10504&-1)+(fq*5252&-1)+4792>>2]|0)==0?22:eS}if((gC|0)>0){eS=b+304+(Y*10504&-1)+(fq*5252&-1)+4832|0;dR=-0.0-cy;ex=0;fh=0;while(1){fg=fh+1|0;fe=c[b+21360+(fg<<2)>>2]|0;fm=fe-(c[b+21360+(fh<<2)>>2]|0)|0;if((ex|0)<(fe|0)){fb=ex;d3=0.0;while(1){dt=+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(fb<<2)>>2];dG=d3+dt*dt;fc=fb+1|0;if((fc|0)<(fe|0)){fb=fc;d3=dG}else{gD=fe;gE=dG;break}}}else{gD=ex;gE=0.0}d3=+(fm|0);d2=gE/d3;h[(c[fw>>2]|0)+190712+(Y*704&-1)+(fq*176&-1)+(fh<<3)>>3]=d2*999999986991104.0;h[(c[fw>>2]|0)+201208+(Y*352&-1)+(fq*176&-1)+(fh<<3)>>3]=+g[o+(fh<<2)>>2]*999999986991104.0*+g[p+(fh<<2)>>2]/d3;d3=+g[ag+(Y*976&-1)+(fq*488&-1)+244+(fh<<2)>>2];do{if(d3>0.0){if((c[r>>2]|0)!=0){gF=0.0;break}gF=d2/d3}else{gF=0.0}}while(0);d3=gF*+g[ag+(Y*976&-1)+(fq*488&-1)+(fh<<2)>>2];d2=+g[(c[dU>>2]|0)+24+(fh<<2)>>2];h[(c[fw>>2]|0)+189304+(Y*704&-1)+(fq*176&-1)+(fh<<3)>>3]=(d3>d2?d3:d2)*999999986991104.0;h[(c[fw>>2]|0)+199160+(Y*352&-1)+(fq*176&-1)+(fh<<3)>>3]=0.0;if((c[eS>>2]|0)!=0&(fh|0)>10){h[(c[fw>>2]|0)+199160+(Y*352&-1)+(fq*176&-1)+(fh<<3)>>3]=+(c[5488+(fh<<2)>>2]|0)*dR}if((fh|0)<21){fm=(c[fw>>2]|0)+199160+(Y*352&-1)+(fq*176&-1)+(fh<<3)|0;h[fm>>3]=+h[fm>>3]-cy*+(c[b+304+(Y*10504&-1)+(fq*5252&-1)+4608+(fh<<2)>>2]|0)}if((fg|0)<(gC|0)){ex=gD;fh=fg}else{break}}gG=gD;gH=gC;gI=c[fi>>2]|0}else{gG=0;gH=0;gI=fl}do{if((gI|0)==2){fh=c[b+304+(Y*10504&-1)+(fq*5252&-1)+4852>>2]|0;if((fh|0)<13){gJ=gG;gK=gH;gL=fh}else{break}while(1){fh=c[b+21452+(gL<<2)>>2]|0;ex=gL+1|0;eS=c[b+21452+(ex<<2)>>2]|0;fm=eS-fh|0;fe=(fh|0)<(eS|0);dR=+(fm|0);fb=gL*3&-1;T=(gL|0)<12;fc=gJ;fj=0;fk=gK;while(1){if(fe){fa=fc;e8=fh;d2=0.0;while(1){d3=+g[b+304+(Y*10504&-1)+(fq*5252&-1)+(fa<<2)>>2];gM=d2+d3*d3;e6=e8+1|0;if((e6|0)<(eS|0)){fa=fa+1|0;e8=e6;d2=gM}else{break}}gN=fc+fm|0;gO=gM}else{gN=fc;gO=0.0}d2=gO/dR;d3=d2>1.0e-20?d2:9.999999682655225e-21;e8=fj+fb|0;h[(c[fw>>2]|0)+194616+(Y*1248&-1)+(fq*312&-1)+(e8<<3)>>3]=d3*999999986991104.0;h[(c[fw>>2]|0)+201912+(Y*624&-1)+(fq*312&-1)+(e8<<3)>>3]=+g[o+(fk<<2)>>2]*999999986991104.0*+g[p+(fk<<2)>>2]/dR;d2=+g[ag+(Y*976&-1)+(fq*488&-1)+332+(gL*12&-1)+(fj<<2)>>2];if(d2>0.0){gP=d3/d2}else{gP=0.0}if((c[r>>2]|0)==0){if((c[eV>>2]|0)==0){gQ=gP}else{cc=908}}else{cc=908}if((cc|0)==908){cc=0;gQ=0.0}d2=gQ*+g[ag+(Y*976&-1)+(fq*488&-1)+88+(gL*12&-1)+(fj<<2)>>2];d3=+g[(c[dU>>2]|0)+112+(gL<<2)>>2];h[(c[fw>>2]|0)+192120+(Y*1248&-1)+(fq*312&-1)+(e8<<3)>>3]=(d2>d3?d2:d3)*999999986991104.0;h[(c[fw>>2]|0)+199864+(Y*624&-1)+(fq*312&-1)+(e8<<3)>>3]=+(c[b+304+(Y*10504&-1)+(fq*5252&-1)+4808+(fj<<2)>>2]|0)*-2.0;if(T){fa=(c[fw>>2]|0)+199864+(Y*624&-1)+(fq*312&-1)+(e8<<3)|0;h[fa>>3]=+h[fa>>3]-cy*+(c[b+304+(Y*10504&-1)+(fq*5252&-1)+4608+(fk<<2)>>2]|0)}fa=fj+1|0;if((fa|0)<3){fc=gN;fj=fa;fk=fk+1|0}else{break}}if((ex|0)<13){gJ=gN;gK=gK+3|0;gL=ex}else{break}}}}while(0);c[(c[fw>>2]|0)+201112+(Y<<3)+(fq<<2)>>2]=c[b+304+(Y*10504&-1)+(fq*5252&-1)+4780>>2];fl=b+304+(Y*10504&-1)+(fq*5252&-1)+4844|0;c[(c[fw>>2]|0)+203400+(Y<<3)+(fq<<2)>>2]=(c[fl>>2]|0)+(c[b+304+(Y*10504&-1)+(fq*5252&-1)+4768>>2]|0);c[(c[fw>>2]|0)+203416+(Y<<3)+(fq<<2)>>2]=c[fl>>2];c[(c[fw>>2]|0)+203160+(Y<<3)+(fq<<2)>>2]=gA;h[(c[fw>>2]|0)+203208+(Y<<4)+(fq<<3)>>3]=gz;h[(c[fw>>2]|0)+203240+(Y<<4)+(fq<<3)>>3]=gx*10.0;h[(c[fw>>2]|0)+203176+(Y<<4)+(fq<<3)>>3]=gy;c[(c[fw>>2]|0)+203272+(Y<<3)+(fq<<2)>>2]=gB;bA(fp|0,S|0,156)|0;fq=fq+1|0;gR=c[eW>>2]|0;}while((fq|0)<(gR|0));gS=gR;gT=c[ao>>2]|0}else{gS=d5;gT=fr}fq=Y+1|0;if((fq|0)<(gT|0)){Y=fq;d5=gS;fr=gT}else{break}}}}while(0);gT=b+84748|0;c[gT>>2]=(c[gT>>2]|0)+1;gT=b+84040+((c[W>>2]|0)*20&-1)+16|0;c[gT>>2]=(c[gT>>2]|0)+1;gT=b+84356|0;c[gT>>2]=(c[gT>>2]|0)+1;if((c[eW>>2]|0)==2){gT=b+84040+((c[W>>2]|0)*20&-1)+(c[f>>2]<<2)|0;c[gT>>2]=(c[gT>>2]|0)+1;gT=b+84340+(c[f>>2]<<2)|0;c[gT>>2]=(c[gT>>2]|0)+1}gT=c[ao>>2]|0;if((gT|0)<=0){i=m;return d$|0}f=b+84740|0;gS=0;gR=c[eW>>2]|0;gB=gT;while(1){if((gR|0)>0){gT=0;do{gA=(c[b+304+(gS*10504&-1)+(gT*5252&-1)+4792>>2]|0)==0?c[b+304+(gS*10504&-1)+(gT*5252&-1)+4788>>2]|0:4;gL=b+84360+((c[W>>2]|0)*24&-1)+(gA<<2)|0;c[gL>>2]=(c[gL>>2]|0)+1;gL=b+84360+((c[W>>2]|0)*24&-1)+20|0;c[gL>>2]=(c[gL>>2]|0)+1;gL=b+84720+(gA<<2)|0;c[gL>>2]=(c[gL>>2]|0)+1;c[f>>2]=(c[f>>2]|0)+1;gT=gT+1|0;gU=c[eW>>2]|0;}while((gT|0)<(gU|0));gV=gU;gW=c[ao>>2]|0}else{gV=gR;gW=gB}gT=gS+1|0;if((gT|0)<(gW|0)){gS=gT;gR=gV;gB=gW}else{break}}i=m;return d$|0}function bh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;if((c|0)==0){return}e=d+4|0;f=d+8|0;h=d+12|0;i=d+16|0;j=d+20|0;k=d+24|0;l=d+28|0;m=d+32|0;n=d+36|0;o=d+40|0;p=d+44|0;q=d+48|0;r=d+52|0;s=d+56|0;t=d+60|0;u=d+64|0;v=d+68|0;w=d+72|0;x=d+76|0;y=d+80|0;z=b;b=c;c=a;while(1){a=b-1|0;g[z>>2]=+g[c>>2]*+g[d>>2]+1.0e-10- +g[z-4>>2]*+g[e>>2]+ +g[c-4>>2]*+g[f>>2]- +g[z-8>>2]*+g[h>>2]+ +g[c-8>>2]*+g[i>>2]- +g[z-12>>2]*+g[j>>2]+ +g[c-12>>2]*+g[k>>2]- +g[z-16>>2]*+g[l>>2]+ +g[c-16>>2]*+g[m>>2]- +g[z-20>>2]*+g[n>>2]+ +g[c-20>>2]*+g[o>>2]- +g[z-24>>2]*+g[p>>2]+ +g[c-24>>2]*+g[q>>2]- +g[z-28>>2]*+g[r>>2]+ +g[c-28>>2]*+g[s>>2]- +g[z-32>>2]*+g[t>>2]+ +g[c-32>>2]*+g[u>>2]- +g[z-36>>2]*+g[v>>2]+ +g[c-36>>2]*+g[w>>2]- +g[z-40>>2]*+g[x>>2]+ +g[c-40>>2]*+g[y>>2];if((a|0)==0){break}else{z=z+4|0;b=a;c=c+4|0}}return}function bi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0,ad=0,ae=0,af=0;if((e|0)==0){i=1;return i|0}if((f|0)==1){j=b}else if((f|0)==2){j=d}else{i=0;return i|0}d=e>>>0<10;f=a+40|0;k=b;if(d){l=e<<2;bA(f|0,k|0,l)|0;m=a+19420|0;n=j;bA(m|0,n|0,l)|0}else{bA(f|0,k|0,40)|0;f=a+19420|0;l=j;bA(f|0,l|0,40)|0}l=a+38760|0;f=a+38764|0;n=a+80|0;m=a+19460|0;o=a+9728|0;p=a+38784|0;q=a+29108|0;r=a+19376|0;s=a+38756|0;t=a+38768|0;u=a+38776|0;v=a+9732|0;w=a+29112|0;x=a+84|0;y=a+19464|0;z=t;A=0;B=e;while(1){if((B|0)<=0){break}C=c[f>>2]|0;D=(c[l>>2]|0)-C|0;E=(B|0)>(D|0)?D:B;if((A|0)<10){D=10-A|0;F=(E|0)>(D|0)?D:E;G=c[m>>2]|0;H=c[n>>2]|0}else{F=E;G=j;H=b}bh(H+(A<<2)|0,(c[o>>2]|0)+(C<<2)|0,F,21224+((c[p>>2]|0)*84&-1)|0);bh(G+(A<<2)|0,(c[q>>2]|0)+(c[f>>2]<<2)|0,F,21224+((c[p>>2]|0)*84&-1)|0);C=c[f>>2]|0;E=c[p>>2]|0;do{if((F|0)==0){I=C}else{J=+g[21984+(E*20&-1)>>2];K=+g[21988+(E*20&-1)>>2];L=+g[21992+(E*20&-1)>>2];M=+g[21996+(E*20&-1)>>2];N=+g[22e3+(E*20&-1)>>2];D=(c[r>>2]|0)+(C<<2)|0;O=F;P=(c[o>>2]|0)+(C<<2)|0;while(1){Q=O-1|0;g[D>>2]=+g[P>>2]*J- +g[D-4>>2]*K+ +g[P-4>>2]*L- +g[D-8>>2]*M+ +g[P-8>>2]*N;if((Q|0)==0){break}else{D=D+4|0;O=Q;P=P+4|0}}P=c[f>>2]|0;O=c[p>>2]|0;N=+g[21984+(O*20&-1)>>2];M=+g[21988+(O*20&-1)>>2];L=+g[21992+(O*20&-1)>>2];K=+g[21996+(O*20&-1)>>2];J=+g[22e3+(O*20&-1)>>2];O=(c[s>>2]|0)+(P<<2)|0;D=F;Q=(c[q>>2]|0)+(P<<2)|0;while(1){P=D-1|0;g[O>>2]=+g[Q>>2]*N- +g[O-4>>2]*M+ +g[Q-4>>2]*L- +g[O-8>>2]*K+ +g[Q-8>>2]*J;if((P|0)==0){break}else{O=O+4|0;D=P;Q=Q+4|0}}Q=c[f>>2]|0;D=c[r>>2]|0;O=D+(Q<<2)|0;P=c[s>>2]|0;R=P+(Q<<2)|0;S=(F|0)%8&-1;if((S|0)==0){T=O;U=R}else{V=Q+S|0;W=P+(V<<2)|0;P=O;O=R;R=S;J=+h[t>>3];K=+h[u>>3];while(1){S=R-1|0;L=+g[P>>2];M=J+L*L;h[t>>3]=M;L=+g[O>>2];N=K+L*L;h[u>>3]=N;if((S|0)==0){break}else{P=P+4|0;O=O+4|0;R=S;J=M;K=N}}T=D+(V<<2)|0;U=W}if((F+7|0)>>>0<15){I=Q;break}R=T;O=U;P=(F|0)/8&-1;K=+h[t>>3];J=+h[u>>3];while(1){S=P-1|0;N=+g[R>>2];M=+g[R+4>>2];L=+g[R+8>>2];X=+g[R+12>>2];Y=+g[R+16>>2];Z=+g[R+20>>2];_=+g[R+24>>2];$=+g[R+28>>2];aa=K+(N*N+M*M+L*L+X*X+Y*Y+Z*Z+_*_+$*$);h[t>>3]=aa;$=+g[O>>2];_=+g[O+4>>2];Z=+g[O+8>>2];Y=+g[O+12>>2];X=+g[O+16>>2];L=+g[O+20>>2];M=+g[O+24>>2];N=+g[O+28>>2];ab=J+($*$+_*_+Z*Z+Y*Y+X*X+L*L+M*M+N*N);h[u>>3]=ab;if((S|0)==0){I=Q;break}else{R=R+32|0;O=O+32|0;P=S;K=aa;J=ab}}}}while(0);C=B-F|0;E=F+A|0;P=I+F|0;c[f>>2]=P;O=c[l>>2]|0;if((P|0)==(O|0)){J=+aB(+((+h[t>>3]+ +h[u>>3])/+(P|0)*.5+1.0e-37))*1.0e3;if(J>0.0){ac=~~J}else{ac=0}R=a+38792+((ac>>>0>11999?11999:ac)<<2)|0;c[R>>2]=(c[R>>2]|0)+1;bz(z|0,0,16);R=c[f>>2]|0;bB(v|0,a+9732+(R<<2)|0,40);bB(w|0,a+29112+(R<<2)|0,40);bB(x|0,a+84+(R<<2)|0,40);bB(y|0,a+19464+(R<<2)|0,40);c[f>>2]=0;ad=0;ae=c[l>>2]|0}else{ad=P;ae=O}if((ad|0)>(ae|0)){i=0;af=965;break}else{A=E;B=C}}if((af|0)==965){return i|0}af=a;if(d){d=10-e|0;B=d<<2;bB(af|0,a+(e<<2)|0,B|0);bB(a+19380|0,a+19380+(e<<2)|0,B|0);B=a+(d<<2)|0;A=e<<2;bA(B|0,k|0,A)|0;k=a+19380+(d<<2)|0;d=j;bA(k|0,d|0,A)|0;i=1;return i|0}else{A=e-10|0;e=b+(A<<2)|0;bA(af|0,e|0,40)|0;e=a+19380|0;a=j+(A<<2)|0;bA(e|0,a|0,40)|0;i=1;return i|0}return 0}function bj(a,b,d,e,f,j,k,l){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,O=0,P=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0.0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0.0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0.0,aE=0.0,aF=0.0,aG=0.0,aH=0.0,aI=0,aJ=0.0,aK=0,aL=0.0,aM=0,aN=0.0,aO=0.0,aP=0.0,aQ=0.0,aR=0.0,aS=0.0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bj=0;m=i;i=i+16|0;n=m|0;o=m+8|0;if((a|0)==0){p=-3;i=m;return p|0}if((c[a>>2]|0)!=-487877){p=-3;i=m;return p|0}q=c[a+288>>2]|0;if((q|0)==0){p=-3;i=m;return p|0}a=q|0;if((c[a>>2]|0)!=-487877){p=-3;i=m;return p|0}if((e|0)==0){p=0;i=m;return p|0}r=q+52152|0;s=c[r>>2]|0;do{if((s|0)==0){u=977}else{if((c[q+52148>>2]|0)<(e|0)){bx(s);u=977;break}else{v=s;w=c[q+52156>>2]|0;u=980;break}}}while(0);if((u|0)==977){s=q+52156|0;x=c[s>>2]|0;if((x|0)!=0){bx(x)}c[r>>2]=by(e,4)|0;x=by(e,4)|0;c[s>>2]=x;c[q+52148>>2]=e;y=c[r>>2]|0;if((y|0)==0){z=s;A=x}else{v=y;w=x;u=980}}do{if((u|0)==980){x=q+52156|0;if((w|0)==0){bx(v);z=x;A=c[x>>2]|0;break}y=(b|0)==0;do{if((c[q+68>>2]|0)>1){if(y|(d|0)==0){p=0;i=m;return p|0}else{bn(q,b,d,e,k,l);break}}else{if(y){p=0;i=m;return p|0}else{bn(q,b,b,e,k,l);break}}}while(0);y=q+76|0;s=c[y>>2]|0;B=s*576&-1;C=(c[a>>2]|0)!=-487877;if(C){p=C?-3:0;i=m;return p|0}C=q+296|0;D=c[C>>2]|0;E=D+1|0;do{if((D|0)<0){F=0;G=s}else{if((j|0)!=0&(E|0)>(j|0)){p=-1;i=m;return p|0}H=c[q+284>>2]|0;bA(f|0,H|0,E)|0;c[C>>2]=-1;c[q+300>>2]=0;if((E|0)<0){p=E;i=m;return p|0}else{F=E;G=c[y>>2]|0;break}}}while(0);E=c[r>>2]|0;C=c[x>>2]|0;s=(G*576&-1)+752|0;D=q+52160|0;c[n>>2]=D;H=q+68096|0;c[n+4>>2]=H;I=o|0;J=o+4|0;K=q+128|0;L=q+72|0;O=q+84036|0;P=q+84032|0;S=q+136|0;T=q+85676|0;U=(j|0)==0;V=q+64|0;W=q+60|0;X=q+12|0;Y=q+37184|0;Z=q+37188|0;_=q+37168|0;$=E;E=C;C=e;aa=f+F|0;ab=F;L1496:while(1){ac=$;ad=E;ae=C;while(1){if((ae|0)<=0){p=ab;u=1066;break L1496}c[I>>2]=ac;c[J>>2]=ad;af=c[O>>2]|0;ag=(c[y>>2]|0)*576&-1;ah=c[L>>2]|0;ai=c[V>>2]|0;aj=+(ai|0);ak=c[W>>2]|0;L1501:do{if((ak|0)<(~~(aj*.9994999766349792)|0)){u=1e3}else{if((~~(aj*1.000499963760376)|0)<(ak|0)){u=1e3;break}al=(ag|0)<(ae|0)?ag:ae;am=al<<2;an=0;ao=ac;while(1){ap=(c[n+(an<<2)>>2]|0)+(af<<2)|0;aq=ao;bA(ap|0,aq|0,am)|0;aq=an+1|0;if((aq|0)>=(ah|0)){ar=al;as=al;break L1501}an=aq;ao=c[o+(aq<<2)>>2]|0}}}while(0);L1507:do{if((u|0)==1e3){u=0;ao=(ag|0)>0;an=0;al=ak;am=ai;aq=ac;while(1){ap=c[n+(an<<2)>>2]|0;aj=+(al|0)/+(am|0);if((al|0)==0){at=am}else{au=am;av=al;while(1){aw=(au|0)%(av|0)&-1;if((aw|0)==0){at=av;break}else{au=av;av=aw}}}av=(am|0)/(at|0)&-1;au=(av|0)>320?320:av;ax=1.0/aj;aw=ax>1.0;ay=+N(+(aj- +M(+(aj+.5))))<1.0e-4?32:31;az=ay+1|0;if((c[X>>2]|0)==0){c[Y>>2]=by(az,4)|0;c[Z>>2]=by(az,4)|0;aA=au<<1;if((aA|0)<0){bz(_|0,0,16);aB=0}else{aC=0;do{c[q+37192+(aC<<2)>>2]=by(az,4)|0;aC=aC+1|0;}while((aC|0)<=(aA|0));bz(_|0,0,16);aD=+(au|0)*2.0;aE=aw?3.1415927410125732:ax*3.141592653589793;aF=+(ay|0);aG=aE/3.141592653589793;aH=aF*aE;aE=+(ay|0)*3.141592653589793;aC=(av|0)<320;aI=0;do{aJ=+(aI-au|0)/aD;aK=q+37192+(aI<<2)|0;aL=0.0;aM=0;while(1){aN=(+(aM|0)-aJ)/aF;aO=aN<0.0?0.0:aN;aN=aO>1.0?1.0:aO;aO=aN+-.5;if(+N(+aO)<1.0e-9){aP=aG}else{aQ=+Q(+(aN*2.0*3.141592653589793));aR=.42-aQ*.5+ +Q(+(aN*4.0*3.141592653589793))*.08;aP=+R(+(aH*aO))*aR/(aE*aO)}aO=aP;g[(c[aK>>2]|0)+(aM<<2)>>2]=aO;aS=aL+aO;aT=aM+1|0;if((aT|0)>(ay|0)){aU=0;break}else{aL=aS;aM=aT}}do{aM=(c[aK>>2]|0)+(aU<<2)|0;g[aM>>2]=+g[aM>>2]/aS;aU=aU+1|0;}while((aU|0)<=(ay|0));aI=aI+1|0;}while((aI|0)<=(aA|0));aB=aC?av<<1|1:641}c[X>>2]=1;aV=aB}else{aV=0}aA=c[q+37184+(an<<2)>>2]|0;L1535:do{if(ao){aI=q+37168+(an<<3)|0;aw=ay>>>1;aK=ay-aw|0;aE=+(ay&1|0)*.5;aH=+(au|0);aM=0;while(1){aG=aj*+(aM|0)- +h[aI>>3];aT=~~+M(+aG);if((aT+aK|0)>=(ae|0)){aW=aT;aX=aM;aY=aK;aZ=aI;break L1535}a_=aT-aw|0;a$=c[q+37192+(~~+M(+(aH+aH*(aG-(aE+ +(aT|0)))*2.0+.5))<<2)>>2]|0;a0=0;aG=0.0;do{a1=a0+a_|0;if((a1|0)<0){a2=aA+(a1+az<<2)|0}else{a2=aq+(a1<<2)|0}aG=aG+ +g[a2>>2]*+g[a$+(a0<<2)>>2];a0=a0+1|0;}while((a0|0)<=(ay|0));g[ap+(aM+af<<2)>>2]=aG;a0=aM+1|0;if((a0|0)<(ag|0)){aM=a0}else{aW=aT;aX=a0;aY=aK;aZ=aI;break}}}else{aW=aV;aX=0;aY=ay-(ay>>>1)|0;aZ=q+37168+(an<<3)|0}}while(0);ap=aW+aY|0;au=(ap|0)>(ae|0)?ae:ap;h[aZ>>3]=+h[aZ>>3]+(+(au|0)-aj*+(aX|0));do{if((au|0)<(az|0)){ap=az-au|0;do{if((ap|0)>0){g[aA>>2]=+g[aA+(au<<2)>>2];if((ap|0)>1){a3=1}else{a4=1;break}while(1){g[aA+(a3<<2)>>2]=+g[aA+(a3+au<<2)>>2];av=a3+1|0;if((av|0)<(ap|0)){a3=av}else{a4=ap;break}}}else{a4=0}}while(0);if((a4|0)<(az|0)){a5=0;a6=a4}else{break}while(1){g[aA+(a6<<2)>>2]=+g[aq+(a5<<2)>>2];ap=a6+1|0;if((ap|0)<(az|0)){a5=a5+1|0;a6=ap}else{break}}}else{ap=au+(ay^-1)|0;g[aA>>2]=+g[aq+(ap<<2)>>2];if(az>>>0>1){a7=1}else{break}do{g[aA+(a7<<2)>>2]=+g[aq+(ap+a7<<2)>>2];a7=a7+1|0;}while((a7|0)<(az|0))}}while(0);az=an+1|0;if((az|0)>=(ah|0)){ar=aX;as=au;break L1507}an=az;al=c[W>>2]|0;am=c[V>>2]|0;aq=c[o+(az<<2)>>2]|0}}}while(0);do{if((c[K>>2]|0)!=0){if((c[S>>2]|0)!=0){break}ah=c[O>>2]|0;if((bi(c[T>>2]|0,q+52160+(ah<<2)|0,q+68096+(ah<<2)|0,ar,c[L>>2]|0)|0)==0){p=-6;u=1067;break L1496}}}while(0);a8=ae-as|0;a9=ac+(as<<2)|0;if((c[L>>2]|0)==2){ba=ad+(as<<2)|0}else{ba=ad}ah=(c[O>>2]|0)+ar|0;c[O>>2]=ah;ag=c[P>>2]|0;if((ag|0)<1){c[P>>2]=1728;bb=1728}else{bb=ag}c[P>>2]=bb+ar;if((ah|0)<(s|0)){ac=a9;ad=ba;ae=a8}else{break}}ae=bg(q,D,H,aa,U?0:j-ab|0)|0;if((ae|0)<0){p=ae;u=1068;break}ad=aa+ae|0;ac=ae+ab|0;ae=(c[O>>2]|0)-B|0;c[O>>2]=ae;c[P>>2]=(c[P>>2]|0)-B;ah=c[L>>2]|0;if((ah|0)>0){bc=0;bd=ae;be=ah}else{$=a9;E=ba;C=a8;aa=ad;ab=ac;continue}while(1){if((bd|0)>0){ah=c[n+(bc<<2)>>2]|0;ae=0;do{g[ah+(ae<<2)>>2]=+g[ah+(ae+B<<2)>>2];ae=ae+1|0;bf=c[O>>2]|0;}while((ae|0)<(bf|0));bh=bf;bj=c[L>>2]|0}else{bh=bd;bj=be}ae=bc+1|0;if((ae|0)<(bj|0)){bc=ae;bd=bh;be=bj}else{$=a9;E=ba;C=a8;aa=ad;ab=ac;continue L1496}}}if((u|0)==1066){i=m;return p|0}else if((u|0)==1067){i=m;return p|0}else if((u|0)==1068){i=m;return p|0}}}while(0);if((A|0)!=0){bx(A)}c[r>>2]=0;c[z>>2]=0;c[q+52148>>2]=0;bw(q,20048,(t=i,i=i+1|0,i=i+7>>3<<3,c[t>>2]=0,t)|0);p=-2;i=m;return p|0}function bk(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return bj(a,b,c,d,e,f,3,32767.0)|0}function bl(b,e,f){b=b|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0.0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,O=0,P=0.0,Q=0,R=0.0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0;h=i;i=i+4752|0;j=h|0;k=h+8|0;l=h+136|0;m=h+144|0;if((b|0)==0){n=-3;i=h;return n|0}if((c[b>>2]|0)!=-487877){n=-3;i=h;return n|0}o=b+288|0;p=c[o>>2]|0;if((p|0)==0){n=-3;i=h;return n|0}if((c[p>>2]|0)!=-487877){n=-3;i=h;return n|0}q=p+84032|0;r=c[q>>2]|0;if((r|0)<1){n=0;i=h;return n|0}s=(c[p+76>>2]|0)*576&-1;u=s+752|0;v=r-1152|0;r=m;bz(r|0,0,4608);w=c[p+64>>2]|0;x=+(w|0);y=c[p+60>>2]|0;if((y|0)<(~~(x*.9994999766349792)|0)){z=1077}else{if((~~(x*1.000499963760376)|0)<(y|0)){z=1077}else{A=1.0;B=v}}if((z|0)==1077){x=+(y|0)/+(w|0);A=x;B=~~(+(v|0)+16.0/x)}v=s-((B|0)%(s|0)&-1)|0;w=((v|0)<576?s:0)+v|0;c[p+84764>>2]=w;v=(w+B|0)/(s|0)&-1;do{if((v|0)>0){s=p+84748|0;B=p+84036|0;w=(f|0)==0;y=m+2304|0;C=v;D=0;E=e;F=c[s>>2]|0;while(1){G=~~(A*+(u-(c[B>>2]|0)|0));H=(G|0)>1152?1152:G;I=bj(b,r,y,(H|0)<1?1:H,E,w?0:f-D|0,0,1.0)|0;J=E+I|0;K=I+D|0;H=c[s>>2]|0;G=C-((F|0)!=(H|0)&1)|0;if((G|0)>0&(I|0)>-1){C=G;D=K;E=J;F=H}else{break}}c[q>>2]=0;if((I|0)<0){n=I}else{L=J;O=K;break}i=h;return n|0}else{c[q>>2]=0;L=e;O=0}}while(0);e=(f|0)==0;q=bb(p,l)|0;if((q|0)>=0){bc(p,q);c[p+52140>>2]=0;c[p+21312>>2]=0}q=bd(p,L,e?0:f-O|0)|0;l=p+85680|0;do{if((c[p+128>>2]|0)!=0){K=c[p+85676>>2]|0;J=0;I=0;do{J=(c[K+38792+(I<<2)>>2]|0)+J|0;I=I+1|0;}while(I>>>0<12e3);if((J|0)==0){P=-24601.0}else{I=~~+Z(+(+(J>>>0>>>0)*.050000000000000044));r=12e3;u=0;while(1){Q=r-1|0;if((r|0)==0){break}v=(c[K+38792+(Q<<2)>>2]|0)+u|0;if(v>>>0<I>>>0){r=Q;u=v}else{break}}P=64.81999969482422- +(Q>>>0>>>0)/100.0}u=0;do{r=K+38792+(u<<2)|0;I=K+86792+(u<<2)|0;c[I>>2]=(c[I>>2]|0)+(c[r>>2]|0);c[r>>2]=0;u=u+1|0;}while(u>>>0<12e3);bz(K|0,0,40);bz(K+84|0,0,40);bz(K+9732|0,0,40);bz(K+19380|0,0,40);bz(K+19464|0,0,40);bz(K+29112|0,0,40);bz(K+38764|0,0,20);A=P;x=+N(+P);R=+N(+(P+24601.0));if(x>24601.0){if(R>x*9.999999974752427e-7){z=1098}else{z=1099}}else{if(R>.024600999937888446){z=1098}else{z=1099}}if((z|0)==1098){c[p+85688>>2]=~~+M(+(A*10.0+.5));break}else if((z|0)==1099){c[p+85688>>2]=0;break}}}while(0);do{if((c[p+132>>2]|0)!=0){z=p+85684|0;Q=~~+Z(+(+aB(+(+g[z>>2]/32767.0))*20.0*10.0));c[p+85692>>2]=Q;if((Q|0)>0){g[l>>2]=+M(+(32767.0/+g[z>>2]*100.0))/100.0;break}else{g[l>>2]=-1.0;break}}}while(0);if((q|0)<0){n=q;i=h;return n|0}l=L+q|0;L=q+O|0;O=e?0:f-L|0;if((c[b+68>>2]|0)==0){n=L;i=h;return n|0}n=k|0;b=c[o>>2]|0;o=j|0;do{if((b|0)!=0){j=c[b+85696>>2]|0;if((j&9|0)!=1){break}a[n]=84;a[k+1|0]=65;a[k+2|0]=71;f=j<<1&32;j=c[b+85704>>2]|0;e=k+3|0;q=30;L1663:while(1){z=(j|0)==0;Q=e;u=q;while(1){S=u-1|0;if(!z){T=a[j]|0;if(T<<24>>24!=0){break}}r=Q+1|0;a[Q]=f;if((S|0)==0){U=r;break L1663}else{Q=r;u=S}}u=Q+1|0;a[Q]=T;if((S|0)==0){U=u;break}else{j=j+1|0;e=u;q=S}}q=c[b+85708>>2]|0;e=U;j=30;L1672:while(1){K=(q|0)==0;u=e;z=j;while(1){V=z-1|0;if(!K){W=a[q]|0;if(W<<24>>24!=0){break}}r=u+1|0;a[u]=f;if((V|0)==0){X=r;break L1672}else{u=r;z=V}}z=u+1|0;a[u]=W;if((V|0)==0){X=z;break}else{q=q+1|0;e=z;j=V}}j=c[b+85712>>2]|0;e=X;q=30;L1681:while(1){z=(j|0)==0;K=e;Q=q;while(1){Y=Q-1|0;if(!z){_=a[j]|0;if(_<<24>>24!=0){break}}r=K+1|0;a[K]=f;if((Y|0)==0){$=r;break L1681}else{K=r;Q=Y}}Q=K+1|0;a[K]=_;if((Y|0)==0){$=Q;break}else{j=j+1|0;e=Q;q=Y}}q=b+85700|0;aA(o|0,20088,(t=i,i=i+8|0,c[t>>2]=c[q>>2],t)|0)|0;e=(c[q>>2]|0)!=0?o:0;q=$;j=4;L1690:while(1){Q=(e|0)==0;z=q;u=j;while(1){aa=u-1|0;if(!Q){ab=a[e]|0;if(ab<<24>>24!=0){break}}r=z+1|0;a[z]=f;if((aa|0)==0){ac=r;break L1690}else{z=r;u=aa}}u=z+1|0;a[z]=ab;if((aa|0)==0){ac=u;break}else{e=e+1|0;q=u;j=aa}}j=b+85720|0;q=c[b+85716>>2]|0;e=ac;u=(c[j>>2]|0)!=0?28:30;L1699:while(1){Q=(q|0)==0;K=e;r=u;while(1){ad=r-1|0;if(!Q){ae=a[q]|0;if(ae<<24>>24!=0){break}}I=K+1|0;a[K]=f;if((ad|0)==0){af=I;break L1699}else{K=I;r=ad}}r=K+1|0;a[K]=ae;if((ad|0)==0){af=r;break}else{q=q+1|0;e=r;u=ad}}if((c[j>>2]|0)==0){ag=af}else{a[af]=0;a[af+1|0]=c[j>>2]&255;ag=af+2|0}a[ag]=c[b+85724>>2]&255;u=b+300|0;e=b+296|0;q=b+284|0;f=b+292|0;r=0;do{Q=d[k+r|0]|0;z=8;while(1){I=c[u>>2]|0;if((I|0)==0){c[u>>2]=8;J=(c[e>>2]|0)+1|0;c[e>>2]=J;a[(c[q>>2]|0)+J|0]=0;ah=c[u>>2]|0}else{ah=I}I=(z|0)<(ah|0)?z:ah;J=z-I|0;v=ah-I|0;c[u>>2]=v;m=(c[q>>2]|0)+(c[e>>2]|0)|0;a[m]=(Q>>>(J>>>0)<<v|(d[m]|0))&255;c[f>>2]=(c[f>>2]|0)+I;if((J|0)>0){z=J}else{ai=0;break}}do{z=b+39840+(ai*48&-1)|0;c[z>>2]=(c[z>>2]|0)+8;ai=ai+1|0;}while((ai|0)<256);r=r+1|0;}while(r>>>0<128)}}while(0);ai=p+296|0;b=c[ai>>2]|0;ah=b+1|0;if((b|0)<0){aj=0;ak=(aj|0)<0;al=ak?0:L;am=al+aj|0;i=h;return am|0}if((O|0)!=0&(ah|0)>(O|0)){aj=-1;ak=(aj|0)<0;al=ak?0:L;am=al+aj|0;i=h;return am|0}O=c[p+284>>2]|0;bA(l|0,O|0,ah)|0;c[ai>>2]=-1;c[p+300>>2]=0;aj=ah;ak=(aj|0)<0;al=ak?0:L;am=al+aj|0;i=h;return am|0}function bm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((a|0)==0){b=0;return b|0}d=a|0;if((c[d>>2]|0)!=-487877){b=0;return b|0}e=a+288|0;f=c[e>>2]|0;c[d>>2]=0;if((f|0)==0){g=-3}else{d=f|0;h=(c[d>>2]|0)==-487877?0:-3;c[d>>2]=0;d=0;do{i=f+37192+(d<<2)|0;j=c[i>>2]|0;if((j|0)!=0){bx(j);c[i>>2]=0}d=d+1|0;}while((d|0)<641);d=f+37184|0;i=c[d>>2]|0;if((i|0)!=0){bx(i);c[d>>2]=0}d=f+37188|0;i=c[d>>2]|0;if((i|0)!=0){bx(i);c[d>>2]=0}d=f+284|0;i=c[d>>2]|0;if((i|0)!=0){bx(i);c[d>>2]=0}d=f+85780|0;i=c[d>>2]|0;if((i|0)!=0){bx(i);c[d>>2]=0;c[f+85776>>2]=0}d=c[f+85796>>2]|0;if((d|0)!=0){bx(d)}d=c[f+85676>>2]|0;if((d|0)!=0){bx(d)}d=c[f+52152>>2]|0;if((d|0)!=0){bx(d)}d=c[f+52156>>2]|0;if((d|0)!=0){bx(d)}d=f+85704|0;i=c[d>>2]|0;if((i|0)!=0){bx(i);c[d>>2]=0}d=f+85708|0;i=c[d>>2]|0;if((i|0)!=0){bx(i);c[d>>2]=0}d=f+85712|0;i=c[d>>2]|0;if((i|0)!=0){bx(i);c[d>>2]=0}d=f+85716|0;i=c[d>>2]|0;if((i|0)!=0){bx(i);c[d>>2]=0}d=f+85728|0;i=c[d>>2]|0;if((i|0)!=0){bx(i);c[d>>2]=0;c[f+85732>>2]=0;c[f+85740>>2]=0}d=f+85744|0;i=c[d>>2]|0;if((i|0)!=0){j=i;while(1){i=c[j+24>>2]|0;k=c[j>>2]|0;bx(c[j+12>>2]|0);bx(i);bx(j);if((k|0)==0){break}else{j=k}}c[d>>2]=0;c[f+85748>>2]=0}d=f+85808|0;j=c[d>>2]|0;if((j|0)!=0){aE(j|0);bx(j);c[d>>2]=0}d=f+85800|0;j=c[d>>2]|0;if((j|0)!=0){k=c[j+2156>>2]|0;if((k|0)==0){l=j}else{bx(k);l=c[d>>2]|0}k=c[l+4316>>2]|0;if((k|0)==0){m=l}else{bx(k);m=c[d>>2]|0}bx(m);c[d>>2]=0}bx(f);c[e>>2]=0;g=h}h=a+284|0;if((c[h>>2]|0)==0){b=g;return b|0}c[h>>2]=0;bx(a);b=g;return b|0}function bn(a,d,e,f,i,j){a=a|0;d=d|0;e=e|0;f=f|0;i=i|0;j=+j;var k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0.0,t=0;k=c[a+52152>>2]|0;l=c[a+52156>>2]|0;m=+g[a+264>>2]*j;n=+g[a+268>>2]*j;o=+g[a+272>>2]*j;p=+g[a+276>>2]*j;if((i|0)==0){if((f|0)<=0){return}a=0;q=e;r=d;while(1){j=+(b[r>>1]|0);s=+(b[q>>1]|0);g[k+(a<<2)>>2]=m*j+n*s;g[l+(a<<2)>>2]=o*j+p*s;t=a+1|0;if((t|0)<(f|0)){a=t;q=q+2|0;r=r+2|0}else{break}}return}else if((i|0)==1){if((f|0)<=0){return}r=0;q=e;a=d;while(1){s=+(c[a>>2]|0);j=+(c[q>>2]|0);g[k+(r<<2)>>2]=m*s+n*j;g[l+(r<<2)>>2]=o*s+p*j;t=r+1|0;if((t|0)<(f|0)){r=t;q=q+4|0;a=a+4|0}else{break}}return}else if((i|0)==2){if((f|0)<=0){return}a=0;q=e;r=d;while(1){j=+(c[r>>2]|0);s=+(c[q>>2]|0);g[k+(a<<2)>>2]=m*j+n*s;g[l+(a<<2)>>2]=o*j+p*s;t=a+1|0;if((t|0)<(f|0)){a=t;q=q+4|0;r=r+4|0}else{break}}return}else if((i|0)==3){if((f|0)<=0){return}r=d;q=e;a=0;while(1){s=+g[r>>2];j=+g[q>>2];g[k+(a<<2)>>2]=m*s+n*j;g[l+(a<<2)>>2]=o*s+p*j;t=a+1|0;if((t|0)<(f|0)){r=r+4|0;q=q+4|0;a=t}else{break}}return}else if((i|0)==4){if((f|0)<=0){return}i=d;d=e;e=0;while(1){j=+h[i>>3];s=+h[d>>3];g[k+(e<<2)>>2]=m*j+n*s;g[l+(e<<2)>>2]=o*j+p*s;a=e+1|0;if((a|0)<(f|0)){i=i+8|0;d=d+8|0;e=a}else{break}}return}else{return}}function bo(){var b=0,d=0,e=0;if(!(a[7920]|0)){b=0;do{g[5864+(b<<2)>>2]=+Y(+(+(b|0)*.001953125+1.0))/.6931471805599453;b=b+1|0;}while((b|0)<513)}a[7920]=1;b=by(1,304)|0;if((b|0)==0){d=0;return d|0}bz(b|0,0,304);c[b>>2]=-487877;e=by(1,85840)|0;c[b+288>>2]=e;if((e|0)==0){bx(b);d=0;return d|0}else{c[b+124>>2]=2;c[b+48>>2]=4;c[b+108>>2]=1;c[b+12>>2]=44100;c[b+8>>2]=2;c[b+4>>2]=-1;c[b+36>>2]=1;c[b+44>>2]=-1;c[b+240>>2]=-1;c[b+88>>2]=-1;c[b+184>>2]=0;c[b+188>>2]=0;c[b+192>>2]=-1;c[b+196>>2]=-1;c[b+156>>2]=0;c[b+164>>2]=4;g[b+224>>2]=-1.0;c[b+168>>2]=128;c[b+172>>2]=0;c[b+176>>2]=0;c[b+180>>2]=0;c[e+112>>2]=1;c[e+116>>2]=13;c[b+132>>2]=-1;c[b+136>>2]=-1;g[b+252>>2]=-1.0;c[e+84920>>2]=180;c[e+84924>>2]=180;c[e+84928>>2]=4;c[e+84932>>2]=4;g[e+84908>>2]=1.0;g[b+264>>2]=-1.0;g[b+268>>2]=-1.0;g[b+20>>2]=1.0;g[b+24>>2]=1.0;g[b+28>>2]=1.0;c[b+232>>2]=-1;c[b+220>>2]=-1;g[b+236>>2]=0.0;c[b+244>>2]=-1;g[b+248>>2]=-1.0;c[e+84032>>2]=1728;c[e+84764>>2]=0;c[e+84036>>2]=528;c[b+60>>2]=0;c[b+64>>2]=0;c[e+136>>2]=0;c[e+128>>2]=0;c[e+132>>2]=0;c[e+85688>>2]=0;c[e+85692>>2]=0;g[e+85680>>2]=-1.0;c[b+292>>2]=1;c[b+296>>2]=1;c[b+300>>2]=1;c[b+152>>2]=0;c[b+68>>2]=1;c[b+276>>2]=2;c[b+280>>2]=2;c[b+272>>2]=2;c[b+284>>2]=1;d=b;return d|0}return 0}function bp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0.0,Q=0,R=0,S=0,T=0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0;e=i;i=i+72|0;f=e|0;h=a+72|0;if((c[h>>2]|0)<=0){i=e;return}j=a+76|0;k=f|0;l=f+68|0;m=f+36|0;n=f+60|0;o=f+44|0;p=f+56|0;q=f+48|0;r=f+32|0;s=f+4|0;t=f+28|0;u=f+8|0;v=f+24|0;w=f+12|0;x=f+20|0;y=f+16|0;z=f+64|0;A=f+40|0;B=f+52|0;C=b;b=0;while(1){do{if((c[j>>2]|0)>0){D=C+1144|0;E=0;while(1){F=1-E|0;G=a+27824+(b*4608&-1)+(F*2304&-1)|0;H=D;I=0;while(1){br(H,G);br(H+128|0,G+128|0);J=G+132|0;g[J>>2]=+g[J>>2]*-1.0;J=G+140|0;g[J>>2]=+g[J>>2]*-1.0;J=G+148|0;g[J>>2]=+g[J>>2]*-1.0;J=G+156|0;g[J>>2]=+g[J>>2]*-1.0;J=G+164|0;g[J>>2]=+g[J>>2]*-1.0;J=G+172|0;g[J>>2]=+g[J>>2]*-1.0;J=G+180|0;g[J>>2]=+g[J>>2]*-1.0;J=G+188|0;g[J>>2]=+g[J>>2]*-1.0;J=G+196|0;g[J>>2]=+g[J>>2]*-1.0;J=G+204|0;g[J>>2]=+g[J>>2]*-1.0;J=G+212|0;g[J>>2]=+g[J>>2]*-1.0;J=G+220|0;g[J>>2]=+g[J>>2]*-1.0;J=G+228|0;g[J>>2]=+g[J>>2]*-1.0;J=G+236|0;g[J>>2]=+g[J>>2]*-1.0;J=G+244|0;g[J>>2]=+g[J>>2]*-1.0;J=G+252|0;g[J>>2]=+g[J>>2]*-1.0;J=I+1|0;if((J|0)<9){G=G+256|0;H=H+256|0;I=J}else{break}}I=a+304+(E*10504&-1)+(b*5252&-1)+4788|0;H=a+304+(E*10504&-1)+(b*5252&-1)+4792|0;G=a+304+(E*10504&-1)+(b*5252&-1)|0;J=0;while(1){K=c[5712+(J<<2)>>2]|0;L=(c[H>>2]|0)!=0&(J|0)<2?0:c[I>>2]|0;M=a+37040+(J<<2)|0;N=+g[M>>2];do{if(N<1.0e-12){bz(G|0,0,72)}else{L1874:do{if(N<1.0){O=0;P=N;while(1){Q=a+27824+(b*4608&-1)+(F*2304&-1)+((O<<5)+K<<2)|0;g[Q>>2]=P*+g[Q>>2];Q=O+1|0;if((Q|0)>=18){break L1874}O=Q;P=+g[M>>2]}}}while(0);if((L|0)!=2){O=-9;do{Q=O+9|0;R=(Q<<5)+K|0;S=(8-O<<5)+K|0;P=+g[8+(L*144&-1)+(O+27<<2)>>2]*+g[a+27824+(b*4608&-1)+(F*2304&-1)+(R<<2)>>2]+ +g[8+(L*144&-1)+(O+36<<2)>>2]*+g[a+27824+(b*4608&-1)+(F*2304&-1)+(S<<2)>>2];T=O+18|0;U=+g[8+(L*144&-1)+(Q<<2)>>2]*+g[a+27824+(b*4608&-1)+(E*2304&-1)+(R<<2)>>2]- +g[8+(L*144&-1)+(T<<2)>>2]*+g[a+27824+(b*4608&-1)+(E*2304&-1)+(S<<2)>>2];V=+g[296+(O+12<<2)>>2];g[f+(Q<<2)>>2]=P-V*U;g[f+(T<<2)>>2]=U+P*V;O=O+1|0;}while((O|0)<0);V=+g[l>>2]- +g[m>>2];P=+g[n>>2]- +g[o>>2];U=+g[p>>2]- +g[q>>2];W=+g[k>>2]+ +g[r>>2];X=+g[s>>2]+ +g[t>>2];Y=+g[u>>2]+ +g[v>>2];Z=+g[w>>2]+ +g[x>>2];_=W+Y-Z;g[G+68>>2]=_-(X- +g[y>>2]);$=_*.5+(X- +g[y>>2]);_=(V-P-U)*.8660253882408142;g[G+20>>2]=_+$;g[G+24>>2]=_-$;$=(+g[z>>2]- +g[A>>2])*.8660253882408142;_=X*.5+ +g[y>>2];X=U*.3420201539993286+(P*.6427876353263855+(V*.9848077297210693+$));aa=Z*.9396926164627075+(W*.1736481785774231+_-Y*-.7660444378852844);g[G+4>>2]=X+aa;g[G+8>>2]=X-aa;aa=U*.9848077297210693+(V*.6427876353263855-$-P*.3420201539993286);X=Z*-.1736481785774231+(W*.7660444378852844+_-Y*.9396926164627075);g[G+36>>2]=aa+X;g[G+40>>2]=aa-X;X=P*.9848077297210693+(V*.3420201539993286-$)-U*.6427876353263855;U=Y*-.1736481785774231+(W*.9396926164627075-_)-Z*-.7660444378852844;g[G+52>>2]=X+U;g[G+56>>2]=X-U;U=+g[r>>2]- +g[k>>2];X=+g[v>>2]- +g[u>>2];Z=+g[x>>2]- +g[w>>2];_=+g[l>>2]+ +g[m>>2];W=+g[z>>2]+ +g[A>>2];Y=+g[n>>2]+ +g[o>>2];$=+g[p>>2]+ +g[q>>2];V=_+Y+$;g[G>>2]=V+(W+ +g[B>>2]);P=V*.5-(W+ +g[B>>2]);V=(U-X+Z)*.8660253882408142;g[G+44>>2]=V+P;g[G+48>>2]=P-V;V=(+g[t>>2]- +g[s>>2])*.8660253882408142;P=+g[B>>2]-W*.5;W=$*-.7660444378852844+(Y*-.1736481785774231+(_*.9396926164627075-P));aa=Z*.6427876353263855+(X*.9848077297210693+(U*.3420201539993286+V));g[G+12>>2]=W+aa;g[G+16>>2]=W-aa;aa=_*.7660444378852844+P-Y*.9396926164627075-$*-.1736481785774231;W=U*.6427876353263855+V-X*.3420201539993286-Z*.9848077297210693;g[G+28>>2]=aa+W;g[G+32>>2]=aa-W;W=_*.1736481785774231+P-Y*-.7660444378852844-$*.9396926164627075;$=X*.6427876353263855+(U*.9848077297210693-V)-Z*.3420201539993286;g[G+60>>2]=W+$;g[G+64>>2]=W-$;break}O=K+288|0;T=K+480|0;Q=-3;while(1){S=Q+3|0;$=+g[296+(S<<2)>>2];R=Q<<5;ab=O+R|0;ac=(8-Q<<5)+K|0;ad=Q*3&-1;g[G+(ad+9<<2)>>2]=$*+g[a+27824+(b*4608&-1)+(E*2304&-1)+(ab<<2)>>2]- +g[a+27824+(b*4608&-1)+(E*2304&-1)+(ac<<2)>>2];ae=a+27824+(b*4608&-1)+(E*2304&-1)+((14-Q<<5)+K<<2)|0;af=a+27824+(b*4608&-1)+(E*2304&-1)+(T+R<<2)|0;g[G+(ad+18<<2)>>2]=$*+g[ae>>2]+ +g[af>>2];g[G+(ad+10<<2)>>2]=$*+g[af>>2]- +g[ae>>2];ae=a+27824+(b*4608&-1)+(F*2304&-1)+((2-Q<<5)+K<<2)|0;af=a+27824+(b*4608&-1)+(F*2304&-1)+((S<<5)+K<<2)|0;g[G+(ad+19<<2)>>2]=$*+g[ae>>2]+ +g[af>>2];g[G+(ad+11<<2)>>2]=$*+g[af>>2]- +g[ae>>2];g[G+(ad+20<<2)>>2]=$*+g[a+27824+(b*4608&-1)+(F*2304&-1)+(ac<<2)>>2]+ +g[a+27824+(b*4608&-1)+(F*2304&-1)+(ab<<2)>>2];ab=Q+1|0;if((ab|0)<0){Q=ab}else{ag=0;ah=G;break}}while(1){Q=ah+24|0;$=+g[Q>>2];T=ah+60|0;W=+g[T>>2];Z=$*.13165250420570374-W;V=+g[ah>>2];O=ah+36|0;U=+g[O>>2];X=V*.7673270106315613-U;Y=$+W*.13165250420570374;W=V+U*.7673270106315613;U=Y+W;ab=ah+12|0;V=+g[ab>>2];ac=ah+48|0;$=+g[ac>>2];P=Z+X;_=(V*.4142135679721832-$)*2.069978111953089e-11;g[ah>>2]=P*1.90752519173728e-11+_;aa=(V+$*.4142135679721832)*2.069978111953089e-11;g[T>>2]=(-0.0-U)*1.90752519173728e-11+aa;$=(Z-X)*.8660254037844387*1.907525191737281e-11;X=U*.5*1.907525191737281e-11+aa;g[ab>>2]=$-X;g[Q>>2]=$+X;X=P*.5*1.907525191737281e-11-_;_=(W-Y)*.8660254037844387*1.907525191737281e-11;g[O>>2]=_+X;g[ac>>2]=X-_;ac=ag+1|0;if((ac|0)<3){ag=ac;ah=ah+4|0}else{break}}}}while(0);L1889:do{if(!((L|0)==2|(J|0)==0)){K=7;while(1){M=G+(K<<2)|0;N=+g[M>>2];_=+g[296+(K+20<<2)>>2];ac=G+((K^-1)<<2)|0;X=+g[ac>>2];Y=+g[296+(K+28<<2)>>2];g[ac>>2]=N*_+X*Y;g[M>>2]=N*Y-_*X;if((K|0)<=0){break L1889}K=K-1|0}}}while(0);L=J+1|0;if((L|0)<32){G=G+72|0;J=L}else{break}}J=E+1|0;ai=c[j>>2]|0;if((J|0)<(ai|0)){D=D+2304|0;E=J}else{break}}if((ai|0)!=1){break}E=a+27824+(b*4608&-1)|0;D=a+27824+(b*4608&-1)+2304|0;bA(E|0,D|0,2304)|0}}while(0);D=b+1|0;if((D|0)<(c[h>>2]|0)){C=d;b=D}else{break}}i=e;return}function bq(){return 20232|0}function br(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0,L=0.0,M=0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0,S=0,T=0,U=0,V=0.0,W=0.0,X=0,Y=0,Z=0.0,_=0.0,$=0,aa=0,ab=0.0,ac=0.0,ad=0,ae=0,af=0.0,ag=0.0,ah=0,ai=0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0;c=a-248|0;d=17728;e=-15;f=a;while(1){h=+g[d-40>>2];i=+g[d-36>>2];j=+g[d-32>>2];k=+g[d-28>>2];l=+g[d-24>>2];m=+g[d-20>>2];n=+g[d-16>>2];o=+g[d-12>>2];p=+g[d-8>>2];q=+g[d-4>>2];r=+g[d>>2];s=+g[d+4>>2];t=+g[d+8>>2];u=+g[d+12>>2];v=+g[d+16>>2];w=+g[d+20>>2];x=h*+g[f+896>>2]+i*+g[f+640>>2]+j*+g[f+384>>2]+k*+g[f+128>>2]+l*+g[f-128>>2]+m*+g[f-384>>2]+n*+g[f-640>>2]+o*+g[f-896>>2]-p*+g[c+1024>>2]-q*+g[c+768>>2]-r*+g[c+512>>2]-s*+g[c+256>>2]-t*+g[c>>2]-u*+g[c-256>>2]-v*+g[c-512>>2]-w*+g[c-768>>2];y=(h*+g[c-896>>2]+i*+g[c-640>>2]+j*+g[c-384>>2]+k*+g[c-128>>2]+l*+g[c+128>>2]+m*+g[c+384>>2]+n*+g[c+640>>2]+o*+g[c+896>>2]+p*+g[f-1024>>2]+q*+g[f-768>>2]+r*+g[f-512>>2]+s*+g[f-256>>2]+t*+g[f>>2]+u*+g[f+256>>2]+v*+g[f+512>>2]+w*+g[f+768>>2])*+g[d+24>>2];z=e<<1;g[b+(z+30<<2)>>2]=x+y;g[b+(z+31<<2)>>2]=+g[d+28>>2]*(x-y);z=e+1|0;if((z|0)<0){c=c+4|0;d=d+72|0;e=z;f=f-4|0}else{break}}y=+g[a-124>>2]*10612.802734375+(+g[a-252>>2]- +g[a+4>>2])*5302.158203125+(+g[a-380>>2]+ +g[a+132>>2])*929.7763061523438+(+g[a-508>>2]- +g[a+260>>2])*728.8010864257812+(+g[a-636>>2]+ +g[a+388>>2])*288.09765625+(+g[a-764>>2]- +g[a+516>>2])*64.91738891601562+(+g[a-892>>2]+ +g[a+644>>2])*30.125003814697266+(+g[a-1020>>2]- +g[a+772>>2])*4.101456642150879;x=+g[a-188>>2]*12804.7978515625+ +g[a-444>>2]*1945.5516357421875+ +g[a-700>>2]*313.42449951171875+ +g[a-956>>2]*20.801593780517578- +g[a+68>>2]*1995.1556396484375- +g[a+324>>2]*9.000839233398438- +g[a+580>>2]*-29.202180862426758- +g[a+836>>2];w=x-y;v=x+y;a=b+56|0;y=+g[a>>2];f=b+60|0;x=+g[f>>2]-y;u=y+v;t=w+x;s=w-x;x=v-y;e=b+112|0;y=+g[e>>2];v=+g[b>>2];w=y+v;r=(y-v)*1.9615705013275146;d=b+116|0;v=+g[d>>2];c=b+4|0;y=+g[c>>2];q=v+y;p=(v-y)*1.9615705013275146;z=b+104|0;y=+g[z>>2];A=b+8|0;v=+g[A>>2];o=y+v;n=(y-v)*1.8477590084075928;B=b+108|0;v=+g[B>>2];C=b+12|0;y=+g[C>>2];m=v+y;l=(v-y)*1.8477590084075928;D=b+96|0;y=+g[D>>2];E=b+16|0;v=+g[E>>2];k=y+v;j=(y-v)*1.662939190864563;F=b+100|0;v=+g[F>>2];G=b+20|0;y=+g[G>>2];i=v+y;h=(v-y)*1.662939190864563;H=b+88|0;y=+g[H>>2];I=b+24|0;v=+g[I>>2];J=y+v;K=b+92|0;L=+g[K>>2];M=b+28|0;N=+g[M>>2];O=L+N;P=O-J;Q=(y-v)*1.4142135623730951-P;v=(L-N)*1.4142135623730951-O-Q;O=u-J;N=J+u;u=t-P;J=P+t;t=s-Q;P=Q+s;s=x-v;Q=v+x;R=b+80|0;x=+g[R>>2];S=b+32|0;v=+g[S>>2];L=x+v;y=(x-v)*1.111140489578247;T=b+84|0;v=+g[T>>2];U=b+36|0;x=+g[U>>2];V=v+x;W=(v-x)*1.111140489578247;X=b+72|0;x=+g[X>>2];Y=b+40|0;v=+g[Y>>2];Z=x+v;_=(x-v)*.7653668522834778;$=b+76|0;v=+g[$>>2];aa=b+44|0;x=+g[aa>>2];ab=v+x;ac=(v-x)*.7653668522834778;ad=b+64|0;x=+g[ad>>2];ae=b+48|0;v=+g[ae>>2];af=x+v;ag=(x-v)*.39018064737319946;ah=b+68|0;v=+g[ah>>2];ai=b+52|0;x=+g[ai>>2];aj=v+x;ak=(v-x)*.39018064737319946;x=y+j;v=(j-y)*.7653668522834778;y=W+h;j=(h-W)*.7653668522834778;W=k+L;h=(k-L)*.7653668522834778;L=i+V;k=(i-V)*.7653668522834778;V=w+af;i=(w-af)*1.8477590084075928;af=q+aj;w=(q-aj)*1.8477590084075928;aj=ag+r;q=(ag-r)*1.8477590084075928;r=ak+p;ag=(p-ak)*1.8477590084075928;ak=o+Z;p=m+ab;al=_+n;am=ac+l;an=am-p;ao=p-ak;p=N-ak;ap=ak+N;N=(m-ab)*1.4142135623730951-an;ab=al-ao;m=J-ao;ak=ao+J;J=an-ab;an=P-ab;ao=ab+P;P=(o-Z)*1.4142135623730951-J;Z=Q-J;o=J+Q;Q=N-P;J=s-P;ab=P+s;s=(n-_)*1.4142135623730951-al-Q;al=t-Q;_=Q+t;t=(l-ac)*1.4142135623730951-am-N-s;N=u-s;am=s+u;u=O-t;s=t+O;O=V+W;t=af+L;ac=aj+x;l=r+y;Q=h+i;n=k+w;P=j+ag;aq=v-q;ar=aq-ac;as=(aj-x)*1.4142135623730951-ar;x=P-l;aj=(r-y)*1.4142135623730951-x;y=l-t;l=n-y;r=x-l;x=(af-L)*1.4142135623730951-r;L=aj-x;af=(k-w)*-1.4142135623730951-n-L;n=t-O;t=ac-n;ac=y-t;y=Q-ac;w=l-y;l=ar-w;ar=r-l;r=(V-W)*1.4142135623730951-ar;W=x-r;x=as-W;V=L-x;L=(h-i)*-1.4142135623730951-Q-V;Q=af-L;i=(v+q)*-1.4142135623730951-aq-as-Q;as=(j-ag)*-1.4142135623730951-P-aj-af-i;g[b>>2]=O+ap;g[b+124>>2]=ap-O;g[c>>2]=n+ak;g[b+120>>2]=ak-n;g[ad>>2]=t+ao;g[f>>2]=ao-t;g[ah>>2]=ac+o;g[a>>2]=o-ac;g[S>>2]=y+ab;g[K>>2]=ab-y;g[U>>2]=w+_;g[H>>2]=_-w;g[D>>2]=l+am;g[M>>2]=am-l;g[F>>2]=ar+s;g[I>>2]=s-ar;g[E>>2]=r+u;g[B>>2]=u-r;g[G>>2]=W+N;g[z>>2]=N-W;g[R>>2]=x+al;g[aa>>2]=al-x;g[T>>2]=V+J;g[Y>>2]=J-V;g[ae>>2]=L+Z;g[$>>2]=Z-L;g[ai>>2]=Q+an;g[X>>2]=an-Q;g[e>>2]=i+m;g[C>>2]=m-i;g[d>>2]=as+p;g[A>>2]=p-as;return}function bs(a,b,c,d,e,f,h){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;f=+f;h=h|0;var i=0.0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0;i=f*2.0;if((h|0)<=0){return}j=f>0.0;k=0;do{f=+g[a+512+(k<<2)>>2];l=+g[a+768+(k<<2)>>2];m=+g[b+(k<<2)>>2];n=+g[b+256+(k<<2)>>2];o=b+512+(k<<2)|0;p=+g[o>>2];q=b+768+(k<<2)|0;r=+g[q>>2];if(m>n*1.5800000429153442|n>m*1.5800000429153442){s=r;t=p}else{u=+g[c+(k<<2)>>2];v=l*u;w=f*u;u=r<v?r:v;v=p<w?p:w;s=r>v?r:v;t=p>u?p:u}if(j){u=+g[d+(k<<2)>>2]*e;p=m>u?m:u;m=n>u?n:u;n=t>u?t:u;v=s>u?s:u;u=n+v;do{if(u>0.0){r=i*(p<m?p:m);if(r>=u){x=n;y=v;break}w=r/u;x=n*w;y=v*w}else{x=n;y=v}}while(0);z=y<s?y:s;A=x<t?x:t}else{z=s;A=t}g[o>>2]=A>f?f:A;g[q>>2]=z>l?l:z;k=k+1|0;}while((k|0)<(h|0));return}function bt(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0,B=0;h=c[a+2152>>2]|0;L1922:do{if((h|0)>0){i=a+2148|0;j=0;k=0;l=0.0;m=0.0;while(1){n=c[a+2060+(k<<2)>>2]|0;o=c[i>>2]|0;p=(n|0)<(o|0)?n:o;if((j|0)<(p|0)){q=n^-1;n=o^-1;r=(q|0)>(n|0)?q:n;n=j;s=l;t=m;do{t=t+ +g[b+(n<<2)>>2];s=s+ +g[d+(n<<2)>>2];n=n+1|0;}while((n|0)<(p|0));u=r^-1;v=s;w=t}else{u=j;v=l;w=m}if((u|0)>=(o|0)){break}x=+g[a+1112+(k<<2)>>2];y=1.0-x;p=b+(u<<2)|0;n=d+(u<<2)|0;z=v+x*+g[n>>2];g[e+(k<<2)>>2]=w+x*+g[p>>2];g[f+(k<<2)>>2]=z;q=k+1|0;if((q|0)<(h|0)){j=u+1|0;k=q;l=y*+g[n>>2];m=y*+g[p>>2]}else{A=q;break L1922}}g[e+(k<<2)>>2]=w;g[f+(k<<2)>>2]=v;A=k+1|0}else{A=0}}while(0);if((A|0)<(h|0)){B=A}else{return}do{g[e+(B<<2)>>2]=0.0;g[f+(B<<2)>>2]=0.0;B=B+1|0;}while((B|0)<(h|0));return}function bu(a,b,d,e){a=+a;b=+b;d=+d;e=+e;var f=0.0,h=0,i=0,j=0.0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0;f=e<1.0?94.82444763183594:e;h=(g[k>>2]=b,c[k>>2]|0);b=+(h&16383|0)*6103515625.0e-14;i=h>>>14&511;e=a*a;a=(+((h>>>23&255)-127|0)+((1.0-b)*+g[5864+(i<<2)>>2]+b*+g[5864+(i+1<<2)>>2]))*3.0102999566398116-d;if(e<=9.999999682655225e-21){j=0.0;l=j<0.0;m=l?0.0:j;n=a*m;o=d+90.30873107910156;p=o-f;q=p+n;r=q*.10000000149011612;s=+P(10.0,+r);return+s}i=(g[k>>2]=e,c[k>>2]|0);e=+(i&16383|0)*6103515625.0e-14;h=i>>>14&511;j=(+((i>>>23&255)-127|0)+((1.0-e)*+g[5864+(h<<2)>>2]+e*+g[5864+(h+1<<2)>>2]))*.03333343265598758+1.0;l=j<0.0;m=l?0.0:j;n=a*m;o=d+90.30873107910156;p=o-f;q=p+n;r=q*.10000000149011612;s=+P(10.0,+r);return+s}function bv(a,b){a=a|0;b=b|0;aJ(c[m>>2]|0,a|0,b|0)|0;ar(c[m>>2]|0)|0;return}function bw(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e|0;if((a|0)==0){i=e;return}g=a+85836|0;if((c[g>>2]|0)==0){i=e;return}a=f;c[a>>2]=d;c[a+4>>2]=0;aS[c[g>>2]&3](b,f|0);i=e;return}function bx(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[5192]|0;if(b>>>0<e>>>0){ap()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){ap()}h=f&-8;i=a+(h-8)|0;j=i;L1964:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){ap()}if((n|0)==(c[5193]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[5190]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=20792+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){ap()}if((c[k+12>>2]|0)==(n|0)){break}ap()}}while(0);if((s|0)==(k|0)){c[5188]=c[5188]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){ap()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}ap()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){ap()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){ap()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){ap()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{ap()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=21056+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[5189]=c[5189]&(1<<c[v>>2]^-1);q=n;r=o;break L1964}else{if(p>>>0<(c[5192]|0)>>>0){ap()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L1964}}}while(0);if(A>>>0<(c[5192]|0)>>>0){ap()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[5192]|0)>>>0){ap()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[5192]|0)>>>0){ap()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){ap()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){ap()}do{if((e&2|0)==0){if((j|0)==(c[5194]|0)){B=(c[5191]|0)+r|0;c[5191]=B;c[5194]=q;c[q+4>>2]=B|1;if((q|0)==(c[5193]|0)){c[5193]=0;c[5190]=0}if(B>>>0<=(c[5195]|0)>>>0){return}do{if((c[1460]|0)==0){B=aD(8)|0;if((B-1&B|0)==0){c[1462]=B;c[1461]=B;c[1463]=-1;c[1464]=2097152;c[1465]=0;c[5299]=0;c[1460]=(aF(0)|0)&-16^1431655768;break}else{ap()}}}while(0);o=c[5194]|0;if((o|0)==0){return}n=c[5191]|0;do{if(n>>>0>40){l=c[1462]|0;B=_((((n-41+l|0)>>>0)/(l>>>0)>>>0)-1|0,l)|0;C=o;u=21200;while(1){g=c[u>>2]|0;if(g>>>0<=C>>>0){if((g+(c[u+4>>2]|0)|0)>>>0>C>>>0){D=u;break}}g=c[u+8>>2]|0;if((g|0)==0){D=0;break}else{u=g}}if((c[D+12>>2]&8|0)!=0){break}u=aM(0)|0;C=D+4|0;if((u|0)!=((c[D>>2]|0)+(c[C>>2]|0)|0)){break}g=aM(-(B>>>0>2147483646?-2147483648-l|0:B)|0)|0;b=aM(0)|0;if(!((g|0)!=-1&b>>>0<u>>>0)){break}g=u-b|0;if((u|0)==(b|0)){break}c[C>>2]=(c[C>>2]|0)-g;c[5296]=(c[5296]|0)-g;C=c[5194]|0;b=(c[5191]|0)-g|0;g=C;u=C+8|0;if((u&7|0)==0){E=0}else{E=-u&7}u=b-E|0;c[5194]=g+E;c[5191]=u;c[g+(E+4)>>2]=u|1;c[g+(b+4)>>2]=40;c[5195]=c[1464];return}}while(0);if((c[5191]|0)>>>0<=(c[5195]|0)>>>0){return}c[5195]=-1;return}if((j|0)==(c[5193]|0)){o=(c[5190]|0)+r|0;c[5190]=o;c[5193]=q;c[q+4>>2]=o|1;c[d+o>>2]=o;return}o=(e&-8)+r|0;n=e>>>3;L2098:do{if(e>>>0<256){b=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;u=20792+(n<<1<<2)|0;do{if((b|0)!=(u|0)){if(b>>>0<(c[5192]|0)>>>0){ap()}if((c[b+12>>2]|0)==(j|0)){break}ap()}}while(0);if((g|0)==(b|0)){c[5188]=c[5188]&(1<<n^-1);break}do{if((g|0)==(u|0)){F=g+8|0}else{if(g>>>0<(c[5192]|0)>>>0){ap()}B=g+8|0;if((c[B>>2]|0)==(j|0)){F=B;break}ap()}}while(0);c[b+12>>2]=g;c[F>>2]=b}else{u=i;B=c[a+(h+16)>>2]|0;l=c[a+(h|4)>>2]|0;do{if((l|0)==(u|0)){C=a+(h+12)|0;f=c[C>>2]|0;if((f|0)==0){t=a+(h+8)|0;p=c[t>>2]|0;if((p|0)==0){G=0;break}else{H=p;I=t}}else{H=f;I=C}while(1){C=H+20|0;f=c[C>>2]|0;if((f|0)!=0){H=f;I=C;continue}C=H+16|0;f=c[C>>2]|0;if((f|0)==0){break}else{H=f;I=C}}if(I>>>0<(c[5192]|0)>>>0){ap()}else{c[I>>2]=0;G=H;break}}else{C=c[a+h>>2]|0;if(C>>>0<(c[5192]|0)>>>0){ap()}f=C+12|0;if((c[f>>2]|0)!=(u|0)){ap()}t=l+8|0;if((c[t>>2]|0)==(u|0)){c[f>>2]=l;c[t>>2]=C;G=l;break}else{ap()}}}while(0);if((B|0)==0){break}l=a+(h+20)|0;b=21056+(c[l>>2]<<2)|0;do{if((u|0)==(c[b>>2]|0)){c[b>>2]=G;if((G|0)!=0){break}c[5189]=c[5189]&(1<<c[l>>2]^-1);break L2098}else{if(B>>>0<(c[5192]|0)>>>0){ap()}g=B+16|0;if((c[g>>2]|0)==(u|0)){c[g>>2]=G}else{c[B+20>>2]=G}if((G|0)==0){break L2098}}}while(0);if(G>>>0<(c[5192]|0)>>>0){ap()}c[G+24>>2]=B;u=c[a+(h+8)>>2]|0;do{if((u|0)!=0){if(u>>>0<(c[5192]|0)>>>0){ap()}else{c[G+16>>2]=u;c[u+24>>2]=G;break}}}while(0);u=c[a+(h+12)>>2]|0;if((u|0)==0){break}if(u>>>0<(c[5192]|0)>>>0){ap()}else{c[G+20>>2]=u;c[u+24>>2]=G;break}}}while(0);c[q+4>>2]=o|1;c[d+o>>2]=o;if((q|0)!=(c[5193]|0)){J=o;break}c[5190]=o;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;J=r}}while(0);r=J>>>3;if(J>>>0<256){d=r<<1;e=20792+(d<<2)|0;A=c[5188]|0;G=1<<r;do{if((A&G|0)==0){c[5188]=A|G;K=e;L=20792+(d+2<<2)|0}else{r=20792+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[5192]|0)>>>0){K=h;L=r;break}ap()}}while(0);c[L>>2]=q;c[K+12>>2]=q;c[q+8>>2]=K;c[q+12>>2]=e;return}e=q;K=J>>>8;do{if((K|0)==0){M=0}else{if(J>>>0>16777215){M=31;break}L=(K+1048320|0)>>>16&8;d=K<<L;G=(d+520192|0)>>>16&4;A=d<<G;d=(A+245760|0)>>>16&2;r=14-(G|L|d)+(A<<d>>>15)|0;M=J>>>((r+7|0)>>>0)&1|r<<1}}while(0);K=21056+(M<<2)|0;c[q+28>>2]=M;c[q+20>>2]=0;c[q+16>>2]=0;r=c[5189]|0;d=1<<M;do{if((r&d|0)==0){c[5189]=r|d;c[K>>2]=e;c[q+24>>2]=K;c[q+12>>2]=q;c[q+8>>2]=q}else{if((M|0)==31){N=0}else{N=25-(M>>>1)|0}A=J<<N;L=c[K>>2]|0;while(1){if((c[L+4>>2]&-8|0)==(J|0)){break}O=L+16+(A>>>31<<2)|0;G=c[O>>2]|0;if((G|0)==0){P=1474;break}else{A=A<<1;L=G}}if((P|0)==1474){if(O>>>0<(c[5192]|0)>>>0){ap()}else{c[O>>2]=e;c[q+24>>2]=L;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=L+8|0;o=c[A>>2]|0;G=c[5192]|0;if(L>>>0<G>>>0){ap()}if(o>>>0<G>>>0){ap()}else{c[o+12>>2]=e;c[A>>2]=e;c[q+8>>2]=o;c[q+12>>2]=L;c[q+24>>2]=0;break}}}while(0);q=(c[5196]|0)-1|0;c[5196]=q;if((q|0)==0){Q=21208}else{return}while(1){q=c[Q>>2]|0;if((q|0)==0){break}else{Q=q+8|0}}c[5196]=-1;return}function by(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aE=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aO=0,aP=0,aQ=0;do{if((a|0)==0){d=16;e=0;f=1526}else{g=_(b,a)|0;if((b|a)>>>0>65535){h=((g>>>0)/(a>>>0)>>>0|0)==(b|0)?g:-1}else{h=g}if(h>>>0<245){if(h>>>0<11){d=16;e=h;f=1526;break}d=h+11&-8;e=h;f=1526;break}if(h>>>0>4294967231){i=-1;j=h;f=1682;break}g=h+11|0;k=g&-8;l=c[5189]|0;if((l|0)==0){i=k;j=h;f=1682;break}m=-k|0;n=g>>>8;do{if((n|0)==0){o=0}else{if(k>>>0>16777215){o=31;break}g=(n+1048320|0)>>>16&8;p=n<<g;q=(p+520192|0)>>>16&4;r=p<<q;p=(r+245760|0)>>>16&2;s=14-(q|g|p)+(r<<p>>>15)|0;o=k>>>((s+7|0)>>>0)&1|s<<1}}while(0);n=c[21056+(o<<2)>>2]|0;L2229:do{if((n|0)==0){t=0;u=m;v=0}else{if((o|0)==31){w=0}else{w=25-(o>>>1)|0}s=0;p=m;r=n;g=k<<w;q=0;while(1){x=c[r+4>>2]&-8;y=x-k|0;if(y>>>0<p>>>0){if((x|0)==(k|0)){t=r;u=y;v=r;break L2229}else{z=r;A=y}}else{z=s;A=p}y=c[r+20>>2]|0;x=c[r+16+(g>>>31<<2)>>2]|0;B=(y|0)==0|(y|0)==(x|0)?q:y;if((x|0)==0){t=z;u=A;v=B;break}else{s=z;p=A;r=x;g=g<<1;q=B}}}}while(0);if((v|0)==0&(t|0)==0){n=2<<o;m=l&(n|-n);if((m|0)==0){i=k;j=h;f=1682;break}n=(m&-m)-1|0;m=n>>>12&16;q=n>>>(m>>>0);n=q>>>5&8;g=q>>>(n>>>0);q=g>>>2&4;r=g>>>(q>>>0);g=r>>>1&2;p=r>>>(g>>>0);r=p>>>1&1;C=c[21056+((n|m|q|g|r)+(p>>>(r>>>0))<<2)>>2]|0}else{C=v}if((C|0)==0){D=u;E=t}else{r=C;p=u;g=t;while(1){q=(c[r+4>>2]&-8)-k|0;m=q>>>0<p>>>0;n=m?q:p;q=m?r:g;m=c[r+16>>2]|0;if((m|0)!=0){r=m;p=n;g=q;continue}m=c[r+20>>2]|0;if((m|0)==0){D=n;E=q;break}else{r=m;p=n;g=q}}}if((E|0)==0){i=k;j=h;f=1682;break}if(D>>>0>=((c[5190]|0)-k|0)>>>0){i=k;j=h;f=1682;break}g=E;p=c[5192]|0;if(g>>>0<p>>>0){ap();return 0;return 0}r=g+k|0;l=r;if(g>>>0>=r>>>0){ap();return 0;return 0}q=c[E+24>>2]|0;n=c[E+12>>2]|0;do{if((n|0)==(E|0)){m=E+20|0;s=c[m>>2]|0;if((s|0)==0){B=E+16|0;x=c[B>>2]|0;if((x|0)==0){F=0;break}else{G=x;H=B}}else{G=s;H=m}while(1){m=G+20|0;s=c[m>>2]|0;if((s|0)!=0){G=s;H=m;continue}m=G+16|0;s=c[m>>2]|0;if((s|0)==0){break}else{G=s;H=m}}if(H>>>0<p>>>0){ap();return 0;return 0}else{c[H>>2]=0;F=G;break}}else{m=c[E+8>>2]|0;if(m>>>0<p>>>0){ap();return 0;return 0}s=m+12|0;if((c[s>>2]|0)!=(E|0)){ap();return 0;return 0}B=n+8|0;if((c[B>>2]|0)==(E|0)){c[s>>2]=n;c[B>>2]=m;F=n;break}else{ap();return 0;return 0}}}while(0);L2279:do{if((q|0)!=0){n=E+28|0;p=21056+(c[n>>2]<<2)|0;do{if((E|0)==(c[p>>2]|0)){c[p>>2]=F;if((F|0)!=0){break}c[5189]=c[5189]&(1<<c[n>>2]^-1);break L2279}else{if(q>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}m=q+16|0;if((c[m>>2]|0)==(E|0)){c[m>>2]=F}else{c[q+20>>2]=F}if((F|0)==0){break L2279}}}while(0);if(F>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}c[F+24>>2]=q;n=c[E+16>>2]|0;do{if((n|0)!=0){if(n>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}else{c[F+16>>2]=n;c[n+24>>2]=F;break}}}while(0);n=c[E+20>>2]|0;if((n|0)==0){break}if(n>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}else{c[F+20>>2]=n;c[n+24>>2]=F;break}}}while(0);do{if(D>>>0<16){q=D+k|0;c[E+4>>2]=q|3;n=g+(q+4)|0;c[n>>2]=c[n>>2]|1}else{c[E+4>>2]=k|3;c[g+(k|4)>>2]=D|1;c[g+(D+k)>>2]=D;n=D>>>3;if(D>>>0<256){q=n<<1;p=20792+(q<<2)|0;m=c[5188]|0;B=1<<n;do{if((m&B|0)==0){c[5188]=m|B;I=p;J=20792+(q+2<<2)|0}else{n=20792+(q+2<<2)|0;s=c[n>>2]|0;if(s>>>0>=(c[5192]|0)>>>0){I=s;J=n;break}ap();return 0;return 0}}while(0);c[J>>2]=l;c[I+12>>2]=l;c[g+(k+8)>>2]=I;c[g+(k+12)>>2]=p;break}q=r;B=D>>>8;do{if((B|0)==0){K=0}else{if(D>>>0>16777215){K=31;break}m=(B+1048320|0)>>>16&8;n=B<<m;s=(n+520192|0)>>>16&4;x=n<<s;n=(x+245760|0)>>>16&2;y=14-(s|m|n)+(x<<n>>>15)|0;K=D>>>((y+7|0)>>>0)&1|y<<1}}while(0);B=21056+(K<<2)|0;c[g+(k+28)>>2]=K;c[g+(k+20)>>2]=0;c[g+(k+16)>>2]=0;p=c[5189]|0;y=1<<K;if((p&y|0)==0){c[5189]=p|y;c[B>>2]=q;c[g+(k+24)>>2]=B;c[g+(k+12)>>2]=q;c[g+(k+8)>>2]=q;break}if((K|0)==31){L=0}else{L=25-(K>>>1)|0}y=D<<L;p=c[B>>2]|0;while(1){if((c[p+4>>2]&-8|0)==(D|0)){break}M=p+16+(y>>>31<<2)|0;B=c[M>>2]|0;if((B|0)==0){f=1673;break}else{y=y<<1;p=B}}if((f|0)==1673){if(M>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}else{c[M>>2]=q;c[g+(k+24)>>2]=p;c[g+(k+12)>>2]=q;c[g+(k+8)>>2]=q;break}}y=p+8|0;B=c[y>>2]|0;n=c[5192]|0;if(p>>>0<n>>>0){ap();return 0;return 0}if(B>>>0<n>>>0){ap();return 0;return 0}else{c[B+12>>2]=q;c[y>>2]=q;c[g+(k+8)>>2]=B;c[g+(k+12)>>2]=p;c[g+(k+24)>>2]=0;break}}}while(0);g=E+8|0;if((g|0)==0){i=k;j=h;f=1682}else{N=g;O=h}}}while(0);do{if((f|0)==1526){h=d>>>3;E=c[5188]|0;M=E>>>(h>>>0);if((M&3|0)!=0){D=(M&1^1)+h|0;L=D<<1;K=20792+(L<<2)|0;I=20792+(L+2<<2)|0;L=c[I>>2]|0;J=L+8|0;F=c[J>>2]|0;do{if((K|0)==(F|0)){c[5188]=E&(1<<D^-1)}else{if(F>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}G=F+12|0;if((c[G>>2]|0)==(L|0)){c[G>>2]=K;c[I>>2]=F;break}else{ap();return 0;return 0}}}while(0);F=D<<3;c[L+4>>2]=F|3;I=L+(F|4)|0;c[I>>2]=c[I>>2]|1;N=J;O=e;break}if(d>>>0<=(c[5190]|0)>>>0){i=d;j=e;f=1682;break}if((M|0)!=0){I=2<<h;F=M<<h&(I|-I);I=(F&-F)-1|0;F=I>>>12&16;K=I>>>(F>>>0);I=K>>>5&8;k=K>>>(I>>>0);K=k>>>2&4;G=k>>>(K>>>0);k=G>>>1&2;H=G>>>(k>>>0);G=H>>>1&1;t=(I|F|K|k|G)+(H>>>(G>>>0))|0;G=t<<1;H=20792+(G<<2)|0;k=20792+(G+2<<2)|0;G=c[k>>2]|0;K=G+8|0;F=c[K>>2]|0;do{if((H|0)==(F|0)){c[5188]=E&(1<<t^-1)}else{if(F>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}I=F+12|0;if((c[I>>2]|0)==(G|0)){c[I>>2]=H;c[k>>2]=F;break}else{ap();return 0;return 0}}}while(0);F=t<<3;k=F-d|0;c[G+4>>2]=d|3;H=G;E=H+d|0;c[H+(d|4)>>2]=k|1;c[H+F>>2]=k;F=c[5190]|0;if((F|0)!=0){H=c[5193]|0;h=F>>>3;F=h<<1;M=20792+(F<<2)|0;J=c[5188]|0;L=1<<h;do{if((J&L|0)==0){c[5188]=J|L;P=M;Q=20792+(F+2<<2)|0}else{h=20792+(F+2<<2)|0;D=c[h>>2]|0;if(D>>>0>=(c[5192]|0)>>>0){P=D;Q=h;break}ap();return 0;return 0}}while(0);c[Q>>2]=H;c[P+12>>2]=H;c[H+8>>2]=P;c[H+12>>2]=M}c[5190]=k;c[5193]=E;N=K;O=e;break}F=c[5189]|0;if((F|0)==0){i=d;j=e;f=1682;break}L=(F&-F)-1|0;F=L>>>12&16;J=L>>>(F>>>0);L=J>>>5&8;G=J>>>(L>>>0);J=G>>>2&4;t=G>>>(J>>>0);G=t>>>1&2;h=t>>>(G>>>0);t=h>>>1&1;D=c[21056+((L|F|J|G|t)+(h>>>(t>>>0))<<2)>>2]|0;t=D;h=D;G=(c[D+4>>2]&-8)-d|0;while(1){D=c[t+16>>2]|0;if((D|0)==0){J=c[t+20>>2]|0;if((J|0)==0){break}else{R=J}}else{R=D}D=(c[R+4>>2]&-8)-d|0;J=D>>>0<G>>>0;t=R;h=J?R:h;G=J?D:G}t=h;K=c[5192]|0;if(t>>>0<K>>>0){ap();return 0;return 0}E=t+d|0;k=E;if(t>>>0>=E>>>0){ap();return 0;return 0}E=c[h+24>>2]|0;M=c[h+12>>2]|0;do{if((M|0)==(h|0)){H=h+20|0;D=c[H>>2]|0;if((D|0)==0){J=h+16|0;F=c[J>>2]|0;if((F|0)==0){S=0;break}else{T=F;U=J}}else{T=D;U=H}while(1){H=T+20|0;D=c[H>>2]|0;if((D|0)!=0){T=D;U=H;continue}H=T+16|0;D=c[H>>2]|0;if((D|0)==0){break}else{T=D;U=H}}if(U>>>0<K>>>0){ap();return 0;return 0}else{c[U>>2]=0;S=T;break}}else{p=c[h+8>>2]|0;if(p>>>0<K>>>0){ap();return 0;return 0}q=p+12|0;if((c[q>>2]|0)!=(h|0)){ap();return 0;return 0}H=M+8|0;if((c[H>>2]|0)==(h|0)){c[q>>2]=M;c[H>>2]=p;S=M;break}else{ap();return 0;return 0}}}while(0);L2416:do{if((E|0)!=0){M=h+28|0;K=21056+(c[M>>2]<<2)|0;do{if((h|0)==(c[K>>2]|0)){c[K>>2]=S;if((S|0)!=0){break}c[5189]=c[5189]&(1<<c[M>>2]^-1);break L2416}else{if(E>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}p=E+16|0;if((c[p>>2]|0)==(h|0)){c[p>>2]=S}else{c[E+20>>2]=S}if((S|0)==0){break L2416}}}while(0);if(S>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}c[S+24>>2]=E;M=c[h+16>>2]|0;do{if((M|0)!=0){if(M>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}else{c[S+16>>2]=M;c[M+24>>2]=S;break}}}while(0);M=c[h+20>>2]|0;if((M|0)==0){break}if(M>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}else{c[S+20>>2]=M;c[M+24>>2]=S;break}}}while(0);if(G>>>0<16){E=G+d|0;c[h+4>>2]=E|3;M=t+(E+4)|0;c[M>>2]=c[M>>2]|1}else{c[h+4>>2]=d|3;c[t+(d|4)>>2]=G|1;c[t+(G+d)>>2]=G;M=c[5190]|0;if((M|0)!=0){E=c[5193]|0;K=M>>>3;M=K<<1;p=20792+(M<<2)|0;H=c[5188]|0;q=1<<K;do{if((H&q|0)==0){c[5188]=H|q;V=p;W=20792+(M+2<<2)|0}else{K=20792+(M+2<<2)|0;D=c[K>>2]|0;if(D>>>0>=(c[5192]|0)>>>0){V=D;W=K;break}ap();return 0;return 0}}while(0);c[W>>2]=E;c[V+12>>2]=E;c[E+8>>2]=V;c[E+12>>2]=p}c[5190]=G;c[5193]=k}M=h+8|0;if((M|0)==0){i=d;j=e;f=1682}else{N=M;O=e}}}while(0);L2456:do{if((f|0)==1682){e=c[5190]|0;if(i>>>0<=e>>>0){d=e-i|0;V=c[5193]|0;if(d>>>0>15){W=V;c[5193]=W+i;c[5190]=d;c[W+(i+4)>>2]=d|1;c[W+e>>2]=d;c[V+4>>2]=i|3}else{c[5190]=0;c[5193]=0;c[V+4>>2]=e|3;d=V+(e+4)|0;c[d>>2]=c[d>>2]|1}N=V+8|0;O=j;break}V=c[5191]|0;if(i>>>0<V>>>0){d=V-i|0;c[5191]=d;V=c[5194]|0;e=V;c[5194]=e+i;c[e+(i+4)>>2]=d|1;c[V+4>>2]=i|3;N=V+8|0;O=j;break}do{if((c[1460]|0)==0){V=aD(8)|0;if((V-1&V|0)==0){c[1462]=V;c[1461]=V;c[1463]=-1;c[1464]=2097152;c[1465]=0;c[5299]=0;c[1460]=(aF(0)|0)&-16^1431655768;break}else{ap();return 0;return 0}}}while(0);h=i+48|0;k=c[1462]|0;G=i+47|0;p=k+G|0;E=-k|0;k=p&E;if(k>>>0<=i>>>0){X=0;return X|0}V=c[5298]|0;do{if((V|0)!=0){d=c[5296]|0;e=d+k|0;if(e>>>0<=d>>>0|e>>>0>V>>>0){X=0}else{break}return X|0}}while(0);L2481:do{if((c[5299]&4|0)==0){V=c[5194]|0;L2483:do{if((V|0)==0){f=1703}else{e=V;d=21200;while(1){Y=d|0;W=c[Y>>2]|0;if(W>>>0<=e>>>0){Z=d+4|0;if((W+(c[Z>>2]|0)|0)>>>0>e>>>0){break}}W=c[d+8>>2]|0;if((W|0)==0){f=1703;break L2483}else{d=W}}if((d|0)==0){f=1703;break}e=p-(c[5191]|0)&E;if(e>>>0>=2147483647){$=0;break}W=aM(e|0)|0;S=(W|0)==((c[Y>>2]|0)+(c[Z>>2]|0)|0);aa=S?W:-1;ab=S?e:0;ac=W;ad=e;f=1712}}while(0);do{if((f|0)==1703){V=aM(0)|0;if((V|0)==-1){$=0;break}e=V;W=c[1461]|0;S=W-1|0;if((S&e|0)==0){ae=k}else{ae=k-e+(S+e&-W)|0}W=c[5296]|0;e=W+ae|0;if(!(ae>>>0>i>>>0&ae>>>0<2147483647)){$=0;break}S=c[5298]|0;if((S|0)!=0){if(e>>>0<=W>>>0|e>>>0>S>>>0){$=0;break}}S=aM(ae|0)|0;e=(S|0)==(V|0);aa=e?V:-1;ab=e?ae:0;ac=S;ad=ae;f=1712}}while(0);L2503:do{if((f|0)==1712){S=-ad|0;if((aa|0)!=-1){af=ab;ag=aa;f=1723;break L2481}do{if((ac|0)!=-1&ad>>>0<2147483647&ad>>>0<h>>>0){e=c[1462]|0;V=G-ad+e&-e;if(V>>>0>=2147483647){ah=ad;break}if((aM(V|0)|0)==-1){aM(S|0)|0;$=ab;break L2503}else{ah=V+ad|0;break}}else{ah=ad}}while(0);if((ac|0)==-1){$=ab}else{af=ah;ag=ac;f=1723;break L2481}}}while(0);c[5299]=c[5299]|4;ai=$;f=1720}else{ai=0;f=1720}}while(0);do{if((f|0)==1720){if(k>>>0>=2147483647){break}G=aM(k|0)|0;h=aM(0)|0;if(!((h|0)!=-1&(G|0)!=-1&G>>>0<h>>>0)){break}E=h-G|0;h=E>>>0>(i+40|0)>>>0;p=h?G:-1;if((p|0)!=-1){af=h?E:ai;ag=p;f=1723}}}while(0);do{if((f|0)==1723){k=(c[5296]|0)+af|0;c[5296]=k;if(k>>>0>(c[5297]|0)>>>0){c[5297]=k}k=c[5194]|0;L2523:do{if((k|0)==0){p=c[5192]|0;if((p|0)==0|ag>>>0<p>>>0){c[5192]=ag}c[5300]=ag;c[5301]=af;c[5303]=0;c[5197]=c[1460];c[5196]=-1;p=0;do{E=p<<1;h=20792+(E<<2)|0;c[20792+(E+3<<2)>>2]=h;c[20792+(E+2<<2)>>2]=h;p=p+1|0;}while(p>>>0<32);p=ag+8|0;if((p&7|0)==0){aj=0}else{aj=-p&7}p=af-40-aj|0;c[5194]=ag+aj;c[5191]=p;c[ag+(aj+4)>>2]=p|1;c[ag+(af-36)>>2]=40;c[5195]=c[1464]}else{p=21200;while(1){ak=c[p>>2]|0;al=p+4|0;am=c[al>>2]|0;if((ag|0)==(ak+am|0)){f=1735;break}h=c[p+8>>2]|0;if((h|0)==0){break}else{p=h}}do{if((f|0)==1735){if((c[p+12>>2]&8|0)!=0){break}h=k;if(!(h>>>0>=ak>>>0&h>>>0<ag>>>0)){break}c[al>>2]=am+af;h=c[5194]|0;E=(c[5191]|0)+af|0;G=h;S=h+8|0;if((S&7|0)==0){an=0}else{an=-S&7}S=E-an|0;c[5194]=G+an;c[5191]=S;c[G+(an+4)>>2]=S|1;c[G+(E+4)>>2]=40;c[5195]=c[1464];break L2523}}while(0);if(ag>>>0<(c[5192]|0)>>>0){c[5192]=ag}p=ag+af|0;E=21200;while(1){ao=E|0;if((c[ao>>2]|0)==(p|0)){f=1745;break}G=c[E+8>>2]|0;if((G|0)==0){break}else{E=G}}do{if((f|0)==1745){if((c[E+12>>2]&8|0)!=0){break}c[ao>>2]=ag;p=E+4|0;c[p>>2]=(c[p>>2]|0)+af;p=ag+8|0;if((p&7|0)==0){aq=0}else{aq=-p&7}p=ag+(af+8)|0;if((p&7|0)==0){ar=0}else{ar=-p&7}p=ag+(ar+af)|0;G=p;S=aq+i|0;h=ag+S|0;d=h;V=p-(ag+aq)-i|0;c[ag+(aq+4)>>2]=i|3;do{if((G|0)==(c[5194]|0)){e=(c[5191]|0)+V|0;c[5191]=e;c[5194]=d;c[ag+(S+4)>>2]=e|1}else{if((G|0)==(c[5193]|0)){e=(c[5190]|0)+V|0;c[5190]=e;c[5193]=d;c[ag+(S+4)>>2]=e|1;c[ag+(e+S)>>2]=e;break}e=af+4|0;W=c[ag+(e+ar)>>2]|0;if((W&3|0)==1){T=W&-8;U=W>>>3;L2568:do{if(W>>>0<256){R=c[ag+((ar|8)+af)>>2]|0;P=c[ag+(af+12+ar)>>2]|0;Q=20792+(U<<1<<2)|0;do{if((R|0)!=(Q|0)){if(R>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}if((c[R+12>>2]|0)==(G|0)){break}ap();return 0;return 0}}while(0);if((P|0)==(R|0)){c[5188]=c[5188]&(1<<U^-1);break}do{if((P|0)==(Q|0)){as=P+8|0}else{if(P>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}M=P+8|0;if((c[M>>2]|0)==(G|0)){as=M;break}ap();return 0;return 0}}while(0);c[R+12>>2]=P;c[as>>2]=R}else{Q=p;M=c[ag+((ar|24)+af)>>2]|0;q=c[ag+(af+12+ar)>>2]|0;do{if((q|0)==(Q|0)){H=ar|16;t=ag+(e+H)|0;K=c[t>>2]|0;if((K|0)==0){D=ag+(H+af)|0;H=c[D>>2]|0;if((H|0)==0){at=0;break}else{au=H;av=D}}else{au=K;av=t}while(1){t=au+20|0;K=c[t>>2]|0;if((K|0)!=0){au=K;av=t;continue}t=au+16|0;K=c[t>>2]|0;if((K|0)==0){break}else{au=K;av=t}}if(av>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}else{c[av>>2]=0;at=au;break}}else{t=c[ag+((ar|8)+af)>>2]|0;if(t>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}K=t+12|0;if((c[K>>2]|0)!=(Q|0)){ap();return 0;return 0}D=q+8|0;if((c[D>>2]|0)==(Q|0)){c[K>>2]=q;c[D>>2]=t;at=q;break}else{ap();return 0;return 0}}}while(0);if((M|0)==0){break}q=ag+(af+28+ar)|0;R=21056+(c[q>>2]<<2)|0;do{if((Q|0)==(c[R>>2]|0)){c[R>>2]=at;if((at|0)!=0){break}c[5189]=c[5189]&(1<<c[q>>2]^-1);break L2568}else{if(M>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}P=M+16|0;if((c[P>>2]|0)==(Q|0)){c[P>>2]=at}else{c[M+20>>2]=at}if((at|0)==0){break L2568}}}while(0);if(at>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}c[at+24>>2]=M;Q=ar|16;q=c[ag+(Q+af)>>2]|0;do{if((q|0)!=0){if(q>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}else{c[at+16>>2]=q;c[q+24>>2]=at;break}}}while(0);q=c[ag+(e+Q)>>2]|0;if((q|0)==0){break}if(q>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}else{c[at+20>>2]=q;c[q+24>>2]=at;break}}}while(0);aw=ag+((T|ar)+af)|0;ax=T+V|0}else{aw=G;ax=V}e=aw+4|0;c[e>>2]=c[e>>2]&-2;c[ag+(S+4)>>2]=ax|1;c[ag+(ax+S)>>2]=ax;e=ax>>>3;if(ax>>>0<256){U=e<<1;W=20792+(U<<2)|0;q=c[5188]|0;M=1<<e;do{if((q&M|0)==0){c[5188]=q|M;ay=W;az=20792+(U+2<<2)|0}else{e=20792+(U+2<<2)|0;R=c[e>>2]|0;if(R>>>0>=(c[5192]|0)>>>0){ay=R;az=e;break}ap();return 0;return 0}}while(0);c[az>>2]=d;c[ay+12>>2]=d;c[ag+(S+8)>>2]=ay;c[ag+(S+12)>>2]=W;break}U=h;M=ax>>>8;do{if((M|0)==0){aA=0}else{if(ax>>>0>16777215){aA=31;break}q=(M+1048320|0)>>>16&8;T=M<<q;e=(T+520192|0)>>>16&4;R=T<<e;T=(R+245760|0)>>>16&2;P=14-(e|q|T)+(R<<T>>>15)|0;aA=ax>>>((P+7|0)>>>0)&1|P<<1}}while(0);M=21056+(aA<<2)|0;c[ag+(S+28)>>2]=aA;c[ag+(S+20)>>2]=0;c[ag+(S+16)>>2]=0;W=c[5189]|0;P=1<<aA;if((W&P|0)==0){c[5189]=W|P;c[M>>2]=U;c[ag+(S+24)>>2]=M;c[ag+(S+12)>>2]=U;c[ag+(S+8)>>2]=U;break}if((aA|0)==31){aB=0}else{aB=25-(aA>>>1)|0}P=ax<<aB;W=c[M>>2]|0;while(1){if((c[W+4>>2]&-8|0)==(ax|0)){break}aC=W+16+(P>>>31<<2)|0;M=c[aC>>2]|0;if((M|0)==0){f=1818;break}else{P=P<<1;W=M}}if((f|0)==1818){if(aC>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}else{c[aC>>2]=U;c[ag+(S+24)>>2]=W;c[ag+(S+12)>>2]=U;c[ag+(S+8)>>2]=U;break}}P=W+8|0;M=c[P>>2]|0;T=c[5192]|0;if(W>>>0<T>>>0){ap();return 0;return 0}if(M>>>0<T>>>0){ap();return 0;return 0}else{c[M+12>>2]=U;c[P>>2]=U;c[ag+(S+8)>>2]=M;c[ag+(S+12)>>2]=W;c[ag+(S+24)>>2]=0;break}}}while(0);N=ag+(aq|8)|0;O=j;break L2456}}while(0);E=k;S=21200;while(1){aE=c[S>>2]|0;if(aE>>>0<=E>>>0){aG=c[S+4>>2]|0;aH=aE+aG|0;if(aH>>>0>E>>>0){break}}S=c[S+8>>2]|0}S=aE+(aG-39)|0;if((S&7|0)==0){aI=0}else{aI=-S&7}S=aE+(aG-47+aI)|0;h=S>>>0<(k+16|0)>>>0?E:S;S=h+8|0;d=ag+8|0;if((d&7|0)==0){aJ=0}else{aJ=-d&7}d=af-40-aJ|0;c[5194]=ag+aJ;c[5191]=d;c[ag+(aJ+4)>>2]=d|1;c[ag+(af-36)>>2]=40;c[5195]=c[1464];c[h+4>>2]=27;c[S>>2]=c[5300];c[S+4>>2]=c[21204>>2];c[S+8>>2]=c[21208>>2];c[S+12>>2]=c[21212>>2];c[5300]=ag;c[5301]=af;c[5303]=0;c[5302]=S;S=h+28|0;c[S>>2]=7;if((h+32|0)>>>0<aH>>>0){d=S;while(1){S=d+4|0;c[S>>2]=7;if((d+8|0)>>>0<aH>>>0){d=S}else{break}}}if((h|0)==(E|0)){break}d=h-k|0;S=E+(d+4)|0;c[S>>2]=c[S>>2]&-2;c[k+4>>2]=d|1;c[E+d>>2]=d;S=d>>>3;if(d>>>0<256){V=S<<1;G=20792+(V<<2)|0;p=c[5188]|0;M=1<<S;do{if((p&M|0)==0){c[5188]=p|M;aK=G;aL=20792+(V+2<<2)|0}else{S=20792+(V+2<<2)|0;P=c[S>>2]|0;if(P>>>0>=(c[5192]|0)>>>0){aK=P;aL=S;break}ap();return 0;return 0}}while(0);c[aL>>2]=k;c[aK+12>>2]=k;c[k+8>>2]=aK;c[k+12>>2]=G;break}V=k;M=d>>>8;do{if((M|0)==0){aO=0}else{if(d>>>0>16777215){aO=31;break}p=(M+1048320|0)>>>16&8;E=M<<p;h=(E+520192|0)>>>16&4;S=E<<h;E=(S+245760|0)>>>16&2;P=14-(h|p|E)+(S<<E>>>15)|0;aO=d>>>((P+7|0)>>>0)&1|P<<1}}while(0);M=21056+(aO<<2)|0;c[k+28>>2]=aO;c[k+20>>2]=0;c[k+16>>2]=0;G=c[5189]|0;P=1<<aO;if((G&P|0)==0){c[5189]=G|P;c[M>>2]=V;c[k+24>>2]=M;c[k+12>>2]=k;c[k+8>>2]=k;break}if((aO|0)==31){aP=0}else{aP=25-(aO>>>1)|0}P=d<<aP;G=c[M>>2]|0;while(1){if((c[G+4>>2]&-8|0)==(d|0)){break}aQ=G+16+(P>>>31<<2)|0;M=c[aQ>>2]|0;if((M|0)==0){f=1853;break}else{P=P<<1;G=M}}if((f|0)==1853){if(aQ>>>0<(c[5192]|0)>>>0){ap();return 0;return 0}else{c[aQ>>2]=V;c[k+24>>2]=G;c[k+12>>2]=k;c[k+8>>2]=k;break}}P=G+8|0;d=c[P>>2]|0;M=c[5192]|0;if(G>>>0<M>>>0){ap();return 0;return 0}if(d>>>0<M>>>0){ap();return 0;return 0}else{c[d+12>>2]=V;c[P>>2]=V;c[k+8>>2]=d;c[k+12>>2]=G;c[k+24>>2]=0;break}}}while(0);k=c[5191]|0;if(k>>>0<=i>>>0){break}d=k-i|0;c[5191]=d;k=c[5194]|0;P=k;c[5194]=P+i;c[P+(i+4)>>2]=d|1;c[k+4>>2]=i|3;N=k+8|0;O=j;break L2456}}while(0);c[(aN()|0)>>2]=12;X=0;return X|0}}while(0);if((N|0)==0){X=0;return X|0}if((c[N-4>>2]&3|0)==0){X=N;return X|0}bz(N|0,0,O|0);X=N;return X|0}function bz(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function bA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function bB(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{bA(b,c,d)|0}}function bC(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function bD(a,b){a=a|0;b=b|0;aR[a&1](b|0)}function bE(a,b,c){a=a|0;b=b|0;c=c|0;aS[a&3](b|0,c|0)}function bF(a,b){a=a|0;b=b|0;return aT[a&1](b|0)|0}function bG(a){a=a|0;aU[a&1]()}function bH(a,b,c){a=a|0;b=b|0;c=c|0;return aV[a&1](b|0,c|0)|0}function bI(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;aW[a&1](b|0,c|0,d|0,e|0)}function bJ(a){a=a|0;$(0)}function bK(a,b){a=a|0;b=b|0;$(1)}function bL(a){a=a|0;$(2);return 0}function bM(){$(3)}function bN(a,b){a=a|0;b=b|0;$(4);return 0}function bO(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;$(5)}
// EMSCRIPTEN_END_FUNCS
var aR=[bJ,bJ];var aS=[bK,bK,bv,bK];var aT=[bL,bL];var aU=[bM,bM];var aV=[bN,bN];var aW=[bO,bO];return{_strlen:bC,_free:bx,_lame_close:bm,_memmove:bB,_memset:bz,_memcpy:bA,_lame_init:bo,_lame_encode_buffer_ieee_float:bk,_get_lame_version:bq,_lame_encode_flush:bl,_calloc:by,stackAlloc:aX,stackSave:aY,stackRestore:aZ,setThrew:a_,setTempRet0:a1,setTempRet1:a2,setTempRet2:a3,setTempRet3:a4,setTempRet4:a5,setTempRet5:a6,setTempRet6:a7,setTempRet7:a8,setTempRet8:a9,setTempRet9:ba,dynCall_vi:bD,dynCall_vii:bE,dynCall_ii:bF,dynCall_v:bG,dynCall_iii:bH,dynCall_viiii:bI}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_llvm_va_end": _llvm_va_end, "_llvm_lifetime_end": _llvm_lifetime_end, "_malloc": _malloc, "_fabsf": _fabsf, "_snprintf": _snprintf, "_abort": _abort, "_fprintf": _fprintf, "_fflush": _fflush, "_llvm_pow_f32": _llvm_pow_f32, "_log": _log, "_fabs": _fabs, "_floor": _floor, "___setErrNo": ___setErrNo, "__reallyNegative": __reallyNegative, "_send": _send, "_decodeMP3_unclipped": _decodeMP3_unclipped, "_sprintf": _sprintf, "_log10": _log10, "_sin": _sin, "_sysconf": _sysconf, "_ExitMP3": _ExitMP3, "_time": _time, "__formatString": __formatString, "_ceil": _ceil, "_floorf": _floorf, "_vfprintf": _vfprintf, "_cos": _cos, "_pwrite": _pwrite, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_llvm_lifetime_start": _llvm_lifetime_start, "_write": _write, "_fwrite": _fwrite, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _lame_close = Module["_lame_close"] = asm["_lame_close"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _memset = Module["_memset"] = asm["_memset"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _lame_init = Module["_lame_init"] = asm["_lame_init"];
var _lame_encode_buffer_ieee_float = Module["_lame_encode_buffer_ieee_float"] = asm["_lame_encode_buffer_ieee_float"];
var _get_lame_version = Module["_get_lame_version"] = asm["_get_lame_version"];
var _lame_encode_flush = Module["_lame_encode_flush"] = asm["_lame_encode_flush"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
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
	init_params: Module.cwrap('lame_init_params', 'number', [ 'number' ]),
	set_mode: Module.cwrap('lame_set_mode', 'number', [ 'number', 'number' ]),
	get_mode: Module.cwrap('lame_get_mode', 'number', [ 'number' ]),
	set_num_samples: Module.cwrap('lame_set_num_samples', 'number', [ 'number', 'number' ]),
	get_num_samples: Module.cwrap('lame_get_num_samples', 'number', [ 'number' ]),
	set_num_channels: Module.cwrap('lame_set_num_channels', 'number', [ 'number', 'number' ]),
	get_num_channels: Module.cwrap('lame_get_num_channels', 'number', [ 'number' ]),
	set_in_samplerate: Module.cwrap('lame_set_in_samplerate', 'number', [ 'number', 'number' ]),
	get_in_samplerate: Module.cwrap('lame_get_in_samplerate', 'number', [ 'number' ]),
	set_out_samplerate: Module.cwrap('lame_set_out_samplerate', 'number', [ 'number', 'number' ]),
	get_out_samplerate: Module.cwrap('lame_get_out_samplerate', 'number', [ 'number' ]),
	set_bitrate: Module.cwrap('lame_set_brate', 'number', [ 'number', 'number' ]),
	get_bitrate: Module.cwrap('lame_get_brate', 'number', [ 'number' ]),
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
