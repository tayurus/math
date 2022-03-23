function calc(expression) {
  const notDigitReg = /[^0-9]/i;

  // функция разбивает мат выражение на массив операндов и операторов
  const splitToExpressionArr = (expression) =>
    expression.split(/([*/+\-])/g).filter((it) => Boolean(it));

  const isOperation = (symbol) =>
    /[+\-/*]/.test(symbol) && typeof symbol === "string";

  // функция удаляет два подряд идущих математических знака
  const removeTwoOperators = (expressionArr) => {
    // если в массиве два элемента, и первый это +, то просто удаляем плюс и возвращаем массив
    if (expressionArr.length === 2 && expressionArr[0] === "+") {
      return [expressionArr[1]];
    }

    // expression = expression.replace(/--/g, '+');
    //если идет два знака подряд, причем второй - это минус, меняем знак следующему операнду на минус
    for (let i = 0; i < expressionArr.length - 1; i++) {
      if (isOperation(expressionArr[i]) && expressionArr[i + 1] === "-") {
        expressionArr[i + 2] = +expressionArr[i + 2] * -1;
        expressionArr.splice(i + 1, 1);
        i--;
      } else if (
        isOperation(expressionArr[i]) &&
        expressionArr[i + 1] === "+"
      ) {
        expressionArr[i + 2] = +expressionArr[i + 2];
        expressionArr.splice(i + 1, 1);
        i--;
      }
    }
    return expressionArr;
  };

  // функция решения мат. выражения
  const calcMathExpression = (expression) => {
    // удаляем все пробелы
    expression = expression.replace(/\s/g, "");

    // заменяем все двойные минусы на плюс
    expression = expression.replace(/--/g, "+");

    // разбиваем на операнды и операции по символам */-+
    let expressionArr = removeTwoOperators(splitToExpressionArr(expression));

    if (expressionArr[0] === "-") {
      expressionArr[1] = -1 * expressionArr[1];
      expressionArr.splice(0, 1);
    }

    // совершаем математические операции
    // идем по массиву
    for (let i = 0; i < expressionArr.length; i++) {
      // выполняем мат. операции только для умножения и деления
      if (/[*/]/g.test(expressionArr[i])) {
        expressionArr = calcOperation(expressionArr[i], expressionArr, i, "*/");
        i -= 1;
      }
    }
    // идем по массиву
    for (let i = 0; i < expressionArr.length; i++) {
      // выполняем все мат. операции
      if (isOperation(expressionArr[i])) {
        expressionArr = calcOperation(expressionArr[i], expressionArr, i);
        i -= 1;
      }
    }

    // возвращаем результат
    return expressionArr[0];
  };

  function remove_x_symbol(str, x) {
    return str.replaceAll(x, "");
  }

  // функция решение мат. операции
  const calcOperation = (
    symbol,
    expressionParts,
    index,
    allowedOperations = "*/+-"
  ) => {
    console.log("symbol = ", symbol);
    console.log("expressionParts = ", expressionParts);
    console.log("expressionParts = ", expressionParts);
    // если в symbol не мат.операция
    if (!isOperation(symbol)) {
      // возвращаем исходный массив
      return expressionParts;
    }

    const firstArg = expressionParts[index - 1];
    const secondArg = expressionParts[index + 1];

    // результат
    let res = symbol;

    // флаг, что мат операция была произведена
    let calculated = false;

    // имееются ли x,y,z и т.д в аргументах
    const firstArgHasX = notDigitReg.test(firstArg);
    const secondArgHasX = notDigitReg.test(secondArg);

    // извлечение x,y,z из аргументов
    const firstArgXSymbol = firstArgHasX ? notDigitReg.exec(firstArg)[0] : null;
    const secondArgXSymbol = secondArgHasX
      ? notDigitReg.exec(secondArg)[0]
      : null;

    const firstArgAsNumber = remove_x_symbol(firstArg, firstArgXSymbol);
    const secondArgAsNumber = remove_x_symbol(secondArg, secondArgXSymbol);

    // равны ли эти символы
    const xSymbolsEqual = firstArgXSymbol === secondArgXSymbol;

    // если умножение
    if (symbol === "*" && allowedOperations.includes(symbol)) {
      res = +firstArg * +secondArg;
      calculated = true;
    }

    // если деление
    if (symbol === "/" && allowedOperations.includes(symbol)) {
      res = +firstArg / +secondArg;
      calculated = true;
    }

    // если суммирование
    if (symbol === "+" && allowedOperations.includes(symbol)) {
      if (
        (firstArgHasX && secondArgHasX && xSymbolsEqual) ||
        (!firstArgHasX && !secondArgHasX)
      ) {
        res = +firstArgAsNumber + +secondArgAsNumber + firstArgXSymbol;
        calculated = true;
      }
    }

    // если вычитание
    if (symbol === "-" && allowedOperations.includes(symbol)) {
      res = +firstArg - +secondArg;
      calculated = true;
    }

    if (calculated) {
      // схлопываем исходный массив
      // заменяем symbol на результат
      expressionParts[index] = res;
      // удаляем элемент массива слева от symbol
      expressionParts.splice(index - 1, 1);
      // удаляем элемент массива справа от symbol
      expressionParts.splice(index, 1);
    }

    // возвращаем измененный массив
    return expressionParts;
  };

  let openBracketPos = 0;
  // идем по выражению
  for (let i = 0; i < expression.length; i++) {
    // если видим открывающуюся скобочку
    if (expression[i] === "(") {
      // запоминаем ее позицию
      openBracketPos = i;
    }

    // если видим закрывающуюся скобочку
    if (expression[i] === ")") {
      // вычленяем выражение между ними
      let subExpression = expression.slice(openBracketPos + 1, i);
      // вычисляем выражение
      let expressionValue = calcMathExpression(subExpression);

      // заменяем содержимое скобочек на значение выражения
      expression = expression.replace(`(${subExpression})`, expressionValue);

      // сбрасываем переменную цикла в -1
      i = -1;
    }
  }

  return calcMathExpression(expression);
}
