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
                // 验证IP 地址是否正确的正则表达式
                const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

                //显示阀门数量
                display_number_of_valves();
                // 显示手自动模式
                if (settings.controlMode === 1) {
                    $('#manualMode').prop('checked', true).next('label').addClass('active');
                } else if (settings.controlMode === 0) {
                    $('#autoMode').prop('checked', true).next('label').addClass('active');
                }
                // 显示本机IP
                $('input[name="native_ip"]').val(settings.Native_IP);
                // 显示 PCP IP 
                $('input[name="pcp_ip"]').val(settings.PCP_IP);
                // 显示DB地址
                $('input[name="db_address"]').val(settings.DB_address);
                // 显示版本号
                $('input[name="Version"]').val(settings.Version);

                // 可以在这里执行其他初始化逻辑
                $('#productSelection').change(function () {
                    let selectedValue = $(this).val(); // 获取选中的值
                    console.log('选中的程序:', selectedValue);
                    settings.programID = selectedValue;
                    settings.programName = allProgramParams[selectedValue - 1].programName;
                });

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

                // 设置阀门数量
                $('.FamenNum button').click(function () {
                    const num = parseInt(this.innerHTML, 10)
                    settings.NumberOfValves = num;
                    $(this).parent().find('button').removeClass('btn-clicked');
                    $(this).addClass('btn-clicked');
                })

                // 设置手自动模式
                $('input[type=radio][name=modeOptions]').change(function () {
                    if (this.id === 'manualMode') {
                        settings.controlMode = 1;
                    } else if (this.id === 'autoMode') {
                        settings.controlMode = 0;
                    }
                });

                // 设置 本机IP
                $('input[name="native_ip"]').on('blur', function () {
                    const inputVal = $(this).val();

                    if (ipPattern.test(inputVal)) {
                        // 如果输入内容是有效的 IP 地址
                        settings.Native_IP = inputVal; // 更新 settings.Native_IP
                    } else {
                        // 如果输入内容不是有效的 IP 地址
                        alert('请输入IP地址格式');
                        $(this).val(settings.Native_IP); // 重置为原始 IP 地址
                    }
                });

                // 设置PCP_IP
                $('input[name="pcp_ip"]').on('blur', function () {
                    const inputVal = $(this).val();

                    if (ipPattern.test(inputVal)) {
                        settings.PCP_IP = inputVal; // 更新 settings.PCP_IP
                    } else {
                        alert('请输入IP地址格式');
                        $(this).val(settings.PCP_IP); // 重置为原始 IP 地址
                    }
                });

                // 设置DB地址
                $('input[name="db_address"]').on('blur', function () {
                    const inputVal = $(this).val();
                    const dbPattern = /^[1-9][0-9]?$|^900$/; // 验证 1 到 900 的整数
                    if (dbPattern.test(inputVal)) {
                        settings.DB_address = inputVal; // 更新 settings.DB_address
                    } else {
                        alert('DB地址应为1-900的整数值');
                        $(this).val(settings.DB_address); // 重置为原始 DB 地址
                    }
                });
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