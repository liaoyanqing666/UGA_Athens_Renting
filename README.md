# UGA_Athens_Renting

UGA Athens 租房信息静态站点。页面数据来自根目录 Excel，经脚本转换后写入 `data/apartments.json`，再由前端页面读取展示。

## Project Structure

- `26fall renting.xlsx`: 原始数据源
- `data/apartments.json`: 生成后的结构化数据
- `index.html`: 公寓卡片筛选页
- `table.html`: 接近 Excel 视图的数据表格页
- `update.html`: 数据更新说明页
- `styles.css`: 全站样式
- `theme.js`: 日夜模式切换逻辑
- `app-utils.js`: 前端公共工具函数
- `script.js`: 首页筛选与卡片渲染逻辑
- `table.js`: 表格页渲染逻辑
- `scripts/build_data.py`: 从 Excel 生成 JSON

## Regenerate Data

```powershell
python .\scripts\build_data.py
```

## Local Preview

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## GitHub Pages

1. 将当前仓库推送到 GitHub。
2. 在仓库 `Settings -> Pages` 中选择 `Deploy from a branch`。
3. 分支选择默认分支，目录选择 `/ (root)`。
4. 保存后等待 GitHub Pages 构建完成。
