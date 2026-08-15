# 模型镇 MODEL TOWN

调研日期：2026-08-15  
源推文：[techartist_ / 2077433800276283523](https://x.com/techartist_/status/2077433800276283523)  
姐妹调研：`01mvp/grok-town/docs/research-chinatown.md`（唐人街夜市，同一套积木语言，换主题）

## 1. 点子

一座能走进去的 **AI 夜市广场**。不是苏州园林，也不是写实硅谷园区。

每家大模型是一栋能认出来的摊位/实验室，芯片公司占北侧工厂，广场中央立排行榜方尖碑。好玩来自三件事：

1. **形象化的对比** —— 智力、用户、估值、性价比、开源、上下文，都变成能看见的高度、人流、气球、围栏。
2. **会动的故事** —— 奥特曼 vs 马斯克法庭、DeepSeek 滑动变阻器、所有人给英伟达交 GPU 税。
3. **能逛** —— WASD 走进去，点击看牌子，L 切榜，R 拧变阻器。

## 2. Techartist 五步（本题落地）

- 氛围：科技夜市。青雾、品牌霓虹、湿地砖倒影、token 粒子，不是唐人街灯笼。
- 构图：南门（GPU 柱）→ 广场方尖碑 → 北侧英伟达工厂。西岸美西实验室，东岸中国实验室。
- 交互：走路 / 巡游 / 鸟瞰 / 点击牌子 / 切榜 / 拧变阻器。
- 动画：霓虹呼吸、token 喷泉、法庭飞纸、变阻器滑块、吉祥物巡逻、GPU 税排队。
- 写实度：Windland 公式 —— low-poly 形体 + 认真的光。
- 资产：100% procedural。零 GLB。字用 Canvas 画。

栈：Vite + vanilla Three r174 + EffectComposer UnrealBloom + OutputPass。不跟 R3F / WebGPU。skills.sh 上的 threejs skill 安装量都太低，方法论以 Citadel 源码 + 唐人街姐妹仓为准。

## 3. 积木

`createLab` / `createChipFab` / `createGate` / `createObelisk` / `createRheostat` / `createCourt` / `createMascot` / `createPerson`

形体只许 box / cylinder / cone / sphere / torus / capsule / plane。

## 4. 迭代

第一版：门 + 广场 + 两边实验室剪影 + bloom 站住。  
然后：招牌、方尖碑、变阻器、法庭、人流。  
然后：调比例、减噪、把氛围推回「夜市」而不是「展会沙盘」。
