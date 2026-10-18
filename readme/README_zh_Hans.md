# Hugging Face Spaces 的 Suno by Ace Data Cloud

在 Space 里输入提示词生成音乐，保存任务 ID，再查询同一个任务并播放终态音频。集成由 **Ace Data Cloud 独立提供**，不冒充 Suno 官方产品，也不表示获得 Suno 或 Hugging Face 背书。

**当前状态：源码候选待审，尚无已验证的公开 HF Space。** 尚未真实发起付费生成、验证搜索安装或证明 Ace 进入官方服务商列表。[英文说明](../README.md) · [当前价格](https://platform.acedata.cloud/models?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=sunohuggingface_zh_pricing)。

## 1. 找到正确入口

发布后在 [HF Spaces 搜索 Suno](https://huggingface.co/spaces?search=suno)，核对标题 **Suno by Ace Data Cloud** 与已验证的 Ace 发布者。现在只有源码，不把其他同名 Space 当成本集成。公开 Static Space 可直接打开，或用 **⋮ → Duplicate this Space** 复制到自己的既有账号；静态托管无需付费计划，Ace API 生成另收费。本静态入口没有 MCP badge，不能声称已进入 MCP 工具目录。

## 2. 获取正确 API Token

1. 打开 [Ace Data Cloud → Applications](https://platform.acedata.cloud/console/applications?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=sunohuggingface_zh_api_key)，注册或登录。
2. 找到 **General application**。不存在时先点 **Initialize General Application**。通用 Key 可调用账户有权使用的服务，专用应用 Key 受服务范围限制；核对 Suno 权限、当前价格和余额。
3. 图中 **1** 是复制 API Key，**2 Manage Keys** 可管理或创建单独 Key。

![真实 Ace 控制台：复制或管理已脱敏的 Key](../assets/get-api-key-en.png)

4. 在 **Manage Keys → Create** 输入名称 `Hugging Face Suno`。历史图中名字是 `Dify tutorial`，请改为自己的名称。按需设到期和使用限制；开启 **Allowed APIs** 时须同时允许 `/suno/audios`、`/suno/tasks`。

![真实 Ace 控制台：创建可选专用凭据，图中文字来自历史 Dify 教程](../assets/create-api-key-en.png)

两图来自现有 SunoDify 的固定提交，2026-10-18 取回，实际拍摄日期未单独记录。保留原图，真实凭据和余额不可见；它们只证明控制台操作，不证明 HF 安装或运行成功。[原图来源](../docs/asset-sources.json)。

只复制 Token 字符串，不带 `Bearer `、引号或图里的脱敏字符。`platform-...` 管理 Token 不能当生成 Key。不要把 Key 放在提示词、URL、共享截图或公开 Static Space secret 中。

## 3. 在 Space 粘贴位置

打开 **1. Connect your Ace account → Ace application API token** 密码框，粘贴 Token。无需输入 API 地址。Key 仅留在本标签页内存并直发 `api.acedata.cloud`；不写 cookie、local/session storage，不复用发布者私有 Key。点 **Clear token** 可清空输入，公用电脑用完关闭标签页。

HF 界面尚待协调者串行实拍；此处不拿参考图或测试日志冒充成功截图。免费核验步骤见 [VALIDATION.md](../docs/VALIDATION.md)。

## 4. 首用与同 ID 查询

已有任务先用 **2. Retrieve an existing task**，粘贴之前返回的 task ID，点 **Retrieve same task**。它只查询 `/suno/tasks`，不发新生成；收费规则仍以当前接口说明为准。

要在自己确认费用后生成：展开 **Create new music — uses your Ace balance**，选准确模型，保留 Instrumental（纯音乐）勾选，输入 `A gentle instrumental piano melody for a sunrise, no vocals.`。检查[价格与余额](https://platform.acedata.cloud/models?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=sunohuggingface_zh_first_run)后勾选费用确认，点 **Generate once — uses Ace balance**。只提交一次，不自动重试、不换模型。此简洁模式用 prompt，最多500字符，不混入自定义歌词参数。

接受请求通常只返回 pending 和任务 ID，不是完成；ID 自动填到查询框。保存 ID，每次间隔至少15秒点 **Retrieve same task**。未终结时隐藏预览音频链接，不因 HTTP 200 就标成功。明确终态成功才展示播放控件和最终链接；失败保留 ID 查历史。

提交后断网可能已经受理，先查 [Ace 应用历史](https://platform.acedata.cloud/console/applications?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=sunohuggingface_zh_history)，不要为轮询重复生成。新标签页不知道上一次提交，也要先查历史。只有终态或人工核对不确定请求后，才能用 **I reviewed history — prepare another task** 开始下一次。

## 5. 常见问题与账单

- 401：核 Token 完整、无 Bearer、有效期与 Allowed APIs。
- 403：核 Suno 权限、余额与限制，不自动换模型。
- pending / 无音频：继续查同 ID，不重生成；可播放预览不是终态。
- 429：降低频率或并发；没有自动重试。
- 网络/5xx：先查历史，以免重复扣费。
- 音频不能打开：核任务已完成和返回 URL 可达；链接可能到期。

用 task/trace ID 对照 Ace 历史里的实际费用；本 Space 尚未完成付费生成、最终媒体可达、唯一账单或获客验证。HF credits 不能抵扣用户自己 Ace Key 的使用。隐私见 [PRIVACY.md](../PRIVACY.md)。

## 开发与发布

`npm test` 跑 Node 默认发现测试，`npm run check` 检查入口和四项 UTM。`python3 scripts/package_space.py` 只打包，不上传、不部署。HF 现有组织、只限目标 Space 的凭据与审核门槛见 [PUBLISHING.md](../docs/PUBLISHING.md)。不为数量批量复制同类 Space。

## 其余四个独立服务入口

当前同一源码还实现了独立的 [Seedance](../spaces/seedance/README_zh_Hans.md)、[HappyHorse](../spaces/happyhorse/README_zh_Hans.md)、[GPT Image](../spaces/gpt-image/README_zh_Hans.md)、[Nano Banana](../spaces/nano-banana/README_zh_Hans.md) Space候选，各自有原生参数、双语图文和视频/图片结果展示。根入口仍是Suno，不用合集代替独立服务发现。`scripts/build_spaces.py`产出四份独立包，共用同一传输/Token/同ID状态底座，不复制MCP/SDK。它们均未发布HF，不能声称服务词已能搜到、普通安装或首用账单已验证。
