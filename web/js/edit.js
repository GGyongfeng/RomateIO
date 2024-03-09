$(document).ready(function () {

    var msg = "";
    $.ajax({
        type: "get",
        url: "./setting.json",
        success: function (settings) {
            console.log('请求settings.json成功:' + settings.nums);

            for (let i = 1; i <= settings.nums; i++) {
                $(".action").eq(0).append(
                    '<div>'+
                    '<p>阀门' + i +'</p>'+
                    '<button>夹紧</button>' +
                    '<button>中位</button>' +
                    '<button>放松</button>' +
                    '</div>'
                );
            }
        }
    })
});