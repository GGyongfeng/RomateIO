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
                    settings:res
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
        }
    })
});