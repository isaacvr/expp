/**
 * Simple expression parser
 * 
 * Since is simple, it does not parse expressions with unary
 * operators (-2+3, 2+-1), but it does parse the expression
 * with any parenthesis no matter how deep they are. There's
 * no recursion here, so there's no problem parsing deep nested
 * expresions like 1^(1^(1^(1^(1^(1^(1^(1^(1^(1^(1^(1)))))))))))
 * 
 * The process is splitted in two steps:
 * 1- Convert to postfix notation (2 + 3 to 2 3 +).
 * 2- Evaluate that new expression.
 * 
 * 1-
 * There are two data structures, the operator stack (op) and the result list (res).
 * The conversion follows the next steps:
 *  1.1- If the symbol is a number, push it into the (res).
 *  1.2- If the symbol is an open patenthesis, push it to the (op).
 *  1.3- If the symbol is a closed parenthesis, move all the operators
 *     from (op) to (res) until the top of (op) is an open parenthesis.
 *     DO NOT MOVE THE PARENTHESIS TO RES. JUST TAKE IT OUT FROM (op).
 *  1.4- If the symbol is an operator:
 *    1.4.1- while the operator at the top of (op) has a higher or equal precedence,
 *         move it from the (op) to (res), since it needs to be done first.
 *    - Then push the operator into (op).
 *  
 *  Then, in (res) will be stored the postfix notation.
 * 
 * 2-
 * This step has the (res) and a number stack (num). (res) must only contain
 * numbers and operators (+, -, *, /, ^).
 * 2.1- If the element is a number, push it into (num).
 * 2.2- If the element is an operator, then take b and a from (num) and do: a operator b.
 *    - Push the result of this operation into (num).
 * 
 * At the end of this process, num should store only one result, the result of
 * the expression.
 * 
 * NOTE: In most of the cases, some operators still remaining in (op), so in order to
 * fix that, we need to push an open parenthesis into (op) at the beginning and add a
 * closed parenthesis at the end of the expression. That way, that last parenthesis will
 * take all the remaining operators according to 1.3.
 */

const NUMBER_REG = /^[\d]\.?[\d]?/;
const OPERATOR_REG = /^[\-\+\*\/\(\)\^]/;

export default class SimpleExpp {
  constructor(debug) {
    this.debug = !!debug;
  }

  parse(str) {

    let postfix = this.getRPN(str);
    let result = this.evaluatePostfix(postfix);
    
    return result;

  }

  getRPN(str) {
    let _str = str.replace(/\s/g, '') + ')';
    let op = [ '(' ];  // Operator stack
    let res = []; // Result stack

    for (let i = 0, maxi = _str.length; i < maxi;) {
      let m;
      if ( (m = _str.match(NUMBER_REG)) && m[0].length > 0 ) {
        this.debug && console.log("NUMBER: ", m[0]);

        res.push(+m[0]);
        _str = _str.substr(m[0].length);
        i += m[0].length;
      } else if ( (m = _str.match(OPERATOR_REG)) && m[0].length > 0 ) {
        this.debug && console.log("OPERATOR: ", m[0]);
        if ( m[0] === '(' ) {
          this.debug && console.log('PUSH: ', m[0], op);

          op.unshift(m[0]);
        } else if ( m[0] === ')' ) {
          while( op[0] != '(' ) {
            this.debug && console.log('POP: ', op[0]);

            res.push( op.shift() );
          }
          this.debug && console.log('PUSH: ', op[0]);

          op.shift();
        } else {
          while( this.precedence(m[0]) >= this.precedence( op[0] ) ) {
            
            this.debug && console.log('PREC: ', m[0], op[0], this.precedence(m[0]), this.precedence( op[0] ));

            if ( op.length === 0 ) {
              throw new ReferenceError('Invalid expression' + m + _str);
            }
            res.push( op.shift() );
          }
          op.unshift(m[0]);
        }
        _str = _str.substr(m[0].length);
        i += m[0].length;
      } else {
        throw new TypeError('Unknown token ' + _str[0]);
      }
    }

    return res;
  }

  evaluatePostfix(pos) {
    if ( !Array.isArray(pos) ) {
      throw new TypeError('Postfix notation array expected.');
    }

    let ok = pos.reduce((acc, e) => acc && (typeof(e) === 'number' || OPERATOR_REG.test(e)), true);

    if (!ok) {
      throw new TypeError('Invalid postfix notation array.');
    }

    let res = [];

    for (let i = 0, maxi = pos.length; i < maxi; i += 1) {
      if ( OPERATOR_REG.test(pos[i]) ) {
        if ( res.length < 2 ) {
          throw new ReferenceError(`Operator ${pos[i]} requires two operands.`);
        }

        let b = res.shift();
        let a = res.shift();

        if ( pos[i] === '+' ) {
          res.unshift(a + b);
        } else if ( pos[i] === '-' ) {
          res.unshift(a - b);
        } else if ( pos[i] === '*' ) {
          res.unshift(a * b);
        } else if ( pos[i] === '/' ) {
          res.unshift(a / b);
        } else if ( pos[i] === '^' ) {
          res.unshift(a ** b);
        }

      } else {
        res.unshift(pos[i]);
      }
    }

    return res[0];
  }

  precedence(op) {
    if ( ['(', ')'].indexOf(op) ) {
      return 0;
    } else if ( ['+', '-'].indexOf(op) ) {
      return 1;
    } else if ( ['*', '/'].indexOf(op) ) {
      return 2;
    } else if ( ['^'].indexOf(op) ) {
      return 3;
    }
    return -1;
  }
}