//1.引入fs path express模块
const fs = require('fs');
const path = require('path');
const express = require('express');
const { exec } = require('child_process');

const archiver = require('archiver');
const unzipper = require('unzipper');
const multer = require('multer');

//2.创建web服务器框架
const server = express();
const upload = multer({
    dest: 'uploads/', // 上传文件临时存放目录
    limits: { fileSize: 1 * 1024 * 1024 } // 限制为 1MB
});


var bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({ extended: false }));

//3.对外提供web文件夹的静态资源
server.use(express.static(path.join(__dirname, './web'), { index: 'login.html' }));
server.use(express.static(path.join(__dirname, './txt')));
server.use(express.static(path.join(__dirname, './programs')));

// Middleware to parse JSON bodies
server.use(express.json());

// 在文件开头添加一个常量来存储基础路径
const BASE_PATH = path.join(__dirname);

//4.接受post请求
// 处理上传 ZIP 文件的 POST 请求
server.post('/upload-zip', upload.single('zipFile'), (req, res) => {
    // 检查是否有文件
    if (!req.file) {
        return res.status(400).send('未上传文件或文件过大，请确保文件小于1MB。');
    }

    const zipPath = req.file.path; // 获取上传的 ZIP 文件路径    
    const extractPath = path.join(BASE_PATH, 'uploads', 'extracted'); // 设置解压路径

    // 解压 ZIP 文件
    fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractPath })) // 解压到指定路径
        .on('close', () => {
            const extractedFiles = fs.readdirSync(extractPath); // 读取解压后的文件
            const isValid = checkZipFile(extractedFiles); // 验证文件是否符合要求

            if (isValid) {
                const txtPath = path.join(BASE_PATH, 'txt');
                if (fs.existsSync(txtPath)) {
                    fs.rmSync(txtPath, { recursive: true });
                }
                fs.renameSync(extractPath, txtPath);

                res.status(200).send('配置更新成功'); // 成功响应
            } else {
                fs.rmSync(extractPath, { recursive: true, force: true }); // 删除解压内容
                res.status(400).send('上传文件版本与当前设备的版本不一致,\n可能存在错误,\n请更新后尝试'); // 失败响应
            }

            fs.unlinkSync(zipPath); // 删除上传的 ZIP 文件
        })
        .on('error', (err) => {
            console.error(err);
            res.status(500).send('服务器配置过程中出现错误'); // 处理解压错误
        });
});

// 处理下载文件的代码
server.post('/download', (req, res) => {
    const { projects } = req.body;

    if (projects === "") {
        const zipName = 'files.zip';
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${zipName}`);

        const archive = archiver('zip', {
            zlib: { level: 9 } // 设置最高压缩级别
        });

        // 错误处理
        archive.on('error', (err) => {
            console.error('打包错误:', err);
            res.status(500).send({ error: '文件打包失败' });
        });

        // 将存档管道连接到响应
        archive.pipe(res);

        // 确保目录存在
        const dir = path.join(BASE_PATH, 'txt');
        if (!fs.existsSync(dir)) {
            return res.status(404).send({ error: '目录不存在' });
        }

        try {
            archive.directory(dir, false);
            archive.finalize();
        } catch (err) {
            console.error('打包过程错误:', err);
            res.status(500).send({ error: '打包过程出错' });
        }
    } else {
        res.status(400).send('无效的项目数据');
    }
});

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
    const fpath = path.join(BASE_PATH, 'txt', url);

    // 接受的数据data写入到指定url位置
    writeToFile(fpath, data);

    // IP地址和DB地址写入到PLC_CONF.txt
    if (url === '/setting.json') {
        writeToPLC_CONF(data);
    }

    res.send('post Success');
})

// 6.get请求
server.get('/get_states', (req, res) => {
     // 设置响应头为 SSE 格式
     res.setHeader('Content-Type', 'text/event-stream');
     res.setHeader('Cache-Control', 'no-cache');
     res.setHeader('Connection', 'keep-alive');
 
     // 读取 state.txt 文件
     const filePath = path.join(BASE_PATH, './txt/state.txt');
     fs.readFile(filePath, 'utf8', (err, data) => {
         if (err) {
             console.error('Error reading the file:', err);
             return res.status(500).send('Error reading the state file');
         }
 
         try {
             // 解析文件内容
             const state = JSON.parse(data);
 
             // 向客户端推送初始状态
             res.write(`data: ${JSON.stringify(state)}\n\n`);
 
             // 设置定时器每秒推送一次最新状态
             setInterval(() => {
                 fs.readFile(filePath, 'utf8', (err, newData) => {
                     if (err) {
                         console.error('Error reading the file:', err);
                         return res.status(500).send('Error reading the state file');
                     }
 
                     try {
                         const newState = JSON.parse(newData);
                         res.write(`data: ${JSON.stringify(newState)}\n\n`);
                     } catch (parseErr) {
                         console.error('Error parsing JSON:', parseErr);
                     }
                 });
             }, 1000); // 每秒推送一次数据
         } catch (parseErr) {
             console.error('Error parsing JSON:', parseErr);
             return res.status(500).send('Error parsing the state file');
         }
     });
});


//7.启动web服务器
server.listen(8080, () => {
    // 确保必要的目录存在
    const directories = ['txt', 'uploads', 'programs'];
    directories.forEach(dir => {
        const dirPath = path.join(BASE_PATH, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });

    // 读取./txt/PLC-CONF.txt和./txt/allProgramParams.json，更新setting.json
    const plcConfPath = path.join(BASE_PATH, 'txt', 'PLC-CONF.txt');
    const settingPath = path.join(BASE_PATH, 'txt', 'setting.json');
    const allProgramParamsPath = path.join(BASE_PATH, 'txt', 'allProgramParams.json');

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
    const plcConfPath = path.join(BASE_PATH, 'txt', 'PLC-CONF.txt');
    fs.writeFile(plcConfPath, content, 'utf-8', () => { });
}


// 上传配置信息时对比版本是否一致
function checkZipFile(files) {
    // 需要检查的文件名
    const requiredFiles = ['PLC-CONF.txt', 'setting.json', 'allProgramParams.json'];

    // 检查每个需要的文件是否在提供的文件列表中
    return requiredFiles.every(file => files.includes(file));
}

function writeToFile(fpath, data) {
    // 获取目录路径
    const dir = path.dirname(fpath);

    // 检查目录是否存在
    fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
            return console.log('创建目录失败:', err);
        }

        // 目录创建成功，写入文件
        fs.writeFile(fpath, data, 'utf-8', function (err) {
            if (err) {
                return console.log('写入文件失败:', err);
            }
            console.log('文件写入成功');
        });
    });
}