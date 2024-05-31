// 界面准备时自动获取setting数据
$(document).ready(function () {
    $.ajax({
        type: "get",
        url: "./setting.json",
        success: function (data) {
            settings = data;
            console.log('请求settings.json成功:');
            // -------------------------------------------
            new Vue({
                el: '.action',
                data: {
                    nums: settings.nums
                },
                computed: {
                    range() {
                        return Array.from({ length: this.nums }, (_, index) => index);
                    }
                },
                methods: {
                    func1(index) {
                        // 切换被选中按钮
                        const clickedButton = $(event.target);
                        clickedButton.parent().find('button').removeClass('select');
                        clickedButton.addClass('select');

                        // getAction
                        msg = getAction(index);
                        console.log(msg);

                        // 发送  将msg写入./txt/hand.txt
                        $.ajax({
                            type: "post",
                            url: "./txt/hand.txt",
                            data: { data: msg },
                            success: function (res) {
                                console.log(res);
                            }
                        })
                    }
                }
            })
            // -------------------------------------------

            // ----------inout模块的js代码-----------------
            if (settings.inout_display === 1) {
                $('.inout').show(); // 如果 settings.inout_display 等于 1，则显示 .input 类元素
            } else {
                $('.inout').hide(); // 否则，隐藏 .input 类元素
            }
            for (let i = 1; i <= 32; i++) {
                $(".in_div div").eq(0).append(
                    '<button>' + i + '</button>'
                );
                $(".out_div div").eq(0).append(
                    '<button>' + i + '</button>'
                );
            }
            $('.in_div button').click(function () {
                $(this).toggleClass('btn-clicked');
            })
            $('#refresh').click(function () {
                $.ajax({
                    type: "get",
                    url: "../txt/OUT.txt",
                    success: function (res) {
                        const OUT = JSON.parse(res);
                        let i = 0;
                        // 使用for...in循环遍历对象的键
                        for (let key in OUT) {
                            // 确保属性是对象自身的属性，而不是原型链上的属性
                            if (OUT.hasOwnProperty(key)) {
                                // 获取key的值
                                const value = OUT[key];

                                // 根据值来决定是否添加或删除btn-clicked类
                                if (value === 1) {
                                    // 添加btn-clicked类
                                    $('.out_div div button:eq(' + i + ')').addClass('btn-clicked');
                                } else {
                                    // 删除btn-clicked类
                                    $('.out_div div button:eq(' + i + ')').removeClass('btn-clicked');
                                }
                            }
                            i++;
                        }
                    }
                })
            })
            // -------------------------------------------
        }
    })
    $.ajax({
        type: "post",
        url: "./txt/command.txt",
        data: { data: "SP,hand.txt" },
        success: function (res) {
            console.log(res);
        }
    })
});