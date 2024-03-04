// 界面准备时自动获取setting数据
$(document).ready(function () {
    var msg="";
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
                    func1(index) {
                        const clickedButton = $(event.target);
                        clickedButton.parent().find('button').removeClass('select');
                        clickedButton.addClass('select');
                         $.post('../txt/1.txt', { data: '张三'}, function (res) {
                             console.log(res);
                         });
                    },
                    func2(index) {
                        const clickedButton = $(event.target);
                        clickedButton.parent().find('button').removeClass('select');
                        clickedButton.addClass('select');
                        console.log("点击了阀门" + index);
                    },
                    func3(index) {
                        const clickedButton = $(event.target);
                        clickedButton.parent().find('button').removeClass('select');
                        clickedButton.addClass('select');
                        console.log("点击了阀门" + index);
                    }
                }
            })
            // -------------------------------------------
        }
    })
});