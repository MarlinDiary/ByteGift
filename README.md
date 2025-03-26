This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Spotify API集成

本项目集成了Spotify API，用于搜索和添加音乐。应用程序可以实时搜索Spotify上的歌曲，并显示热门华语歌曲推荐。

### 设置Spotify API

当前项目已配置使用客户端凭据流程(Client Credentials Flow)访问Spotify API，这使得应用无需用户登录即可搜索音乐。按照以下步骤设置：

1. 访问 [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) 并登录或创建账户
2. 创建一个新的应用程序
3. 获取客户端ID(`Client ID`)和客户端密钥(`Client Secret`)
4. 在项目根目录创建或修改 `.env.local` 文件，添加以下内容：

```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

替换为您的实际客户端ID和密钥。

### 功能亮点

- **实时搜索**：搜索Spotify上的歌曲、艺术家
- **热门推荐**：自动显示热门华语歌曲
- **离线模式**：如果API连接失败，会自动切换到内置的离线数据
- **直接输入**：支持直接输入Spotify链接

### 安全注意事项

当前实现将客户端密钥暴露在前端代码中，这在生产环境中存在安全风险。为更安全的实现，建议：

1. 创建一个服务器端API来处理认证，保护您的客户端密钥
2. 将令牌获取逻辑移至服务器端
3. 为生产环境实现适当的CORS策略

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
