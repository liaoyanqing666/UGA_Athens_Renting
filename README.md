# UGA_Athens_Renting

** Chinese Introduction: **

*每个学期我都整理一遍租房信息，我寻思既然我都做了，不如开源出来让所有需要租房的同学都能方便一些。*

这是一个面向 UGA 学生的 Athens 租房信息整理项目。项目将作者手动调研得到的公寓信息整理成 Excel，再转换为网页可直接读取的 `apartments.json`，最终以卡片页、表格页和地图页的形式展示出来，方便在选房时快速筛选、对比和查看细节。

如果你只是想使用这个项目，可以直接打开网页查看；如果你想补充、纠错或继续维护数据，这个仓库也提供了相对直接的更新方式。整个项目使用 CodeX 基于原生 HTML、CSS 和 JavaScript 编写，没有复杂依赖，适合长期维护和二次修改。

** English Introduction: **

*I update Athens housing information every semester. Since I already do the work, I might as well open-source it so other students can use it too.*

This repository is a housing information project for UGA students looking for apartments in Athens. The data is manually researched by the author, organized in Excel, converted into structured JSON files such as `apartments.json`, and then displayed as a card page, spreadsheet page, and map-friendly site so apartments can be filtered, compared, and reviewed quickly.

If you only want to use the project, you can open the website directly. If you want to correct data, add missing listings, or keep the dataset maintained, this repository also provides a straightforward update workflow. The whole project is built with native HTML, CSS, and JavaScript, plus a small Python script for data generation, so it is easy to maintain and modify over time.

[Clike here to switch to English version](#how-to-use--page-description)
---

## 如何使用与页面说明（Chinese）

如果你只是想查看租房信息，可以直接使用下面三个页面：

- [主页](https://siyuanli.tech/UGA_Athens_Renting/)：以卡片形式浏览公寓，并支持筛选、排序、地图查看和数据统计说明，适合快速比较。
- [表格页](https://siyuanli.tech/UGA_Athens_Renting/table.html)：尽量贴近 Excel 的阅读方式，适合快速查原始字段，也支持下载原始 Excel。
- [更新页](https://siyuanli.tech/UGA_Athens_Renting/update.html)：适合想补充、纠错或参与维护这个项目的人。


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

**如果这份整理对你有帮助，欢迎给项目点一个 Star。如果你有任何问题或者建议，也欢迎提 Issue 或者直接联系作者**

---

## How to Use & Page Description

If you only want to browse apartment information, start with these three pages:

- [Home Page](https://siyuanli.tech/UGA_Athens_Renting/index-en.html) : card-based apartment browsing with filters, sorting, map view, and data notes. Best for quick comparison.
- [Spreadsheet Page](https://siyuanli.tech/UGA_Athens_Renting/table-en.html) : closer to the original Excel view, useful when you want to scan raw fields directly. The source Excel can also be downloaded there.
- [Update Page](https://siyuanli.tech/UGA_Athens_Renting/update-en.html) : intended for contributors who want to fix, supplement, or maintain the dataset.


## How to Update the Data

Suggestions of any size are welcome. The project is hosted as a static website on GitHub and uses Excel files as the source of truth. If you only want to report a mistake, the first two methods are enough. If you want to update the data yourself and submit changes, use the third method.

### Method 1: Open an Issue

- If you find missing records, price changes, incorrect information, or outdated details, open a GitHub Issue directly.
- Include the apartment name, the fields that need to be updated, and the new information you found.

### Method 2: Contact the Author

- If you do not use GitHub, or you want to contact the author directly, you can send the update by email.
- When possible, include the apartment name, the fields to change, and the corrected values in a single message.
- QQ email: `1793706453@qq.com`
- UGA email: `sl64343@uga.edu`

### Method 3: Edit the Spreadsheet and Rebuild the Data

- Create a GitHub account, fork this repository, and work in your own copy.
- Update `26fall renting.xlsx`. If you also want the English pages to stay aligned, update `26fall renting EN.xlsx` as well.
- Run `python scripts/build_data.py` to regenerate `data/apartments.json` and `data/apartments_EN.json`.
- Open `index.html`, `table.html`, `index-en.html`, and `table-en.html` locally to make sure the site renders correctly. You can use the VSCode Live Server extension, or open the HTML files directly in a browser.
- Commit the updated Excel files together with the generated JSON files to your own repository.
- Open a Pull Request and wait for the maintainer to review and merge it.


## Repository Structure

These are the most important files and directories in the project:

- `26fall renting.xlsx` : original Chinese apartment spreadsheet and primary data source.
- `26fall renting EN.xlsx` : translated English spreadsheet used by the English pages.
- `data/apartments.json` : generated structured data for the Chinese pages.
- `data/apartments_EN.json` : generated structured data for the English pages.
- `index.html` : Chinese home page.
- `table.html` : Chinese spreadsheet page.
- `update.html` : Chinese update instructions page.
- `index-en.html` : English home page.
- `table-en.html` : English spreadsheet page.
- `update-en.html` : English update instructions page.
- `styles.css` : shared site-wide styles.
- `script.js` : Chinese home page filtering, sorting, and card rendering logic.
- `script-en.js` : English home page filtering, sorting, and card rendering logic.
- `table.js` : Chinese spreadsheet rendering logic.
- `table-en.js` : English spreadsheet rendering logic.
- `theme.js` : light and dark mode toggle logic.
- `app-utils.js` : shared frontend utility functions.
- `scripts/build_data.py` : the core script that converts Excel files into JSON data.

If you only want to adjust copy or UI, you will usually only need to edit HTML, CSS, and JavaScript. If you want to change the apartment data itself, edit the Excel files and rerun `build_data.py`.

**If you find this project helpful, please give it a Star. If you have any questions or suggestions, feel free to open an Issue or contact the author directly.**
