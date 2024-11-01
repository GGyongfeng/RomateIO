$(document).ready(function () {
    // 在btnContainer渲染接口号的按钮r
    for (let i = 1; i <= 64; i++) {
        $('.btnContainer').append('<button>' + i + '</button>');
    }

    $.when(
        $.get("./setting.json"),
        $.get("./allProgramParams.json")
    ).then(function (res1, res2) {
        // res1[0] 是 ./setting.json 的响应数据内容
        // res2[0] 是 ./allProgramParams.json 的响应数据内容
        settings = res1[0];
        allProgramParams = res2[0];
        // 所选程序的阀门参数
        settings.valve = allProgramParams[settings.programID - 1].valve;
        // 程序储存路径
        pgmTxtFilePath = './programs/' + settings.programID + '.txt';
        repgmTxtFilePath = './programs/re_programs/' + settings.programID + '.txt';
        // -------------------------------------------

        // 读取程序
        $.get(pgmTxtFilePath, function (msg) {
            // 成功获取文件内容后的回调函数
            readTxt(msg);
        }).fail(function () {
            // 请求失败时的处理
            // console.log("此程序尚未编写");
            // 或者你可以在页面上显示一个提示，比如：
            $('#error-message').text("此程序尚未编写");
        });

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
                    '<div class="Fr-action-bar">' +
                    '<div class="action-bar">' +
                    '<button onclick="func2()">连续步</button>' +
                    '<button onclick="func2()">按钮启动</button>' +
                    '<button onclick="func3()">外部编码</button>' +
                    '</div>' +
                    '<div class="action-bar-2">' +
                    '<button onclick="requestContinue()">请求继续</button>' +
                    '</div>' +
                    '</div>'
                );
            }
        }

        // 判断程序是否在执行
        // 检查 settings.isRunning 的值，并执行相应的程序
        if (settings.isRunning === 1) {
            $(".nav button:eq(7)").addClass('btnClick')

            // 禁用所有元素的点击事件，除了此按钮
            $(".sidebar, .nav div:eq(0), .nav div:eq(1) button:eq(0), .nav div:eq(1) button:eq(1), .nav div:eq(1) button:eq(3)").css("pointer-events", "none");
            $("#program button,#program .disclicked").css("pointer-events", "none");
            // 动作栏取消点击事件
            $('#program .action').off('click', stepClickHandler);
        }

        //夹具名称显示以及修改 vue实现 
        new Vue({
            el: '#showProgramName',
            data: {
                msg: settings,
            },
            mounted() {
                $('#showProgramName div').on('click', function () {
                    // 显示模态框
                    $('#showProgramNameInput').css('display', 'flex');

                    // 确认按钮点击事件
                    $('#showProgramNameInput .confirmBtn').on('click', function () {
                        // if (confirm("确认保存嘛？")) {
                        const newName = $('#newNameInput').val();

                        console.log("修改程序名称为：" + newName);

                        // 将新名称输入到setting.json和allProgramParams.json中
                        modifyProgramName(newName);
                        // 关闭模态框
                        $('#showProgramNameInput').css('display', 'none');
                        // }
                    });

                    // 取消按钮点击事件
                    $('#showProgramNameInput .cancelBtn').on('click', function () {
                        // 关闭模态框
                        $('#showProgramNameInput').css('display', 'none');
                    });
                });
            }
        })
    })



    //动作按钮
    $(".nav button:eq(0)").click(function () {
        // // 获取#program下的最后一个class为action的div
        // const $lastActionDiv = $('#program .action:last');

        // // 克隆最后一个class为action的div
        // const $clone = $lastActionDiv.clone();

        // // 判断#program下是否包含class为action的div
        // if ($lastActionDiv.length > 0) {
        //     $clone.click(function () {
        //         $("#program").find('.selected').not(this).removeClass("selected");

        //         // 首先检查点击事件是否发生在按钮上
        //         if ($(this).hasClass("action")) {
        //             // 获取点击事件的目标元素
        //             const clickTarget = $(event.target);

        //             // 检查目标元素是否是 $(this) 下的按钮
        //             if (clickTarget.closest($(this)).length > 0 && clickTarget.is('button')) {
        //                 // 如果是 $(this) 下的按钮，不执行任何操作
        //             } else {
        //                 // 如果是 $(this) 下的其他元素或按钮之外的部分，执行 toggleClass
        //                 $(this).toggleClass("selected");
        //             }
        //         } else {
        //             // 如果没有找到按钮，直接执行 toggleClass
        //             $(this).toggleClass("selected");
        //         }
        //     });
        //     // 检查是否有class为step的div具有selected样式
        //     if ($('#program .selected').length > 0) {
        //         $clone.removeClass("selected");
        //         // 如果有，将克隆的div元素添加到具有selFected样式的div之后
        //         $('.selected').after($clone);
        //     } else {
        //         // 如果没有，将克隆的div元素添加到#program的末尾
        //         $('#program').append($clone);
        //     }
        // } else {
        //     // 否则执行copy（0）这个函数
        //     copy(0);
        //     steps = steps - 1;
        // }
        // // 步骤数+1
        // steps = steps + 1;

        copy(0); //复制空动作 2024/7/5 更改成这个形式
        numStepSerial();
    });

    // 等待信号
    $(".nav button:eq(1)").click(function () {
        // 切换display属性
        $(".sidebar_sign").toggle();
        $(".btnContainer button").removeClass('btn-clicked-bar');
        SignalNum = [];
        SignalNumON = [];
        SignalNumOFF = [];
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
            numStepSerial();
        }
    })

    // 提交代码
    $(".nav button:eq(6)").click(function () {
        // 调用 getMsg() 并检查成功与否
        if (getMsg().success) {
            showCustomConfirm("确认提交吗？", () => {
                msg = getMsg().message;
                console.log('提交msg:\n' + msg);
                console.log('提交到:\n' + pgmTxtFilePath);
                re_program = getReProgram();

                // 提交程序
                $.post(pgmTxtFilePath, { data: msg });
                $.post(repgmTxtFilePath, { data: re_program });

                // 写指令
                $.post("./command.txt", { data: "SP," + settings.programID + ".txt" });
            }, () => {
                // 取消操作
            });
        } else {
            // 如果不成功，弹出提示框
            alert('第 ' + getMsg().message + ' 步没有选择条件'); // 提示框显示消息
        }


    })

    // 运行按钮
    $(".nav button:eq(7)").click(function () {
        $(this).toggleClass("btnClick");
        // const message = "ST," + '/programs/' + settings.programID + '.txt';

        //程序运行时，除了运行按钮之外的所有元素点击无效
        if ($(this).hasClass("btnClick")) {
            // setting.json更新运行状态
            settings.isRunning = 1;

            // 禁用所有元素的点击事件，除了此按钮
            $(".sidebar, .nav div:eq(0), .nav div:eq(1) button:eq(0), .nav div:eq(1) button:eq(1), .nav div:eq(1) button:eq(3)").css("pointer-events", "none");
            $("#program button,#program .disclicked").css("pointer-events", "none");
            // 动作栏取消点击事件
            $('#program .action').off('click', stepClickHandler);

            // 写指令
            $.post("./command.txt", { data: "ST," + settings.programID + ".txt" });
        } else {
            // setting.json更新运行状态
            settings.isRunning = 0;

            // 取消运行，则移除所有步骤上的RunningStep类属性
            $('#program .step').removeClass("RunningStep");
            // 动作栏恢复点击事件
            $('#program .action').on('click', stepClickHandler)
            // 恢复所有元素的点击事件
            $("body *").css("pointer-events", "");

            // 写指令
            $.post("./command.txt", { data: "SP," + settings.programID + ".txt" });
        }

        SendSettingNotValve(settings);
    })


    // 侧边栏：输出功能
    $(".sidebar_output button").click(function () {
        $('.sidebar_output').hide();
    })

    // 等待信号-侧边栏-----------------------------------------
    $(".btnContainer button").click(function () {
        $(this).toggleClass('btn-clicked-bar');
        // 检查按钮是否有 btn-clicked 类
        if ($(this).hasClass('btn-clicked-bar')) {
            // 如果有 btn-clicked 类，则执行操作
            SignalNum.push(parseInt($(this).text(), 10));
        }
    })

    new Vue({
        el: '#waitSingalOnOff',
        data: {
            SignalNumON: [],
            SignalNumOFF: []
        },
        computed: {
            formattedSignalNumON() {
                return this.SignalNumON.join(', ');
            },
            formattedSignalNumOFF() {
                return this.SignalNumOFF.join(', ');
            }
        },
        methods: {
            updateSignalNumON() {
                this.SignalNumON = SignalNum.slice();
                console.log("等待信号ON:", this.SignalNumON);
                // 移除所有具有 .btn-clicked 类的 .btnContainer button 元素的 btn-clicked 类
                $('.btnContainer .btn-clicked-bar').removeClass('btn-clicked-bar');
                // 清空 SignalNum 数组
                SignalNum = [];
            },
            updateSignalNumOFF() {
                this.SignalNumOFF = SignalNum.slice();
                console.log("等待信号OFF:", this.SignalNumOFF);
                // 移除所有具有 .btn-clicked 类的 .btnContainer button 元素的 btn-clicked 类
                $('.btnContainer .btn-clicked-bar').removeClass('btn-clicked-bar');
                // 清空 SignalNum 数组
                SignalNum = [];
            },
            confirmButtonClicked() {
                if (this.SignalNumON.length === 0 && this.SignalNumOFF.length === 0) {
                    alert("等待信号不能为空");
                } else {
                    let msg = '';
                    if (this.SignalNumON.length > 0) {
                        msg += "等待信号ON:" + this.SignalNumON.join(',');
                    }
                    if (this.SignalNumOFF.length > 0) {
                        if (msg) {
                            msg += " "; // 如果msg已有内容，则添加一个空格
                        }
                        msg += "等待信号OFF:" + this.SignalNumOFF.join(',');
                    }
                    copy(1, msg);

                    $('.sidebar').hide();
                    this.SignalNumON = [];
                    this.SignalNumOFF = [];
                }
            },
            cancelButtonClicked() {
                $('.sidebar').hide();
                this.SignalNumON = [];
                this.SignalNumOFF = [];
            }
        },
        mounted() {
            $('.waitSingalON').on('click', (event) => {
                this.updateSignalNumON();
            });

            $('.waitSingalOFF').on('click', (event) => {
                this.updateSignalNumOFF();
            });

            // 确认按钮点击事件
            $(".sidebar_sign div:eq(0) button:eq(0)").click(() => {
                this.confirmButtonClicked();
            });

            // 取消按钮点击事件
            $(".sidebar_sign div:eq(0) button:eq(1)").click(() => {
                this.cancelButtonClicked();
            });
        }
    });

    // 每500毫秒计时器
    // .sidebar的display属性，如果为flex，执行渲染btnContainer
    setInterval(checkSidebarDisplay, 500);
    // 如果 运行按钮 具有btnClick类，则读取step.txt
    setInterval(CheckStep, 500);
    // -----------------------------------------

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