/* 语料库 · 旅行 / 日常 / 影视
 * 结构：[中文意思, 检索关键词[], [[英文说法, 语气, 场景, 使用提醒], ...]]
 */
window.CORPUS_LIFE = [
  // ============ 旅行 travel ============
  ["我要办理入住", ["入住", "check in", "酒店", "房间"], [
    ["Hi, I'd like to check in. I have a reservation under Liu.", "标准", "travel", "check in 入住；reservation under + 姓名 是前台固定句式。"],
    ["Checking in — booking's under my name, Liu.", "简洁", "travel", "省略主语，前台场景完全够用。"],
    ["I booked a room for two nights. Here's my passport.", "直接", "travel", "for two nights 说清天数，省去追问。"]
  ]],
  ["我的航班延误了", ["航班", "延误", "飞机", "晚点"], [
    ["My flight's been delayed — I'm not sure when we'll land.", "自然", "travel", "be delayed 延误；land 降落，比 arrive 具体。"],
    ["Looks like we're stuck at the gate for a while.", "随意", "travel", "stuck at the gate 卡在登机口，很地道。"],
    ["They just pushed our departure back by an hour.", "地道", "travel", "push back 推迟，机场广播里的常用说法。"]
  ]],
  ["请问洗手间在哪里", ["洗手间", "厕所", "哪里", "restroom"], [
    ["Excuse me, where's the restroom?", "礼貌", "travel", "美式用 restroom / bathroom，别说 WC（英式老词）。"],
    ["Any idea where I can find a bathroom?", "随意", "travel", "Any idea... 比 Do you know... 更松弛。"],
    ["Is there a restroom around here?", "自然", "travel", "around here 这附近，问路万能搭配。"]
  ]],
  ["这里可以刷卡吗", ["刷卡", "付款", "现金", "credit"], [
    ["Do you take card?", "简洁", "travel", "take card 接受刷卡，比 Can I use credit card 地道。"],
    ["Can I pay by card, or is it cash only?", "清楚", "travel", "一次问清两种方式，避免尴尬。"],
    ["Is it okay if I tap?", "现代", "travel", "tap 指感应/闪付，年轻人常用。"]
  ]],
  ["我想退掉这个", ["退货", "退款", "退掉", "换"], [
    ["I'd like to return this, please. I still have the receipt.", "标准", "travel", "return 退货；receipt 收据是关键词。"],
    ["Can I get a refund on this?", "直接", "travel", "refund 退款（钱），区别于 exchange 换货。"],
    ["Would it be possible to exchange it for a different size?", "礼貌", "travel", "exchange for 换成别的尺码/款式。"]
  ]],
  ["帮我叫辆车", ["打车", "出租车", "叫车", "taxi"], [
    ["Could you call me a cab?", "标准", "travel", "call sb. a cab 叫出租车，酒店常说的一句话。"],
    ["Can you help me get an Uber? I can't find the pickup spot.", "现代", "travel", "pickup spot 上车点，打车软件场景必备。"],
    ["I need a ride to the airport, please.", "直接", "travel", "ride 搭车，比 take a car 自然。"]
  ]],
  ["我对花生过敏，不吃辣", ["过敏", "不吃", "辣", "忌口"], [
    ["I'm allergic to peanuts — does this have any?", "认真", "travel", "allergic to 对……过敏，一定要说清，属于安全信息。"],
    ["Could you make it not spicy at all? I can't handle chili.", "清楚", "travel", "not spicy at all 完全不辣，比 a little spicy 明确。"],
    ["I have a nut allergy — can you double-check with the kitchen?", "谨慎", "travel", "double-check with the kitchen 请厨房确认，很实用。"]
  ]],
  ["这个太贵了", ["太贵", "价格", "便宜", "expensive"], [
    ["That's a bit out of my budget, honestly.", "委婉", "travel", "out of my budget 超出预算，比 too expensive 得体。"],
    ["Whoa, that's steep. Is there a cheaper option?", "地道", "travel", "steep 形容价格陡峭，很口语。"],
    ["Any chance of a better price?", "砍价", "travel", "夜市/小店砍价的温和开场。"]
  ]],
  ["能给我看一下菜单吗", ["菜单", "点餐", "menu"], [
    ["Could I get a menu, please?", "标准", "travel", "Could I get... 是点餐场景最高频的句式。"],
    ["Can we see the menu? We're ready to order.", "自然", "travel", "ready to order 准备好点餐了，主动示意。"],
    ["What do you recommend? I'll go with that.", "省事", "travel", "go with 选这个，很常用的决定句式。"]
  ]],
  ["我迷路了", ["迷路", "找不到", "导航", "lost"], [
    ["I think I'm a bit lost — could you point me in the right direction?", "礼貌", "travel", "point sb. in the right direction 指个方向。"],
    ["Sorry, do you know how to get to the station from here?", "清楚", "travel", "from here 从这里出发，问路必备。"],
    ["My map's not loading. Am I going the right way?", "现代", "travel", "not loading 加载不出来，非常真实。"]
  ]],
  ["我的行李丢了", ["行李", "丢了", "托运", "luggage"], [
    ["My luggage didn't show up. Can you help me file a report?", "标准", "travel", "didn't show up 没到；file a report 登记报失。"],
    ["One of my bags is missing — here's my baggage tag.", "直接", "travel", "baggage tag 行李条，机场沟通关键道具。"],
    ["I can't find my suitcase. Who should I talk to?", "着急", "travel", "Who should I talk to 找对人，比 What should I do 有效。"]
  ]],
  ["WiFi 密码是多少", ["wifi", "密码", "网络", "上网"], [
    ["What's the Wi-Fi password?", "标准", "travel", "最直白的一句，咖啡馆酒店通用。"],
    ["Is there Wi-Fi here? What's the code?", "自然", "travel", "code 也指密码，口语里常换用。"],
    ["Could I get the Wi-Fi details, please?", "礼貌", "travel", "details 比 password 更含蓄。"]
  ]],
  ["去XX怎么走", ["怎么走", "路线", "怎么去", "地铁"], [
    ["How do I get to the museum from here?", "标准", "travel", "How do I get to... 问路第一句。"],
    ["Is it walkable, or should I take the subway?", "实用", "travel", "walkable 可以走着去，很地道的一个词。"],
    ["Which line do I take? I'm trying to get downtown.", "具体", "travel", "line 地铁线；downtown 市中心。"]
  ]],
  ["能帮我拍张照吗", ["拍照", "帮拍", "照片"], [
    ["Could you take a photo for us? Just press this button.", "标准", "travel", "把动作说清楚，对方更容易帮忙。"],
    ["Mind snapping one for me?", "随意", "travel", "snap a photo 咔嚓一张，比 take a picture 俏皮。"],
    ["Do you mind taking our picture? I'll do the same for you.", "互惠", "travel", "表示愿意互换，成功率高。"]
  ]],
  ["我要办退税", ["退税", "免税", "tax"], [
    ["I'd like to claim the tax refund, please.", "标准", "travel", "claim 申领，是退税窗口的标准动词。"],
    ["Where can I get my VAT back?", "英欧", "travel", "VAT 增值税，欧洲退税常用词。"],
    ["Can I get the tax-free form for this purchase?", "具体", "travel", "tax-free form 退税单，购物时先要这一张。"]
  ]],
  ["几点开始登机", ["登机", "boarding", "几点", "gate"], [
    ["What time does boarding start?", "标准", "travel", "boarding 登机，机场核心词。"],
    ["Has the gate changed? It says Gate 12 on my ticket.", "具体", "travel", "gate 登机口，注意 gate 与 flight 别混。"],
    ["When do they start letting people on?", "口语", "travel", "let sb. on 放行登机，很生活化。"]
  ]],
  ["这个座位有人吗", ["座位", "有人吗", "空位", "seat"], [
    ["Is this seat taken?", "标准", "travel", "taken 被占了，一字到位。"],
    ["Excuse me, is anyone sitting here?", "礼貌", "travel", "更完整的问法，适合车厢/候车室。"],
    ["Mind if I sit here?", "随意", "travel", "坐下前的请求，简短自然。"]
  ]],
  ["我身体不舒服，需要看医生", ["不舒服", "医生", "生病", "药"], [
    ["I'm not feeling well — is there a doctor nearby?", "标准", "travel", "not feeling well 最通用的不舒服说法。"],
    ["I think I need to see a doctor. My stomach's been off all day.", "具体", "travel", "stomach's off 肠胃不适，说症状能省很多时间。"],
    ["Is there a pharmacy around here? I need something for a cold.", "实用", "travel", "pharmacy 药店；something for a cold 感冒药。"]
  ]],

  // ============ 日常 daily ============
  ["我起晚了", ["起晚", "睡过头", "迟到", "闹钟"], [
    ["I overslept — my alarm didn't go off.", "自然", "daily", "overslept 睡过头；alarm didn't go off 闹钟没响。"],
    ["I slept through my alarm. Rushing now!", "地道", "daily", "sleep through 响铃都没听见。"],
    ["I got up way later than I planned.", "随意", "daily", "way later 晚太多了，way 表强调。"]
  ]],
  ["我饿了，想吃点东西", ["饿了", "吃点", "吃什么", "hungry"], [
    ["I'm starving — what's for dinner?", "随意", "daily", "starving 饿死了，比 very hungry 生动（不是真饿死）。"],
    ["I could eat. Want to grab something?", "地道", "daily", "I could eat 我也能吃点，是很地道的说法。"],
    ["I'm getting kind of hungry. Snack time?", "轻松", "daily", "kind of 有点儿，软化语气。"]
  ]],
  ["今天好累", ["累", "疲惫", "exhausted"], [
    ["I'm wiped out today.", "地道", "daily", "wiped out 被掏空，比 tired 程度更深。"],
    ["Long day. I'm beat.", "简洁", "daily", "beat 累趴了，短短两个词很有画面。"],
    ["I'm running on empty — need a break.", "生动", "daily", "running on empty 油尽灯枯，形容精力耗尽。"]
  ]],
  ["我感冒了", ["感冒", "生病", "不舒服", "sick"], [
    ["I think I'm coming down with something.", "地道", "daily", "come down with 染上（病），刚开始有症状时最准。"],
    ["I've got a bit of a cold — nothing serious.", "自然", "daily", "a bit of a cold 有点小感冒，降低对方担心。"],
    ["I'm feeling under the weather today.", "委婉", "daily", "经典习语，请假时用它很得体。"]
  ]],
  ["帮我拿一下这个", ["帮我拿", "递", "拿一下"], [
    ["Could you hand me that, please?", "礼貌", "daily", "hand sb. sth. 递给某人，比 give 更准确。"],
    ["Can you grab that for me? It's just out of reach.", "随意", "daily", "out of reach 够不着，说明原因。"],
    ["Mind passing me the salt?", "餐桌", "daily", "pass 递，餐桌上的标准动词。"]
  ]],
  ["我忘了", ["忘了", "不记得", "forget"], [
    ["It completely slipped my mind.", "地道", "daily", "slip one's mind 从脑子里溜走，比 forget 有画面。"],
    ["Sorry, it's gone right out of my head.", "随意", "daily", "out of my head 从脑子里跑掉了。"],
    ["I totally forgot — my bad.", "坦诚", "daily", "my bad 我的错，很常用的口语认错。"]
  ]],
  ["等一下", ["等一下", "稍等", "wait"], [
    ["Hang on a sec — I'm almost done.", "随意", "daily", "hang on 稍等，比 wait 亲切。"],
    ["Give me one second, please.", "礼貌", "daily", "one second 不一定真是一秒，表示很快。"],
    ["Hold up, I need to grab my keys.", "地道", "daily", "hold up 等一下，带点打断的意味。"]
  ]],
  ["我马上到", ["马上到", "快到了", "在路上"], [
    ["I'm almost there — two minutes.", "标准", "daily", "almost there 快到了，最常用。"],
    ["On my way! Should be there in five.", "随意", "daily", "短信里超高频的一句。"],
    ["Just around the corner now.", "地道", "daily", "around the corner 拐个弯就到。"]
  ]],
  ["手机快没电了", ["没电", "充电", "手机", "battery"], [
    ["My phone's about to die — do you have a charger?", "地道", "daily", "die 指设备没电，比 no power 生动。"],
    ["I'm down to 3%. Got a power bank?", "现代", "daily", "power bank 充电宝；down to 只剩。"],
    ["My battery's nearly dead. I'll text you when I'm home.", "自然", "daily", "nearly dead 快没电了。"]
  ]],
  ["今天天气真好", ["天气", "真好", "晴朗"], [
    ["The weather is gorgeous today.", "自然", "daily", "gorgeous 比 nice 更有感染力。"],
    ["It's such a beautiful day out.", "随意", "daily", "out 指户外，out there 更口语。"],
    ["Perfect day — not too hot, not too cold.", "地道", "daily", "用对比表达\"刚刚好\"。"]
  ]],
  ["我先去洗澡/我先睡了", ["洗澡", "睡了", "休息", "先去"], [
    ["I'm going to hop in the shower.", "地道", "daily", "hop in 钻进去，比 take a bath 更口语。"],
    ["I'm calling it a night — talk tomorrow.", "自然", "daily", "call it a night 今晚到此为止，很常用。"],
    ["I'm off to bed. Don't stay up too late!", "亲切", "daily", "be off to bed 出发去睡；stay up 熬夜。"]
  ]],
  ["这个坏了", ["坏了", "故障", "不能用", "broken"], [
    ["It's not working — I think it's broken.", "标准", "daily", "先说现象再说判断，比较好沟通。"],
    ["Something's wrong with the screen. It keeps freezing.", "具体", "daily", "keep freezing 一直卡住，描述故障很地道。"],
    ["It just stopped working out of nowhere.", "地道", "daily", "out of nowhere 突然、毫无预兆。"]
  ]],
  ["我找不到钥匙了", ["找不到", "钥匙", "丢了", "找"], [
    ["I can't find my keys anywhere — have you seen them?", "标准", "daily", "anywhere 强调到处都找了。"],
    ["My keys have gone missing again. Typical me.", "自嘲", "daily", "typical me 我就这样，自嘲很自然。"],
    ["They were right here a second ago — weird.", "随意", "daily", "weird 奇怪了，口语里高频。"]
  ]],
  ["慢慢来，不着急", ["慢慢来", "不着急", "别急"], [
    ["Take your time — there's no rush.", "体贴", "daily", "no rush 不急，比 don't hurry 自然很多。"],
    ["No need to rush. We've got plenty of time.", "安心", "daily", "plenty of time 时间充裕。"],
    ["Slow down, we're not late yet.", "直接", "daily", "slow down 慢下来，可作提醒。"]
  ]],
  ["我想一个人静一静", ["安静", "静静", "独处", "别打扰"], [
    ["I need a bit of space right now, if that's okay.", "礼貌", "daily", "need space 需要空间，既不伤人又清楚。"],
    ["Give me a moment — I need to clear my head.", "坦诚", "daily", "clear my head 让脑子清醒一下。"],
    ["I just need some me time.", "轻松", "daily", "me time 属于自己的时间，很常用。"]
  ]],
  ["今天过得怎么样", ["今天", "过得", "how was"], [
    ["How was your day?", "标准", "daily", "最经典的寒暄，注意用 was（已过去的白天）。"],
    ["How did it go today?", "关心", "daily", "针对某件具体的事追问。"],
    ["Rough day or good day?", "俏皮", "daily", "二选一问法，对方更容易开口。"]
  ]],
  ["我在减肥，少吃点", ["减肥", "少吃", "节食", "diet"], [
    ["I'm trying to cut back a bit.", "自然", "daily", "cut back 减少摄入，比 on a diet 不尴尬。"],
    ["I'm watching what I eat these days.", "地道", "daily", "watch what I eat 注意饮食，很常用。"],
    ["No dessert for me — I'm being good today.", "玩笑", "daily", "be good 乖一点，自嘲式拒绝。"]
  ]],
  ["帮我带杯咖啡", ["带杯", "咖啡", "帮我买"], [
    ["Could you grab me a coffee on your way?", "随意", "daily", "grab 顺便买，比 bring 更口语。"],
    ["If you're going out, can you pick me up a latte?", "具体", "daily", "pick up 顺路买，通勤场景常用。"],
    ["Any chance you could bring me back a coffee?", "礼貌", "daily", "bring back 带回来。"]
  ]],
  ["我不太确定，也许吧", ["也许", "不确定", "大概", "maybe"], [
    ["Maybe — I haven't decided yet.", "自然", "daily", "配上还没决定，避免给人确定感。"],
    ["I'm 50/50 on it right now.", "地道", "daily", "50/50 一半一半，表示摇摆。"],
    ["Probably, but don't count on it.", "坦诚", "daily", "don't count on it 别指望，语气偏保留。"]
  ]],

  // ============ 影视 media ============
  ["我不敢相信", ["不敢相信", "难以置信", "unbelievable"], [
    ["I can't believe this is happening.", "激动", "media", "美剧里最高频的一句，进行时表正在发生。"],
    ["You've got to be kidding me.", "震惊", "media", "带点不敢置信的质问，语气更强。"],
    ["No way. That's insane.", "俚语", "media", "No way 不可能；insane 疯了（夸张用法）。"]
  ]],
  ["这跟我没关系", ["没关系", "无关", "不关我事"], [
    ["That's got nothing to do with me.", "撇清", "media", "have nothing to do with 与……无关。"],
    ["I'm not part of this.", "简短", "media", "part of 参与其中，否定即撇清。"],
    ["Don't drag me into this.", "强烈", "media", "drag into 把某人拖下水，很有戏剧张力。"]
  ]],
  ["别管我", ["别管我", "让我静静", "leave me"], [
    ["Just leave me alone, okay?", "直接", "media", "leave sb. alone 别打扰，注意语气可能伤人。"],
    ["I need to be alone right now.", "克制", "media", "比上一句温和，适合解释。"],
    ["Back off. I'm fine.", "强硬", "media", "back off 退开，冲突场景常用。"]
  ]],
  ["冷静一点", ["冷静", "别激动", "calm"], [
    ["Calm down. Let's think this through.", "劝解", "media", "think through 想清楚，安抚时很好用。"],
    ["Take a breath. We'll figure it out.", "温和", "media", "take a breath 深呼吸；figure out 想办法。"],
    ["Let's not panic — we still have options.", "沉稳", "media", "options 余地，强调还有选择。"]
  ]],
  ["我早就告诉过你", ["早说过", "早告诉", "提醒过"], [
    ["I told you so.", "经典", "media", "四个字，语气有点得意，慎用。"],
    ["I tried to warn you.", "认真", "media", "warn 警告过，比上一句不那么挑衅。"],
    ["Didn't I say exactly this would happen?", "强烈", "media", "反问句式，戏剧感强。"]
  ]],
  ["随你便", ["随你", "随便你", "suit yourself"], [
    ["Suit yourself.", "冷淡", "media", "字面\"随你合适\"，实际是\"我不拦你了\"，略带情绪。"],
    ["It's your call.", "中性", "media", "call 指决定，比 suit yourself 友好。"],
    ["Whatever you think is best.", "客气", "media", "表面让步，实际也可表示不认同。"]
  ]],
  ["说重点", ["重点", "别绕弯", "直说"], [
    ["Get to the point.", "直接", "media", "get to the point 进入正题，语气偏硬。"],
    ["Cut to the chase — what do you want?", "地道", "media", "cut to the chase 省掉铺垫，来自老电影。"],
    ["Long story short?", "轻松", "media", "长话短说，请对方挑重点。"]
  ]],
  ["我受够了", ["受够了", "忍不了", "fed up"], [
    ["I've had enough of this.", "决绝", "media", "have enough of 受够了，很常用。"],
    ["I'm done. I'm out.", "干脆", "media", "两个短句连用，表示彻底退出。"],
    ["I'm so fed up with all the excuses.", "抱怨", "media", "be fed up with 受够了某事。"]
  ]],
  ["说来话长", ["说来话长", "复杂", "long story"], [
    ["It's a long story.", "经典", "media", "最标准的说法，通常用于不想细讲时。"],
    ["Long story short, we broke up.", "转折", "media", "先一句挡住细节，再给结论。"],
    ["You don't want to know the details.", "保留", "media", "表示事情复杂到不必展开。"]
  ]],
  ["你别插手", ["插手", "别管", "我自己来"], [
    ["Stay out of it.", "简短", "media", "stay out of 别掺和，干脆利落。"],
    ["This is my fight. Let me handle it.", "坚定", "media", "my fight 我的仗，戏剧感强。"],
    ["I've got this — you don't need to step in.", "自信", "media", "step in 介入，比 interfere 温和。"]
  ]],
  ["我们走着瞧", ["走着瞧", "等着看", "威胁"], [
    ["We'll see about that.", "经典", "media", "含蓄的\"不一定呢\"，也可作威胁。"],
    ["Just wait and see.", "悬念", "media", "中性偏自信的说法。"],
    ["You'll regret this. Mark my words.", "强烈", "media", "mark my words 记住我的话，很有压迫感。"]
  ]],
  ["这不是你的错", ["不是你的错", "别自责", "安慰"], [
    ["It's not your fault. Don't blame yourself.", "安慰", "media", "fault 过错；blame 责怪。"],
    ["You couldn't have known.", "体贴", "media", "couldn't have known 你不可能知道，很有说服力。"],
    ["None of this is on you.", "地道", "media", "be on sb. 是某人的责任，否定即开解。"]
  ]],
  ["一切都会好起来的", ["会好的", "安慰", "一切"], [
    ["It's going to be okay. I promise.", "温柔", "media", "最经典的安慰句。"],
    ["We'll get through this together.", "坚定", "media", "get through 熬过去，强调陪伴。"],
    ["This too shall pass.", "哲理", "media", "古语式表达，文艺角色爱用。"]
  ]],
  ["我尽量", ["尽量", "试试", "努力"], [
    ["I'll do my best.", "诚恳", "media", "do my best 尽力而为，不打包票。"],
    ["I'll try, but I can't promise anything.", "谨慎", "media", "先留余地，避免承诺落空。"],
    ["I'll see what I can do.", "保留", "media", "经典外交式回答，实际可能办不到。"]
  ]],
  ["别放在心上", ["别在意", "别放在心上", "没关系"], [
    ["Don't take it personally.", "地道", "media", "take sth. personally 往心里去。"],
    ["Let it go — it's not worth it.", "干脆", "media", "not worth it 不值得。"],
    ["Don't let it get to you.", "体贴", "media", "get to sb. 影响到某人情绪。"]
  ]],
  ["你得相信我", ["相信我", "trust me"], [
    ["You have to trust me on this one.", "恳切", "media", "on this one 这件事上。"],
    ["Just hear me out — I'm telling the truth.", "急切", "media", "hear sb. out 听某人说完。"],
    ["I wouldn't lie to you. Not about this.", "沉重", "media", "否定式强调，情绪浓度高。"]
  ]],
  ["我没时间了", ["没时间", "来不及", "time"], [
    ["I'm running out of time.", "紧张", "media", "run out of 用完，形容时间告急。"],
    ["There's no time to explain — just go!", "紧急", "media", "动作片经典台词。"],
    ["We're on the clock here.", "地道", "media", "on the clock 计时中，团队行动常用。"]
  ]],
  ["我们得谈谈", ["谈谈", "聊聊", "we need to talk"], [
    ["We need to talk.", "严肃", "media", "英文里自带紧张感，别当普通邀约用。"],
    ["Can we talk? Something's been on my mind.", "缓和", "media", "be on my mind 一直挂念/困扰。"],
    ["Look, there's something you should know.", "铺垫", "media", "there's something you should know 经典开场。"]
  ]],
  ["我改变主意了", ["改变主意", "反悔", "mind"], [
    ["I've changed my mind.", "标准", "media", "change one's mind 改变主意。"],
    ["On second thought, let's not.", "口语", "media", "on second thought 转念一想，很地道。"],
    ["I'm having second thoughts about this.", "犹豫", "media", "second thoughts 复数的\"再想想\"，表示动摇。"]
  ]],
  ["小心一点", ["小心", "注意", "当心"], [
    ["Watch out!", "紧急", "media", "短促有力，用于眼前危险。"],
    ["Be careful — it's slippery.", "提醒", "media", "slippery 滑，加上原因更清楚。"],
    ["Heads up! Something's coming.", "地道", "media", "heads up 抬头/当心，团队提醒常用。"]
  ]]
];
