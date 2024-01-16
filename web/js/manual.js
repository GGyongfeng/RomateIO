// 界面准备时自动获取setting数据
$(document).ready(function () {
    $.ajax({
        type: "get",
        url: "./setting.json",
        success: function (settings) {
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
                    select() {
                        // 获取当前点击的按钮
                        const clickedButton = $(event.target);
                        // 移除所有按钮上的 select 类
                        clickedButton.parent().find('button').removeClass('select');
                        // 给当前点击的按钮添加 select 类
                        clickedButton.addClass('select');
                    }
                }
            })
            // -------------------------------------------
        }
    })
});