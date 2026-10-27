/* 语料库 · 社交场景
 * 结构：[中文意思, 检索关键词[], [[英文说法, 语气, 场景, 使用提醒], ...]]
 */
window.CORPUS_SOCIAL = [
  ["好久不见", ["好久不见", "long time", "见面", "重逢"], [
    ["Long time no see! How have you been?", "热情", "social", "经典寒暄，后面接 How have you been 才完整。"],
    ["It's been ages — we should catch up properly.", "亲切", "social", "ages 夸张表示很久；catch up 叙旧，比 talk 地道。"],
    ["Hey stranger! It's been way too long.", "玩笑", "social", "Hey stranger 是老友间的调侃，别对不熟的人用。"]
  ]],
  ["改天一起吃个饭", ["改天", "一起吃饭", "约", "聚"], [
    ["We should grab dinner sometime.", "随意", "social", "grab dinner 比 have dinner 轻松，sometime 表示不约定死。"],
    ["Let's catch up over coffee soon — I'll text you.", "亲切", "social", "over coffee 边喝咖啡边聊，比直接约饭压力小。"],
    ["We need to do this again. I'm free next week?", "热情", "social", "用问号收尾把球抛给对方，更容易成行。"]
  ]],
  ["我先走了", ["先走", "撤了", "离开", "bye"], [
    ["I'm going to head out — it was great seeing you.", "礼貌", "social", "head out 出门/离开，是派对告别最自然的说法。"],
    ["I should get going. Let's do this again soon!", "热情", "social", "get going 该走了，配上再约的话不显冷淡。"],
    ["Alright, I'll leave you to it. Take care!", "随意", "social", "leave you to it 表示不打扰对方继续忙。"]
  ]],
  ["我同意你的看法", ["同意", "对", "说得对", "same"], [
    ["Totally — I was thinking the same thing.", "自然", "social", "Totally 一个词就能表达强烈同意，很口语。"],
    ["Right? That's exactly how I feel.", "共鸣", "social", "Right? 句尾上扬，用来找共鸣。"],
    ["I couldn't agree more.", "强调", "social", "字面\"再同意不过\"，比 I agree 强烈得多。"]
  ]],
  ["我不太想去，这次先算了", ["不想去", "拒绝", "邀约", "算了"], [
    ["I'd love to, but I'll have to take a rain check.", "委婉", "social", "rain check 指这次不行下次再约，是拒绝邀约的万能说法。"],
    ["I'm not really feeling up to it tonight, sorry.", "坦诚", "social", "not feeling up to it 表示状态/心情不适合。"],
    ["Can I skip this one? I've got a lot going on.", "直接", "social", "skip 跳过这次；a lot going on 事情多。"]
  ]],
  ["你最近怎么样", ["最近", "怎么样", "近况", "how"], [
    ["How have you been? What's new with you?", "热情", "social", "两句连着问，是最标准的近况寒暄。"],
    ["How's life treating you these days?", "地道", "social", "有点俏皮的说法，适合朋友间。"],
    ["What have you been up to lately?", "随意", "social", "be up to 最近在忙什么，比 what are you doing 自然。"]
  ]],
  ["恭喜你", ["恭喜", "祝贺", "厉害"], [
    ["Congrats! That's awesome — you deserve it.", "热情", "social", "you deserve it 表示实至名归，比单独 congrats 真诚。"],
    ["That's huge! So happy for you.", "激动", "social", "That's huge 指事情很大、很了不起。"],
    ["Well done — I knew you'd nail it.", "赞赏", "social", "nail it 完美做到，很口语。"]
  ]],
  ["听说你换工作了", ["听说", "换工作", "新工作", "跳槽"], [
    ["I heard you switched jobs — how's the new place?", "自然", "social", "switched jobs 换工作；how's the new place 顺势追问。"],
    ["So you've moved on to something new? Tell me everything.", "好奇", "social", "moved on 往前走，不含负面意味。"],
    ["Someone told me you started somewhere new — congrats!", "礼貌", "social", "someone told me 表示消息来源，不显得八卦。"]
  ]],
  ["我请你喝咖啡", ["我请", "请客", "咖啡", "买单"], [
    ["Let me grab you a coffee — my treat.", "随意", "social", "my treat 我请客，是固定说法。"],
    ["This one's on me.", "简洁", "social", "买单时最常用的一句，动作感很强。"],
    ["Can I get you a drink? It's on me.", "礼貌", "social", "get you a drink 帮你点一杯，酒吧/聚餐常用。"]
  ]],
  ["不用谢", ["不用谢", "别客气", "不客气"], [
    ["No worries at all — happy to help.", "随意", "social", "No worries 是澳洲/美式高频回应，比 You're welcome 更松弛。"],
    ["Anytime! It was nothing.", "亲切", "social", "Anytime 表示随时乐意帮忙。"],
    ["Don't mention it. Really, it was no trouble.", "礼貌", "social", "Don't mention it 别提了，老派但得体。"]
  ]],
  ["抱歉给你添麻烦了", ["添麻烦", "麻烦你", "不好意思"], [
    ["Sorry for the trouble — I really appreciate it.", "礼貌", "social", "Sorry for the trouble 是标准道歉，配感谢更完整。"],
    ["I hate to be a pain, but could you help me with this?", "委婉", "social", "be a pain 当个麻烦精，提前自贬以软化请求。"],
    ["Thanks for putting up with me.", "玩笑", "social", "put up with 忍受，朋友间的自嘲说法。"]
  ]],
  ["我晚点到", ["晚点", "迟到", "稍等", "晚到"], [
    ["I'm running about ten minutes late — sorry!", "自然", "social", "run late 是\"会迟到\"的固定说法，别用 I will late。"],
    ["Just got held up. Be there in 15.", "随意", "social", "get held up 被耽搁，短信里非常常见。"],
    ["I'm on my way, just running a bit behind.", "坦诚", "social", "on my way 在路上；behind 落后于时间。"]
  ]],
  ["你先来", ["你先", "先请", "优先"], [
    ["Go ahead — after you.", "礼貌", "social", "after you 是让行的经典说法，进门/排队都能用。"],
    ["Ladies first. / Age before beauty.", "玩笑", "social", "后一句是老式玩笑，只对熟人用。"],
    ["You go first, I'm still deciding.", "随意", "social", "说明自己在犹豫，让对方先。"]
  ]],
  ["我开玩笑的", ["开玩笑", "逗你", "joke"], [
    ["I'm just kidding — ignore me.", "随意", "social", "kidding 比 joking 更口语。"],
    ["Just messing with you!", "地道", "social", "mess with sb. 逗某人玩，年轻人常用。"],
    ["Kidding, kidding. Please don't take it seriously.", "缓和", "social", "重复两遍加强\"别当真\"的信号。"]
  ]],
  ["我理解你的感受", ["理解", "感受", "同理", "安慰"], [
    ["I get it — that sounds really rough.", "共情", "social", "I get it 我懂；rough 形容处境难熬。"],
    ["That makes total sense. I'd feel the same way.", "体贴", "social", "I'd feel the same 表示换位思考。"],
    ["I hear you. That's a lot to deal with.", "沉稳", "social", "a lot to deal with 要承受的东西很多。"]
  ]],
  ["这事就让它过去吧", ["过去", "别提了", "翻篇", "算了"], [
    ["Let's just move past it — no hard feelings.", "大度", "social", "no hard feelings 不记仇，和解时的固定搭配。"],
    ["Water under the bridge. Let's move on.", "地道", "social", "桥下流水，比喻已经过去的事。"],
    ["Let's call it even and start fresh.", "干脆", "social", "call it even 扯平；start fresh 重新开始。"]
  ]],
  ["我们保持联系", ["保持联系", "常联系", "联系"], [
    ["Let's keep in touch — don't be a stranger.", "亲切", "social", "don't be a stranger 别断了联系，很温暖。"],
    ["Stay in touch, yeah? Text me anytime.", "随意", "social", "句尾 yeah? 让语气更软。"],
    ["Let me know how things go. I'd love to hear from you.", "真诚", "social", "hear from you 收到你的消息。"]
  ]],
  ["你觉得怎么样", ["你觉得", "怎么样", "意见", "想法"], [
    ["What do you think? Be honest.", "直接", "social", "Be honest 鼓励对方说真话。"],
    ["How does that sound to you?", "委婉", "social", "How does ... sound 询问对方感受，很柔和。"],
    ["Thoughts? I'm open to anything.", "随意", "social", "一个词 Thoughts? 在群聊里极其常见。"]
  ]],
  ["能帮我个忙吗", ["帮忙", "帮我", "请求", "favor"], [
    ["Could you do me a favor?", "标准", "social", "do sb. a favor 帮忙，固定搭配。"],
    ["Any chance you could help me out with something?", "委婉", "social", "help out 搭把手，语气比 help 轻松。"],
    ["I could really use a hand with this.", "坦诚", "social", "use a hand 需要人手，暗示自己也尽力了。"]
  ]],
  ["我不想聊这个话题", ["不想聊", "话题", "回避", "别问"], [
    ["I'd rather not get into that right now.", "礼貌", "social", "get into 深入谈论，I'd rather not 明确但不伤人。"],
    ["Can we talk about something else?", "直接", "social", "简单转开话题。"],
    ["That's a bit of a sore subject — mind if we skip it?", "地道", "social", "sore subject 敏感/扎心话题，很高级的表达。"]
  ]],
  ["你先忙，我不打扰了", ["你忙", "不打扰", "打扰了"], [
    ["I'll let you go — talk soon!", "自然", "social", "挂电话/结束聊天的万能句。"],
    ["Don't let me keep you. Go enjoy your day!", "体贴", "social", "keep sb. 占用某人时间。"],
    ["I'll leave you to it. Catch you later!", "随意", "social", "leave you to it 让你继续忙。"]
  ]],
  ["很高兴认识你", ["认识你", "幸会", "初次"], [
    ["Nice to meet you! I've heard a lot about you.", "热情", "social", "I've heard a lot about you 久仰，社交加分句。"],
    ["Great to finally meet you in person.", "自然", "social", "in person 线下本人，区别于线上。"],
    ["It's a pleasure. Let's stay connected.", "正式", "social", "stay connected 保持联系，偏商务社交。"]
  ]],
  ["路上堵车，我会晚一点", ["堵车", "交通", "迟到", "路上"], [
    ["Traffic is brutal — I'll be a few minutes late.", "地道", "social", "brutal 形容堵得厉害，比 heavy 生动。"],
    ["Stuck in traffic. Save me a seat!", "随意", "social", "stuck 被卡住；后面加句玩笑缓解气氛。"],
    ["I'm hitting some traffic, should be there by 8.", "自然", "social", "hit traffic 遇上堵车，动词搭配很地道。"]
  ]],
  ["你今天气色不错", ["气色", "好看", "状态", "夸奖"], [
    ["You look great today — did you do something different?", "热情", "social", "追问细节让夸奖更真诚。"],
    ["You're glowing! Something good happened?", "亲切", "social", "glow 容光焕发，专夸气色。"],
    ["Love the new look. It really suits you.", "自然", "social", "suit 适合，夸穿搭比 beautiful 具体。"]
  ]],
  ["我英语不太好，请多包涵", ["英语不好", "包涵", "说错", "担心"], [
    ["My English is a bit rusty — please bear with me.", "坦诚", "social", "rusty 生疏了，比 poor 得体，暗示曾经会。"],
    ["Sorry if I mispronounce things — still learning!", "轻松", "social", "still learning 表明态度，对方会更包容。"],
    ["Feel free to correct me if I get it wrong.", "积极", "social", "correct me 请纠正我，是学习的正确姿势。"]
  ]],
  ["让我想想", ["想想", "考虑", "等一下", "思考"], [
    ["Let me think about it for a sec.", "随意", "social", "for a sec 一会儿，比 a moment 口语。"],
    ["Give me a second — I'm still on the fence.", "地道", "social", "on the fence 犹豫不决，很形象的俚语。"],
    ["Let me sleep on it and get back to you.", "稳妥", "social", "sleep on it 考虑一晚上再决定。"]
  ]],
  ["没问题，包在我身上", ["包在我", "放心", "没问题", "保证"], [
    ["Consider it done.", "干脆", "social", "四个字表示\"这事已经算办好了\"。"],
    ["Leave it to me — I've got this.", "自信", "social", "I've got this 我来处理，很常见。"],
    ["You can count on me. I'll handle it.", "可靠", "social", "count on sb. 可以信赖某人。"]
  ]],
  ["我比较内向/有点社恐", ["内向", "社恐", "害羞", "慢热"], [
    ["I'm a bit of an introvert — I need time to recharge.", "自然", "social", "recharge 充电，解释独处需求，不带负面色彩。"],
    ["I'm kind of shy at first, but I warm up quickly.", "坦诚", "social", "warm up 熟起来，让人安心。"],
    ["I'm more of a listener, honestly.", "轻松", "social", "换个正面说法，比直接说社恐舒服。"]
  ]],
  ["今天玩得很开心", ["开心", "玩得", "愉快", "enjoy"], [
    ["I had a great time — thanks for having me.", "礼貌", "social", "thanks for having me 感谢招待，做客必备。"],
    ["That was so much fun. We need to do it again.", "热情", "social", "so much fun 比 very happy 地道。"],
    ["Tonight was a blast. I'm still laughing.", "地道", "social", "a blast 极度开心，很有画面感。"]
  ]],
  ["下次再约", ["下次", "再约", "回头"], [
    ["Let's do it again soon.", "简单", "social", "最常用的一句，几乎人人都会说。"],
    ["Next time's on me — I owe you one.", "热情", "social", "I owe you one 我欠你一次，很有人情味。"],
    ["Let's not wait another six months, yeah?", "玩笑", "social", "用玩笑表达\"别又拖这么久\"。"]
  ]],
  ["你先请，我不着急", ["不着急", "你先", "慢慢来"], [
    ["Take your time — I'm not in a rush.", "体贴", "social", "Take your time 慢慢来，万能安抚句。"],
    ["No rush at all. Whenever you're ready.", "随意", "social", "No rush 不急，比 don't hurry 自然。"],
    ["I'm easy — go ahead and finish up first.", "地道", "social", "I'm easy 我随便/都行，很口语。"]
  ]],
  ["我也有同感", ["同感", "一样", "我也是"], [
    ["Same here — it's been a crazy week.", "随意", "social", "Same here 我也是，最短的共鸣。"],
    ["Tell me about it!", "地道", "social", "字面\"跟我说说\"，实际是\"可不是嘛\"，表强烈同感。"],
    ["Join the club. We're all in the same boat.", "幽默", "social", "in the same boat 同舟共济，指处境一样。"]
  ]]
];
