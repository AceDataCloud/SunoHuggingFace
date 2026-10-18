# Seedance by Ace Data Cloud：Hugging Face独立Space候选

这是Ace Data Cloud独立提供的Seedance集成，不冒充服务品牌或HF官方产品。**源码已合并，2026-10-19已发布GitHub v0.2.0独立包；仍未发布HF，HF安装URL/版本未知，未真实生成或验证账单。** 共用单一源码底座，但原生参数、动作与结果展示按服务分别实现，不是只换名字的Suno表单。[English](README.md) · [当前价格](https://platform.acedata.cloud/models?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=seedancehuggingface_readme_zh_pricing)。

## 1. 官方安装入口

获准发布后在 [HF Spaces搜索Seedance](https://huggingface.co/spaces?search=seedance)，核对标题Seedance by Ace Data Cloud和已核Ace发布者；打开或用 **⋮→Duplicate this Space**。现在没有已验证的公开入口，不拿其他同品牌Space冒充。Static Space无需付费计划，Ace API另计费；此静态包没有MCP badge，也不是官方模型Provider注册。

## 2. 注册登录和专用Token

打开 [Ace Applications](https://platform.acedata.cloud/console/applications?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=seedancehuggingface_readme_zh_api_key) 注册/登录；找 **General application**，没有则先初始化。核Seedance权限、当前价格/余额和Key到期。复制标记1的API Key，或Manage Keys标记2创建单独Key。

![真实已脱敏控制台：复制或管理Token](../../assets/get-api-key-en.png)

专用名填 **Hugging Face Seedance**，历史图Dify tutorial保留原样，需改成自己的名字。Allowed APIs若启用，允许 `/seedance/videos, /seedance/tasks`。不要用platform-管理Token；只复制Token字符串，不带Bearer、引号和脱敏占位。

![真实已脱敏控制台：创建专用Key，历史名称保留](../../assets/create-api-key-en.png)

图来自SunoDify固定提交，2026-10-18取回，实际拍摄日期未记录；不是HF安装或首用证明。[来源](../../docs/asset-sources.json)。

## 3. 本Space填写位置

实际控件为 **1. Connect your Ace account→Ace application API token** 密码框，无需填接口URL。Token仅在本标签页内存，直发api.acedata.cloud，不写cookie/local/session storage或日志，不使用共享发布者Key。Static Space secret/variable前端可见，不能填共享owner Token。点Clear token并关闭共享设备标签页。[隐私](../../PRIVACY.md)。HF候选界面实拍待协调串行，未伪造截图。

## 4. 本服务原生能力

Text模式使用content[{type:text,text}]；frames把首尾帧转为image_url+first_frame/last_frame；reference按image/audio/video各自角色构建content。2.0音频参考同时需图片或视频，2.5可音频独立；edit/extend仅2.5且必须参考视频。支持有边界的9图/3音频/3视频，不宣称2.5最大素材数量全部实现。

可用字段及默认起步配置在 [英文参数表](README.md)；起步为 `doubao-seedance-2-0-fast-260128; mode=text; resolution=480p; ratio=16:9; duration=5; generateAudio=false`。输入自己的提示词，不会自动发送；素材URL格式通过不代表时长/大小/权限已合格，服务器仍会校验。只用自有/获授权素材；准确型号不自动替换。

## 5. 首用、同ID和最终结果

有旧任务先选 **2. Retrieve the same existing task**，填Ace返回的task ID，点Retrieve same task；仅查 `/seedance/tasks` 的retrieve，不发新生成。不要把data里供应端ID当Ace task ID。

要新生成/编辑先展开费用面板，选mode/model和对应参数，核[当前价和余额](https://platform.acedata.cloud/models?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=seedancehuggingface_readme_zh_first_run)，勾费用/素材权限确认，点Submit once。只发一次async请求，pending不是成功；保存ID。处理中和不确定受理结果会阻止新生成，断网/5xx/异常2xx先查 [应用历史](https://platform.acedata.cloud/console/applications?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=seedancehuggingface_readme_zh_history)，不能为轮询重生成。刷新页或新标签不了解旧任务，也要先查历史。

同ID查询间隔至少15秒；pending、预览URL、HTTP200不等于终态。明确成功才展示视频播放器和最终链接；失败优先。图片Base64只接受合法PNG/JPEG/WebP，不能展示SVG/脚本。按task/trace核实际账单；未证明最终媒体可达、唯一扣费或注册/营收。

## 6. 排错与发布

400核动作/型号/参考素材/参数；401核Key完整有效；403核权限/审核/余额；429降低频率；pending继续同ID；提交后断网先查历史；媒体不可达核终态和链接时效。API错误不回显原始敏感正文，无自动重试/换模型。

[npm测试与离线UI验收](../../docs/TOP5_VALIDATION.md)、[发布材料和品牌政策边界](../../docs/TOP5_PUBLISHING.md)。`python3 scripts/build_spaces.py`产出独立seedance包，不上传/部署。没有新开户、扩权、签约、付费或新生成。源代码和反馈统一在AceDataCloud/SunoHuggingFace。
