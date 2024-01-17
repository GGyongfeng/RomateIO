﻿# RomateIO-远程web控制工业夹具项目

### server.js文件

作用：开启服务器 发送到8080端口

开启方法：`RomateIO`目录下，在终端输入：

```shell
node server.js
```

然后访问：`localhost:8080`即可



### web_start.sh文件

作用：实现开机自启，包括wifi驱动，打开热点，自动开启服务器

使用方法：linux系统，导入到`/etc/profile.d/`文件夹下即可



### web文件夹：

**项目主要内容**，放置所有前端文件

链接：https://nuclqnctgoz7pwrknh3kcw.on.drv.tw/RomateIO/

**注**：用DirveToWed网站实现的公网发布，只能托管静态资源，post请求是无法实现的，因而有些功能不能完整演示，链接主要用于观看UI设计效果

同时，因为每次更新代码都要重新在DriveToWeb发布，不像`git push`这样简单，所以链接的内容效果并不一定是最新效果，最好是`git clone`一下





### 一些有用的文件

下面这些文件是搭建上面web网站项目中大量用到的css+js样式，引用下面的这些文件可以快速搭建一个这样的网站。

对于想要借鉴的访客来说，相比于其他文件，这些文件更有用。

#### 1、style.css

位置：`/web/css`

`eg-div`非常有用

重点可以看一下`button`和`.btn-clicked`,配合`pubulic.js`里面的`function example`非常好用

#### 2、public.js

位置：`/web/js`

提供一些可以参考的js
