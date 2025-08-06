  小程序
工具
开发
中文
EN
取消
工具
开发辅助 /命令行调用
若需在不依赖开发者工具场景如自身业务工程流水线上进行小程序项目上传、预览，则推荐使用 miniprogram-ci。

开发者工具提供了命令行与 HTTP 服务两种接口供外部调用，开发者可以通过命令行或 HTTP 请求指示工具进行登录、预览、上传等操作。

命令行 V2
升级说明：自 1.02.202003092 开始，CLI & HTTP 接口升级 v2 版本，在 v2 版本中，旧版命令仍然可以使用，但已废弃并会在未来移除，请使用 v2 命令。v2 版本增加了云开发管理操作支持、优化命令形式、增加细致状态提示、支持长时间命令执行、支持国际化（中英文选择）等。

通过命令行调用安装完成的工具可执行文件，完成登录、预览、上传、自动化测试等操作。调用返回码为 0 时代表正常，为 -1 时错误。

要使用命令行，注意首先需要在开发者工具的设置 -> 安全设置中开启服务端口。

命令行工具所在位置：

macOS: <安装路径>/Contents/MacOS/cli

Windows: <安装路径>/cli.bat

命令索引
可以使用 cli -h 查看所有命令，使用 cli --lang zh -h 可以使用中文版本的帮助。

分类	作用	命令
帮助	查看帮助	cli -h
登录	登录工具	cli login
是否登录工具	cli islogin
小程序代码	预览	cli preview
上传代码	cli upload
自动预览	cli auto-preview
开启自动化	cli auto
开启自动化	cli auto-replay
构建 npm	cli build-npm
清除缓存	cli cache
工具窗口	启动工具	cli open
打开其他项目	cli open-other
关闭项目窗口	cli close
关闭工具	cli quit
重建文件监听	cli reset-fileutils
云开发	云开发操作	cli cloud -h
云环境相关操作	cli cloud env -h
云函数相关操作	cli cloud functions -h
查看云环境列表	cli cloud env list
查看云函数列表	cli cloud functions list
查看云函数信息	cli cloud functions info
上传云函数	cli cloud functions deploy
增量上传云函数	cli cloud functions inc-deploy
下载云函数	cli cloud functions download
所有命令后均可接 -h 或 --help 查看帮助。

通用选项
项目选项
命令	说明
--project	项目路径
--appid	小程序 AppID 或第三方平台 AppID。如果有提供 --project，该选项将忽略
--ext-appid	第三方平台开发时被开发 AppID。如果有提供 --project，该选项将忽略
全局选项
操作	命令	说明
查看帮助	-h, --help	
选择语言	--lang	可选。en 或 zh。默认 en
指定端口号	--port	可选。工具 HTTP 服务端口。如果工具没有启动，则会启动并在给定端口号启动服务。如果工具已启动并且端口不同，需要先退出工具再重新执行。
开启调试模式	--debug	可选。开启调试模式，用于输出额外信息以协助定位问题
命令文档
登录工具
命令行提供两种登录方式：一是将登录二维码转成 base64 给用户，让用户自己集成到自己系统中使用；二是将二维码打印在命令行中。

--qr-format, -f: 可选。二维码格式，选项：terminal, image, base64。默认 terminal

--qr-size, -f: 可选。二维码大小，仅在 qr-format=terminal 时生效，选项：small, default。默认 default（工具版本 1.05.2105072 起）

--qr-output, -o: 可选。二维码会被输出到给定路径

--result-output, -r: 输出登录结果到指定文件

示例：

# 登录，在终端中打印登录二维码
cli login
# 登录，在终端中打印登录 base64 形式的二维码
cli login -f base64
# 登录，二维码转成 base64 并存到文件 /Users/username/code.txt
cli login -f base64 -o /Users/username/code.txt
# 登录，并输出登录结果到文件 /Users/username/result.json
cli login -r /Users/username/result.json
是否已经登录工具
查询是否已经登陆工具

cli islogin
预览
帮助：cli preview -h

选项

--qr-format, -f: 可选。二维码格式，选项：terminal, image, base64。默认terminal

--qr-size, -f: 可选。二维码大小，仅在 qr-format=terminal 时生效，选项：small, default。默认 default（工具版本 1.05.2105072 起）

--qr-output, -o: 可选。二维码会被输出到给定路径

--info-output, -i: 可选。相关信息会被输出到给定路径

--project: 项目路径

示例：

# 预览，在终端中打印登录二维码
cli preview --project /Users/username/demo
# 预览，二维码转成 base64 并存到文件 /Users/username/code.txt
cli preview --project /Users/username/demo --qr-output base64@/Users/username/code.txt --qr-format base64
# 预览，并将预览代码包大小等信息存入 /Users/username/info.json
cli preview --project /Users/username/demo --info-output /Users/username/info.json
# 预览，指定自定义编译条件，pathName
cli preview --compile-condition '{"pathName":"pages/index/index","query":"x=1&y=2"}'
自动预览
帮助：cli auto-preview -h

自动预览必须处于登录状态，如果没有登录，会提示需先登录。

--info-output <path>: 指定后，会将本次预览的额外信息以 json 格式输出至指定路径，如代码包大小、分包大小信息。

--project: 项目路径

示例：

# 预览，并将预览代码包大小等信息存入 /Users/username/info.json
cli auto-preview --project /Users/username/demo --info-output /Users/username/info.json
上传代码
帮助：cli upload -h

上传代码时必须处于登录状态，如果没有登录，会提示需先登录。

上传代码需要的信息包括项目根目录、版本号、以及可选的版本备注。

--version, -v: 上传代码，version 指定版本号，project_root 指定项目根路径。

--desc, -d: 上传代码时的备注。

--info-output, -i: 指定后，会将本次上传的额外信息以 json 格式输出至指定路径，如代码包大小、分包大小信息。

--project: 项目路径

示例：

# 上传路径 /Users/username/demo 下的项目，指定版本号为 1.0.0，版本备注为 initial release
cli upload --project /Users/username/demo -v 1.0.0 -d 'initial release'
# 上传并将代码包大小等信息存入 /Users/username/info.json
cli upload --project /Users/username/demo -v 1.0.0 -d 'initial release' -i /Users/username/info.json
构建 npm
命令行触发 npm 构建。

--project: 项目路径 --compile-type <type>：手动指定编译类型（"miniprogram" | "plugin"），用于指定走 miniprogramRoot 还是 pluginRoot，优先级比 project.config.json 中的高

示例：

cli build-npm --project /Users/username/demo
开启自动化
开启小程序自动化功能，详细介绍可点此查看。

--project：打开指定项目并开启自动化功能。

--auto-port <port>：指定自动化监听端口。

--auto-account <openid>：指定使用 openid。

示例：

cli auto --project /Users/username/demo --auto-port 9420
打开自动化测试窗口
打开自动化测试窗口，同时可以开始回放之前录制好的测试用例。 录制回放可点此查看。 最低可用工具版本：1.05.2111232

--project：项目路径 --replay-all: 回放全部

# 打开自动化测试窗口
cli auto-replay --project /Users/username/demo
# 打开自动化测试窗口并回放全部测试用例
cli auto-replay --project /Users/username/demo --replay-all
启动工具
--project: 可选，如果不带 --project，只是打开工具。如果带 project path，则打开路径中的项目，每次执行都会自动编译刷新，并且自动打开模拟器和调试器。projectpath 不能是相对路径。项目路径中必须含正确格式的 project.config.json 且其中有 appid 和 projectname 字段。 --pure-simulator: 可选。如果不使用 --pure-simulator 参数则为默认项目编辑窗口模式。如果使用 --pure-simulator 参数，则为纯模拟器模式。支持小游戏和小程序。

示例：

# 打开工具
cli open
# 打开路径 /Users/username/demo 下的项目
cli open --project /Users/username/demo
打开其他项目
可以通过cli命令行在工具中以「其他」项目的形式打开文件或者文件夹。（纯编辑器模式）

--project: 必选，指定打开的文件或者文件夹路径，支持绝对路径和相对路径

示例：

# 打开指定项目，在「其他」项目窗口中打开
cli open-other --project /Users/username/demo
关闭项目窗口
关闭项目窗口

--project: 可选，如果指定的 project_root 项目被打开，将会被自动关闭

示例：

# 关闭指定项目
cli close --project /Users/username/demo
注：关闭项目时，会有弹窗提示是否阻止；如未阻止，将在 3 秒后关闭

关闭工具
关闭开发者工具

# 关闭开发者工具
cli quit
注：关闭开发者工具时，会有弹窗提示是否阻止；如未阻止，将在 3 秒后关闭

重建文件监听
重置工具内部文件缓存，重新监听项目文件。

--project：项目路径

# 需要确保先开启了项目的窗口
cli open --project /Users/username/demo
# 调用 reset-fileutils 可对开启的项目进行重建文件监听
cli reset-fileutils --project /Users/username/demo
清除工具缓存
帮助：cli cache -h

--clean, -c: 缓存类型 storage(数据)/file(文件)/seeion(登陆)/auth(授权)/network(网络)/compile(编译)/all(所有)

示例：

# clean all
cli cache --clean all --project /Users/xxx/miniprogram-10
# clean storage
cli cache --clean storage --project /Users/xxx/miniprogram-10
云开发操作
云开发命令帮助：cli cloud -h

云开发云环境命令帮助：cli cloud env -h

云开发云函数命令帮助：cli cloud functions -h

在云开发命令中，除非特殊说明，均可通过指定 --project 选项或 --appid （如果是第三方平台则还加上 --ext-appid）两者二选一的方式进行操作。

查看云环境列表
帮助：cli cloud env list -h

示例：

# 通过 --project 查看
cli cloud env list --project /Users/username/demo
# 通过 --appid 查看
cli cloud env list --appid wx1111111111111
查看云函数列表
帮助：cli cloud functions list -h

--env, -e: 云环境 ID

示例：

# 通过 --project 查看环境 test-123 下的线上云函数
cli cloud functions list --env test-123 --project /Users/username/demo
# 通过 --appid 查看环境 test-123 下的线上云函数
cli cloud functions list --env test-123 --appid wx11111111111111
查看云函数信息
帮助：cli cloud functions info -h

--env, -e: 云环境 ID

--names, -n: 云函数名称，多个云函数则以空格分隔，例：cli cloud functions info --names func_a func_b

示例：

# 通过 --project 查看环境 test-123 下的云函数 aaa, bbb 的信息
cli cloud functions info --env test-123 --names aaa bbb --project /Users/username/demo
# 通过 --appid 查看环境 test-123 下的云函数 aaa, bbb 的信息
cli cloud functions info --env test-123 --names aaa bbb --appid wx1111111111111
上传云函数
帮助：cli cloud functions deploy -h

--env, -e: 云环境 ID

--names, -n: 云函数名称，多个则以空格分隔。将会在 project.config.json 中指定的 "cloudfunctionRoot" 目录下找同名文件夹。若使用，则必须提供 --project 选项

--paths, -p: 需要部署的云函数目录路径，多个则以空格分隔。将认为函数目录名即为函数名称。使用该选项则云函数目录组织结构不用遵循必须在 project.config.json "cloudfunctionRoot" 的方式

--remote-npm-install, -r: 云端安装依赖，指定选项后 node_modules 将不会上传

示例：

# 上传云函数根目录下名为 func_a, func_b 的两个云函数至云环境 ENVID，开启云端安装依赖
cli cloud functions deploy --env ENVID -r --names func_a func_b --project /aaa/bbb/ccc
# 指定绝对路径目录上传，开启云端安装依赖
cli cloud functions deploy --env ENVID -r --paths /a/b/func_a /x/y/func_b --appid APPID
增量上传云函数
帮助：cli cloud functions inc-deploy -h

--env, -e: 云环境 ID

--name, -n: 需要更新的云函数名，使用该选项则不应使用 path 选项。将会在 project.config.json 中指定的 "cloudfunctionRoot" 目录下找同名文件夹。若使用，则必须提供 --project 选项

--path, -p: 云函数目录，使用该选项则不应使用 name 选项。将认为函数目录名即为函数名称。使用该选项则云函数目录组织结构不用遵循必须在 project.config.json "cloudfunctionRoot" 的方式

--file, -f: 需要增量更新的相对文件/目录路径，路径必须是相对云函数目录的路径

示例：

# 增量上传，指定云函数名
cli cloud functions inc-deploy --env ENVID --name func_a --file index.js --project /aaa/bbb/ccc
# 增量上传，指定云函数路径
cli cloud functions inc-deploy --env ENVID --path /aaa/func_a --file index.js --appid APPID
下载云函数
帮助：cli cloud functions download -h

--env, -e: 云环境 ID

--name, -n: 云函数名

--path, -p: 下载后的存放位置

示例：

# 下载云函数 func_a 至 /xxx/yyy 目录
cli cloud functions download --env ENVID --name func_a --path /xxx/yyy --appid APPID