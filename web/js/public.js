// 通用程序1：获取设置数据
// ------------------------------------------------
// 用于界面准备时自动获取setting数据
function GetSetting() {
    $.ajax({
        type: "get",
        url: "./setting.json",
        success: function (res) {
            console.log('请求settings.json成功:');
            settings = res;
            console.log(settings);
        }
    })
};
// );
// ------------------------------------------------


// 通用程序2:提交json格式的设置数据
// ------------------------------------------------

// 有关setting设置的解释
// json类型数据 按对象方式引用
// nums:阀门数量
// valve:[{close:0,open:1 },{close:0,open:1}]
// va1:{close:0,open:1 }
//close:1 夹到位的IN端口数
//open:2  松到位的IN端口数
// settings.val1[0].close=0


//调试阶段可以将console.log(settings)等同于下面这个部分，编写代码时使用即可
function SendSetting(settings) {
    // 将json数据→字符串类型数据 再进行发送
    const msg = JSON.stringify(settings);

    // 将msg发送给服务器，写入到setting.json文件
    $.ajax({
        type: "post",
        url: "/setting.json",
        data: { data: msg },
        success: function (res) {
            console.log(res);
        }
    })
}
// ------------------------------------------------
