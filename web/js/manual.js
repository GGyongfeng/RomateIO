// 界面准备时自动获取数据
$(document).ready(function () {
    $.when(
        $.get("./setting.json"),
        $.get("/allProgramParams.json")
    ).then(function (res1, res2) {
        // res1[0] 是 ./setting.json 的响应数据内容
        // res2[0] 是 ./allProgramParams.json 的响应数据内容
        settings = res1[0];

        $.ajax({
            type: "post",
            url: "./command.txt",
            data: { data: "SP,hand.txt" },
            success: function (res) {
                console.log(res);
            }
        })

        allProgramParams = res2[0];
        // 所选程序的阀门参数
        valveParam = allProgramParams[settings.programID - 1].valve;
        // -------------------------------------------

        new Vue({
            el: '.action',
            data: {
                NumberOfValves: settings.NumberOfValves
            },
            computed: {
                range() {
                    return Array.from({ length: this.NumberOfValves }, (_, index) => index);
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

                    // 发送  将msg写入./hand.txt
                    $.ajax({
                        type: "post",
                        url: "./hand.txt",
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
                url: "./OUT.txt",
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
        //夹具名称显示以及修改 vue实现 
        new Vue({
            el: '#showProgramName',
            data: {
                msg: settings,
            },
            mounted() {
                $('#showProgramName div').on('click', function () {
                    // 显示模态框
                    $('#showProgramNameInput').css('display', 'flex');

                    // 确认按钮点击事件
                    $('#showProgramNameInput .confirmBtn').on('click', function () {
                        // if (confirm("确认保存嘛？")) {
                        const newName = $('#newNameInput').val();

                        console.log("修改程序名称为：" + newName);

                        // 将新名称输入到setting.json和allProgramParams.json中
                        modifyProgramName(newName);
                        // 关闭模态框
                        $('#showProgramNameInput').css('display', 'none');
                        // }
                    });

                    // 取消按钮点击事件
                    $('#showProgramNameInput .cancelBtn').on('click', function () {
                        // 关闭模态框
                        $('#showProgramNameInput').css('display', 'none');
                    });
                });
            }
        })
    })
});