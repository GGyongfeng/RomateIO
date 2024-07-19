//1.引入fs path express模块
const fs = require('fs');
const path = require('path');
const express = require('express');

//2.创建web服务器框架
const server = express();

var bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({ extended: false }));

//3.对外提供web文件夹的静态资源
server.use(express.static(path.join(__dirname, './web'), { index: 'login.html' }));
server.use(express.static(path.join(__dirname, './txt')));
server.use(express.static(path.join(__dirname, './programs')));

//4.接受post请求
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
    console.log('server running at localhost:8080');
})

// 封装处理 PLC_CONF.txt 的函数
function writeToPLC_CONF(data) {
    const jsonData = JSON.parse(data);
    const { Native_IP, PCP_IP, DB_address } = jsonData;
    const content = `${Native_IP}\n${PCP_IP}\n${DB_address}`;
    const plcConfPath = path.join(__dirname, 'txt', 'PLC-CONF.txt');
    fs.writeFile(plcConfPath, content, 'utf-8', () => { });
}