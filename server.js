//1.引入fs path express模块
const fs = require('fs');
const path = require('path');
const express = require('express');
const { exec } = require('child_process');

//2.创建web服务器框架
const server = express();

var bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({ extended: false }));

//3.对外提供web文件夹的静态资源
server.use(express.static(path.join(__dirname, './web'), { index: 'login.html' }));
server.use(express.static(path.join(__dirname, './txt')));
server.use(express.static(path.join(__dirname, './programs')));

// Middleware to parse JSON bodies
server.use(express.json());


//4.接受post请求
// 处理reboot的post请求
const rebootPSW = '6688';
server.post('/reboot', (req, res) => {
    const { password } = req.body;

    if (password === rebootPSW) {
        exec('sudo reboot', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error}`);
                return res.status(500).json({ message: '重启失败' });
            }
            res.json({ message: 'System is rebooting...' });
        });
    } else {
        res.status(403).json({ message: '密码错误' });
    }
});


server.post('*', (req, res) => {
    const url = req.url;
    const data = req.body.data;
    const fpath = path.join(__dirname, 'txt', url);

    // 接受的数据data写入到指定url位置
    fs.writeFile(fpath, data, 'utf-8', function (err) {
        if (err) { return console.log('读取失败'); }
    });

    // IP地址和DB地址写入到PLC_CONF.txt
    if (url === '/setting.json') {
        writeToPLC_CONF(data);
    }

    res.send('post Success');
})


//6.启动web服务器
server.listen(8080, () => {
    // 读取./txt/PLC-CONF.txt和./txt/allProgramParams.json，更新setting.json
    const plcConfPath = path.join(__dirname, 'txt', 'PLC-CONF.txt');
    const settingPath = path.join(__dirname, 'txt', 'setting.json');
    const allProgramParamsPath = path.join(__dirname, 'txt', 'allProgramParams.json');

    // 读取 PLC-CONF.txt
    fs.readFile(plcConfPath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件错误:', err);
            return;
        }

        const lines = data.split('\n').map(line => line.trim());
        const newSettings = {
            "Native_IP": lines[0] || '',
            "PCP_IP": lines[1] || '',
            "DB_address": lines[2] || ''
        };

        // 读取现有的 settings.json
        fs.readFile(settingPath, 'utf8', (err, settingsData) => {
            if (err) {
                console.error('读取 settings.json 错误:', err);
                return;
            }

            let settings;
            try {
                settings = JSON.parse(settingsData);
            } catch (parseErr) {
                console.error('解析 JSON 错误:', parseErr);
                return;
            }

            // 读取 allProgramParams.json
            fs.readFile(allProgramParamsPath, 'utf8', (err, paramsData) => {
                if (err) {
                    console.error('读取 allProgramParams.json 错误:', err);
                    return;
                }

                let allProgramParams;
                try {
                    allProgramParams = JSON.parse(paramsData);
                } catch (parseErr) {
                    console.error('解析 allProgramParams JSON 错误:', parseErr);
                    return;
                }

                // 更新 programName
                if (settings.programID && allProgramParams[settings.programID - 1]) {
                    settings.programName = allProgramParams[settings.programID - 1].programName;
                }

                // 更新设置
                Object.assign(settings, newSettings);

                // 写回更新后的 settings.json
                fs.writeFile(settingPath, JSON.stringify(settings, null, 2), (err) => {
                    if (err) {
                        console.error('写入文件错误:', err);
                        return;
                    }
                    console.log('设置已更新:', settings);
                });
            });
        });
    });




    console.log('server running at http://localhost:8080');
})



// 封装处理 PLC_CONF.txt 的函数
function writeToPLC_CONF(data) {
    const jsonData = JSON.parse(data);
    const { Native_IP, PCP_IP, DB_address } = jsonData;
    const content = `${Native_IP}\n${PCP_IP}\n${DB_address}`;
    const plcConfPath = path.join(__dirname, 'txt', 'PLC-CONF.txt');
    fs.writeFile(plcConfPath, content, 'utf-8', () => { });
}