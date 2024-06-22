// 界面准备时自动获取setting数据
$(document).ready(function () {
    // 在sidebar渲染接口号的按钮
    for (let i = 1; i <= 64; i++) {
        $('.btnContainer').append('<button>' + i + '</button>');
    }
    var num = [];
    var port = 0;
    var choose = "close"

    // 切换手动
    $.post("./command.txt", { data: "SP,hand.txt" }, function (res) {
        console.log(res);
    });

    $.ajax({
        type: "get",
        url: "./setting.json",
        success: function (res) {
            console.log('请求settings.json成功');
            var settings = res;
            // -------------------------------------------
            new Vue({
                el: '#app',
                data: {
                    NumberOfValves: res.NumberOfValves,
                    settings: res
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
                                this.settings.valve[port].close = num;
                                break;
                            default:
                                this.settings.valve[port].open = num;
                                break;
                        }

                        // 隐藏sidebar
                        $('.sidebar').hide();
                    },

                    // 保存按钮的func
                    commitAll() {
                        console.log("提交了最新setting");
                        // 将Vue对象转化为JS对象
                        const settingsJSON = JSON.parse(JSON.stringify(this.settings));
                        // 输出转化后的JS对象
                        console.log(settingsJSON);
                        // console.log(JSON.stringify(settingsJSON));
                        SendSetting(settingsJSON);
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
                $(".sidebar .btnContainer button").removeClass('btn-clicked');

                num = [];
            })

            // 关闭按钮
            $(".sidebar .close").click(function () {
                $('.sidebar').hide();
            })

            $(".sidebar .btnContainer button").click(function () {
                $(this).toggleClass('btn-clicked');
                num.push(parseInt(this.innerHTML, 10));
            })

            // sidebar的夹紧按钮
            $(".sidebar div:eq(2) button:eq(0)").click(function () {
                let msg = "";
                // 夹紧
                msg = 'F' + (port + 1) + '(Y' + settings.valve[port].out[0] + '=1,Y' + settings.valve[port].out[1] + '=0)' + 'J';

                // post msg
                $.post("./hand.txt", { data: msg }, function () {
                    console.log(msg);
                })
            })

            // sidebar的打开按钮
            $(".sidebar div:eq(2) button:eq(1)").click(function () {
                let msg = "";
                // 打开
                msg = 'F' + (port + 1) + '(Y' + settings.valve[port].out[0] + '=0,Y' + settings.valve[port].out[1] + '=1)' + 'K';

                // post msg
                $.post("./hand.txt", { data: msg }, function () {
                    console.log(msg);
                })
            })

            // 每500毫秒检查一次.sidebar的display属性，如果为flex，执行渲染btnContainer
            setInterval(checkSidebarDisplay, 500);
        }
    })
});