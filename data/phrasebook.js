/* 常用 100 句 · 生活高频场景
 * 结构：{ id, name, icon, scene(入库时归入的场景), items: [[中文, 英文, 检索关键词[], 使用提醒?] ...] }
 * 供「常用100句」页与快速记录的匹配引擎共用。
 */
window.PHRASEBOOK = [
  {
    id: 'dining', name: '餐厅就餐', icon: '🍽️', scene: 'travel',
    items: [
      ["请问有两人位吗", "Do you have a table for two?", ["两人", "位子", "订位", "桌"], "a table for two 双人桌，进店第一句。"],
      ["我想订今晚七点的位子", "I'd like to book a table for tonight at seven.", ["订位", "预订", "餐厅"], "book / reserve a table 都行。"],
      ["我们可以点餐了吗", "Could we order, please?", ["点餐", "菜单"], "举手说 excuse me 再点，别喊 waiter。"],
      ["这个菜辣吗", "Is this dish spicy?", ["辣", "菜", "辣椒"], "spicy 辣；想问微辣说 mild。"],
      ["有什么推荐的吗", "What do you recommend?", ["推荐", "招牌", "特色"], "问店员推荐最直接的说法。"],
      ["我对花生过敏", "I'm allergic to peanuts.", ["过敏", "花生", "忌口"], "allergic to + 食物，严肃场合必会。"],
      ["请不要放香菜", "Could I get that without cilantro?", ["香菜", "葱", "忌口"], "without + 食材，点餐改料万能句。"],
      ["能做得不那么辣吗", "Could you make it less spicy?", ["辣", "微辣"], "make it + 形容词，改口味通用。"],
      ["我们分开买单", "Could we get separate checks, please?", ["买单", "分开", "AA"], "美式 separate checks；英式 split the bill。"],
      ["一起结账", "Could we have one check, please?", ["买单", "一起", "结账"], "one check 一张账单。"],
      ["这个打包", "Could I get this to go?", ["打包", "外带", "带走"], "美式 to go；英式 takeaway。"],
      ["买单", "Could we get the check, please?", ["结账", "买单", "账单"], "check 美式账单；英式说 bill。"],
      ["含服务费了吗", "Is the service charge included?", ["服务费", "小费"], "included 包含，看账单高频词。"]
    ]
  },
  {
    id: 'home', name: '家庭日常', icon: '🏠', scene: 'daily',
    items: [
      ["该起床了", "Time to get up.", ["起床", "早起"], "Time to... 该……了。"],
      ["早餐想吃什么", "What do you want for breakfast?", ["早餐", "早饭"], "for breakfast 早餐吃……。"],
      ["帮我倒杯水好吗", "Could you get me a glass of water?", ["水", "倒水", "喝"], "get me a... 拿/倒给某人。"],
      ["轮到你洗碗了", "It's your turn to do the dishes.", ["洗碗", "家务", "轮到"], "do the dishes 洗碗固定说法。"],
      ["把垃圾拿出去", "Could you take out the trash?", ["垃圾", "倒垃圾"], "英式说 rubbish，美式 trash。"],
      ["我快到家了", "I'm almost home.", ["到家", "快到了"], "home 前不加 to。"],
      ["晚饭吃什么", "What's for dinner?", ["晚饭", "晚餐"], "What's for... 三餐通用。"],
      ["我先去睡了", "I'm heading to bed.", ["睡觉", "先睡"], "比 I will sleep 自然得多。"],
      ["帮忙关一下灯", "Could you turn off the lights?", ["灯", "关灯"], "turn off / turn on 开关电器。"],
      ["看见遥控器了吗", "Have you seen the remote?", ["遥控器", "电视", "找"], "Have you seen...? 找东西万能句。"],
      ["我今天加班，晚点回", "I'm working late tonight, so I'll be home late.", ["加班", "晚回"], "work late 加班。"],
      ["周末有什么安排", "Any plans for the weekend?", ["周末", "安排", "计划"], "Any plans for...? 寒暄高频。"]
    ]
  },
  {
    id: 'work', name: '公司工作', icon: '💼', scene: 'work',
    items: [
      ["我们开个会吧", "Let's set up a meeting.", ["开会", "会议", "安排"], "set up a meeting 安排会议。"],
      ["会议改个时间行吗", "Could we push the meeting back an hour?", ["改时间", "推迟", "会议"], "push back 推迟；提前说 move up。"],
      ["我给你发邮件了", "I just sent you an email.", ["邮件", "发送"], "just + 过去式 刚做完。"],
      ["收到，我马上看", "Got it — I'll take a look right away.", ["收到", "马上", "回复"], "Got it 比 I received it 地道。"],
      ["这周内给你", "I'll get it to you by the end of the week.", ["交付", "截止", "本周"], "by + 时间点 = 在……之前。"],
      ["我觉得这个方案行不通", "I don't think this approach will work.", ["方案", "反对", "不行"], "I don't think... 委婉否定，不说 Your plan is wrong。"],
      ["能帮我个忙吗", "Could you do me a favor?", ["帮忙", " favor"], "do me a favor 固定搭配。"],
      ["我明天想请一天假", "I'd like to take a day off tomorrow.", ["请假", "休息"], "take a day off 请一天假。"],
      ["现在方便说话吗", "Is now a good time to talk?", ["电话", "方便", "聊"], "打扰别人前先问这句。"],
      ["我进度有点落后", "I'm running a bit behind schedule.", ["进度", "落后", "延期"], "behind schedule 比计划慢。"],
      ["有问题随时找我", "Reach out anytime if you have questions.", ["问题", "联系", "随时"], "reach out 联系，职场高频。"],
      ["这个谁负责", "Who's in charge of this?", ["负责", "分工"], "in charge of 负责。"],
      ["这个做得漂亮", "Nice work on this.", ["表扬", "干得好"], "中文“辛苦了”没有直译，夸具体成果更自然。"]
    ]
  },
  {
    id: 'trip', name: '出差旅行', icon: '✈️', scene: 'travel',
    items: [
      ["我是来出差的", "I'm here on business.", ["出差", "商务"], "on business 固定搭配，注意没有冠词。"],
      ["我要办理入住", "Hi, I'd like to check in, please.", ["入住", "check in", "酒店"], "check in 入住；check out 退房。"],
      ["我要退房", "I'd like to check out, please.", ["退房", "离开酒店"], "前台说 check out 即可。"],
      ["早餐几点开始", "What time does breakfast start?", ["早餐", "几点", "酒店"], "What time does... 问时间。"],
      ["请问地铁站在哪里", "Excuse me, how do I get to the subway station?", ["地铁", "怎么走", "问路"], "How do I get to... 问路第一句。"],
      ["请送我去机场", "Could you take me to the airport, please?", ["打车", "机场", "出租"], "take me to... 送我去……。"],
      ["我赶飞机要迟到了", "I'm running late for my flight.", ["赶飞机", "迟到", "航班"], "run late 赶不上时间。"],
      ["这里有无线网吗", "Do you have Wi-Fi here?", ["wifi", "网络", "无线"], "Wi-Fi 发音 /ˈwaɪfaɪ/。"],
      ["我的航班延误了", "My flight's been delayed.", ["航班", "延误", "晚点"], "be delayed 被动表延误。"],
      ["我想换点外币", "I'd like to exchange some money.", ["换钱", "兑换", "外币"], "exchange A for B。"],
      ["能开一张收据吗", "Could I get a receipt?", ["发票", "收据", "报销"], "receipt 收据；invoice 抬头发票。"],
      ["附近有什么好吃的", "Any good places to eat around here?", ["附近", "吃的", "推荐"], "around here 这一带。"],
      ["这个用英语怎么说", "How do you say this in English?", ["怎么说", "英语"], "指着实物问最实用。"]
    ]
  },
  {
    id: 'shopping', name: '购物消费', icon: '🛍️', scene: 'daily',
    items: [
      ["我就随便看看", "I'm just looking, thanks.", ["看看", "随便逛"], "店员凑上来先说这句。"],
      ["这个多少钱", "How much is this?", ["多少钱", "价格"], "复数用 How much are these?"],
      ["这个有别的颜色吗", "Does this come in other colors?", ["颜色", "款式"], "come in + 颜色/尺码 固定用法。"],
      ["可以试穿吗", "Can I try this on?", ["试穿", "试衣间"], "try on 衣服鞋；try it 试试别的。"],
      ["有大一号的吗", "Do you have this in a larger size?", ["尺码", "大一号"], "in a larger / smaller size。"],
      ["有点贵", "That's a bit pricey.", ["贵", "价格"], "a bit pricey 比 too expensive 委婉。"],
      ["能便宜一点吗", "Any chance you could give me a better price?", ["便宜", "砍价"], "Any chance...? 委婉提请求。"],
      ["这个在打折吗", "Is this on sale?", ["折扣", "促销", "打折"], "on sale 打折（美）；英式特指促销。"],
      ["我再逛逛", "I'll keep looking, thanks.", ["再看看", "不买"], "委婉离开，不说 No。"],
      ["就要这个了", "I'll take it.", ["买", "决定"], "比 I want to buy this 地道。"],
      ["不合适能退吗", "Can I return this if it doesn't fit?", ["退货", "退款"], "return 退货；refund 退钱。"],
      ["这个免税吗", "Is this tax-free?", ["免税", "退税"], "tax-free / duty-free 机场语境。"]
    ]
  },
  {
    id: 'transport', name: '交通出行', icon: '🚇', scene: 'travel',
    items: [
      ["这趟车去市中心吗", "Does this bus go downtown?", ["公交", "去", "市中心"], "go downtown 美式；英式 go into town。"],
      ["我坐过站了", "I missed my stop.", ["坐过站", "地铁"], "miss the stop 固定说法。"],
      ["这列车停不停机场", "Does this train stop at the airport?", ["火车", "停靠", "机场"], "stop at + 站名。"],
      ["一张单程票", "One single ticket, please.", ["单程", "票"], "英式 single；美式 one-way。"],
      ["一张往返票", "A return ticket, please.", ["往返", "票"], "英式 return；美式 round trip。"],
      ["最近的车站在哪", "Where's the nearest station?", ["车站", "最近"], "the nearest + 名词。"],
      ["我有点迷路了", "I'm a bit lost.", ["迷路", "问路"], "a bit lost 比 I'm lost 缓和。"],
      ["走路能到吗", "Is it within walking distance?", ["步行", "远吗", "走路"], "walking distance 步行可达。"],
      ["能帮我叫辆车吗", "Could you call a taxi for me?", ["叫车", "出租"], "call a taxi / hail a ride。"],
      ["到那边大概多久", "How long does it take to get there?", ["多久", "时间"], "How long does it take 万能句。"],
      ["就在这儿停吧", "Could you drop me off here?", ["下车", "停车"], "drop off 让人下车；pick up 接人。"],
      ["下一班几点", "What time's the next one?", ["下一班", "几点"], "指代车次用 the next one。"]
    ]
  },
  {
    id: 'social', name: '社交闲聊', icon: '💬', scene: 'social',
    items: [
      ["好久不见", "Long time no see!", ["好久不见", "重逢"], "语法不严谨但全世界都在用。"],
      ["最近怎么样", "How've you been?", ["最近", "近况"], "老朋友之间比 How are you 更亲近。"],
      ["改天一起吃饭", "Let's grab a meal sometime.", ["吃饭", "约", "改天"], "grab 随意地吃一顿。"],
      ["这周末有空吗", "Are you free this weekend?", ["有空", "周末", "约"], "free 有空；约人第一步。"],
      ["我先走了", "I should get going.", ["先走", "告辞"], "告辞万能句，比 goodbye 自然。"],
      ["今天很开心", "I had a great time today.", ["开心", "愉快"], "告别时表达感谢与愉快。"],
      ["保持联系", "Let's keep in touch.", ["联系", "保持"], "keep in touch 固定搭配。"],
      ["顺路捎你一程", "I can give you a ride.", ["捎", "载", "顺路"], "give a ride 开车捎人。"],
      ["你说得有道理", "That's a fair point.", ["同意", "有道理"], "比 You're right 更有来有回。"],
      ["我没听清，再说一遍好吗", "Sorry, I didn't quite catch that.", ["没听懂", "再说一遍"], "catch 没听清，请人重复的礼貌说法。"],
      ["你周末一般做什么", "What do you usually do on weekends?", ["周末", "爱好", "闲聊"], "small talk 破冰标准题。"],
      ["久仰大名", "I've heard a lot about you.", ["久仰", "初次见面"], "初次见面客气话。"],
      ["太巧了", "What a coincidence!", ["巧合", "偶遇"], "coincidence 重音在 -ci-。"]
    ]
  },
  {
    id: 'hotel', name: '酒店住宿', icon: '🛏️', scene: 'travel',
    items: [
      ["还有空房吗", "Do you have any rooms available?", ["空房", "住宿"], "available 有空房/有空。"],
      ["一晚多少钱", "How much is it per night?", ["一晚", "价格"], "per night 每晚。"],
      ["含早餐吗", "Is breakfast included?", ["含早", "早餐"], "included 包含，高频词。"],
      ["可以延迟退房吗", "Could we have a late checkout?", ["延迟退房", "checkout"], "late checkout 延退，有的酒店要加钱。"],
      ["空调坏了", "There's something wrong with the air conditioning.", ["空调", "坏了", "报修"], "There's something wrong with... 万能报障句。"],
      ["能帮我寄存行李吗", "Could I leave my luggage here?", ["寄存", "行李"], "luggage 不可数，不说 a luggage。"],
      ["出门时能打扫一下房间吗", "Could you clean the room while I'm out?", ["打扫", "保洁"], "while I'm out 我外出时。"],
      ["空调太冷了", "The AC is too cold. Could you help me adjust it?", ["空调", "冷", "调温"], "AC = air conditioning 口语缩写。"],
      ["房间有点吵", "The room is a bit noisy.", ["吵", "隔音"], "要求换房：Could I switch rooms?"],
      ["能借个充电器吗", "Could I borrow a phone charger?", ["充电器", "借"], "borrow 借入；lend 借出。"],
      ["早上七点能叫醒我吗", "Could you give me a wake-up call at seven?", ["叫醒", "早起"], "wake-up call 叫醒服务。"],
      ["退房后能再来取行李吗", "Could I pick up my luggage after checkout?", ["取行李", "退房"], "pick up 取/拿。"]
    ]
  }
];
