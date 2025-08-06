OpenAI 兼容
公有云金融云
使用SDK调用时需配置的base_url：https://dashscope.aliyuncs.com/compatible-mode/v1

使用HTTP方式调用时需配置的endpoint：POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions

您需要已获取API Key并配置API Key到环境变量。如果通过OpenAI SDK进行调用，还需要安装SDK。
请求体
文本输入流式输出图像输入视频输入工具调用联网搜索异步调用文档理解文字提取
此处以单轮对话作为示例，您也可以进行多轮对话。
PythonJavaNode.jsGoC#（HTTP）PHP（HTTP）curl
 
import os
from openai import OpenAI


client = OpenAI(
    # 若没有配置环境变量，请用百炼API Key将下行替换为：api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

completion = client.chat.completions.create(
    # 模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
    model="qwen-plus",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "你是谁？"},
    ],
    # Qwen3模型通过enable_thinking参数控制思考过程（开源版默认True，商业版默认False）
    # 使用Qwen3开源版模型时，若未启用流式输出，请将下行取消注释，否则会报错
    # extra_body={"enable_thinking": False},
)
print(completion.model_dump_json())
model string （必选）

模型名称。

支持的模型：通义千问大语言模型（商业版、开源版）、通义千问VL、代码模型、通义千问Omni、数学模型。

通义千问Audio暂不支持OpenAI兼容模式，仅支持DashScope方式。
具体模型名称和计费，请参见模型列表。

messages array （必选）

由历史对话组成的消息列表。

消息类型

System Message object （可选）

模型的目标或角色。如果设置系统消息，请放在messages列表的第一位。

属性

content string （必选）

消息内容。

role string （必选）

固定为system。

QwQ 模型不建议设置 System Message，QVQ 模型设置System Message不会生效。
User Message object （必选）

用户发送给模型的消息。

属性

content string 或 array （必选）

消息内容。如果您的输入只有文本，则为 string 类型；如果您的输入包含图像等多模态数据，则为 array 类型。

如需传入音频给通义千问Audio模型，请前往DashScope查看，暂不支持使用OpenAI兼容的方式。
使用多模态模型时的属性

role string （必选）

固定为user。

Assistant Message object （可选）

模型对用户消息的回复。

属性

content string （可选）

消息内容。仅当助手消息中指定tool_calls参数时非必选。

role string （必选）

固定为assistant。

partial boolean （可选）

是否开启Partial Mode。使用方法请参考前缀续写。

支持的模型

tool_calls array （可选）

在发起 Function Calling后，模型回复的要调用的工具和调用工具时需要的参数。包含一个或多个对象。由上一轮模型响应的tool_calls字段获得。

属性

Tool Message object （可选）

工具的输出信息。

属性

content string （必选）

消息内容，一般为工具函数的输出。

role string （必选）

固定为tool。

tool_call_id string （可选）

发起 Function Calling 后返回的 id，可以通过completion.choices[0].message.tool_calls[0].id获取，用于标记 Tool Message 对应的工具。

stream boolean （可选） 默认值为 false

是否流式输出回复。参数值：

false：模型生成完所有内容后一次性返回结果。

true：边生成边输出，即每生成一部分内容就立即输出一个片段（chunk）。您需要实时地逐个读取这些片段以获得完整的结果。

Qwen3商业版（思考模式）、Qwen3开源版、QwQ、QVQ只支持流式输出。
stream_options object （可选）

当启用流式输出时，可通过将本参数设置为{"include_usage": true}，在输出的最后一行显示所使用的Token数。

如果设置为false，则最后一行不显示使用的Token数。
本参数仅在设置stream为true时生效。

modalities array （可选）默认值为["text"]

输出数据的模态，仅支持 Qwen-Omni 模型指定。可选值：

["text","audio"]：输出文本与音频；

["text"]：输出文本。

audio object （可选）

输出音频的音色与格式，仅支持 Qwen-Omni 模型，且modalities参数需要包含"audio"。

属性

voice string （必选）

输出音频的音色，可选值：

Cherry

Serena

Ethan

Chelsie

音色效果请参见：支持的音频音色。

format string （必选）

输出音频的格式，当前仅支持设定为"wav"。

temperature float （可选）

采样温度，控制模型生成文本的多样性。

temperature越高，生成的文本更多样，反之，生成的文本更确定。

取值范围： [0, 2)

由于temperature与top_p均可以控制生成文本的多样性，因此建议您只设置其中一个值。更多说明，请参见Temperature 和 top_p。

temperature默认值

Qwen3（非思考模式）、Qwen3-Instruct、Qwen3-Coder系列、qwen-max系列、qwen-plus系列、qwen-turbo系列、qwen开源系列、qwen-coder系列、qwq-32b-preview、qwen-doc-turbo：0.7；

qwen-long、qwen-omni-turbo系列：1.0；

QVQ系列 : 0.5；

qwen-vl系列、qwen-vl-ocr系列、qwen-omni系列、qvq-72b-preview：0.01；

qwen-math系列：0；

Qwen3（思考模式）、Qwen3-Thinking、QwQ 系列：0.6

不建议修改QVQ模型的默认temperature值 。
top_p float （可选）

核采样的概率阈值，控制模型生成文本的多样性。

top_p越高，生成的文本更多样。反之，生成的文本更确定。

取值范围：（0,1.0]

由于temperature与top_p均可以控制生成文本的多样性，因此建议您只设置其中一个值。更多说明，请参见Temperature 和 top_p。

top_p默认值

Qwen3（非思考模式）、Qwen3-Instruct、Qwen3-Coder系列、qwen-max系列、qwen-plus系列、qwen-turbo系列、qwen开源系列、qwen-coder系列、qwen-long、qwq-32b-preview、qwen-doc-turbo：0.8；

qwen-vl-max-2024-11-19、qwen-vl-max-2024-10-30、qwen-vl-max-2024-08-09、qwen2-vl-72b-instruct、qwen-omni-turbo 系列：0.01；

qwen-vl-plus系列、qwen-vl-ocr系列、qwen-vl-max、qwen-vl-max-latest、qwen-vl-max-2025-04-08、qwen-vl-max-2025-04-02、qwen-vl-max-2025-01-25、qwen-vl-max-2024-12-30、qvq-72b-preview、qwen2-vl-2b-instruct、qwen2-vl-7b-instruct、qwen2.5-vl-3b-instruct、qwen2.5-vl-7b-instruct、qwen2.5-vl-32b-instruct、qwen2.5-vl-72b-instruct、qwen2.5-omni-7b：0.001；

QVQ系列: 0.5；

qwen-math系列：1.0；

Qwen3（思考模式）、Qwen3-Thinking、QwQ 系列：0.95

不建议修改QVQ模型的默认 top_p 值。
top_k integer （可选）

生成过程中采样候选集的大小。例如，取值为50时，仅将单次生成中得分最高的50个Token组成随机采样的候选集。取值越大，生成的随机性越高；取值越小，生成的确定性越高。取值为None或当top_k大于100时，表示不启用top_k策略，此时仅有top_p策略生效。

取值需要大于或等于0。

top_k默认值

QVQ系列：10；

QwQ 系列：40；

qwen-math 系列、qwen-vl 系列、qwen-vl-ocr系列、qwen-audio-asr系列、qwen-audio-turbo系列、qwen2.5-omni-7b、qvq-72b-preview：1；

其余模型均为20；

通过 Python SDK调用时，请将 top_k 放入 extra_body 对象中，配置方式为：extra_body={"top_k":xxx}。
不建议修改QVQ模型的默认 top_k 值。
presence_penalty float （可选）

控制模型生成文本时的内容重复度。

取值范围：[-2.0, 2.0]。正数会减少重复度，负数会增加重复度。

适用场景：

较高的presence_penalty适用于要求多样性、趣味性或创造性的场景，如创意写作或头脑风暴。

较低的presence_penalty适用于要求一致性或专业术语的场景，如技术文档或其他正式文档。

presence_penalty默认值

Qwen3（非思考模式）、Qwen3-Instruct、qwen3-0.6b/1.7b/4b（思考模式）、QVQ系列、qwen-max、qwen-max-latest、qwen-max-latest、qwen-max-2024-09-19、qwen2.5-vl-3b-instruct、qwen2.5-vl-7b-instruct、qwen2.5-vl-32b-instruct、qwen2.5-vl-72b-instruct、qwen-vl-max、qwen-vl-max-latest、qwen-vl-max-2025-04-08、qwen-vl-max-2025-04-02、qwen-vl-max-2025-01-25、qwen-vl-max-2024-12-30、qwen-vl-max-2024-11-19、qwen-vl-max-2024-10-30、qwen-vl-max-2024-08-09、qwen2-vl-72b-instruct、qwen-vl-plus-2025-01-02、qwen-vl-plus-2025-05-07、qwen-vl-plus_latest：1.5；

qwen-vl-plus、qwen-vl-plus-2025-01-25：1.0；

qwen3-8b/14b/32b/30b-a3b/235b-a22b（思考模式）、qwen-plus/qwen-plus-latest/2025-04-28（思考模式）、qwen-turbo/qwen-turbo-latest/2025-04-28（思考模式）：0.5；

其余均为0.0。

原理介绍

如果参数值是正数，模型将对目前文本中已存在的Token施加一个惩罚值（惩罚值与文本出现的次数无关），减少这些Token重复出现的几率，从而减少内容重复度，增加用词多样性。

示例

提示词：把这句话翻译成中文“This movie is good. The plot is good, the acting is good, the music is good, and overall, the whole movie is just good. It is really good, in fact. The plot is so good, and the acting is so good, and the music is so good.”

参数值为2.0：这部电影很好。剧情很棒，演技棒，音乐也非常好听，总的来说，整部电影都好得不得了。实际上它真的很优秀。剧情非常精彩，演技出色，音乐也是那么的动听。

参数值为0.0：这部电影很好。剧情好，演技好，音乐也好，总的来说，整部电影都很好。事实上，它真的很棒。剧情非常好，演技也非常出色，音乐也同样优秀。

参数值为-2.0：这部电影很好。情节很好，演技很好，音乐也很好，总的来说，整部电影都很好。实际上，它真的很棒。情节非常好，演技也非常好，音乐也非常好。

使用qwen-vl-plus、qwen-vl-plus-2025-01-25模型进行文字提取时，建议设置presence_penalty为1.5。
不建议修改QVQ模型的默认presence_penalty值。
response_format object （可选） 默认值为{"type": "text"}

返回内容的格式。可选值：{"type": "text"}或{"type": "json_object"}。设置为{"type": "json_object"}时会输出标准格式的JSON字符串。使用方法请参见：结构化输出。

如果指定该参数为{"type": "json_object"}，您需要在System Message或User Message中指引模型输出JSON格式，如：“请按照json格式输出。”
支持的模型

qwen-max 系列

qwen-max-2024-09-19及之后的模型

qwen-plus 系列（非思考模式）

qwen-plus-2024-09-19及之后的模型

qwen-turbo 系列（非思考模式）

qwen-turbo-2024-09-19及之后的模型

qwen-开源系列

qwen3（非思考模式）、qwen2.5系列的文本模型（不含math与coder模型）

max_tokens integer （可选）

本次请求返回的最大 Token 数。

max_tokens 的设置不会影响大模型的生成过程，如果模型生成的 Token 数超过max_tokens，本次请求会返回截断后的内容。
默认值和最大值都是模型的最大输出长度。关于各模型的最大输出长度，请参见模型列表。

max_tokens参数适用于需要限制字数（如生成摘要、关键词）、控制成本或减少响应时间的场景。

qwen-vl-ocr、qwen-vl-ocr-latest、qwen-vl-ocr-2025-04-13模型的max_tokens参数（最大输出长度）默认为 4096，如需提高该参数值（4097~8192范围），请发送邮件至 modelstudio@service.aliyun.com进行申请，并提供以下信息：主账号ID、图像类型（如文档图、电商图、合同等）、模型名称、预计 QPS 和每日请求总数，以及模型输出长度超过4096的请求占比。
对于 QwQ、QVQ 与开启思考模式的 Qwen3 模型，max_tokens会限制回复内容的长度，不限制深度思考内容的长度。
n integer （可选） 默认值为1

生成响应的个数，取值范围是1-4。对于需要生成多个响应的场景（如创意写作、广告文案等），可以设置较大的 n 值。

当前仅支持 qwen-plus 与 Qwen3（非思考模式） 模型，且在传入 tools 参数时固定为1。
设置较大的 n 值不会增加输入 Token 消耗，会增加输出 Token 的消耗。
enable_thinking boolean （可选）

是否开启思考模式，适用于 Qwen3 模型。

Qwen3 商业版模型默认值为 False，Qwen3 开源版模型默认值为 True。

通过 Python SDK 调用时，请通过extra_body配置。配置方式为：extra_body={"enable_thinking": xxx}。
thinking_budget integer （可选）

思考过程的最大长度，只在enable_thinking为true时生效。适用于 Qwen3 的商业版与开源版模型。详情请参见限制思考长度。

通过 Python SDK 调用时，请通过extra_body配置。配置方式为：extra_body={"thinking_budget": xxx}。
seed integer （可选）

设置seed参数会使文本生成过程更具有确定性，通常用于使模型每次运行的结果一致。

在每次模型调用时传入相同的seed值（由您指定），并保持其他参数不变，模型将尽可能返回相同的结果。

取值范围：0到231−1。

seed默认值

qwen-vl-plus-2025-01-02、qwen-vl-max、qwen-vl-max-latest、qwen-vl-max-2025-04-08、qwen-vl-max-2025-04-02、qwen-vl-max-2024-12-30、qvq-72b-preview、qvq-max系列：3407；

qwen-vl-max-2025-01-25、qwen-vl-max-2024-11-19、qwen-vl-max-2024-10-30、qwen-vl-max-2024-08-09、qwen-vl-max-2024-02-01、qwen2-vl-72b-instruct、qwen2-vl-2b-instruct、qwen-vl-plus、qwen-vl-plus-latest、qwen-vl-plus-2025-05-07、qwen-vl-plus-2025-01-25、qwen-vl-plus-2024-08-09、qwen-vl-plus-2023-12-01：无默认值；

其余模型均为1234。

logprobs boolean （可选）

是否返回输出 Token 的对数概率，可选值：

true

返回；

false

不返回。

支持 qwen-plus、qwen-turbo 系列的快照模型（不包含主线模型）与 Qwen3 开源模型。
top_logprobs integer （可选）

指定在每一步生成时，返回模型最大概率的候选 Token 个数。

取值范围：[0,5]

仅当 logprobs 为 true 时生效。

stop string 或 array （可选）

使用stop参数后，当模型生成的文本即将包含指定的字符串或token_id时，将自动停止生成。

您可以在stop参数中传入敏感词来控制模型的输出。

stop为array类型时，不可以将token_id和字符串同时作为元素输入，比如不可以指定stop为["你好",104307]。
tools array （可选）

可供模型调用的工具数组，可以包含一个或多个工具对象。一次Function Calling流程模型会从中选择一个工具（开启parallel_tool_calls可以选择多个工具）。

目前不支持通义千问VL/Audio，也不建议用于数学和代码模型（Qwen3-Coder 模型除外）。
属性

type string （必选）

tools的类型，当前仅支持function。

function object （必选）

属性

tool_choice string 或 object （可选）默认值为 "auto"

如果您希望对于某一类问题，大模型能够采取制定好的工具选择策略（如强制使用某个工具、强制不使用工具），可以通过修改tool_choice参数来强制指定工具调用的策略。可选值：

"auto"

表示由大模型进行工具策略的选择。

"none"

如果您希望无论输入什么问题，Function Calling 都不会进行工具调用，可以设定tool_choice参数为"none"；

{"type": "function", "function": {"name": "the_function_to_call"}}

如果您希望对于某一类问题，Function Calling 能够强制调用某个工具，可以设定tool_choice参数为{"type": "function", "function": {"name": "the_function_to_call"}}，其中the_function_to_call是您指定的工具函数名称。

parallel_tool_calls boolean （可选）默认值为 false

是否开启并行工具调用。参数为true时开启，为false时不开启。并行工具调用详情请参见：并行工具调用。

translation_options object （可选）

当您使用翻译模型时需要配置的翻译参数。

属性

source_lang string （必选）

源语言的英文全称，详情请参见支持的语言。您可以将source_lang设置为"auto"，模型会自动判断输入文本属于哪种语言。

target_lang string （必选）

目标语言的英文全称，详情请参见支持的语言。

terms arrays （可选）

在使用术语干预翻译功能时需要设置的术语数组。

属性

tm_list arrays （可选）

在使用翻译记忆功能时需要设置的翻译记忆数组。

属性

domains string （可选）

在使用领域提示功能时需要设置的领域提示语句。

领域提示语句暂时只支持英文。
若您通过Python SDK调用，请通过extra_body配置。配置方式为：extra_body={"translation_options": xxx}。
enable_search boolean （可选）

模型在生成文本时是否使用互联网搜索结果进行参考。取值如下：

true：启用互联网搜索，模型会将搜索结果作为文本生成过程中的参考信息，但模型会基于其内部逻辑判断是否使用互联网搜索结果。

如果模型没有搜索互联网，建议优化Prompt，或设置search_options中的forced_search参数开启强制搜索。
false（默认）：关闭互联网搜索。

启用互联网搜索功能可能会增加 Token 的消耗。
若您通过 Python SDK调用，请通过extra_body配置。配置方式为：extra_body={"enable_search": True}。
支持的模型

通义千问-Max

通义千问-Plus

通义千问-Turbo

QwQ

QwQ-开源版

search_options object （可选）

联网搜索的策略。仅当enable_search为true时生效。

属性

forced_search boolean（可选）默认值为false

是否强制开启搜索。参数值：

true：强制开启；

false：不强制开启。

search_strategy string（可选）默认值为"standard"

搜索互联网信息的数量。参数值：

"standard"：在请求时搜索5条互联网信息；

"pro"：在请求时搜索10条互联网信息。

若您通过 Python SDK调用，请通过extra_body配置。配置方式为：extra_body={"search_options": xxx}。
X-DashScope-DataInspection string （可选）

在通义千问 API 的内容安全能力基础上，是否进一步识别输入输出内容的违规信息。取值如下：

'{"input":"cip","output":"cip"}'：进一步识别；

不设置该参数：不进一步识别。

通过 HTTP 调用时请放入请求头：-H "X-DashScope-DataInspection: {\"input\": \"cip\", \"output\": \"cip\"}"；

通过 Python SDK 调用时请通过extra_headers配置：extra_headers={'X-DashScope-DataInspection': '{"input":"cip","output":"cip"}'}。

详细使用方法请参见内容安全。

不支持通过 Node.js SDK设置。
不适用于 Qwen-VL 系列模型。
chat响应对象（非流式输出）
 
{
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": "我是阿里云开发的一款超大规模语言模型，我叫通义千问。"
            },
            "finish_reason": "stop",
            "index": 0,
            "logprobs": null
        }
    ],
    "object": "chat.completion",
    "usage": {
        "prompt_tokens": 3019,
        "completion_tokens": 104,
        "total_tokens": 3123,
        "prompt_tokens_details": {
            "cached_tokens": 2048
        }
    },
    "created": 1735120033,
    "system_fingerprint": null,
    "model": "qwen-plus",
    "id": "chatcmpl-6ada9ed2-7f33-9de2-8bb0-78bd4035025a"
}
id string

本次调用的唯一标识符。

choices array

模型生成内容的数组，可以包含一个或多个choices对象。

属性

finish_reason string

有三种情况：

因触发输入参数中的stop条件，或自然停止输出时为stop；

因生成长度过长而结束为length；

因需要调用工具而结束为tool_calls。

index integer

当前响应在choices数组中的序列编号。

logprobs object

当前 choices 对象的概率信息。

属性

message object

本次调用模型输出的消息。

属性

created integer

本次chat请求被创建时的时间戳。

model string

本次chat请求使用的模型名称。

object string

始终为chat.completion。

service_tier string

该参数当前固定为null。

system_fingerprint string

该参数当前固定为null。

usage object

本次chat请求使用的 Token 信息。

属性

completion_tokens integer

模型生成回复转换为 Token 后的长度。

prompt_tokens integer

用户的输入转换成 Token 后的长度。

total_tokens integer

prompt_tokens与completion_tokens的总和。

completion_tokens_details object

使用Qwen-VL 模型时输出Token的细粒度分类。

属性

prompt_tokens_details object

输入 Token 的细粒度分类。

属性

chat响应chunk对象（流式输出）
 
{"id":"chatcmpl-e30f5ae7-3063-93c4-90fe-beb5f900bd57","choices":[{"delta":{"content":"","function_call":null,"refusal":null,"role":"assistant","tool_calls":null},"finish_reason":null,"index":0,"logprobs":null}],"created":1735113344,"model":"qwen-plus","object":"chat.completion.chunk","service_tier":null,"system_fingerprint":null,"usage":null}
{"id":"chatcmpl-e30f5ae7-3063-93c4-90fe-beb5f900bd57","choices":[{"delta":{"content":"我是","function_call":null,"refusal":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null}],"created":1735113344,"model":"qwen-plus","object":"chat.completion.chunk","service_tier":null,"system_fingerprint":null,"usage":null}
{"id":"chatcmpl-e30f5ae7-3063-93c4-90fe-beb5f900bd57","choices":[{"delta":{"content":"来自","function_call":null,"refusal":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null}],"created":1735113344,"model":"qwen-plus","object":"chat.completion.chunk","service_tier":null,"system_fingerprint":null,"usage":null}
{"id":"chatcmpl-e30f5ae7-3063-93c4-90fe-beb5f900bd57","choices":[{"delta":{"content":"阿里","function_call":null,"refusal":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null}],"created":1735113344,"model":"qwen-plus","object":"chat.completion.chunk","service_tier":null,"system_fingerprint":null,"usage":null}
{"id":"chatcmpl-e30f5ae7-3063-93c4-90fe-beb5f900bd57","choices":[{"delta":{"content":"云的超大规模","function_call":null,"refusal":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null}],"created":1735113344,"model":"qwen-plus","object":"chat.completion.chunk","service_tier":null,"system_fingerprint":null,"usage":null}
{"id":"chatcmpl-e30f5ae7-3063-93c4-90fe-beb5f900bd57","choices":[{"delta":{"content":"语言模型，我","function_call":null,"refusal":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null}],"created":1735113344,"model":"qwen-plus","object":"chat.completion.chunk","service_tier":null,"system_fingerprint":null,"usage":null}
{"id":"chatcmpl-e30f5ae7-3063-93c4-90fe-beb5f900bd57","choices":[{"delta":{"content":"叫通义千","function_call":null,"refusal":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null}],"created":1735113344,"model":"qwen-plus","object":"chat.completion.chunk","service_tier":null,"system_fingerprint":null,"usage":null}
{"id":"chatcmpl-e30f5ae7-3063-93c4-90fe-beb5f900bd57","choices":[{"delta":{"content":"问。","function_call":null,"refusal":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null}],"created":1735113344,"model":"qwen-plus","object":"chat.completion.chunk","service_tier":null,"system_fingerprint":null,"usage":null}
{"id":"chatcmpl-e30f5ae7-3063-93c4-90fe-beb5f900bd57","choices":[{"delta":{"content":"","function_call":null,"refusal":null,"role":null,"tool_calls":null},"finish_reason":"stop","index":0,"logprobs":null}],"created":1735113344,"model":"qwen-plus","object":"chat.completion.chunk","service_tier":null,"system_fingerprint":null,"usage":null}
{"id":"chatcmpl-e30f5ae7-3063-93c4-90fe-beb5f900bd57","choices":[],"created":1735113344,"model":"qwen-plus","object":"chat.completion.chunk","service_tier":null,"system_fingerprint":null,"usage":{"completion_tokens":17,"prompt_tokens":22,"total_tokens":39,"completion_tokens_details":null,"prompt_tokens_details":{"audio_tokens":null,"cached_tokens":0}}}
id string

本次调用的唯一标识符。每个chunk对象有相同的 id。

choices array

模型生成内容的数组，可包含一个或多个choices对象。如果设置include_usage参数为true，则最后一个chunk为空。

属性

delta object

chat请求的增量对象。

属性

finish_reason string

有四种情况：

因触发输入参数中的stop条件，或自然停止输出时为stop；

当生成未结束时为null；

因生成长度过长而结束为length；

因需要调用工具而结束为tool_calls。

index integer

当前响应在choices列表中的序列编号。当输入参数 n 大于1时，您需要根据 index 参数来进行不同响应对应的完整内容的拼接。

logprobs object

当前 choices 对象的概率信息。

属性

created integer

本次chat请求被创建时的时间戳。每个chunk对象有相同的时间戳。

model string

本次chat请求使用的模型名称。

object string

始终为chat.completion.chunk。

service_tier string

该参数当前固定为null。

system_fingerprintstring

该参数当前固定为null。

usage object

本次chat请求使用的Token信息。只在include_usage为true时，在最后一个chunk显示。

属性

completion_tokens integer

模型生成回复转换为 Token 后的长度。

prompt_tokens integer

用户的输入转换成 Token 后的长度。

total_tokens integer

prompt_tokens与completion_tokens的总和。

completion_tokens_details object

输出转换为 Token 后的详细信息。

属性

prompt_tokens_details object

输入数据的 Token 细粒度分类。

属性

audio_tokens integer

使用Qwen-Omni 模型时，输入的音频转换为 Token 后的长度。

视频文件中的音频转换为 Token 后的长度会在该参数中体现。
text_tokens integer

使用Qwen-Omni 模型时，输入的文本转换为 Token 后的长度。

video_tokens integer

使用Qwen-VL 模型、QVQ模型、Qwen-Omni 模型时，输入的视频（图片列表形式或视频文件）转换为 Token 后的长度。如果Qwen-Omni 模型输入的是视频文件，则video_tokens 不包含音频的 Token，音频的 Token 在audio_tokens中体现。

image_tokens integer

使用Qwen-VL 模型、QVQ模型、Qwen-Omni 模型时，输入的图片转换为 Token 后的长度。

cached_tokens integer

命中 Cache 的 Token 数。Context Cache 详情请参见上下文缓存。