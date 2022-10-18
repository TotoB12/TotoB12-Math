const form = document.querySelector("form");
const result = document.querySelector("p");

form.addEventListener("submit", handleSubmit);

function handleSubmit(e) {
  e.preventDefault();

  let expression = e.target.expression.value.trim();

  // The expression is solved following BODMAS rule
  // Finds expression inside brackets like, (5+ 6 / 7)
  const bracketRegex = /\([0-9+-/*^ ]+\)/;

  // Check if the expression contains any brackets
  if (bracketRegex.test(expression)) {
    // All the expressions inside the brackets are solved
    expression.match(new RegExp(bracketRegex, "g")).forEach((rawExp) => {
      const solvedExp = solveExpression(rawExp.replace(/[()]/g, ""));
      // The original expression is replaced with result
      expression = expression.replace(rawExp, solvedExp);
    });
  }

  // Solve rest of expression
  expression = solveExpression(expression);

  result.textContent = `Result: ${expression}`;
}

function solveExpression(expression) {
  if (!expression) return 0;

  // Regexes to find basic expressions

  // Find basic expressions like, -4+5, 4-5, -4 + -5
  const addOrSubRegex =
    /([-]?\s*([0-9]+\.?[0-9]*|\.[0-9]+))\s*(\+|-)\s*([-]?\s*([0-9]+\.?[0-9]*|\.[0-9]+))/;

  // Regex won't accept if a number has preceding / or *
  // Like 3/ 4 / [4 / 4] , the expression inside bracket is not accepted
  // As expressions should be solved left to right
  // Find basic expressions like, -4/5, 5*-5
  const divideOrMultiplyRegex =
    /(?<![\/|\*]\s*)([-]?\s*([0-9]+\.?[0-9]*|\.[0-9]+))\s*(\/|\*)\s*([-]?\s*([0-9]+\.?[0-9]*|\.[0-9]+))/;

  // Find basic expressions like 5 ^ 3
  const exponentRegex =
    /([0-9]+\.?[0-9]*|\.[0-9]+)\s*(\^)\s*([0-9]+\.?[0-9]*|\.[0-9]+)/;

  // Now expression is solved with priority

  // First all exponents are solved
  if (exponentRegex.test(expression))
    expression = solveOperation(expression, exponentRegex);

  // Then all divisions and multiplications are solved
  if (divideOrMultiplyRegex.test(expression))
    expression = solveOperation(expression, divideOrMultiplyRegex);

  // Lastly all additions and subtractions are solved
  if (addOrSubRegex.test(expression))
    expression = solveOperation(expression, addOrSubRegex);

  // Edge case below
  // I the remaining string is numbers with a space (like 7 8)
  // then it's a remaing expression to be added
  if (/ /g.test(expression)) {
    expression = expression
      .split(" ")
      .reduce((prev, current) => Number(prev) + Number(current), 0);
  }

  return expression;
}

function solveOperation(expression, regex) {
  // Loop over each result and solve them from left to right
  expression.match(new RegExp(regex, "g")).forEach((rawExp) => {
    console.log("Expression", rawExp);
    const exp = rawExp.match(regex);

    // Operation and number are taken based on array length
    // Due different results if the number is negative or not
    const operation = exp.length === 4 ? exp[2] : exp[3];
    let num1 = Number(exp[1].replace(/ /g, "")); // Space between sign and value is removed
    let num2 = exp.length === 4 ? exp[3] : exp[4];
    num2 = Number(num2.replace(/ /g, ""));

    let result;

    switch (operation) {
      case "^": {
        result = Math.pow(num1, num2);
        break;
      }
      case "*": {
        result = num1 * num2;
        break;
      }
      case "/": {
        result = num1 / num2;
        break;
      }
      case "-": {
        result = num1 - num2;
        break;
      }
      case "+": {
        result = num1 + num2;
        break;
      }
    }

    // The original expression is replaced with result
    expression = expression.replace(rawExp, result.toString());
  });

  // If the expression still contains the operation, solve it further
  if (regex.test(expression)) return solveExpression(expression, regex);

  return expression;
}
