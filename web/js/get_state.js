$(document).ready(function () {
    const eventSource = new EventSource('/get_states');
    let heartValues = []; // 用于存储最近接收到的 states.heart 值


    // 当接收到新的数据时触发此事件
    eventSource.onmessage = (event) => {
        try {
            // 解析接收到的 JSON 数据
            const states = JSON.parse(event.data);
            
            // 检查 states.heart 是否连续三次相同
            heartValues.push(states.heart);
            if (heartValues.length > 2) {
                heartValues.shift(); // 保持数组长度为3
            }
            
            if (states.mode === "1") {
                $("#CXBJ .indicator").addClass('blink');

                // 如果连续三次相同，添加 "off" 样式
                if (heartValues.length === 2 && heartValues[0] === heartValues[1]) {
                    updateIndicator('on')
                } else if (states.SO.SO_3 === "1") {
                    updateIndicator('off')
                }else {
                    updateIndicator('blink')// 添加闪烁样式
                }

                $('a.others').on('click', function (event) {
                    event.preventDefault();
                    const actionName = $(this).find('span').text(); // 获取对应的操作名称
                    $('#alert-message').text(`程序正在运行，无法进行“${actionName}”`); // 动态更新提示信息
                    $('#alert-box').fadeIn();
                });
            } else {
                $("#CXBJ .indicator").removeClass('blink');
                updateIndicator('none') // 不运行
                $('a.others').off('click'); // 移除之前的点击事件
            }

            // 关闭提示框
            $('#alert-close').on('click', function () {
                $('#alert-box').fadeOut();
            });
        } catch (err) {
            console.error('Error parsing state data:', err);
        }
    };





    // 监听连接错误
    eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
    };

    function updateIndicator(state) {
        // 移除所有样式
        $('#YXZT .indicator').removeClass('on off blink');

        if (state === 'on') {
            $('#YXZT .indicator').addClass('on'); // 添加 "on" 样式
        } else if (state === 'off') {
            $('#YXZT .indicator').addClass('off'); // 添加 "off" 样式
        } else if (state === 'blink') {
            $('#YXZT .indicator').addClass('blink'); // 添加 "blink" 样式
        }
        // 如果是 'none'，则不做任何操作，已在开头移除所有样式
    }
});