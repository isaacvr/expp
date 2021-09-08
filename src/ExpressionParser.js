// TODO: Add function map and register function
const BUILTIN_FUNCTIONS = new Map();

BUILTIN_FUNCTIONS.set('log10', { args: 1, f: Math.log10 });
BUILTIN_FUNCTIONS.set('tanh',  { args: 1, f: Math.tanh  });
BUILTIN_FUNCTIONS.set('cosh',  { args: 1, f: Math.cosh  });
BUILTIN_FUNCTIONS.set('log2',  { args: 1, f: Math.log2  });
BUILTIN_FUNCTIONS.set('sinh',  { args: 1, f: Math.sinh  });
BUILTIN_FUNCTIONS.set('atan',  { args: 1, f: Math.atan  });
BUILTIN_FUNCTIONS.set('sin',   { args: 1, f: Math.sin   });
BUILTIN_FUNCTIONS.set('tan',   { args: 1, f: Math.tan   });
BUILTIN_FUNCTIONS.set('cos',   { args: 1, f: Math.cos   });
BUILTIN_FUNCTIONS.set('ln',    { args: 1, f: Math.log   });
// [
//   [ 'log10', Math.log10 ],
//   [ 'tanh', Math.tanh ],
//   [ 'cosh', Math.cosh ],
//   [ 'log2', Math.log2 ],
//   [ 'sinh', Math.sinh ],
//   [ 'atan', Math.atan ],
//   [ 'sin', Math.sin ],
//   [ 'tan', Math.tan ],
//   [ 'cos', Math.cos ],
//   [ 'ln', Math.log ],
// ];

// TODO: Add operator map and register function
const OPERATORS = new Map();

OPERATORS.set("(",  { length: 0, prec: 0, dir: 1 });
OPERATORS.set(")",  { length: 0, prec: 0, dir: 1 });
OPERATORS.set("+",  { length: 2, prec: 1, dir: 1, f: (a, b) => a + b });
OPERATORS.set("-",  { length: 2, prec: 1, dir: 1, f: (a, b) => a - b });
OPERATORS.set("*",  { length: 2, prec: 2, dir: 1, f: (a, b) => a * b });
OPERATORS.set("/",  { length: 2, prec: 2, dir: 1, f: (a, b) => a / b });
OPERATORS.set("^",  { length: 2, prec: 3, dir: 1, f: (a, b) => a ** b });
OPERATORS.set("+u", { length: 1, prec: 4, dir: -1, f: (a) => +a });
OPERATORS.set("-u", { length: 1, prec: 4, dir: -1, f: (a) => -a });

const NUMBER_REG = /^([\d]*\.?[\d]*)([e]-?[\d]*)?/;
const FUNCTION_REG = new RegExp("^(" + BUILTIN_FUNCTIONS.map(e => e[0]).join("|") + ")");
const OPERATOR_REG = /^[\-\+\*\/\(\)\^]/;

const ORDERED_REGS = [
  NUMBER_REG,
  FUNCTION_REG,
  OPERATOR_REG,
];

export default class ExpressionParser {
  constructor() {
    this.funcs = [];
  }

  isBalanced(str) {
    let c = 0;

    for(let i = 0, maxi = str.length; i < maxi; i += 1) {
      c += (str[i] === '(') ? 1 : str[i] === ')' ? -1 : 0;
      if ( c < 0 ) {
        return false;
      }
    }

    return c === 0;
  }

  parse(str) {
    let _str = str.replace(/\s/g, '');

    if ( !this.isBalanced(str) ) {
      return "NOT_BALANCED";
    }

    let doOperation = function(op) {
      if ( OPERATORS.has(op) ) {
        let opInfo = OPERATORS.get(op);

        if ( res.length < opInfo.length ) {
          let suff = opInfo.length != 1 ? 's' : '';
          throw new ReferenceError(`Operator ${op} requires ${opInfo.length} operand${ suff }.`);
        } else {
          let operands = [];
          for (let i = 0; i < opInfo.length; i += 1) {
            operands.unshift( +res.shift() );
          } 
          res.unshift( opInfo.f.apply(null, operands) );
        }
      } else {
        throw new ReferenceError(`Operator "${op}" not found.`);
      }
    };

    _str += ')';

    let ops = [ '(' ];
    let res = [];
    let token = true;

    for (let i = 0, maxi = _str.length; i < maxi;) {
      let ok = false;

      for(let j = 0, maxj = ORDERED_REGS.length;j < maxj; j += 1) {
        let m = _str.match(ORDERED_REGS[j]);
        if ( m && m[0].length ) {
          switch(j) {
            case 0: { // Number
              token = false;
              res.unshift(+m[0]);
              break;
            }
            case 1: { // Function
              token = false;
              ops.unshift(m[0]);
              break;
            }
            case 2: { // Operator
              if ( m[0] === '(' ) {
                token = true;
                ops.unshift('(');
              } else if ( m[0] === ')' ) {
                token = false;
                while( ops[0] != '(' ) {
                  doOperation( ops.shift() );
                }
                ops.shift();
              } else {
                let op = m[0] + (( token ) ? 'u' : '');
                token = true;
                
                let o1 = OPERATORS.get(op);
                let f = (a, b) => a <= b;

                if ( o1.dir < 0 ) {
                  f = (a, b) => a < b;  
                }

                do {
                  let o2 = OPERATORS.get(ops[0]);

                  if ( f(o1.prec, o2.prec) ) {
                    doOperation( ops.shift() );
                  } else break;

                } while(true);

                ops.unshift(op);
              }
              break;
            }
          }

          i += m[0].length;
          _str = _str.substr(m[0].length);
          ok = true;
          break;
        }
      }
      if ( !ok ) {
        console.log("Symbol not found: ", _str[0]);
        break;
      }
    }

    return res[0];
  }
}