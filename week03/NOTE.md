## 运算符和表达式

### 概览

**Atom：**

- **Grammar（语法）**
  - Grammar Tree vs Priority :  语法树 vs 优先级
  - Left hand side & Right hand side ：运算符的左值和右值

- **Runtime（运行时）**
  - Type Convertion ：类型转换
  - Reference ：引用类型

### Grammar

#### Tree vs priority

- \+ -：会形成更高一级的语法结构
- \* /：比加减优先级高，会优先形成更小一级的语法结构
- ( )：比乘除优先级更高
- 在整个JavaScript标准中，是用产生式来描述优先级的

### Expressions Priority

表达式的优先级从上到下依次降低：

- Member|New Expressions：成员表达式和New表达式
- Reference：引用类型
- Call Expressions：函数调用表达式
- Left Handside & Right Handside Expressions：左值和右值表达式
- Unary Expressions：单目运算表达式
- Exponental Expressions：指数表达式
- Multiplicative|Additive|Shift|Relationship Expressions：乘除|加减|移位|关系比较 表达式
- Equality|Bitwise Expressions：相等|按位 表达式
- Logical|Conditional Expressions：逻辑|条件(三目运算) 表达式

#### Member|New Expressions（成员|New 表达式）

- Member：运算符优先级最高的表达式

  - a.b
  - a[b]
  - foo\`string`

  - super.b
  - super['b']
  - new.target
  - new Foo()
    - 例如：**new a()()**，因为new a()属于Member表达式，优先级更高，所以结合顺序为(**new a()**)**()**

- New

  - new Foo：JavaScript语言设计中，new后面构造函数的括号是可以省略的，虽然可以省略但是与带括号的表达的意思相同，注意，优先级是不同的，new Foo不带括号的写法不属于Member表达式，所以优先级更低。
    - 例如：**new new a()**，同理new a()属于Member表达式，优先级更高，所以结合顺序为 **new** (**new a()**)

#### Reference（引用类型）

引用类型属于运行时的一个设施，当使用a.b去访问一个属性，从属性中取出来的不是属性的值，而是一个引用。引用类型并非JavaScript的7种基本类型之一，但是引用类型也是确实存在于运行时中的一个JavaScript的类型，这种把它称作标准中的类型，而不是语言中的类型。一个引用类型分为两个部分：

- 第一个部分是一个Object，就是JavaScript对象（Object）
- 第二个部分是一个key，key可以是String，也可以是Symbol

一个引用类型取出来的是一个Object和一个key，完全的记录了Member运算的前半部分和后半部分。如果做加法或者减法的运算，就会把Reference直接解引用，然后像普通的变量一样去使用。

- delete：当把Member表达式放在delete之后，需要用到引用的特性，因为需要知道删除的是哪一个对象的哪一个key

- assign：赋值运算，当把Member表达式放在一个等号的左边（加等于、减等于、乘等于、除等于这类的运算都属于assign运算），需要知道把右边的表达式赋值给哪一个对象的哪一个属性。

JavaScript语言就是用引用类型在运行时来处理，删除或者是赋值这样的写相关的操作。

#### Call Expression （函数调用表达式）

Call Expression就是函数调用，是一个统称，最基础的Call Expression就是一个函数后面跟了一对圆括号，Call Expression的优先级低于New，同时也低于前面的所有的Member运算。

- Call
  - foo()
  - super()
  - foo()['b']
  - foo().b
  - foo()\`abc`

但是如果在圆括号之后如果加上取属性，比如说方括号[]，不如说 .b 又比如说反引号``，那么它会让表达式降级为Call Expression，也就是后面的点运算的优先级降低了。语法结构能够表达的内容是要多于运算符优先级所能表达的像这种点运算，本身就可以有不同的优先级，它是它前面的语法结构来决定自己的优先级。带圆括号的属性的优先级就比不带圆括号的要低两级，有的时候用优先级来解释运算符其实并不是一个非常严谨的一种说法。真正严谨的还是使用产生式，一级一级的语法结构来描述运算的优先顺序。

例如: **new a()['b']**，执行顺序为 (**new a()**)**['b']**，原因式 new a() 属于Member Expression优先级最高，而**['b']**位于圆括号之后，因此被Call Expression拉低了优先级，执行顺序为先把 **a()**赋给**new**，生成的实例对象在和**['b']**结合。

这个部分可以理解为：call、new和Member这三个其实原本应该是级别差不多的，是因为要处理new的后面的圆括号跟谁结合的问题，所以才产生了三个不同的表达式的优先级。

#### Left Handside & Right Handside Expressions（左值表达式和右值表达式）

- a.b = c;     可以这样写
- a + b = c；  不可以这样写

原因是a.b是一个Left Handside Expression（左值表达式），a+b是Right Handside Expression（右值表达式），只有左值表达式才有资格放到等号的左边，这个是各种编程语言都会使用的一个概念。所以在JavaScript里面其实并不会定义所谓的Right Handside Expression，因为所有的 Expression 默认它只要不属于Left Handside，它就一定属于Right Handside。

不能放到等号左边的Expression，从Update Expression这一级开始，它就已经是Right Handside Expression了，可以认为Left Handside Expression几乎一定是Right Handside Expression，在JavaScript里面没有例外，在大部分语言里面也没有例外

- Update
  - a++
  - a--
  - --a
  - ++a

#### Unary Expressions(单目运算符)

- Unary
  - delete a.b
  - void foo()
  - typeof a
  - \+ a
  - \- a
  - \~ a
  - \! a
  - await a

#### Exponental Expressions(指数表达式)

指数表达式是JavaScript的唯一一个右结合的运算符

- Exponental
  - **
    - 3\*\*2*\*3 先算2的3次方等于8，再算3的8次方。

大部分运算符都是左结合，唯有**是右结合的。这个让JavaScript的表达式变得非常的复杂，如果要做语法解析，这个结构也是非常难处理的一个结构

#### Multiplicative | Additive | Shift | Relationship Expressions（四则运算|移位运算|关系比较 表达式）

- Multiplicative
  - \* / %
  - 乘除运算要求所有参与运算的类型必须为Number类型，所以如果参与运算的类型不是Number类型，会发生类型转换。
- Additive
  - \+、 -
  - 在JavaScript里面有两种加法，第一种是把两个字符串连接起来，第二种是把两个数字相加。所以加号的类型转换是比较复杂的。
- Shift（移位运算表达式）
  - <<、>>、>>>
- Relationship（关系比较表达式）
  - <、>、<=、>=、instanceof、in

#### Equality | Bitwise Expressions（相等|位运算 表达式）

- Equality
  - == （不建议使用）
  - !=
  - ===
  - !==
- Bitwise（位运算）
  - &、^、|

#### Logical | Conditional Expressions（逻辑|条件 表达式）

- Logical
  - &&
  - ||
  - 逻辑运算有一个叫做短路原则，具体为如果&&的前面的部分得到的结果是false的话，那么后边的部分的表达式根本就不会被执行。||的前面的部分得到的结果是true，那么后面就不会被执行。所以说&&和||有时候会被用来代替if
- Conditional
  - ? :
  - JavaScript中的三目运算符于C语言不同，有短路机制，即如果?前面为true，：后面是不执行的。



## 类型转换

### Type Covertion

- Number转其他类型：
  - String：——
  - Boolean：0—>false, 1与其他数字—>true
  - Object：装箱转换
- String转其他类型：
  - Number：——
  - Boolean："" —>false，其他字符串 —> true
- Boolean转其他类型：
  - Number：true —> 1，false —> 0
  - String：true —> "true", fasle —> "false"
  - Object：装箱转换
- Undefined转其他类型：
  - Number：NaN（not a number）
  - String："Undefined"
  - Boolean: false
- Null转其他类型：
  - Number：0
  - String："Null"
  - Boolean：false
- Object转其他类型：
  - Number：拆箱转换
  - String：拆箱转换
  - Boolean：true
- Symbol变量无法转换乘任何的其他的变量，它只能通过装箱转换成Object

### 拆箱转换

拆箱转换是指把一个Object对象转换为一个普通的基本类型。

**ToPrimitive：**ToPremitive发生在Object参与运算的方方面面。一个对象中有三个方法的定义会影响ToPrimitive。分别为：

- toString方法
- valueOf方法
- Symbol的ToPrimitive

ToPrimitive的调用规则及顺序如下：

- 首先检查对象中是否有用户显式定义的[Symbol.toPrimitive]方法，如果有，直接调用，然后忽略toString和valueOf。
- 如果没有[Symbol.toPrimitive]，则执行原内部函数ToPrimitive，然后判断传入的hint值，如果其值为string，先调用toString方法，如果toString方法返回一个基本类型值，则把该基本类型值返回，然后终止运算。否则继续调用valueOf方法
- 如果判断传入的hint值不为string，则就可能为number或者default，这两种情况都会先调用valueOf方法，如果valueOf方法返回一个基本类型值，则把该基本类型值返回，然后终止运算。否则继续调用toString方法。
- 如果对象作为其他对象的属性，总会优先调用它的toString方法

例如：

- 第一种情况：

  ```javascript
  var o = {
  	valueOf: () => {console.log("valueOf");return {}},
  	toString: () => {console.log("toString");return {}}
  }
  o[Symbol.toPrimitive] = () => {console.log("toPrimitive"); return "hello"}
  
  console.log(o + "");
  //toPrimitive
  //hello
  ```

- 第二种情况：

  ```javascript
  //返回基本类型值得情况
  var o = {
  	valueOf:()=>{console.log("valueOf");return 1},
  	toString:()=>{console.log("toString");return '2'}
  }
  
  String(o);
  //toString
  //2
  ```

  ```javascript
  //返回非基本类型值得情况
  var o = {
  	valueOf:()=>{console.log("valueOf");return 1},
  	toString:()=>{console.log("toString");return {}}
  }
  
  String(o);
  //toString
  //valueOf 
  //1     
  ```

- 第三种情况：

  ```javascript
  //返回基本类型值得情况
  var o = {
  	valueOf:()=>{console.log("valueOf");return 1},
  	toString:()=>{console.log("toString");return '2'}
  }
  
  o + 1;
  //valueOf
  //2
  ```

  ```javascript
  //返回非基本类型值得情况
  var o = {
  	valueOf:()=>{console.log("valueOf");return {}},
  	toString:()=>{console.log("toString");return "2" }
  }
  
  o + 1;
  //valueOf
  //toString 
  //21     
  ```

- 第四种情况：

  ```javascript
  var o = {
      toString() {
          console.log("toString")
          return "2"
      },
      valueOf() {
          console.log("valueOf")
          return 1
      }
  }
  
  var x = {}
  x[o] = 1
  //toString
  ```

### 装箱转换

装箱转换就是把其他基本数据类型转换为Object类型，Object对每个基础类型都提供了一个包装的类（Undefined和Null除外），比如说Number就是一个构造器名为Number，这个Number既可以使用new去调用，又可以直接调用，如果直接调用Number，就会返回一个值。如果使用new去调用它就会返回一个Object，这个时候就称为这个Number对象和这个值1它存在着一个装箱关系。String和Boolean同理。需要注意的是Symbol构造器，它是没有办法被new调用的，所以要想创建一个Symbol对象还需要用Object构造器给它再包一层，只能通过调用Symbol来获得一个Symbol类型的值，但是加了new就会抛错。如下：

| 类型    | 对象                    | 值          |
| ------- | ----------------------- | :---------- |
| Number  | new Number(1)           | 1           |
| String  | new String("a")         | "a"         |
| Boolean | new Boolean(false)      | false       |
| Symbol  | new Object(Symbol("a")) | Symbol("a") |

当使用Member，也就是使用点或者方括号去访问属性的时候，如果点和方括号之前的变量或者是表达式得到的是一个基础类型，那么就会自动调用装箱的过程，不需要再去调用标准里面规定的Number、String、Boolean这些构造器，所以会看到一个现象，就是在Number这个Class上定义了什么样的值，那么正常的Number类型的值也可以通过点运算去访问。

**可以通过typeof去判断具体是包装后的对象还是包装前的值**

## 运行时相关概念

### 大纲

#### Grammar

- 简单语句
- 组合语句
- 声明

#### Runtime

- Completion Record
- Lexical Environment

### Completion Record（完成记录）

**Completion Record类型：**用于存储语句完成的结果的一种数据结构,用于描述异常、跳出等语句执行过程，它不在javascript语言的基本类型里面，是因为在JavaScirpt里面无论如何努力都没办法真正的访问到这个数据，它没有办法赋值给变量，也没有办法作为参数，在任何环节都没有办法得到它。但是它有确确实实存在，每写一个语句由JavaScript引擎区执行之后，就会产生Completion Record这样的东西。

**Completion Record组成：**

-  **[[type]]：**表示完成的类型，有normal，break，continue，return，和throw几种类型。
- **[[value]]：**表示语句的返回值，如果语句没有，则是empty。
- **[[target]]：**表示语句的目标，通常是一个JavaScript标签（label）

JavaScript正是依靠语句的Completion Record类型，方才可以在语句的复杂嵌套结构中，实现各种控制。

**Completion Record类型的控制过程：**

- 普通语句执行后，会得到[[type]]为normal的Completion Record，JavaScript引擎遇到这样的Completion Record会继续执行下一条语句。
- 这些语句中，只有表达式语句会产生[[value]]，当然，从引擎控制的角度，这个value并没有什么用处。
- 对于语句块来说，语句块内部的语句的Completion Record的[[type]]如果不为normal，会打断语句块后续的语句执行。
  - return语句可能产生[[type]]为return或者throw类型的Completion Record。
  - break/continue语句如果后跟了关键字，会产生带[[target]]的完成记录，一旦完成记录带了target，那么只有拥有对应label的循环语句会消费它。

### 简单语句

**简单语句**指里面不会再容纳其他语句的这种语句。

- ExpressionStatement：表达式语句，这是简单语句里最基本的一个类型。在语句中只有表达式语句完全由表达式组成，因为表达式里存在着等号赋值的可能性，所以简单语句里面就有可能使用Expresstion来单独的成一个语句，一个简单的表达式后面接一个分号就是一个简单语句了
- EmptyStatement：空语句，单独的一个分号，就是一个空语句，基本上没什么作用
- DebuggerStatement：Debugger语句，由debugger加一个分号构成，debugger语句是一种专门做调试的时候使用的语句，他在实际的用户电脑上运行的时候是不会发生任何作用的。基本用法是，触发一个debugger的一个断点。一般在真正编写的代码中往往会在上线前把debugger语句全都移除
- ThrowStatement：抛出异常语句，它会抛出一个异常，当然除了ThrowStatement外还有其他方法可以抛出异常，但是如果不是想让它真的发生个错误，是可以主动在代码里面用throw加空格接一个表达式，然后来抛出这样的一个异常的
- ContinueStatement和BreakStatement：这两个语句与循环语句相匹配，continue表示结束当次循环，后面的循环继续。break表示结束整个循环，相当于循环条件被破坏了
- ReturnStatement：这个语句一定得在函数中去使用，他会返回一个函数的值

从上面可以看出，其实所有的简单语句里面最核心的就是ExpressionStatement了，它是真正的驱动计算机去进行计算的一种语句，然后剩下的throw、continue、break、return其实全是流程控制语句。所以说其实整个JavaScript语言其实也就是让计算机完成计算，然后完成一定的流程控制的作用

### 复合语句

- BlockStatement：这个是最重要的语句，它是一对花括号中间一个语句的列表，它能够把所有需要单条语句的地方都变成可以用多一条语句，这是非常重要的，是完成语句的树状结构的重要的基础设施。
- IfStatement：条件语句，这是一个分支结构
- SwitchStatement：多分支的结构，不太建议在JavaScript中使用，它在C++或者C里面的性能是会比连续的if要高的，但在JavaScript中肯定是没有区别的。而且它特别容易写错，每一个case后面都要写一个break，而如果写错了就会出一定的问题，所以建议在JavaScript中用多个if else这样的结构去代替switch。
- IterationStatement：循环语句，它不是一个语句，由一大堆，比如while循环、do-while循环、for循环、for await循环
- WithStatement：这是一个广受诟病的一个表达式，它可以通过with打开一个对象，然后把这个对象的所有的属性直接放进作用域里面去，这个在写法上是可以节约一些空间，也可以节约一些记忆的成本，但是它本身带来的不确定性非常的高，所以说在一般的现代的JavaScript的编程规范里面都是拒绝使用with的
- LabelledStatement：这个语句就是在简单的语句前面加上一个label组成，当然也可以在复合语句的前面加上一个label，相当于给语句取了一个名字，所以这个语句其实是可以给任何语句用的，但是其实真正有效的地方在于配合iterationStatement然后再配合break、continue这种后面带label的语句才会产生意义。
- TryStatement：TryStatement是一个三段结构，它包含了try catch和finally三个结构，需要注意在try这个里面其实不是BlockStatement，它的这个花括号是由try语句去定义的，所以try是不能省略花括号的，省略后会抛错

#### statement

- BlockStatement

  block是一个可以容纳多个语句的代码块。

  **Completion Record表示：**

  - [[type]]：normal
  - [[value]]：--
  - [[target]]：--

  它的type是normal，value和target不明，如果里面有break continue这种东西，它的type也随时可以变成相应的值，

- IterationStatement

  - while(){};
  - do{}while();
  - for( ; ; ){};
  - for( in ){};
  - for( of ){};
  - for await( of ){};   这个是for of中带await的一个版本，对应的就是Async Generator

- 标签、循环、break、continue

  - LabelledStatement
  - IterationStatement
  - ContinueStatement
  - BreakStatement
  - SwitchStatement

  **Completion Record表示：**

  - [[type]]：break continue
  - [[value]]：--
  - [[target]]：label

- try

  ```javascript
  try {
  
  } catch() {
  
  } finally {
  
  }
  
  //注意：即使在try里面使用的return语句，finally依旧还是会执行的。
  ```

  **Completion Record表示：**

  - [[type]]：return
  - [[value]]：--
  - [[target]]：label

### 声明

在JavaScript语法树里声明的定义不是特别统一，一般来说认为是声明的变量声明也会被归类到语句里面去，然后看语法会发现有一堆的函数声明，const 和 let 被归为 LexicalDeclaration。（以下声明的划分是概念上的，于JavaScript标准中的定义不是特别统一）

- FunctionDeclaration：函数声明，有以下四种
  - function：普通函数声明
  - function *：Generator声明
  - async function：异步函数声明
  - async function *：异步的产生器声明
- GeneratorDeclaration
- AsyncFunctionDeclaration
- AsyncGeneratorDeclaration
- VariableStatement：变量声明，既有声明的作用，又有实际的执行计算的能力
  - var
- ClassDeclaration：类声明
  - class
- LexicalDeclaration
  - let
  - const

**作用范围只认Function Body的声明：**

- function
- function *
- async function
- async function *
- var

以上声明的作用域范围只认Function Body，其他都不好使，而且它是没有先后关系的，它们永远会被当作出现在函数的第一行一样去处理，所以在函数体里面最靠后的部分声明一个局部的Function，在前面一样可以访问到这个Function。var比较特殊，var的声明作用是相当于出现在函数的头部，但是它实际上后面的表达式，如果写var a = 1，这个变量已经被声明为了一个函数级的局部变量，但是它后面的一个赋值并没有发生，这是它跟Function声明的一个区别

**声明之前无法使用的声明：**

- class
- const
- let

以上声明，当在声明之前使用的时候就会报错，注意这个并不是说他们的声明没有作用，比如说在外面声明了一个class a，在函数里面又声明了一个class a，这个时候在函数里面的class a的声明之前访问这个a，就会抛错。const和let也一样，它实际上也是有一个预处理的能力的。

### 预处理（pre-process）

所谓预处理是指在一段代码执行之前，JavaScript引擎会对代码本身做一次预先处理，这样的一种机制叫做预处理机制。

**例一：**

```javascript
var a = 2;
void function(){
	a = 1;
	return;
	var a;
}();
console.log(a);//2
```

**分析：**理论上讲，在void function中，var a; 在 return; 之后，所以它并不会被执行到，但是预处理是不管这些的，它会提前去找到所有的var声明的变量，并且让它去生效。所以void function中的 a = 1 确确实实的被声明到了这个function的作用域中。因此执行这段代码，打印出来的结果是2。也就是这个a=1并没有改变外面的var a = 2的这个a，它被里面的var a给占据了，这就是所谓的预处理机制造成的代码的一个执行的效果。

**特别注意：**var不管写在函数里面的哪个位置，不管是写在if里面还是写在return之后，甚至写在catch里面finally里面，都没有任何区别，都会被预处理挑出来，把这个变量声明到这个函数的作用级别。

**例二：**

```javascript
var a = 2;
void function(){
	a = 1;
	return;
	const a;
}();
console.log(a);
```

**分析：**当把例一中void function中的var a换成const a的时候，会发现这个变量a成为了一个局部的变量，它还是会执行抛错但是它其实并没有影响到外面的变量a，也就是说如果给这个函数的外面套一个try-catch的话最后会发现打印出来的结果仍然是2。

通过上面两个例子，需要知道：

- 所有的声明都是有预处理机制的，它都能够把变量变成一个局部变量，区别是const和let声明在声明之前使用的话会抛错，而且这个错误是可以被try-catch去处理的。

### 作用域

var的作用域是它所在的函数体里，const和let的作用域在它所在的花括号里

## 宏任务和微任务

### JS执行粒度（运行时）

- 宏任务：传给JavaScript引擎的任务，是JavaScript语言讨论的最大粒度的范围
- 微任务（Promise）：在JavaScript引擎内部的任务，是一个由Promise来产生的任务，在JavaScript中只有Promise会产生微任务
- 函数调用（Execution Context）
- 语句/声明（Completion Record）
- 表达式（Reference）
- 直接量/变量/this ......

 #### 事件循环

事件循环掰开说其实它只有三个部分：

- 获取一段代码
- 执行这段代码
- 等待

## JS函数调用

函数调用本身会形成一个栈式（stack）结构，它能访问的变量其实也可以用一个stack去描述，每一个stack里所保存的东西称为Execution Context（执行上下文），也就是说执行一个语句的时候，所需要的所有的信息都会保存在这个Execution Context里面，保存Execution Context的这个数据结构就称为Execution Context stack（执行上下文栈），当执行到当前语句的时候，这个栈有一个栈顶元素，这个栈顶元素就是当前能访问到的所有的变量，这些变量有一个特殊的名字叫做Running Execution Context，代码里面所需要的一切信息都会从Running Execution Context里面去取回来。

### Execution Context

Execution Context里面简单来说有七个部分：

- code evaluation state：这个是用于async和generator函数的，它是一个代码执行到了哪儿的这样的一个保存的信息
- Function：由function来初始化的一个Execution Context会有这一项。
- Script or Module：要么有Script，要么有Module，在script或module中的代码就会有这个部分
- Generator：只有Generator函数会有这个，这个并不是Generator函数，它是Generator函数每次执行所生成的隐藏在背后的Generator，也就是说只有Generator函数创建的执行上下文会有Generator字段
- Realm：保存所有使用的内置对象的这样的一个王国或者领域
- LexicalEnvironment：表示我们执行代码中所需要访问的环境，也就是保存变量的作用
  - this
  - new.target
  - super
  - 变量
- VariableEnvironment：决定了用var去声明变量，它会声明到哪的环境，这个是一个历史的遗留包袱，仅仅用于处理var声明，var是会在函数的body被预处理的时候就把var声明都给处理掉了，但是var声明如果出现在eval里面，就没有办法通过预处理去识别它，那么专门给eval加var这个去进行处理。所以说多数时候VariableEnvironment和LexicalEnvironment它俩是重合的。 

没有任何一个Execution Context是完全包含这七部分的，**可以分为以下两个种类：**

- ECMAScript Code Execution Context
  - code evaluation state
  - Function
  - Script or Module
  - Realm
  - LexicalEnvironment
  - VariableEnvironment
- Generator Execution Contexts
  - code evaluation state
  - Function
  - Script or Module
  - Realm
  - LexicalEnvironment：
  - VariableEnvironment
  - Generator

### Environment Record

environment并不是一个单纯的结构，它会形成一个链式结构，这个链式结构里面的每一个节点，把它称作一个**Environment Record**，Environment Record又有一个继承关系，它是一个家族，如下：

- Environment Records
  - Declarative Environment Records
    - Function Environment Records
    - module Environment Records
  - Global Environment Records
  - Object Environment Records

### Function - Closure

在JavaScript中每一个函数都会生成一个闭包，根据闭包的经典定义，闭包是分成了两个部分，其中包含代码部分和环境部分。环境部分由一个object和一个变量的序列来组成的，在JavaScript里面，每一个函数都会带一个它定义时所在的Environment Records，它会把这个Environment Records保存到自己的函数对象身上，变成一个属性。代码部分，每个函数有自己的code

### Realm

在JS中，函数表达式和对象直接量均会创建对象。使用 `.`做隐式转换也会创建对象。这些对象也是有原型的，如果没有Realm，就不知道它们的原型是什么。

规定在一个JavaScript引擎的实例里面，它所有的内置对象会被放进一个Realm里面去，在不同的Realm实例之间它们是完全互相独立的，所以说也就意味着用instanceo有可能会失效。有了Realm之后就可以去执行这些对应的表达式，去描述他们的行为了，而Realm这个东西它是会根据一些外部的条件去创建不同Realm，JavaScript中没有规定什么时候会创建Realm，不同的Realm之间也可以互相传递对象但是传递过来之后，它的Prototype是不一致的



在计算它之前，所有ECMAScript代码必须与一个域相关联。从概念上讲，领域由一组内在对象、一个ECMAScript全局环境、在该全局环境范围内加载的所有ECMAScript代码以及其他相关状态和资源组成。

