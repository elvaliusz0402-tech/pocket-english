/* 语料库 · 工作场景
 * 结构：[中文意思, 检索关键词[], [[英文说法, 语气, 场景, 使用提醒], ...]]
 */
window.CORPUS_WORK = [
  ["我想确认一下明天的会议时间", ["确认", "会议", "时间", "安排", "明天"], [
    ["Just double-checking — are we still on for 3 tomorrow?", "轻松", "work", "be on for... 表示\"约定照旧\"，熟人或同级之间最自然。"],
    ["Could you confirm the meeting time for tomorrow?", "礼貌", "work", "对客户或上级用 Could you... 比 Can you... 更稳妥。"],
    ["I just want to make sure I've got the time right — 3 p.m. tomorrow?", "委婉", "work", "用 I want to make sure 软化语气，避免显得你在质疑对方。"]
  ]],
  ["这个方案我看了，有几个小问题", ["方案", "问题", "反馈", "意见", "看过"], [
    ["I took a look at the proposal — I've got a few small questions.", "平和", "work", "I've got a few questions 比 I have some problems 柔和得多，先问再说。"],
    ["I went through the deck. A couple of things I'm not sure about.", "随意", "work", "go through 是\"过一遍\"的高频说法；deck 指 PPT。"],
    ["Overall it looks good. Can I flag two things I'd tweak?", "委婉", "work", "先肯定再提意见（flag / tweak），是职场最安全的反馈句式。"]
  ]],
  ["麻烦你把资料发我一份", ["资料", "文件", "发我", "发一份", "文档"], [
    ["Could you shoot me the deck when you get a chance?", "随意", "work", "shoot me... 是美式职场高频口语，等于\"发我\"，别用 send me the material 这种直译。"],
    ["Would you mind sharing the files with me?", "礼貌", "work", "Would you mind... 是标准礼貌请求，适合跨部门或生人。"],
    ["Whenever you're free, please send over the materials.", "正式", "work", "send over 比 send 更口语自然；Whenever you're free 表示不催。"]
  ]],
  ["我这边进度有点落后，可能要延后两天", ["进度", "延后", "延期", "落后", "delay"], [
    ["I'm running a bit behind — I'll probably need two extra days.", "坦诚", "work", "run behind 是\"进度落后\"的地道说法，比落后于 schedule 更常用。"],
    ["Just a heads-up: this is going to slip by about two days.", "直接", "work", "heads-up 提前打招呼；slip 专指工期/截止日滑走。"],
    ["Can I push the deadline back by a couple of days?", "商量", "work", "push back + 时间，是请求延期的固定搭配。"]
  ]],
  ["这个需求现在做不了，排期太紧", ["做不了", "排期", "拒绝", "太紧", "没时间"], [
    ["With the current timeline, I don't think I can fit this in.", "委婉", "work", "fit in 表示\"塞得进去\"，比 I can't do it 好听很多。"],
    ["I'd love to, but my plate is pretty full right now.", "温和", "work", "my plate is full 是\"手上事太多\"的经典比喻，拒绝又不伤和气。"],
    ["This one's going to have to wait until things free up a bit.", "直接", "work", "have to wait 说明是优先级问题，不是不愿意做。"]
  ]],
  ["我先跟团队对一下，再回复你", ["团队", "对一下", "回复", "商量", "确认"], [
    ["Let me check with the team and get back to you.", "标准", "work", "get back to you 是职场万能句，比 I will reply you 地道得多。"],
    ["I'll run it by the team first and circle back.", "随意", "work", "run it by sb. 征求意见；circle back 稍后再聊，都是高频职场短语。"],
    ["Can I take this offline and confirm internally first?", "正式", "work", "take it offline 表示\"会后再单独处理\"，会议里很好用。"]
  ]],
  ["抱歉我来晚了", ["迟到", "来晚", "抱歉", "晚了"], [
    ["Sorry I'm late — the train was a nightmare.", "随意", "work", "nightmare 形容交通糟心，比 very bad 生动。"],
    ["Apologies for the delay, everyone. Shall we get started?", "礼貌", "work", "Apologies for the delay 是会议迟到的标准说法。"],
    ["Thanks for waiting — I got held up.", "自然", "work", "get held up 表示被事耽搁，不解释细节也很体面。"]
  ]],
  ["我这边网络不好，能再说一遍吗", ["网络", "再说一遍", "听不清", "信号"], [
    ["Sorry, you're breaking up — could you say that again?", "自然", "work", "you're breaking up 专指通话断断续续，别直译 network is bad。"],
    ["I didn't catch that. Mind repeating it?", "随意", "work", "I didn't catch that 比 pardon 更口语，catch 指\"听清\"。"],
    ["Could you repeat that? My connection's a bit patchy.", "礼貌", "work", "patchy 形容网络时好时坏，很地道。"]
  ]],
  ["我们直接进入重点吧", ["重点", "进入", "会议", "简短"], [
    ["Let's jump straight into it — we've got a lot to cover.", "干练", "work", "jump straight into 直接进入正题；cover 指覆盖议程。"],
    ["I'll keep this short — let's get straight to the point.", "直接", "work", "keep it short 声明简短，参会者会很感激。"],
    ["To save time, let's skip the intros and dive in.", "随意", "work", "dive in 开始投入，熟人间自然。"]
  ]],
  ["这个我先记下来，回头跟进", ["记下", "跟进", "回头", "later"], [
    ["Let me note that down and follow up later.", "标准", "work", "note down 记下；follow up 跟进，都是职场必备动词。"],
    ["I'll put a pin in it and come back to it.", "地道", "work", "put a pin in it 是\"暂时搁置、待会再说\"的常用说法。"],
    ["Good point — I'll take that away and look into it.", "礼貌", "work", "take it away 带走这个意见；look into it 去查/去跟进。"]
  ]],
  ["我不太同意这个方案", ["不同意", "反对", "不认同", "不同看法"], [
    ["I see it a bit differently, to be honest.", "委婉", "work", "先说 I see it differently，比直接 I disagree 安全。"],
    ["I'm not sure I'm on board with this one.", "含蓄", "work", "be on board 表示赞同/加入，否定式表达保留意见。"],
    ["Can I push back on that a little?", "直接", "work", "push back 是职场里\"提出反对\"的地道动词。"]
  ]],
  ["我先说结论", ["结论", "总结", "先说"], [
    ["Let me start with the bottom line.", "干练", "work", "bottom line 本义账本末行，引申为\"最关键的结论\"。"],
    ["Short version: it works.", "随意", "work", "Short version 是\"长话短说\"的口头禅。"],
    ["To cut a long story short — we're good to go.", "地道", "work", "cut a long story short 长话短说；good to go 可以推进了。"]
  ]],
  ["这个不在我负责的范围内", ["不负责", "范围", "不是我", "职责"], [
    ["That's a bit outside my scope, I'm afraid.", "礼貌", "work", "outside my scope 比 not my job 得体得多。"],
    ["That's not really my area — let me point you to the right person.", "热心", "work", "point you to 帮你引荐对的人，拒绝但给出口。"],
    ["I don't own that piece, but I can find out who does.", "直接", "work", "own 表示\"负责/归属\"，是职场高频动词。"]
  ]],
  ["麻烦帮我看一下有没有问题", ["看一下", "检查", "review", "有没有问题"], [
    ["Could you take a look and let me know if anything's off?", "随意", "work", "something's off 表示\"哪里不对劲\"，非常口语。"],
    ["Would you mind giving it a quick once-over?", "礼貌", "work", "once-over 是\"快速过一遍\"的固定说法。"],
    ["Can you sanity-check this before I send it out?", "专业", "work", "sanity-check 确认没低级错误，技术团队常用。"]
  ]],
  ["文件我已经更新好了，麻烦查收", ["更新", "文件", "查收", "发给你"], [
    ["I've updated the file — please take a look.", "标准", "work", "take a look 比 check it 客气。"],
    ["Just pushed the latest version. Let me know what you think.", "随意", "work", "push 指上传/提交最新版，团队协作常用。"],
    ["The revised deck is attached. FYI.", "简洁", "work", "FYI = for your information，邮件里表示\"供参考\"。"]
  ]],
  ["这件事我们邮件/线上说", ["邮件", "线上", "会后说", "私下"], [
    ["Let's take this offline — I'll send you an email.", "职场", "work", "take it offline 指会下单独沟通，避免占用大家时间。"],
    ["I'll drop you a message after the call.", "随意", "work", "drop sb. a message 是\"随手发个消息\"的轻松说法。"],
    ["Let me follow up over email with the details.", "正式", "work", "follow up over email 标准书面表达。"]
  ]],
  ["我下周休假，有事找他", ["休假", "不在", "请假", "找他"], [
    ["I'm out next week — please reach out to Dan instead.", "标准", "work", "be out 表示不在岗；reach out to 联系某人。"],
    ["I'll be OOO next week. Dan's got you covered.", "地道", "work", "OOO = out of office，邮件自动回复里最常见。"],
    ["Heads-up: I'm taking next week off.", "随意", "work", "take ... off 休假；heads-up 提前告知。"]
  ]],
  ["这个价格能不能再低一点", ["价格", "便宜", "降价", "折扣"], [
    ["Is there any wiggle room on the price?", "地道", "work", "wiggle room 表示\"可商量的余地\"，谈判时非常地道。"],
    ["Would you be able to do a bit better on the price?", "礼貌", "work", "do better on the price 是砍价不改口的委婉说法。"],
    ["Any chance of a discount if we commit to a larger order?", "专业", "work", "commit to 承诺下单量，换取折扣的常用逻辑。"]
  ]],
  ["我手头还有别的事，这个要晚点", ["忙", "手头", "晚点", "没空"], [
    ["I've got a few things on my plate right now — can this wait till later?", "自然", "work", "on my plate 形容手上待办，比 I'm busy 生动。"],
    ["I'm tied up at the moment. I'll get to it this afternoon.", "直接", "work", "tied up 表示被事缠住，无法立刻抽身。"],
    ["Can I get to this a little later? I'm in the middle of something.", "礼貌", "work", "in the middle of something 正在忙某事，很常用。"]
  ]],
  ["我理解你的意思，但我的想法是", ["理解", "我的想法", "不同意见"], [
    ["I hear you, but here's how I see it.", "平和", "work", "I hear you 表示\"我听进去了\"，不是字面\"我听见你\"。"],
    ["That makes sense. My only concern is the timeline.", "委婉", "work", "先认可再抛出 concern，容易被接受。"],
    ["I get where you're coming from. Let me offer another angle.", "成熟", "work", "where you're coming from 指对方的立场，很高级的说法。"]
  ]],
  ["我先做个初版，大家看看方向对不对", ["初版", "方向", "草稿", "原型"], [
    ["I'll put together a rough draft so we can sanity-check the direction.", "专业", "work", "rough draft 初稿；direction 方向，避免走偏。"],
    ["Let me hack something together first — we can polish it later.", "随意", "work", "hack together 指先做出能用的东西，工程师爱用。"],
    ["Here's a first pass. Is this the direction you had in mind?", "自然", "work", "first pass 第一版；had in mind 你想要的样子。"]
  ]],
  ["数据看着不太对，我们核对一下", ["数据", "不对", "核对", "检查"], [
    ["These numbers look off to me — can we double-check them?", "自然", "work", "look off 看着不对劲；double-check 再核一遍。"],
    ["Something doesn't add up here. Let me dig into it.", "地道", "work", "doesn't add up 字面\"加不起来\"，即逻辑对不上。"],
    ["I think there might be an error in the data. Let's verify before we send it.", "谨慎", "work", "verify 强调核实，适合对外交付前。"]
  ]],
  ["我这边没问题，可以推进", ["没问题", "可以", "同意", "推进"], [
    ["Looks good to me — let's move forward.", "干练", "work", "Looks good to me 是批准的口头禅；move forward 推进。"],
    ["I'm happy with this. Let's go ahead.", "自然", "work", "go ahead 表示放行、可以开始。"],
    ["No objections from my side. Green light.", "简洁", "work", "green light 绿灯放行，团队沟通很常用。"]
  ]],
  ["抱歉打断一下", ["打断", "插话", "打扰"], [
    ["Sorry to jump in — quick question.", "随意", "work", "jump in 打断/插话；配 quick question 显得不突兀。"],
    ["Mind if I interrupt for a second?", "礼貌", "work", "Mind if I... 请求许可的礼貌句式。"],
    ["Can I chime in here?", "地道", "work", "chime in 指加入发言，是会议里的常用短语。"]
  ]],
  ["抱歉，我要先下线了", ["下线", "先走", "离开", "退出"], [
    ["I've got to jump — thanks everyone.", "随意", "work", "I've got to jump 表示得赶紧走，很口语。"],
    ["I need to drop off now. I'll catch up on the notes.", "自然", "work", "drop off 下线；catch up on the notes 补看记录。"],
    ["Sorry, I have to hop off for another call.", "礼貌", "work", "hop off 跳下（通话），比 leave 轻松。"]
  ]],
  ["这个截止日期太紧了", ["截止", "deadline", "太紧", "来不及"], [
    ["That deadline is pretty tight — is there any flexibility?", "礼貌", "work", "tight 形容时间紧；flexibility 问有没有余地。"],
    ["We're cutting it close on this one.", "地道", "work", "cut it close 指时间卡得很险，差点来不及。"],
    ["I'm not sure we can hit that date. Can we talk about scope?", "坦诚", "work", "hit a date 赶上日期；谈 scope 是谈判常见做法。"]
  ]],
  ["我总结一下今天的结论", ["总结", "结论", "today"], [
    ["To wrap up — here's what we agreed on.", "标准", "work", "wrap up 收尾；agreed on 达成的一致。"],
    ["Quick recap so we're all on the same page.", "随意", "work", "on the same page 指信息同步、理解一致。"],
    ["Let me summarize the action items before we close.", "正式", "work", "action items 待办事项；close 结束会议。"]
  ]],
  ["有没有别的做法", ["别的做法", "换个", "其他方案", "替代"], [
    ["Is there another way we could approach this?", "开放", "work", "approach 处理/切入，问法比 other method 自然。"],
    ["What if we tried a completely different angle?", "创意", "work", "What if... 提出假想的经典句式。"],
    ["Have we considered any alternatives?", "正式", "work", "consider alternatives 书面感更强，适合汇报。"]
  ]],
  ["这个我还不确定，需要再查一下", ["不确定", "查一下", "不清楚", "确认"], [
    ["I'm not 100% sure — let me confirm and get back to you.", "坦诚", "work", "先承认不确定，再承诺回复，比瞎猜安全。"],
    ["Off the top of my head, I'd say no, but let me double-check.", "地道", "work", "off the top of my head 凭印象，暗示未经核实。"],
    ["I don't want to guess — I'll verify it first.", "谨慎", "work", "I don't want to guess 表示负责任的态度。"]
  ]],
  ["辛苦了，大家做得很好", ["辛苦", "做得好", "表扬", "感谢"], [
    ["Great work, everyone — appreciate you pulling this together.", "真诚", "work", "pull together 合力完成，表扬团队很自然。"],
    ["Nice job on this. You knocked it out of the park.", "热情", "work", "knock it out of the park 做得极好，棒球梗。"],
    ["Thanks for grinding on this — I know it wasn't easy.", "体贴", "work", "grind 指苦干，适合辛苦的攻坚场景。"]
  ]],
  ["我刚接手这个项目，还在熟悉", ["刚接手", "新来的", "熟悉", "上手"], [
    ["I just took this over, so I'm still getting up to speed.", "标准", "work", "get up to speed 追上进度/熟悉情况，高频短语。"],
    ["I'm new to this project — bear with me while I catch up.", "坦诚", "work", "bear with me 请多包涵，很得体。"],
    ["I'm still getting my head around how this works.", "地道", "work", "get my head around 弄明白，比 understand 生动。"]
  ]],
  ["我们约个时间细聊", ["约时间", "细聊", "安排", "会议"], [
    ["Let's find some time to dig into this properly.", "自然", "work", "dig into 深入探讨；properly 强调认真谈。"],
    ["Can we set up a quick 30-minute sync?", "职场", "work", "sync 指同步会，比 meeting 轻松。"],
    ["When are you free? I'd love to talk it through.", "礼貌", "work", "talk through 把事情说透。"]
  ]],
  ["麻烦你催一下他", ["催", "提醒", "跟一下", "进度"], [
    ["Could you nudge him on this?", "地道", "work", "nudge 轻轻推一下，比 urge/push 温和得多。"],
    ["Can you give him a gentle reminder?", "礼貌", "work", "gentle reminder 温和提醒，不显得逼人。"],
    ["Mind chasing him for an update?", "随意", "work", "chase sb. 追进度，职场口语常用。"]
  ]],
  ["我先把手头这个做完", ["先做", "手头", "优先", "顺序"], [
    ["Let me finish what I'm working on first.", "自然", "work", "朴实说法，说明优先级。"],
    ["I'll wrap this up before I move on to the next thing.", "干练", "work", "wrap up 收尾完成，很职场。"],
    ["I want to close this out before starting anything new.", "正式", "work", "close out 彻底结束，适合汇报。"]
  ]]
];
