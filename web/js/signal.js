// 界面准备时自动获取setting数据
$(document).ready(function () {
    // 在sidebar渲染接口号的按钮
    for (let i = 1; i <= 88; i++) {
        $('.btnContainer').append('<button>' + i + '</button>');
    }
    var num = [];
    var port = 0;
    var choose = "close"

    $.when(
        $.get("./setting.json"),
        $.get("/allProgramParams.json")
    ).then(function (res1, res2) {
        // res1[0] 是 ./setting.json 的响应数据内容
        // res2[0] 是 ./allProgramParams.json 的响应数据内容
        settings = res1[0];

        allProgramParams = res2[0];
        // 所选程序的阀门参数
        var valveParam = allProgramParams[settings.programID - 1].valve;
        console.log(valveParam);

        if (settings.isRunning === 1) {
            showCustomAlert("请先终止程序运行，再进行信号编辑");
        } else {
            $.ajax({
                type: "post",
                url: "./command.txt",
                data: { data: "SP,hand.txt" },
                success: function (res) {
                    console.log(res);
                }
            })
        }

        new Vue({
            el: '#app',
            data: {
                NumberOfValves: settings.NumberOfValves,
                valveParam: valveParam
            },
            computed: {
                range() {
                    return Array.from({ length: this.NumberOfValves }, (_, index) => index);
                }
            },
            methods: {
                // 选择端口
                func1(index, data) {
                    port = index;
                    choose = data;
                },

                // 提交按钮的func
                commit() {
                    // 将num传递给对应的接口号
                    switch (choose) {
                        case "close":
                            this.valveParam[port].close = num;
                            break;
                        default:
                            this.valveParam[port].open = num;
                            break;
                    }

                    // 隐藏sidebar
                    $('.sidebar').hide();
                },

                // 保存按钮的func
                commitAll() {
                    // 新增：检查程序是否正在运行
                    if (settings.isRunning === 1) {
                        showCustomAlert("程序正在运行，无法保存");
                        return;
                    }

                    // 使用自定义提示框代替 confirm
                    showCustomConfirm("确认保存吗？", () => {
                        console.log("提交了最新程序", settings.programID, "的阀门参数");
                        allProgramParams[settings.programID - 1].valve = valveParam;
                        // Json对象转化为字符串 再发送
                        const msg = JSON.stringify(allProgramParams);
                        // 发送设置信息
                        $.post('./allProgramParams.json', { data: msg }, function () {
                            // 在发送成功后显示提示框
                            showCustomAlert('配置提交成功！！\n请返回 "程序编辑" 页面,点击 "提交" \n 以更新程序');
                        });
                    }, () => {
                        // 取消操作
                    });
                }
            }
        })
        // -------------------------------------------

        $(".part button").click(function () {
            // 切换sidebar的display属性
            $('.sidebar').show();

            // 多个按钮：同时只能一个被选中时
            $(".part").find('button').removeClass('btn-clicked');
            $(this).addClass('btn-clicked');

            // 取消sidebar中按钮的btn—clicked样式
            $(".sidebar .btnContainer button").removeClass('btn-clicked-bar');

            num = [];
        })

        // 关闭按钮
        $(".sidebar .close").click(function () {
            $('.sidebar').hide();
        })

        $(".sidebar .btnContainer button").click(function () {
            $(this).toggleClass('btn-clicked-bar');
            num.push(parseInt(this.innerHTML, 10));
        })

        // sidebar的夹紧按钮
        $(".sidebar div:eq(2) button:eq(0)").click(function () {
            // 管理样式btnClick 类
            $(this).addClass('btnClick');
            $(".sidebar div:eq(2) button").not($(this)).removeClass('btnClick');

            // 发送指令
            let msg = "";
            msg = 'F' + (port + 1) + '(Y' + valveParam[port].out[0] + '=1,Y' + valveParam[port].out[1] + '=0)' + 'J';
            $.post("./hand.txt", { data: msg }, function () {
                console.log(msg);
            })
        })

        // sidebar的打开按钮
        $(".sidebar div:eq(2) button:eq(1)").click(function () {
            // 管理样式btnClick 类
            $(this).addClass('btnClick');
            $(".sidebar div:eq(2) button").not($(this)).removeClass('btnClick');

            // 发送指令
            let msg = "";
            msg = 'F' + (port + 1) + '(Y' + valveParam[port].out[0] + '=0,Y' + valveParam[port].out[1] + '=1)' + 'K';
            $.post("./hand.txt", { data: msg }, function () {
                console.log(msg);
            })
        })

        // 每500毫秒检查一次.sidebar的display属性，如果为flex，执行渲染btnContainer
        setInterval(checkSidebarDisplay, 500);

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
});

// 显示弹窗
function showCustomAlert(message) {
    $('#alertMessage').text(message);
    $('#customAlert').fadeIn(100);
}

function closeCustomAlert() {
    $('#customAlert').fadeOut(100);
}