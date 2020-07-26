let stack = [{
  type: "document",
  children: []
}]

let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

function emit(token) {
  let top = stack[stack.length - 1]; //先计算好当前数组最下面是什么标签，以在 endTag 做闭合使用
  if (token.type == 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: []
    }
    element.tagName = token.tagName;

    for (let p in token) {
      if (p != "type" && p != "tagName") {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }
    top.children.push(element);
    element.parent = top;

    if (!token.isSelfClosing) {
      stack.push(element);
    }
    currentTextNode = null;

  } else if(token.type == 'endTag'){
    if( top.tagName != token.tagName ){
      throw new Error('Tag start end doesn\'t match!')
    }else{
      stack.pop()
    }
    currentTextNode = null;
  }else if( token.type == 'text' ){
    if( currentTextNode == null ){
      currentTextNode = {
        type:'text',
        content:''
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content;
  }
}

const EOF = Symbol("EOF");//定义一个唯一属性，做为结束使用

/**
 * html Tag 分三种
 * 1、开始标签
 * 2、结束标签
 * 3、自封闭标签
 */

function data(c) {
  //判断开始标签
  if (c == '<') {
    return tagOpen;//返回开始标签状态
  } else if (c == EOF) {// data 最后传入的状态是 == EOF 呢？
    emit({
      type: "EOF"
    })
    return;
  } else {
    emit({
      type: "text",
      content: c
    })
    return data;
  }
}

//处理开始状态的标签
function tagOpen(c) {
  //自结束标签
  if (c == '/') {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "startTag",
      tagName: ""
    }
    return tagName(c);//收集 tagName
  } else {
    return;
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "endTag",
      tagName: ""
    }
    return tagName(c);
  } else if (c == '>') {

  } else if (c == EOF) {

  } else {

  }
}

function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == '/') {
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c;
    return tagName
  } else if (c == '>') {
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == '/' || c == '>' || c == EOF) {
    return afterAttributeName(c)
  } else if (c == '=') {
  } else {
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
    return afterAttributeName(c)
  } else if (c == '=') {
    return beforeAttributeValue;
  } else if (c == '\u0000') {

  } else if (c == '"' || c == '\'' || c == '<') {

  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName
  } else if (c == '/') {
    return selfClosingStartTag
  } else if (c == '=') {
    return beforeAttributeValue
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == EOF) {

  } else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}



//属性 - 取值之前判断是 单引号还是双引号
function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
    return beforeAttributeValue;
  } else if (c == '"') {
    return doubleQuotedAttributeValue;
  } else if (c == '\'') {
    return singleQuotedAttributeValue;
  } else if (c == '>') {

  } else {
    return UnquotedAttributeValue(c)
  }
}

function doubleQuotedAttributeValue(c) {
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue;
  } else if (c == '\u0000') {

  } else if (c == EOF) {

  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue
  }
}

//属性 - 单引号的匹配
function singleQuotedAttributeValue(c) {
  if (c == '\'') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue
  } else if (c == '\u0000') {

  } else if (c == EOF) {

  } else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;//doubleQuotedAttributeValue
  }
}

//属性 - 双引号的 值
function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c == "/") {
    return selfClosingStartTag;
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken)
    return data;
  } else if (c = EOF) {

  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue
  }
}

function UnquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName
  } else if (c == '/') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return UnquotedAttributeValue
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == '\u0000') {

  } else if (c == '\'' || c == '"' || c == '<' || c == '=' || c == '`') {

  } else if (c == EOF) {

  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue
  }
}

function selfClosingStartTag(c) {
  if (c == '>') {
    currentToken.isSelfClosing = true;
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken)
    return data;
  } else if (c == 'EOF') {

  } else {

  }
}


module.exports.parseHTML = function parseHTML(html) {
  let state = data;//默认开始方式为 data
  for (let c of html) {
    state = state(c)
  }
  state = state(EOF);
  return stack[0]
}