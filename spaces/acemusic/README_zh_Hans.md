# ACE Music 静态 Space

在浏览器中生成歌曲、编辑歌词、上传参考音频或查询原任务。将 `acemusic-static-space.zip` 解压，在目录运行 `python3 -m http.server 8000`，打开 `http://localhost:8000`。要使用自己的 Hugging Face Static Space，将解压后的全部文件（含 `README.md` 与 `index.html`）放在 Space 根目录。

1. 从 [API 凭据管理](https://platform.acedata.cloud/console/credentials?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=acemusic_space_key_zh) 取得允许访问 ACE Music 的应用 API Key。只把它填入页面的密码框，凭据仅保留在当前标签页。
2. 有原任务 ID 时先点 **Retrieve same task** 免费查询。歌曲完整成功时，两首候选各有播放器和下载链接，上传的参考音轨有单独的音轨 ID。部分失败时仍可取回已完成的候选。
3. 生成歌曲可选灵感模式或自定义歌词模式。自定义需填写标题、歌词和风格。歌词助手另行计费。
4. 导入可公开访问且有权使用的 HTTPS MP3 会产生独立的上传费用。翻唱使用一首已完成的自有音轨 ID，融合需要两首不同且兼容的音轨 ID。二者均使用 `acemusic-v1.1`，并需提供歌词和风格。
5. 确认[价格与权限](https://platform.acedata.cloud/services/acemusic?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=acemusic_space_pricing_zh)后再提交创作。保存返回的 `task_id`；网络中断或任务仍在处理时，查询原任务以恢复结果。

[歌曲与参考音频指南](https://docs.acedata.cloud/zh-Hans/guides/acemusic/acemusic_audios.md) · [任务查询指南](https://docs.acedata.cloud/zh-Hans/guides/acemusic/acemusic_tasks.md)
