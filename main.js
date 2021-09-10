import './style.css'
import SimpleExpp from './src/SimpleExpp';
// import ExpressionParser from './src/ExpressionParser';

let se = new SimpleExpp(false);

console.log( se.parse('2 + 4 - (1 * 5)') );

/*
let e = new ExpressionParser();

let expr = [
  "1 + 1",
  "-1.2+14.2e-3 + 3 - (2*3)",
  "-1.2+14.2e-3 + 3 - (-2*3)",
  "-2 * -3",
  "(-2)^2",
  "-2^2",
  "-2",
  "(-2)",
  "-(-2)",
  "--2",
  "-+--+-+-2++-+-+-+-1"
];

expr.forEach((ex, i) => console.log( i, ex, e.parse(ex) ));
//*/