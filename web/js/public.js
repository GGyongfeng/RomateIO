// 通用程序1：获取设置数据
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


// 通用程序2:提交json格式的设置数据
// 有关setting设置的解释
// json类型数据 按对象方式引用
// nums:阀门数量
// valve:[{close:0,open:1 },{close:0,open:1}]
// va1:{close:0,open:1 }
//close:1 夹到位的IN端口数
//open:2  松到位的IN端口数
// settings.val1[0].close=0
function SendSetting(settings) {
    // 将json数据→字符串类型数据 再进行发送
    const msg = JSON.stringify(settings);

    // 将msg发送给服务器，写入到setting.json文件
    $.ajax({
        type: "post",
        url: "./setting.json",
        data: { data: msg },
        success: function (res) {
            console.log(res);
        }
    })
}


function checkSidebarDisplay() {
    let sidebarDisplay = window.getComputedStyle(document.querySelector('.sidebar_sign')).getPropertyValue('display');

    if (sidebarDisplay === 'flex') {
        re_btnContainer(); // 如果.display属性为flex，则执行re_BtnContainer()函数
    }
}

// 读取刷新.btnContainer
function re_btnContainer() {
    $.get('./IO.txt', function (red) {
        res = red.replace(/\s/g, ''); // 去除空格

        // 将十六进制字符串转换为二进制字符串
        let binary = "";
        for (let i = 0; i < res.length; i++) {
            let hex = parseInt(res.charAt(i), 16).toString(2);
            // 确保每个字符都转换为4位二进制数
            while (hex.length < 4) {
                hex = '0' + hex;
            }
            binary += hex;
        }

        // 每8位进行倒序排列
        let reversedBinary = "";
        for (let i = 0; i < binary.length; i += 8) {
            let subStr = binary.substring(i, i + 8);
            reversedBinary += subStr.split('').reverse().join('');
        }

        for (let i = 0; i < 64; i++) {
            // 检查第i位是否为字符 '1'
            if (reversedBinary.charAt(i) === '1') {
                $(".btnContainer button").eq(i).addClass('GetSignal');
            } else {
                $(".btnContainer button").eq(i).removeClass('GetSignal');
            }
        }
        console.log("刷新btnContainer");
    })
}
