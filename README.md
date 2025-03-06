# 德州扑克游戏

这是一个基于网页的德州扑克游戏，采用苹果设计风格，适配电脑和手机浏览器。

## 主要功能

- 符合苹果UI风格的界面设计
- 适配电脑和手机浏览器
- 营造拉斯维加斯赌场感觉
- 支持4-10人游戏
- 房间系统（创建/加入房间）
- 玩家头像和聊天功能
- 旁观者模式
- 游戏回放功能
- 玩家统计数据
- 游戏教程
- 断线重连功能
- 手牌概率计算

## 技术栈

- HTML5
- CSS3 (动画、Flexbox、Grid)
- 原生JavaScript (ES6+)
- SVG (图标和动画)

## 项目结构

```
├── index.html          # 主页面
├── css/               # 样式文件目录
│   ├── style.css      # 主样式
│   └── animations.css # 动画样式
├── js/                # JavaScript文件目录
│   ├── app.js        # 应用程序主逻辑
│   ├── ui.js         # UI组件
│   ├── poker.js      # 扑克游戏逻辑
│   └── game.js       # 游戏界面
└── assets/           # 资源文件目录
    └── images/       # 图片资源
```

## 本地开发

1. 克隆仓库：
   ```bash
   git clone <仓库URL>
   cd poker-game
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中访问：
   ```
   http://localhost:8000
   ```

## 部署

项目已配置为可以直接部署到Render.com：

1. Fork这个仓库

2. 在Render.com创建新的静态站点：
   - 登录Render.com
   - 点击 "New +" → "Static Site"
   - 连接你的GitHub仓库

3. 配置部署设置：
   - Name: poker-game（或你想要的名称）
   - Branch: main
   - Build Command: `npm install && npm run build`
   - Publish Directory: dist
   - Environment Variables: 不需要设置

4. 点击 "Create Static Site"

5. 等待部署完成（约1-2分钟）

6. 访问Render提供的URL（例如 https://poker-game.onrender.com）

## 自动部署

每次推送到main分支时，Render会自动重新部署：

```bash
# 修改代码后
git add .
git commit -m "更新说明"
git push origin main
```

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- iOS Safari (最新版)
- Android Chrome (最新版)

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License 