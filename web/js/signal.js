// 界面准备时自动获取setting数据
$(document).ready(function () {
    $.ajax({
        type: "get",
        url: "./setting.json",
        success: function (res) {
            console.log('请求settings.json成功:');

            // -------------------------------------------
            new Vue({
                el: '#app',
                data: {
                    nums: res.nums,
                    nihao: "hello",
                    settings: res
                },
                computed: {
                    range() {
                        return Array.from({ length: this.nums }, (_, index) => index);
                    }
                },
                methods: {
                    // 写function
                }
            })
            // -------------------------------------------

            $(".part button").click(function () {
                var target = $(this).data('target');
                // 切换sidebar的display属性
                $('.sidebar').show();

                // 多个按钮：同时只能一个被选中时
                $(".part").find('button').removeClass('btn-clicked');
                $(this).addClass('btn-clicked');
            })

            $(".sidebar .close").click(function () {
                $('.sidebar').hide();
            })

        }
    })
});