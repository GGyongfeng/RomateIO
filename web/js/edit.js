$(document).ready(function () {
    $.ajax({
        type: "get",
        url: "./setting.json",
        success: function (msg) {
            settings = msg;
            console.log('请求settings.json成功:' + settings.nums);

            for (let i = 1; i <= settings.nums; i++) {
                $(".action").eq(0).append(
                    '<div>' +
                    '<p>阀门' + i + '</p>' +
                    '<button onclick="func1()">夹紧</button>' +
                    '<button onclick="func1()">中位</button>' +
                    '<button onclick="func1()">放松</button>' +
                    '</div>'
                );
                if (i == settings.nums) {
                    $(".action").eq(0).append(
                        '<div class="action-bar">' +
                        '<button onclick="func2()">模拟运行</button>' +
                        '<button onclick="func2()">双手启动</button>' +
                        '<button onclick="func3()">外部编码</button>' +
                        '</div>'
                    );
                }
            }

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
                        // 如果有，将克隆的div元素添加到具有selected样式的div之后
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

            //延迟按钮 
            $(".nav button:eq(2)").click(function () {
                // 弹出输入框
                let userInput = prompt("请输入延迟时间ms:");

                // 如果用户点击了取消按钮或者未输入任何内容，则不进行替换操作
                if (userInput !== null && userInput !== "") {
                    copy(3, '延迟' + userInput + 'ms');
                }
            })

            //输出按钮 
            $(".nav button:eq(3)").click(function () {
                // 切换sidebar的display属性
                $('.sidebar').show();
            })

            // 删除按钮
            $(".nav button:eq(4)").click(function () {
                // 判断是否存在被选中的step
                if ($("#program .selected").length > 0) {
                    // 存在则执行以下操作
                    $("#program .selected").remove(); // 删除具有 .selected 类的元素
                    steps = steps - 1; // 更新 steps 的值
                }
            })

            // 输出功能的侧边栏
            // sidebar的button被点击时，隐藏侧边栏
            $(".sidebar button").click(function () {
                $('.sidebar').hide();
            })

            // 提交代码
            $(".nav button:eq(5)").click(function () {
                msg = getMsg();
                console.log('steps:' + steps);
                console.log(msg);
                // 将msg写入./txt/1.txt
                $.ajax({
                    type: "post",
                    url: "./txt/web.txt",
                    data: { data: msg },
                    success: function (res) {
                        console.log(res);
                    }
                })
            })
            $(".nav button:eq(6)").click(function () {
                $.ajax({
                    type: "post",
                    url: "./txt/command.txt",
                    data: { data: "ST,web.txt" },
                    success: function (res) {
                        console.log(res);
                    }
                })
            })
            // 读取按钮
            $(".nav button:eq(7)").click(function () {
                $.ajax({
                    type: "get",
                    url: "./web.txt",
                    success: function (msg) {
                        readTxt(msg);
                    }
                })
            })
        }
    })
});