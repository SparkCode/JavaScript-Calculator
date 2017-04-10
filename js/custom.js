function HistoryInput(element) {
    Object.defineProperty(this, "currentMathExpression", {get: function () {
        return element.innerText.toString();
    }, set: function (val) {
        element.innerText = val;
    }});

    this.deleteAll = function () {
        this.currentMathExpression = "";
    };

    this.addOperation =  function (numb, op){
        this.currentMathExpression += " " + numb + " " + op;
    };

    this.changeLastOperation = function (op) {
        var char = this.currentMathExpression.slice(-1);
        if (char.search(/\d/) === -1)
            this.currentMathExpression = this.currentMathExpression.slice(0, -1) + op;
    };
}

function CurrentInput(element) {
    var currentTyping = "0";

    Object.defineProperty(this, "currentTyping", {get: function () {
        return currentTyping;
    }, set: function (value) {
        this.isTempResult = false;
        currentTyping = value;
        element.innerText = value;
    }});

    Object.defineProperty(this, "currentTempResult", {set: function (value) {
        this.isTempResult = true;
        element.innerText = value;
    }, get: function () {
        return element.innerText;
    }});

    this.addDigit = function (digit) {
        this.currentTyping = this.currentTyping === "0" ? digit :  this.currentTyping + digit;
    };

    this.changeSign = function () {
        this.currentTyping = this.isTempResult ? this.currentTempResult * -1 : this.currentTyping * -1;
    };

    this.addPoint = function () {
        if (this.currentTyping.indexOf('.') === -1)
            this.currentTyping += ".";
    };

    this.deleteAll = function () {
        this.currentTyping = "0";
    };

    this.deleteChar = function () {
        if (this.currentTyping === "0")
            return;
        if (this.currentTyping.length === 1)
            this.currentTyping = "0";
        else
            this.currentTyping = this.currentTyping.slice(0, -1);
    };

    this.getNumber =function () {
        return this.currentTyping;
    };

    this.showTempResult = function (numb) {
        this.currentTyping = "0";
        this.currentTempResult = numb;
    };

    this.showResult = function (numb) {
        this.currentTyping = numb;
    }
}

function CustomMath(value, op) {
    var operations =
        {'division': function (a, b) {return a / b;},
            'multiplication': function (a,b) {return a*b},
            'subtraction': function (a,b) {return a-b},
            'addition': function (a,b) {return a+b}};

    var res = +value;
    var prevOp = op;

    this.changeOperation = function (op) {
        prevOp = op;
    };

    this.makeOperation = function (nameOp, numb) {
        console.log(res);
        res = operations[prevOp](res, +numb);
        prevOp = nameOp;
        return res;
    }
}

function Calculator(inputElement, memoryElement) {
    var input = new CurrentInput(inputElement);
    var memory = new HistoryInput(memoryElement);
    var result;

    this.addDigit = input.addDigit.bind(input);
    this.deleteChar = input.deleteChar.bind(input);
    this.changeSign = input.changeSign.bind(input);
    this.addPoint = input.addPoint.bind(input);
    this.deleteChar = input.deleteChar.bind(input);
    this.deleteInputAll = input.deleteAll.bind(input);

    this.deleteAll = function () {
        input.deleteAll();
        memory.deleteAll();
        result = null;
    };

    this.makeOperation = function (element) {
        var operationName = element.getAttribute("data-value");
        var operationIcon = element.innerHTML;

        if (input.isTempResult === true)
        {
            memory.changeLastOperation(operationIcon);
            result.changeOperation(operationName);
            return;
        }

        var currTypingNumber = input.getNumber();

        memory.addOperation(currTypingNumber, operationIcon);

        if (!result)
        {
            result = new CustomMath(currTypingNumber, operationName);
            input.showTempResult(currTypingNumber);
        }
        else
        {
            var currRes = result.makeOperation(operationName, currTypingNumber);
            input.showTempResult(currRes);
        }
    };

    this.makeResult = function () {
        if (result === null || input.isTempResult === true)
            return;
        var currTypingNumber = input.getNumber();
        var currRes = result.makeOperation("", currTypingNumber);
        input.showResult(currRes);
        memory.deleteAll();
        result = null;
    }
}

$(document).ready(function () {
    var calc = new Calculator($("#curr-number").first()[0], $("#history").first()[0]);

    $("[data-operation-name='digit-adding']").click(function () {
        var digit = this.innerHTML;
        calc.addDigit(digit);
    });

    $("[data-operation-name='char-deleter']").click(function () {
        calc.deleteChar();
    });

    $("[data-operation-name='sign-changer']").click(function () {
        calc.changeSign();
    });

    $("[data-operation-name='point-adder']").click(function () {
        calc.addPoint();
    });

    $("[data-operation-name='input-char-deleter']").click(function () {
        calc.deleteChar();
    });

    $("[data-operation-name='input-deleter']").click(function () {
        calc.deleteInputAll();
    });

    $("[data-operation-name='input-and-memory-deleter']").click(function () {
        calc.deleteAll();
    });

    $("[data-operation-name='operation']").click(function () {
        calc.makeOperation(this);
    });

    $("[data-operation-name='result-getter']").click(function () {
        calc.makeResult();
    });
});