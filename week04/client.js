const net = require('net');
const parser = require('./parser.js');

class Request{
    constructor(options){
        this.methods = options.methods || 'GET';
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {};
        this.headers = options.headers || {};

        if( !this.headers['Content-Type'] ){
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if( this.headers['Content-Type'] === 'application/json' ){
            this.bodyText = JSON.stringify(this.body);
        }else if( this.headers['Content-Type'] === 'application/x-www-form-urlencoded'){
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
        }

        this.headers["Content-length"] = this.bodyText.length;

    }
    
    send(connection){
        return new Promise((resolve,reject)=>{
            let parser = new ResponseParser;
            if ( connection ){
                connection.write(this.toString());
            }else{
                connection = net.createConnection({
                    port: this.port,
                    host: this.host
                },()=>{
                    connection.write(this.toString());
                })
            }

            connection.on('data',(data)=>{
                //接收数据
                parser.receive(data.toString());
                console.log(JSON.stringify(data.toString()))
                if( parser.isFinished ){
                    console.log('isFinished true')
                    resolve(parser.response)
                    connection.end();
                }
            })

            connection.on('error',(err)=>{
                reject(err);
                connection.end();
            })

        })
    }

    toString(){
        return `${this.methods} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}:${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`;
    }
}

class ResponseParser {
    constructor() {
        /**
         * \n 是换行，英文是 New line，表示使光标到行首
         * \r 是回车，英文是 Carriage return，表示使光标下移一格
         * \r\n 表示回车换行
         * \n 只是移动到下一行行首，而 \r 是产生回车的
         * \r\n 是两个状态，
         * 所以需要 status_line 和 status_line_end 两个状态
         * 而 header 的状态为：key:value\r
         */

        this.WAITING_STATUS_LINE = 0;//默认起始行
        this.WAITING_STATUS_LINE_END = 1;//起始行结束
        this.WAITING_HEADER_NAME = 2;//头字段名称 key
        this.WAITING_HEADER_SPACE = 3;//头字段分号 ：
        this.WAITING_HEADER_VALUE = 4;//头字段值 Value
        this.WAITING_HEADER_LINE_END = 5;//头字段 结束
        this.WAITING_HEADER_BLOCK_END = 6;//头部块结束
        this.WAITING_BODY = 7;//body 体

        this.current = this.WAITING_STATUS_LINE;//状态机默认是 起始行
        this.statusLine = "";//状态行内容
        this.headers = {};//headers 内容
        this.headerName = "";//头部字段 key
        this.headerValue = "";//头部字段 value
        this.bodyParser = null;//body 体

    }

    get isFinished(){
        return this.bodyParser && this.bodyParser.isFinished;
    }

    get response(){
        this.statusLine.match(/HTTP\/1.1 ([0-9]*) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    receive(string) {
        console.log(string)
        for (let i = 0; i < string.length; i++) {
            this.reveiveChar(string.charAt(i));
        }
    }
    reveiveChar(char) {
        //"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nDate: Thu, 23 Jul 2020 13:06:25 GMT\r\nConnection: keep-alive\r\nTransfer-Encoding: chunked\r\n\r\nd\r\n Hello World\n\r\n0\r\n\r\n"
        //判断起始行
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_STATUS_LINE_END;//等待结束行
            } else {
                this.statusLine += char;
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE
            } else if (char === '\r') {
                //说明是空行，需要结束
                this.current = this.WAITING_HEADER_BLOCK_END
                if( this.headers['Transfer-Encoding'] === 'chunked' ){
                    this.bodyParser = new TrunkedBodyParser()
                }
            } else {
                this.headerName += char;
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                //冒号后面 必须是空格
                this.current = this.WAITING_HEADER_VALUE;
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            } else {
                this.headerValue += char
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = this.WAITING_BODY;
            }
        } else if (this.current === this.WAITING_BODY) {
            this.bodyParser.receiveChar(char)
        }
    }
}

class TrunkedBodyParser{
    constructor(){
        this.WAITING_LENGTH = 0;//chunk 长度为0，则结束
        this.WAITING_LENGTH_LINE_END = 1;// chunk 结束标签
        this.READING_TRUNK = 2;//获取 trunk
        this.WAITING_NEW_LINE = 3;//新的一行
        this.WAITING_NEW_LINE_END = 4;
        this.length = 0;//返回数据的总长度
        this.content = [];
        this.isFinished = false;//是否全部匹配完
        this.current = this.WAITING_LENGTH;//当前状态为 0
    }
    receiveChar(char){
        if( this.current === this.WAITING_LENGTH ){
            if( char === '\r' ){
                if( this.length === 0 ){
                    this.isFinished = true;
                }
                this.current = this.WAITING_LENGTH_LINE_END;
            }else{
                this.length *= 16;
                this.length += parseInt(char,16)
            }
        }else if( this.current === this.WAITING_LENGTH_LINE_END ){
            if (char === '\n' ){
                if ( this.isFinished ){
                    this.current === this.WAITING_NEW_LINE
                }else{
                    this.current = this.READING_TRUNK
                }
            }
        }else if( this.current === this.READING_TRUNK ){
            this.content.push(char);
            this.length --;
            if( this.length === 0 ){
                this.current = this.WAITING_NEW_LINE
            }
        }else if( this.current === this.WAITING_NEW_LINE ){
            if( char === '\r' ){
                this.current = this.WAITING_NEW_LINE_END
            }
        }else if( this.current === this.WAITING_NEW_LINE_END ){
            if( char === '\n' ){
                this.current = this.WAITING_LENGTH
            }
        }
    }
}

void async function(){
    let request = new Request({
        methods:'POST',
        host:"127.0.0.1",
        port:'8088',
        path:'/',
        headers:{
            ["X-Foo2"]:"customed"
        },
        body:{
            name:'majunfeng',
            age:'18',
        }
    })
    let response = await request.send();
    console.log(response);
    console.log(JSON.stringify(response.body))
    let dom = parser.parseHTML(response.body)
}();