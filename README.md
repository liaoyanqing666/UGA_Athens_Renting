# UGA_Athens_Renting

*每个学期我都整理一遍租房信息，我寻思既然我都做了，不如开源出来让所有需要租房的同学都能方便一些。*

这是一个面向 UGA 学生的 Athens 租房信息整理项目。项目将作者手动调研得到的公寓信息整理成 Excel，再转换为网页可直接读取的 `apartments.json`，最终以卡片页、表格页和地图页的形式展示出来，方便在选房时快速筛选、对比和查看细节。

如果你只是想使用这个项目，可以直接打开网页查看；如果你想补充、纠错或继续维护数据，这个仓库也提供了相对直接的更新方式。整个项目使用 CodeX 基于原生 HTML、CSS 和 JavaScript 编写，没有复杂依赖，适合长期维护和二次修改。

---

## 如何使用与页面说明

如果你只是想查看租房信息，可以直接使用下面三个页面：

- [主页](https://siyuanli.tech/UGA_Athens_Renting/)：以卡片形式浏览公寓，并支持筛选、排序、地图查看和数据统计说明，适合快速比较。
- [表格页](https://siyuanli.tech/UGA_Athens_Renting/table.html)：尽量贴近 Excel 的阅读方式，适合快速查原始字段，也支持下载原始 Excel。
- [更新页](https://siyuanli.tech/UGA_Athens_Renting/update.html)：适合想补充、纠错或参与维护这个项目的人。

---

## 如何更新数据

欢迎任何形式的更新建议。项目以静态网页的形式存在 GitHub 中，使用 Excel 表格作为数据源。如果你只是想指出错误，可以使用前两种方法；如果你希望自己更新并提交上来，欢迎使用第三种方法。

### 方法一：留下 Issue

- 如果你发现数据缺漏、价格变化、信息错误等，可以直接在 GitHub 中提 Issue。
- 在 Issue 里写清公寓名称、需要修改的字段，以及你看到的新信息即可。

### 方法二：联系作者

- 如果你完全不会使用 GitHub，或者希望与作者直接沟通，可以直接联系作者。
- 如果想要更新数据，建议把公寓名、要改的字段、修改后的值等全部信息一次写清。
- QQ 邮箱：`1793706453@qq.com`
- UGA 邮箱：`sl64343@uga.edu`

### 方法三：自行更新表格后运行脚本

- 创建 GitHub 账号，点击项目右上角 Fork，将此项目 Fork 到你自己的账户中。
- 修改根目录下的 `26fall renting.xlsx`。
- 使用 Python 运行 `scripts/build_data.py`，重新生成 `data/apartments.json`。
- 在本地打开 `index.html` 和 `table.html`，确认数据正常显示。你可以使用 VSCode 的 Live Server 插件来本地预览页面，也可以直接在浏览器里打开 HTML 文件。
- 将新的 `26fall renting.xlsx` 和 `data/apartments.json` 一起提交到你自己的仓库。
- 最后在 GitHub 上提交 Pull Request，等待项目维护者合并。

---

## 仓库结构

下面是这个项目里最关键的文件和目录：

- `26fall renting.xlsx`：原始租房数据表，也是最上游的数据源。
- `data/apartments.json`：由脚本生成的结构化数据，前端页面直接读取这个文件。
- `index.html`：主页面。
- `table.html`：数据表格页。
- `update.html`：更新说明页。
- `styles.css`：全站样式文件。
- `script.js`：主页筛选、排序、卡片渲染逻辑。
- `table.js`：表格页渲染逻辑。
- `theme.js`：日夜模式切换逻辑。
- `app-utils.js`：前端共用工具函数。
- `scripts/build_data.py`：将 Excel 转换为 `apartments.json` 的核心脚本。

如果你只是想改文案或界面，通常只需要改 HTML、CSS、JS；如果你想改数据本身，只需要改 Excel 并重新运行 `build_data.py`。

---

**如果这份整理对你有帮助，欢迎给项目点一个 Star。如果你有任何问题或者建议，也欢迎提 Issue 或者直接联系作者**
