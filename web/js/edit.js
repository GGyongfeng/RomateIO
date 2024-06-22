$(document).ready(function () {
    // 在btnContainer渲染接口号的按钮r
    for (let i = 1; i <= 64; i++) {
        $('.btnContainer').append('<button>' + i + '</button>');
    }

    $.ajax({
        type: "get",
        url: "./setting.json",
        success: function (msg) {
            settings = msg;
            console.log('请求settings.json成功:' + settings.NumberOfValves);

            for (let i = 1; i <= settings.NumberOfValves; i++) {
                $(".action").eq(0).append(
                    '<div>' +
                    '<p>阀门' + i + '</p>' +
                    '<button onclick="func1()">夹紧</button>' +
                    '<button onclick="func1()">中位</button>' +
                    '<button onclick="func1()">打开</button>' +
                    '</div>'
                );
                if (i == settings.NumberOfValves) {
                    $(".action").eq(0).append(
                        '<div class="action-bar">' +
                        '<button onclick="func2()">连续步</button>' +
                        '<button onclick="func2()">按钮启动</button>' +
                        '<button onclick="func3()">外部编码</button>' +
                        '</div>'
                    );
                }
            }
        }
    })

    //动作按钮
    $(".nav button:eq(0)").click(function () {
        // 获取#program下的最后一个class为action的div
        const $lastActionDiv = $('#program .action:last');

        // 克隆最后一个class为action的div
        const $clone = $lastActionDiv.clone();

        // 判断#program下是否包含class为action的div
        if ($lastActionDiv.length > 0) {
            $clone.click(function () {
                $("#program").find('.selected').not(this).removeClass("selected");

                // 首先检查点击事件是否发生在按钮上
                if ($(this).hasClass("action")) {
                    // 获取点击事件的目标元素
                    const clickTarget = $(event.target);

                    // 检查目标元素是否是 $(this) 下的按钮
                    if (clickTarget.closest($(this)).length > 0 && clickTarget.is('button')) {
                        // 如果是 $(this) 下的按钮，不执行任何操作
                    } else {
                        // 如果是 $(this) 下的其他元素或按钮之外的部分，执行 toggleClass
                        $(this).toggleClass("selected");
                    }
                } else {
                    // 如果没有找到按钮，直接执行 toggleClass
                    $(this).toggleClass("selected");
                }
            });
            // 检查是否有class为step的div具有selected样式
            if ($('#program .selected').length > 0) {
                $clone.removeClass("selected");
                // 如果有，将克隆的div元素添加到具有selFected样式的div之后
                $('.selected').after($clone);
            } else {
                // 如果没有，将克隆的div元素添加到#program的末尾
                $('#program').append($clone);
            }
        } else {
            // 否则执行copy（0）这个函数
            copy(0);
            steps = steps - 1;
        }
        // 步骤数+1
        steps = steps + 1;
    });

    // 等待信号
    $(".nav button:eq(1)").click(function () {
        // 切换display属性
        $(".sidebar_sign").toggle();
        $(".btnContainer button").removeClass('btn-clicked');
        SignalNum = [];
    })

    //延迟按钮 
    $(".nav button:eq(3)").click(function () {
        // 弹出输入框
        let userInput = prompt("请输入延迟时间ms:");

        // 如果用户点击了取消按钮或者未输入任何内容，则不进行替换操作
        if (userInput !== null && userInput !== "") {
            copy(3, '延迟' + userInput + 'ms');
        }
    })

    //输出按钮 
    $(".nav button:eq(4)").click(function () {
        // 切换sidebar_output的display属性
        $('.sidebar_output').show();
    })

    // 删除按钮
    $(".nav button:eq(5)").click(function () {
        // 判断是否存在被选中的step
        if ($("#program .selected").length > 0) {
            // 存在则执行以下操作
            $("#program .selected").remove(); // 删除具有 .selected 类的元素
            steps = steps - 1; // 更新 steps 的值
        }
    })

    // 提交代码
    $(".nav button:eq(6)").click(function () {
        if (confirm("确认保存嘛？")) {
            msg = getMsg();
            console.log('steps:' + steps);
            console.log(msg);
            // 将msg写入./web.txt
            $.ajax({
                type: "post",
                url: "./web.txt",
                data: { data: msg },
                success: function (res) {
                    console.log(res);
                }
            })
            $.ajax({
                type: "post",
                url: "./command.txt",
                data: { data: "SP,web.txt" },
                success: function (res) {
                    console.log(res);
                }
            })
        } else {
            // 取消操作
        }
    })

    // 运行按钮
    $(".nav button:eq(7)").click(function () {
        $(this).toggleClass("btnClick");

        //程序运行时，除了运行按钮之外的所有元素点击无效
        if ($(this).hasClass("btnClick")) {
            // 开启自动模式
            $.post("./command.txt", { data: "ST,web.txt" });
            // 禁用所有元素的点击事件，除了此按钮
            $(".sidebar, .nav div:eq(0), .nav div:eq(1) button:eq(0), .nav div:eq(1) button:eq(1), .nav div:eq(1) button:eq(3)").css("pointer-events", "none");
            $("#program button,#program .disclicked").css("pointer-events", "none");
        } else {
            // 如果按钮没有btnClick类属性，则移除所有步骤上的RunningStep类属性
            $('#program .step').removeClass("RunningStep");
            // 恢复手动模式
            $.post("./command.txt", { data: "SP,web.txt" });
            // 恢复所有元素的点击事件
            $("body *").css("pointer-events", "");
        }
    })

    // 读取按钮
    $(".nav button:eq(8)").click(function () {
        $.ajax({
            type: "get",
            url: "./web.txt",
            success: function (msg) {
                readTxt(msg);
            }
        })
    })

    // 侧边栏：输出功能
    $(".sidebar_output button").click(function () {
        $('.sidebar_output').hide();
    })

    // 等待信号-侧边栏
    $(".sidebar_sign div:eq(0) button:eq(0)").click(function () {
        $('.sidebar').hide();
        copy(1, "等待信号: " + SignalNum);
    })
    $(".sidebar_sign div:eq(0) button:eq(1)").click(function () {
        $('.sidebar').hide();
    })

    $(".btnContainer button").click(function () {
        $(this).toggleClass('btn-clicked');
        SignalNum.push(parseInt(this.innerHTML, 10));
    })

    // 每500毫秒计时器
    // .sidebar的display属性，如果为flex，执行渲染btnContainer
    setInterval(checkSidebarDisplay, 500);
    // 如果 运行按钮 具有btnClick类，则读取step.txt
    setInterval(CheckStep, 500);
});

function CheckStep() {
    if ($(".nav button:eq(7)").hasClass("btnClick")) {
        $.get('./step.txt', function (res) {
            S = parseInt(res); // 将字符串转换为整数
            console.log("正在运行第 " + S + " 步"); // 打印当前步骤

            // 移除所有步骤上的RunningStep类属性
            $('#program .step').removeClass("RunningStep");

            if (S !== 0) {
                // 选择对应的DOM元素，并添加RunningStep类属性
                $('#program .step:eq(' + (S - 1) + ')').addClass("RunningStep");
            }
        })
    }
}