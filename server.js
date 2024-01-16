//1.引入fs path express模块
const fs = require('fs');
const path = require('path');
const express = require('express');

//2.创建web服务器框架
const server = express();

var bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({ extended: false }));

//3.对外提供web文件夹的静态资源
server.use(express.static(path.join(__dirname, './web')));
server.use(express.static(path.join(__dirname, './txt')));

//4.接受post请求
server.post('*', (req, res) => {
    const url = req.url;
    const data = req.body.data;
    switch (url) {
        case '/setting.json':
            const fpath = path.join(__dirname, '/web', url);
            fs.writeFile(fpath,data, 'utf-8', function (err) {
                if (err) { return console.log('读取失败'); }
            });
            res.send('post Success');
            break;
        default:

            break;
    }
})

//4.启动web服务器
server.listen(8080, () => {
    console.log('server running at localhost:8080');
})
