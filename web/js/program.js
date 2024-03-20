function getMsg() {
    let Msg = "";
    for (let S = 0; S < steps; S++) {
        // 选择 #programs 下的第 S 个 class 为 step 的 div 元素
        let $step = $('#program .step:eq(' + S + ')');
        // 检查这个元素的 class 是否包含特定的类名
        if ($step.hasClass('action')) {
            // 在这里处理 action 步骤
            Msg = Msg + 'S' + (S + 1) + ':' + getAction(S);
        } else if ($step.hasClass('wait')) {
            // 在这里处理 wait 步骤
            Msg = Msg + 'S' + (S + 1) + ':WAIT' + "\n";
        } else if ($step.hasClass('delay')) {
            // 在这里处理 delay 步骤
            Msg = Msg + 'S' + (S + 1) + ':delay' + "\n";
        } else if ($step.hasClass('output')) {
            // 在这里处理 output 步骤
            Msg = Msg + 'S' + (S + 1) + ':' + $step.text() + "\n";
        } else if ($step.hasClass('kind1')) {
            // 在这里处理 output 步骤
            Msg = Msg + 'S' + (S + 1) + ':kind1' + "\n";
        } else {
            // 如果类名不被识别，在这里处理
            console.log('Step ' + (S + 1) + ' has no recognized class.');
        }
    }
    return Msg;
}

function getAction(S) {
    let $step = $('#program .step:eq(' + S + ')');
    let Msg = "";
    let Msg2 = "";
    for (let i = 0; i < settings.nums; i++) {
        // 获取$step下的第i个div
        let $div = $step.find('div:eq(' + i + ')');

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
                Msg2 = Msg2 + ';';
                Msg = Msg + Msg2 + "\n";
                break;
            case "中位":
                // 中位操作的代码
                Msg = Msg + 'F' + (i + 1) + '(Y' + settings.valve[i].out[0] + '=0,Y' + settings.valve[i].out[1] + '=0)';
                Msg2 = ';';
                Msg = Msg + Msg2 + "\n";
                break;
            case "放松":
                // 放松操作的代码
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
                Msg2 = Msg2 + ';';
                Msg = Msg + Msg2 + "\n";
                break;
            default:
                // 默认操作，如果文本不符合上述任何情况
                console.log('阀门' + (i + 1) + "未知的操作");
                break;
        };
    }

    // 获取$step下的第i个div
    let $div2 = $step.find('.action-bar');
    let text2 = $div2.find('.select').text();
    // CN为没有需要等待的信号，界面上的“模拟运行”
    // CW为没有需要等待的信号，界面上的“双手XXX”
    // C1010为没有需要等待的信号，界面上的“编码”
    switch (text2) {
        case "模拟运行":
            Msg = Msg + "CN" + "\n";
            break;
        case "双手启动":
            Msg = Msg + "CW" + "\n";
            break;
        case "外部编码":
            Msg = Msg + "C1010" + "\n";
            break;
        default:
            console.log("此步动作未选择条件");
            break;
    }
    return Msg;
}