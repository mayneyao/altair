# Altair

react写的图像处理工具,怎么好玩怎么写.

1. gif表情(模板)制作
2. ...

# 运行

```
git clone https://github.com/mayneyao/altair.git

cd altair

yarn install

yarn start
```

# TODO

+ ~~导入网络图片~~
+ 字幕顺序调整(拖动)
+ 自定义字幕位置和样式
+ canvas resize 屏幕适配
    + 宽高处理
    + 场景切换，表情包模式自动resize，减小生成图片大小
+ ~~模板发布(添加后端)~~
+ ~~优化canvas转gif~~
+ ~~上传模板~~
+ 本地存储用户数据（存储在 `localStorage` 中）（`doing`）
    + 我的图库（保存图片时自动生成的记录）
        + 在此页面直接预览生成后的图片
        + ~~删除此记录~~
        + ~~添加到收藏~~
        + ~~发布模板到远程仓库~~
    + 收藏模板（收藏的模板，自制或来着模板仓库的）
+ 公共模板图片缓存（模板仓库的图片做缓存处理）
+ gif 拼接


# 感谢

+ 灵感来源(为所欲为): [sorry](https://github.com/xtyxtyx/sorry)


+ canvas转gif: [jsgif](https://github.com/antimatter15/jsgif) [gif.js](https://github.com/jnordberg/gif.js)

  canvas转gif还是有点慢

+ gif解析: [fastgif](https://github.com/samthor/fastgif) [omggif](https://github.com/deanm/omggif)

  开始用的 `omggif` 解码,然后自己写帧数处理,效率太低了,后来用上`fastgif`速度快多了(`wasm`真香)

+ 图床：[sm.ms](https://sm.ms/)

# 更新记录

+ 2018-09-17
    + canvas转gif，`jsgif`=>`gif.js`
    + 模板列表&上传