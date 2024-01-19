// 界面准备时自动获取setting数据
$(document).ready(function () {
    // 在sidebar渲染接口号的按钮
    for (let i = 1; i <= 64; i++) {
        $('.btnContainer').append('<button>' + i + '</button>');
    }

    var num = [];

    $.ajax({
        type: "get",
        url: "./setting.json",
        success: function (res) {
            console.log('请求settings.json成功:');
            // -------------------------------------------
            new Vue({
                el: '#app',
                data: {
                    port: 0,
                    choose: "close",
                    nums: res.nums,
                    settings: res
                },
                computed: {
                    range() {
                        return Array.from({ length: this.nums }, (_, index) => index);
                    }
                },
                methods: {
                    // 选择端口
                    func1(index, data) {
                        this.port = index;
                        this.choose = data;
                    },

                    // 提交按钮的func
                    commit() {
                        // 将num传递给对应的接口号
                        switch (this.choose) {
                            case "close":
                                this.settings.valve[this.port].close = num;
                                break;
                            default:
                                this.settings.valve[this.port].open = num;
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

            $(".sidebar .close").click(function () {
                $('.sidebar').hide();
            })

            $(".sidebar .btnContainer button").click(function () {
                $(this).addClass('btn-clicked');
                num.push(parseInt(this.innerHTML, 10));
            })
        }
    })
});