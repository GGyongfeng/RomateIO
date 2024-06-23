// ----------------总说明------------
// 页面准备时,先读取setting.json数据存入settings变量
// 所有设置的修改都是对settings这一json对象的修改
// 只有最后提交的时候会对setting.json进行修改

var settings = "";
var allProgramParams = [];
$(document).ready(function () {
    $.when(
        $.get("./setting.json"),
        $.get("/allProgramParams.json")
    ).then(function (res1, res2) {
        // res1[0] 是 ./setting.json 的响应数据内容
        // res2[0] 是 ./allProgramParams.json 的响应数据内容
        settings = res1[0];
        allProgramParams = res2[0];

        new Vue({
            el: '#SettingPart',
            data: {
                Programlist: allProgramParams,
                initialSelectedProgram: settings.programID
            },
            mounted() {
                // 可以在这里执行其他初始化逻辑
                $('#productSelection').change(function () {
                    let selectedValue = $(this).val(); // 获取选中的值
                    console.log('选中的程序:', selectedValue);
                    settings.programID = selectedValue;
                    settings.programName = allProgramParams[selectedValue - 1].programName;
                });

                //显示阀门数量
                display_number_of_valves();

                // 设置程序选中项
                $('#productSelection').val(settings.programID);

                // 提交设置
                $('.SettingCommit').click(function () {
                    if (confirm("确认保存嘛？")) {
                        console.log('settings:', settings);
                        SendSetting(settings);
                    } else {
                        // 取消操作
                    }
                });

                $('.FamenNum button').click(function () {
                    const num = parseInt(this.innerHTML, 10)
                    settings.NumberOfValves = num;
                    $(this).parent().find('button').removeClass('btn-clicked');
                    $(this).addClass('btn-clicked');
                })
            }
        })
    });
});


// 显示阀门数量
function display_number_of_valves() {
    // 判断settings.numberOfValves并显示阀门数量
    if (settings.NumberOfValves === 8) {
        $('.FamenNum button:eq(0)').addClass('btn-clicked'); // 第一个按钮
    } else if (settings.NumberOfValves === 16) {
        $('.FamenNum button:eq(1)').addClass('btn-clicked'); // 第二个按钮
    } else if (settings.NumberOfValves === 24) {
        $('.FamenNum button:eq(2)').addClass('btn-clicked'); // 第三个按钮
    }
}