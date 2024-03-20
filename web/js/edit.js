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
                        '<button onclick="func1()">模拟运行</button>' +
                        '<button onclick="func1()">双手启动</button>' +
                        '<button onclick="func1()">外部编码</button>' +
                        '</div>'
                    );
                }
            }

            //输出按钮 
            $(".nav button:eq(4)").click(function () {
                // 切换sidebar的display属性
                $('.sidebar').show();
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

            // 输出功能的侧边栏
            // sidebar的button被点击时，隐藏侧边栏
            $(".sidebar button").click(function () {
                $('.sidebar').hide();
            })

            // 提交代码
            $(".nav button:eq(6)").click(function () {
                msg = getMsg();
                console.log('steps:' + steps);
                console.log(msg);
                $.ajax({
                    type: "post",
                    url: "./txt/1.txt",
                    data: { data: msg },
                    success: function (res) {
                        console.log(res);
                    }
                })
            })
        }
    })
});