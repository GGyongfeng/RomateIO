// 框图→程序
function getMsg() {
    let Msg = "";
    for (let S = 0; S < steps; S++) {
        // 选择 #programs 下的第 S 个 class 为 step 的 div 元素
        let $step = $('#program .step:eq(' + S + ')');
        // 检查这个元素的 class 是否包含特定的类名
        if ($step.hasClass('action')) {
            // 在这里处理 “动作” 步骤
            Msg = Msg + 'S' + (S + 1) + ':' + getAction(S);
        } else if ($step.hasClass('wait')) {
            // 在这里处理 “等待释放” 步骤
            Msg = Msg + 'S' + (S + 1) + ':WAIT' + "\n";
        } else if ($step.hasClass('delay')) {
            // 在这里处理 “延迟” 步骤
            let contentText = '';
            $step.contents().each(function () {
                if (!$(this).hasClass('numStepSerial')) {
                    contentText += $(this).text();
                }
            });
            Msg = Msg + 'S' + (S + 1) + ':delay' + ',' + contentText.substring(2, $step.text().length - 3) + "\n";
        } else if ($step.hasClass('output')) {
            // 在这里处理 “输出” 步骤
            let contentText = '';
            $step.contents().each(function () {
                if (!$(this).hasClass('numStepSerial')) {
                    contentText += $(this).text();
                }
            });
            Msg = Msg + 'S' + (S + 1) + ':' + contentText + "\n";
        } else if ($step.hasClass('signal')) {
            // 在这里处理 “等待信号” 步骤
            Msg = Msg + 'S' + (S + 1) + ':' + getSignal(S) + "\n";
        } else {
            // 如果类名不被识别，在这里处理
            console.log('Step ' + (S + 1) + ' has no recognized class.');
        }
    }
    return Msg;
}

// 动作步骤 框图→程序
function getAction(S) {
    let $step = $('#program .step:eq(' + S + ')');
    let Msg = "";
    let Msg2 = "";
    for (let i = 0; i < settings.NumberOfValves; i++) {
        // 获取$step下的第i个div
        let $div = $step.find('div:eq(' + (i + 1) + ')');

        // 获取第i个div下class为"selet"的button
        let button = $div.find('.select');
        // 获取被选中button的文本
        let text = button.text()
        // 使用switch语句根据文本进行判断
        switch (text) {
            case "夹紧":
                // 夹紧操作的代码
                Msg = Msg + 'F' + (i + 1) + '(Y' + settings.valve[i].out[0] + '=1,Y' + settings.valve[i].out[1] + '=0)' + 'J';
                Msg2 = '-'
                // 按照夹到位的信号数量进行循环拼接字符串
                for (let k = 0; k < settings.valve[i].close.length; k++) {
                    Msg2 = Msg2 + 'X' + settings.valve[i].close[k] + ',';
                    // 最后一个不加逗号
                    if (k == (settings.valve[i].close.length - 1)) {
                        Msg2 = Msg2.slice(0, -1);
                    }
                }
                Msg2 = Msg2 + ',';
                Msg = Msg + Msg2;
                break;
            case "中位":
                // 中位操作的代码
                Msg = Msg + 'F' + (i + 1) + '(Y' + settings.valve[i].out[0] + '=0,Y' + settings.valve[i].out[1] + '=0)';
                Msg2 = ',';
                Msg = Msg + Msg2;
                break;
            case "打开":
                //打开操作的代码
                Msg = Msg + 'F' + (i + 1) + '(Y' + settings.valve[i].out[0] + '=0,Y' + settings.valve[i].out[1] + '=1)' + 'K';
                Msg2 = '-';
                // 按照夹到位的信号数量进行循环拼接字符串
                for (let k = 0; k < settings.valve[i].open.length; k++) {
                    Msg2 = Msg2 + 'X' + settings.valve[i].open[k] + ',';
                    // 最后一个不加逗号
                    if (k == (settings.valve[i].open.length - 1)) {
                        Msg2 = Msg2.slice(0, -1);
                    }
                }
                Msg2 = Msg2 + ',';
                Msg = Msg + Msg2;
                break;
            default:
                // 默认操作，如果文本不符合上述任何情况
                // console.log('阀门' + (i + 1) + "未知的操作");
                break;
        };
    }


    // 获取$step下的请求继续框
    let $div3 = $step.find('.action-bar-2');
    // 获取$div3下的第一个button按钮
    let $button = $div3.find('button').first();
    // 判断button是否具有request-continue-click属性
    if ($button.hasClass('request-continue-click')) {
        Msg = Msg + "G,";
    }


    // 获取$step下的条件选择栏
    let $div2 = $step.find('.action-bar');
    let text2 = $div2.find('.select').text();
    // CN为没有需要等待的信号，界面上的“连续步”
    // CW为没有需要等待的信号，界面上的“双手XXX”
    // C1010为没有需要等待的信号，界面上的“编码”
    switch (text2) {
        case "连续步":
            Msg = Msg + "CN" + "\n";
            break;
        case "按钮启动":
            Msg = Msg + "CW" + "\n";
            break;
        case "外部编码":
            Msg = Msg + "\n";
            break;
        default:
            Msg = Msg + text2 + "\n";
            // console.log("此步动作未选择条件");
            break;
    }
    return Msg;
}

// 等待信号 框图→程序
function getSignal(S) {
    let message = $('#program .step:eq(' + S + ')').text();
    let result = [];

    // 匹配 ON: 后面的数字
    let onMatches = message.match(/ON:(\d+(?:,\s*\d+)*)/);
    if (onMatches) {
        var onNumbers = onMatches[1].split(',').map(num => 'X' + num.trim());
        result.push(onNumbers.join(','));
    }

    // 匹配 OFF: 后面的数字
    let offMatches = message.match(/OFF:(\d+(?:,\s*\d+)*)/);
    if (offMatches) {
        var offNumbers = offMatches[1].split(',').map(num => 'Q' + num.trim());
        result.push(offNumbers.join(','));
    }

    return result.join(',') + ',';
}

// 程序→框图
function readTxt(txt) {
    console.log(txt);

    steps = 0; // 初始化步数为0
    // 清空id为'program'的元素的内容
    $('#program').empty();
    let maxStep = 0; // 最大步数
    let currentStep = 0; // 当前步数

    // 遍历txt的每一个字母或者符号
    // if 是 S
    // 读取字母S后面的连续数字直到冒号:,将这个连续数字转化为数值类型变量
    // 取最大的一个，让steps=这个数字
    // if是冒号:
    // 则进行switch判断冒号:的后一个字符
    //  case F：
    //  case d：
    //  case W：

    // 遍历txt的每一个字母或者符号
    for (let i = 0; i < txt.length; i++) {
        let char = txt[i];
        // 如果是字母S，且后面是数字，则更新最大步数
        if (char === 'S') {
            // 找到 S 后面的连续数字
            let numStr = '';
            for (let j = i + 1; j < txt.length; j++) {
                if (!isNaN(parseInt(txt[j]))) {
                    numStr += txt[j];
                } else {
                    break;
                }
            }
            if (numStr !== '') {
                currentStep = parseInt(numStr);
                if (currentStep > maxStep) {
                    maxStep = currentStep;
                }
            }
        }
        // 如果是冒号:，则进行switch判断这个字符的后一个字符
        else if (char === ':') {
            switch (txt[i + 1]) {
                // 添加 动作 
                case 'F':
                    let strF = '';
                    for (let k = i + 1; k < txt.length; k++) {
                        if (txt[k] === '\n') {
                            break;
                        }
                        else {
                            strF += txt[k];
                        }
                    }
                    readAction(strF)
                    break;
                //添加  延迟 操作
                case 'd':
                    // 遍历判断char以后的字符直到换行符
                    // 判断如果为逗号,，则找到,后的连续数字直到换行符，拼接起来赋值给一个变量
                    for (let k = i + 1; k < txt.length; k++) {
                        if (txt[k] === ',') {
                            let tempNumStr = '';
                            for (let l = k + 1; l < txt.length; l++) {
                                if (!isNaN(parseInt(txt[l]))) {
                                    tempNumStr += txt[l];
                                } else if (txt[l] === '\n') {
                                    break;
                                }
                            }
                            copy(3, '延迟' + tempNumStr + 'ms');
                            break;
                        }
                    }
                    break;
                // 添加 等待释放 操作
                case 'W':
                    copy(2);
                    break;
                // 添加 输出 操作
                case 'S':
                    // 添加字符串直至换行
                    let Str = '';
                    for (let k = i + 1; k < txt.length; k++) {
                        if (txt[k] === '\n') {
                            break;
                        }
                        else {
                            Str += txt[k];
                        }
                    }
                    copy(4, Str);
                    break;
                case 'X':
                case 'Q':
                    // 提取字符串
                    let Signal = "";
                    for (let k = i + 1; k < txt.length; k++) {
                        if (txt[k] === '\n') {
                            break;
                        }
                        else {
                            Signal += txt[k];
                        }
                    }
                    TxtintoChart_waitingSignal(Signal);
                    break;
                default:
                    break;
            }
        }
    }
    steps = maxStep; // 将最大步数作为结果
}

// 动作 程序→框图
function readAction(strF) {
    let $copy = copy(0);
    // 遍历str的每一个字符char
    for (let i = 0; i < strF.length; i++) {
        let char = strF[i]; // 获取当前字符
        if (char === 'F') {
            // 找到 F 后面的连续数字
            // 方便对对应的div进行操作
            let numStr = '';
            for (let j = i + 1; j < strF.length; j++) {
                if (!isNaN(parseInt(strF[j]))) {
                    numStr += strF[j];
                } else {
                    break;
                }
            }
            let $div = $copy.children('div').eq(numStr)

            // 遍历F后的字符，直到),switch判断)后一位的字符,case J: case K: case ,:
            for (let k = i + 1; k < strF.length; k++) {
                if (strF[k] === ')') {
                    let nextChar = strF[k + 1];
                    switch (nextChar) {
                        case 'J':
                            $div.children('button').eq(0).addClass("select");
                            break;
                        case 'K':
                            $div.children('button').eq(2).addClass("select");
                            break;
                        case ',':
                            $div.children('button').eq(1).addClass("select");
                            break;
                        default:
                            // 如果不是上述情况，可以添加默认处理逻辑
                            break;
                    }
                    break;
                }
            }
        } else if (char === 'C') {
            switch (strF[i + 1]) {
                case 'N':
                    $copy.find('.action-bar').find('button:eq(0)').addClass('select');
                    break;
                case 'W':
                    $copy.find('.action-bar').find('button:eq(1)').addClass('select');
                    break;
                default:
                    $copy.find('.action-bar').find('button:eq(2)').addClass('select');
                    // 找到 C 后面的连续数字
                    let numStr = '';
                    for (let j = i + 1; j < strF.length; j++) {
                        if (!isNaN(parseInt(strF[j]))) {
                            numStr += strF[j];
                        } else {
                            break;
                        }
                    }
                    $copy.find('.action-bar').find('button:eq(2)').text('C' + numStr);
                    break;
            }
        } else if (char === 'G') {
            console.log('G');
            $copy.find('.action-bar-2').find('button:eq(0)').addClass('request-continue-click')
        }
    }
}

//等待信号 程序→框图 
function TxtintoChart_waitingSignal(Signal) {
    // 转化为数组
    let signals = Signal.split(','); // 将字符串分割成信号项数组

    let SignalX = '';
    let SignalQ = '';

    // 循环遍历信号项数组中的每个元素
    signals.forEach(item => {
        // 使用正则表达式匹配以 X 或 Q 开头的数字部分
        let matchX = item.match(/^X(\d+)/);
        let matchQ = item.match(/^Q(\d+)/);

        // 如果匹配成功，将数字部分提取出来并添加到对应的字符串中
        if (matchX) {
            if (SignalX !== '') SignalX += ',';
            SignalX += matchX[1]; // 提取匹配的第一个捕获组（即数字部分）
        } else if (matchQ) {
            if (SignalQ !== '') SignalQ += ',';
            SignalQ += matchQ[1]; // 提取匹配的第一个捕获组（即数字部分）
        }
    });

    let Msg = '';
    // 根据 SignalX 和 SignalQ 构建 Msg 字符串
    if (SignalX !== '') {
        Msg += '等待信号ON:' + SignalX;
    }
    if (SignalQ !== '') {
        if (Msg !== '') Msg += ' '; // 添加空格分隔
        Msg += '等待信号OFF:' + SignalQ;
    }
    copy(1, Msg);
}

//渲染步骤号 
function numStepSerial() {
    // 在每一个$("#program .step")的右上角添加名为numStepSerial的div
    $("#program .step").each(function (index) {
        // 查找.step元素下是否已经存在.numStepSerial元素
        let $numStepSerial = $(this).find(".numStepSerial");

        if ($numStepSerial.length === 0) {
            // 如果.numStepSerial不存在，则创建并添加到右上角
            $(this).prepend("<div class='numStepSerial'></div>");
            $numStepSerial = $(this).find(".numStepSerial");
        }
        // 更新div的文本内容为步骤序号（这里假设步骤从1开始）
        $numStepSerial.text(index + 1);
    });
}

// 逆向程序
function getReProgram() {
    let Msg = "";
    for (let S = 0; S < steps; S++) {
        // 选择 #programs 下的第 S 个 class 为 step 的 div 元素
        let $step = $('#program .step:eq(' + S + ')');
        // 检查这个元素的 class 是否包含特定的类名
        if ($step.hasClass('action')) {
            // 在这里处理 “动作” 步骤
            Msg = Msg + 'S' + (S + 1) + ':' + getReAction(S);
        } else if ($step.hasClass('wait')) {
            // 在这里处理 “等待释放” 步骤
            Msg = Msg + 'S' + (S + 1) + ':WAIT' + "\n";
        } else if ($step.hasClass('delay')) {
            // 在这里处理 “延迟” 步骤
            let contentText = '';
            $step.contents().each(function () {
                if (!$(this).hasClass('numStepSerial')) {
                    contentText += $(this).text();
                }
            });
            Msg = Msg + 'S' + (S + 1) + ':delay' + ',' + contentText.substring(2, $step.text().length - 3) + "\n";
        } else if ($step.hasClass('output')) {
            // 在这里处理 “输出” 步骤
            let contentText = '';
            $step.contents().each(function () {
                if (!$(this).hasClass('numStepSerial')) {
                    contentText += $(this).text();
                }
            });
            Msg = Msg + 'S' + (S + 1) + ':' + contentText + "\n";
        } else if ($step.hasClass('signal')) {
            // 在这里处理 “等待信号” 步骤
            Msg = Msg + 'S' + (S + 1) + ':' + getSignal(S) + "\n";
        } else {
            // 如果类名不被识别，在这里处理
            console.log('Step ' + (S + 1) + ' has no recognized class.');
        }
    }
    return Msg;
}

// 逆向动作步骤
function getReAction(S) {
    let $step = $('#program .step:eq(' + S + ')');
    let Msg = "";
    let Msg2 = "";
    for (let i = 0; i < settings.NumberOfValves; i++) {
        // 获取$step下的第i个div
        let $div = $step.find('div:eq(' + (i + 1) + ')');

        // 获取第i个div下class为"selet"的button
        let button = $div.find('.select');
        // 获取被选中button的文本
        let text = button.text()
        // 使用switch语句根据文本进行判断
        switch (text) {
            case "打开":
                // 夹紧操作的代码
                Msg = Msg + 'F' + (i + 1) + '(Y' + settings.valve[i].out[0] + '=1,Y' + settings.valve[i].out[1] + '=0)' + 'J';
                Msg2 = '-'
                // 按照夹到位的信号数量进行循环拼接字符串
                for (let k = 0; k < settings.valve[i].close.length; k++) {
                    Msg2 = Msg2 + 'X' + settings.valve[i].close[k] + ',';
                    // 最后一个不加逗号
                    if (k == (settings.valve[i].close.length - 1)) {
                        Msg2 = Msg2.slice(0, -1);
                    }
                }
                Msg2 = Msg2 + ',';
                Msg = Msg + Msg2;
                break;
            // case "中位":
            //     // 中位操作的代码
            //     Msg = Msg + 'F' + (i + 1) + '(Y' + settings.valve[i].out[0] + '=0,Y' + settings.valve[i].out[1] + '=0)';
            //     Msg2 = ',';
            //     Msg = Msg + Msg2;
            //     break;
            case "夹紧":
                //打开操作的代码
                Msg = Msg + 'F' + (i + 1) + '(Y' + settings.valve[i].out[0] + '=0,Y' + settings.valve[i].out[1] + '=1)' + 'K';
                Msg2 = '-';
                // 按照夹到位的信号数量进行循环拼接字符串
                for (let k = 0; k < settings.valve[i].open.length; k++) {
                    Msg2 = Msg2 + 'X' + settings.valve[i].open[k] + ',';
                    // 最后一个不加逗号
                    if (k == (settings.valve[i].open.length - 1)) {
                        Msg2 = Msg2.slice(0, -1);
                    }
                }
                Msg2 = Msg2 + ',';
                Msg = Msg + Msg2;
                break;
            default:
                // 默认操作，如果文本不符合上述任何情况
                // console.log('阀门' + (i + 1) + "未知的操作");
                break;
        };
    }


    // 获取$step下的请求继续框
    let $div3 = $step.find('.action-bar-2');
    // 获取$div3下的第一个button按钮
    let $button = $div3.find('button').first();
    // 判断button是否具有request-continue-click属性
    if ($button.hasClass('request-continue-click')) {
        Msg = Msg + "G,";
    }


    // 获取$step下的条件选择栏
    let $div2 = $step.find('.action-bar');
    let text2 = $div2.find('.select').text();
    // CN为没有需要等待的信号，界面上的“连续步”
    // CW为没有需要等待的信号，界面上的“双手XXX”
    // C1010为没有需要等待的信号，界面上的“编码”
    switch (text2) {
        case "连续步":
            Msg = Msg + "CN" + "\n";
            break;
        case "按钮启动":
            Msg = Msg + "CW" + "\n";
            break;
        case "外部编码":
            Msg = Msg + "\n";
            break;
        default:
            Msg = Msg + text2 + "\n";
            // console.log("此步动作未选择条件");
            break;
    }
    return Msg;
}