/* 常用句 · 语言包
 * 结构：window.PHRASE_PACKS = [{ id, name, icon, desc, cats:[{ id, name, scene, items:[[中文, 英文, 关键词[], 提醒?]] }] }]
 * 第一个包固定是「日常用语」，内容即原来的「日常用语 100 句」（data/phrasebook.js）。
 * 其余按职业组织，选取后在「常用句」页切换显示；练习与本地匹配会覆盖所有包。
 */
window.PHRASE_PACKS = [
  {
    id: 'daily', name: '日常用语', icon: 'book', desc: '生活高频 · 原「日常用语 100 句」',
    cats: window.PHRASEBOOK || []
  },

  /* ---------------- 医疗医护 ---------------- */
  {
    id: 'medical', name: '医疗医护', icon: 'health', desc: '问诊、护理、给药',
    cats: [
      {
        id: 'med-ask', name: '问诊沟通', scene: 'other',
        items: [
          ["您哪里不舒服", "What seems to be the problem?", ["不舒服", "问诊", "症状"], "门诊开场最常用，比 What's wrong 更得体。"],
          ["这种情况持续多久了", "How long have you had this?", ["多久", "持续时间"], "have + 症状 + how long，别用 How long time。"],
          ["疼痛是持续的还是间断的", "Is the pain constant, or does it come and go?", ["疼", "持续", "间断"], "come and go 时好时坏，问诊高频。"],
          ["从一到十，您给疼痛打几分", "On a scale of one to ten, how would you rate the pain?", ["疼痛评分", "几分"], "国际通用疼痛评分问法。"],
          ["您对什么药物过敏吗", "Are you allergic to any medication?", ["过敏", "药物"], "allergic to + 药物，必问。"],
          ["您最近吃过什么药", "Have you taken any medication recently?", ["用药", "最近"], "medication 比 medicine 正式。"],
          ["您有高血压或糖尿病吗", "Do you have high blood pressure or diabetes?", ["高血压", "糖尿病", "病史"], "问既往史：Do you have any medical conditions?"],
          ["请张开嘴说啊", "Open your mouth and say \"ah\".", ["张嘴", "检查"], "查咽部固定说法。"],
          ["我给您量一下血压", "I'm going to take your blood pressure.", ["血压", "测量"], "take one's blood pressure 固定搭配。"],
          ["请深呼吸", "Take a deep breath, please.", ["深呼吸", "听诊"], "听诊前一句，简单有效。"],
          ["我给您抽个血", "I'm going to draw some blood.", ["抽血", "化验"], "draw blood 抽血。"],
          ["结果大约两小时出来", "The results should be back in about two hours.", ["结果", "化验", "时间"], "be back 指报告出来。"]
        ]
      },
      {
        id: 'med-care', name: '护理与告知', scene: 'other',
        items: [
          ["这药一天三次，饭后吃", "Take this three times a day, after meals.", ["吃药", "剂量", "饭后"], "给药交代的固定语序：次数 + 时间。"],
          ["打针会有点疼，忍一下", "This will sting a little.", ["打针", "疼"], "sting 刺痛，比 hurt 准确。"],
          ["我帮您把床头摇高一点", "Let me raise the head of your bed.", ["床头", "床位"], "raise the head of the bed 摇高床头。"],
          ["按这个按钮可以叫我们", "Press this button if you need us.", ["呼叫铃", "按钮"], "press 按；push 也行但 press 更准。"],
          ["今晚零点以后不能吃东西", "You can't eat anything after midnight tonight.", ["禁食", "术前"], "术前禁食标准说法。"],
          ["手术前需要空腹", "You'll need to fast before the surgery.", ["空腹", "手术"], "fast 作动词 = 禁食。"],
          ["有家属陪同吗", "Is there a family member with you?", ["家属", "陪同"], "问陪同人，入院登记常用。"],
          ["我们会随时观察您的情况", "We'll keep an eye on you.", ["观察", "照看"], "keep an eye on 比 watch 温和。"],
          ["您今天感觉好点了吗", "Are you feeling any better today?", ["查房", "好转"], "查房开口句。"],
          ["请在这里签个字", "Please sign here.", ["签字", "同意书"], "签知情同意书用 sign the consent form。"],
          ["出院后一周来复查", "Come back for a follow-up in a week.", ["复查", "出院"], "follow-up 复查，名词。"],
          ["如果发烧超过三十八度，请马上来医院", "If your fever goes above 38, come in right away.", ["发烧", "急诊"], "38 读 thirty-eight，别读成 three eight。"]
        ]
      }
    ]
  },

  /* ---------------- 餐饮服务 ---------------- */
  {
    id: 'restaurant', name: '餐饮服务', icon: 'bowl', desc: '迎宾、点单、结账',
    cats: [
      {
        id: 'rest-seat', name: '迎宾点单', scene: 'work',
        items: [
          ["欢迎光临，几位", "Hi, welcome in — how many in your party?", ["迎宾", "人数"], "问人数固定说法 how many in your party。"],
          ["靠窗的位子可以吗", "Would you like a table by the window?", ["座位", "靠窗"], "by the window 靠窗。"],
          ["稍等两分钟，我马上收拾好", "Give me just a minute to clear this table.", ["等位", "收台"], "clear the table 收台。"],
          ["这是菜单，需要看酒水单吗", "Here are your menus. Would you like the drinks list as well?", ["菜单", "酒水"], "as well 放句尾 = 也要吗。"],
          ["今天的特色是烤鱼", "Our special today is the grilled fish.", ["特色", "推荐", "招牌"], "special 今日特餐，餐厅高频词。"],
          ["需要我推荐几道吗", "Can I recommend a few dishes?", ["推荐", "点菜"], "recommend 后直接跟菜，不加 for you。"],
          ["这道菜偏辣，可以接受吗", "This one's on the spicy side — is that okay?", ["辣", "提醒"], "on the spicy side 偏辣，很地道。"],
          ["您有忌口吗", "Do you have any dietary restrictions?", ["忌口", "过敏"], "比 What can't you eat 专业。"],
          ["前菜和主菜一起上还是分开", "Would you like your starter and main together or separately?", ["上菜顺序", "前菜"], "starter 英式前菜；美式 appetizer。"],
          ["需要加一份米饭吗", "Would you like a side of rice with that?", ["主食", "米饭"], "a side of 加一份配餐。"],
          ["我重复一下您的点单", "Let me read that back to you.", ["确认点单"], "read back 复述核对，服务业标准说法。"],
          ["大约十五分钟就好", "It'll be about fifteen minutes.", ["等餐", "时间"], "报时间别说 wait fifteen minutes。"]
        ]
      },
      {
        id: 'rest-serve', name: '席间与结账', scene: 'work',
        items: [
          ["这是您的菜，小心烫", "Here's your dish — it's hot.", ["上菜", "烫"], "提醒烫：it's hot / careful, it's hot。"],
          ["还需要什么吗", "Is there anything else I can get you?", ["巡台", "添加"], "巡台标准句。"],
          ["帮您把盘子收一下可以吗", "May I take these plates?", ["收盘", "撤碟"], "May I 比 Can I 更客气。"],
          ["抱歉让您久等了", "Sorry for the wait.", ["道歉", "等位"], "短句最自然，不用 apologize for waiting so long。"],
          ["我帮您催一下厨房", "I'll check on that for you.", ["催菜", "厨房"], "check on 比 hurry 得体，客人听着舒服。"],
          ["这道菜我给您重做一份", "I'll have this remade for you.", ["重做", "投诉"], "have sth remade 让厨房重做。"],
          ["今天的甜点要试试吗", "Would you like to see the dessert menu?", ["甜点", "加单"], "see the menu = 看菜单。"],
          ["可以买单了吗", "Are you ready for the check?", ["买单", "结账"], "美式 check；英式 bill。"],
          ["一起结还是分开", "Together or separate?", ["结账", "AA"], "separate 分开付，最简说法。"],
          ["我们收现金和刷卡", "We take cash and card.", ["支付", "刷卡"], "take 收（某种支付方式）。"],
          ["服务费已经包含在内了", "The service charge is already included.", ["服务费", "小费"], "included 已包含，避免客人重复给小费。"],
          ["谢谢光临，欢迎下次再来", "Thanks for coming — hope to see you again.", ["送客"], "比 Welcome again 自然。"]
        ]
      }
    ]
  },

  /* ---------------- 酒店前台 ---------------- */
  {
    id: 'hotel', name: '酒店前台', icon: 'bell', desc: '入住、退房、客需',
    cats: [
      {
        id: 'hotel-in', name: '入住与退房', scene: 'work',
        items: [
          ["您好，有预订吗", "Hi there — do you have a reservation with us?", ["入住", "预订"], "with us 让语气更亲和。"],
          ["请问预订在谁的名下", "What name is the booking under?", ["预订", "姓名"], "under one's name 固定说法。"],
          ["请出示一下护照", "May I see your passport, please?", ["护照", "登记"], "May I see... 前台万能句。"],
          ["我帮您安排一间高层的房间", "I'll put you in a room on a higher floor.", ["房间", "楼层"], "put sb in a room 安排房间。"],
          ["房费含早餐，七点到十点", "Breakfast is included, from seven to ten.", ["含早", "早餐时间"], "included 一句顶一句。"],
          ["押金两百，退房时退回", "There's a two-hundred deposit, refunded at checkout.", ["押金", "退款"], "deposit 押金；refund 退。"],
          ["这是房卡，电梯在右手边", "Here's your key card — the lifts are on your right.", ["房卡", "电梯"], "英式 lift，美式 elevator。"],
          ["无线网密码在房卡套上", "The Wi-Fi password is on the card sleeve.", ["wifi", "密码"], "Wi-Fi 读 /ˈwaɪfaɪ/。"],
          ["您要几点退房", "What time will you be checking out?", ["退房", "时间"], "check out 退房，动词。"],
          ["可以延迟到下午两点退房", "Late checkout until two is fine.", ["延迟退房"], "late checkout 名词，前台常用。"],
          ["这是您的账单，请核对一下", "Here's your bill — please have a look.", ["账单", "核对"], "have a look 比 check it 客气。"],
          ["需要帮您叫车去机场吗", "Would you like me to call a taxi to the airport?", ["叫车", "机场"], "call a taxi 叫出租车。"]
        ]
      },
      {
        id: 'hotel-need', name: '客需与处理', scene: 'work',
        items: [
          ["前台，有什么可以帮您", "Front desk — how can I help?", ["接电话", "前台"], "接电话先自报岗位。"],
          ["我马上让同事送上去", "I'll have someone bring it up right away.", ["送物", "客房"], "have someone do 让某人去做。"],
          ["毛巾十分钟内送到", "Towels will be up in ten minutes.", ["毛巾", "送物"], "up 指送到楼上房间。"],
          ["现在方便打扫房间吗", "Is it a good time to clean your room?", ["打扫", "客房服务"], "Is it a good time to... 询问是否方便。"],
          ["空调不制冷，我们可以帮您换房", "If the AC isn't cooling, we can move you to another room.", ["空调", "换房"], "move sb to another room 换房。"],
          ["行李可以先寄存在这里", "You're welcome to leave your luggage here.", ["寄存", "行李"], "luggage 不可数。"],
          ["洗衣服务明天早上送回", "Laundry will be back tomorrow morning.", ["洗衣", "送回"], "laundry 洗衣服务/待洗衣物。"],
          ["抱歉给您带来不便", "I'm sorry for the inconvenience.", ["道歉"], "标准道歉句，正式但不说作。"],
          ["我已经帮您记下了，会尽快处理", "I've made a note of it and we'll take care of it.", ["记录", "处理"], "make a note of 记下。"],
          ["附近有家不错的餐厅，走路五分钟", "There's a good restaurant five minutes away on foot.", ["推荐", "附近"], "on foot 步行。"],
          ["需要多一床被子吗", "Would you like an extra blanket?", ["被子", "加床品"], "extra 额外的。"],
          ["有维修问题随时拨零", "For any maintenance issues, just dial 0.", ["报修", "电话"], "dial 0 拨零找前台。"]
        ]
      }
    ]
  },

  /* ---------------- 外贸业务 ---------------- */
  {
    id: 'trade', name: '外贸业务', icon: 'globe', desc: '询盘、报价、订单',
    cats: [
      {
        id: 'trade-inquiry', name: '开发与询盘', scene: 'work',
        items: [
          ["感谢您的询盘", "Thank you for your inquiry.", ["询盘", "开场"], "inquiry 询盘，邮件第一句。"],
          ["我们是这家产品的直接生产商", "We're the direct manufacturer of this product.", ["工厂", "生产商"], "manufacturer 制造商，比 factory 更专业。"],
          ["附件是我们的产品目录", "Please find our catalogue attached.", ["附件", "目录"], "邮件固定句，catalogue 英式拼法。"],
          ["这个型号有现货", "This model is in stock.", ["现货", "库存"], "in stock 有货；out of stock 缺货。"],
          ["起订量是五百件", "Our minimum order quantity is 500 pieces.", ["起订量", "MOQ"], "简称 MOQ，客户常用。"],
          ["样品三天内可以寄出", "We can send samples out within three days.", ["样品", "寄出"], "send out 寄出。"],
          ["运费按实际重量计算", "Freight is calculated by actual weight.", ["运费", "重量"], "freight 运费，贸易术语。"],
          ["您对包装有什么要求", "Do you have any requirements for the packaging?", ["包装", "要求"], "packaging 包装材料/方式。"],
          ["我们可以按您的品牌做定制", "We can customize it with your branding.", ["定制", "品牌"], "customize 定制；OEM 也可提。"],
          ["交期大约三十天", "Lead time is around thirty days.", ["交期", "生产周期"], "lead time 交期，客户最关心。"],
          ["能告诉我您的目标价吗", "Could you share your target price?", ["目标价", "议价"], "target price 目标价，谈价第一问。"],
          ["这个价格含运费吗", "Does this price include shipping?", ["报价", "运费"], "shipping 运费/运输。"]
        ]
      },
      {
        id: 'trade-order', name: '报价与订单', scene: 'work',
        items: [
          ["这是我们的最新报价", "Here's our latest quotation.", ["报价", "quotation"], "quotation 报价单，比 price 正式。"],
          ["报价有效期三十天", "This quote is valid for thirty days.", ["有效期", "报价"], "valid for + 时长。"],
          ["量大我们可以再谈折扣", "We can discuss a discount for larger volumes.", ["折扣", "量大"], "volume 量，贸易常用。"],
          ["付款方式是百分之三十定金，百分之七十见提单", "Payment is 30% deposit, 70% against the bill of lading.", ["付款方式", "定金", "提单"], "against + 单据 = 见单付款。"],
          ["我们接受电汇和信用证", "We accept T/T and L/C.", ["电汇", "信用证"], "T/T 电汇，L/C 信用证，读作 letters of credit。"],
          ["订单已排产，下周开始生产", "Your order is scheduled for production next week.", ["排产", "生产"], "be scheduled for 已排入计划。"],
          ["货好了我发照片给您", "I'll send you photos once the goods are ready.", ["验货", "照片"], "goods 货物，复数。"],
          ["这批货下周装柜", "The container loads next week.", ["装柜", "集装箱"], "container 货柜，load 装。"],
          ["装箱单和发票已经发到您邮箱", "The packing list and invoice are in your inbox.", ["装箱单", "发票"], "packing list 装箱单。"],
          ["提单原件已经寄出", "The original bill of lading has been couriered.", ["提单", "寄出"], "courier 作动词 = 快递寄出。"],
          ["收到货后请确认一下", "Please confirm once the goods arrive.", ["收货", "确认"], "once = 一……就。"],
          ["有质量问题我们负责到底", "We'll take full responsibility for any quality issues.", ["质量", "售后"], "take full responsibility 承担责任。"]
        ]
      }
    ]
  },

  /* ---------------- 客户服务 ---------------- */
  {
    id: 'support', name: '客户服务', icon: 'headset', desc: '接待、核实、处理',
    cats: [
      {
        id: 'cs-front', name: '接待与核实', scene: 'work',
        items: [
          ["您好，请问有什么可以帮您", "Hi, how can I help you today?", ["接待", "开场"], "开场白别用 What's your problem，容易冒犯。"],
          ["方便提供一下订单号吗", "Could I have your order number, please?", ["订单号", "核实"], "Could I have... 礼貌索要信息。"],
          ["我帮您查一下，稍等", "Let me pull that up for you.", ["查询", "稍等"], "pull up 调出记录，客服高频。"],
          ["请问下单时用的手机号是", "What phone number did you use when you ordered?", ["手机号", "核实"], "核实身份常用。"],
          ["我核实一下您的信息", "I just need to verify a few details.", ["核实", "身份"], "verify details 核实信息。"],
          ["您的订单显示已发货", "Your order shows as shipped.", ["发货", "物流"], "show as + 状态。"],
          ["预计后天送到", "It should arrive the day after tomorrow.", ["送达", "预计"], "the day after tomorrow 后天。"],
          ["这个情况我记录一下", "I'll log this for you.", ["记录", "工单"], "log 记录进系统。"],
          ["我帮您转接专门同事", "I'll transfer you to a colleague who can help.", ["转接"], "transfer sb to 转接给某人。"],
          ["请稍等，我确认后马上回复您", "Give me a moment and I'll confirm.", ["稍等", "确认"], "give me a moment 比 wait 礼貌。"],
          ["您希望退款还是换货", "Would you prefer a refund or a replacement?", ["退款", "换货"], "refund 退款；replacement 换货。"],
          ["我理解您的心情", "I understand how frustrating this is.", ["安抚", "共情"], "共情句，先处理情绪再处理问题。"]
        ]
      },
      {
        id: 'cs-fix', name: '处理与收尾', scene: 'work',
        items: [
          ["非常抱歉给您带来不便", "I'm really sorry about the trouble.", ["道歉"], "trouble 比 inconvenience 更自然。"],
          ["这个我们可以给您全额退款", "We can issue a full refund for this.", ["全额退款"], "issue a refund 办理退款。"],
          ["退款三到五个工作日到账", "The refund takes three to five business days.", ["退款", "到账"], "business days 工作日。"],
          ["补发今天就能安排", "We can send a replacement today.", ["补发"], "send a replacement 补发。"],
          ["麻烦您拍张照片发给我们", "Could you send us a photo?", ["拍照", "举证"], "简单直给，不要 over-apologize。"],
          ["这个问题已经反馈给相关部门", "I've passed this on to the relevant team.", ["反馈", "部门"], "pass on to 转交。"],
          ["我会跟进到解决为止", "I'll follow up until it's sorted.", ["跟进", "解决"], "sort out 解决（英式口语）。"],
          ["这不在保修范围内", "This isn't covered by the warranty.", ["保修", "拒赔"], "be covered by 在……范围内。"],
          ["可以给您补一张优惠券", "We can offer you a voucher instead.", ["补偿", "优惠券"], "voucher 代金券。"],
          ["您看这样处理可以吗", "Does that work for you?", ["确认方案"], "work for you 你能接受吗。"],
          ["还有什么可以帮您的吗", "Is there anything else I can help with?", ["收尾"], "收尾前必问。"],
          ["感谢您的耐心等待", "Thanks for your patience.", ["感谢", "收尾"], "patience 耐心，客服高频词。"]
        ]
      }
    ]
  },

  /* ---------------- 跨境物流 ---------------- */
  {
    id: 'logistics', name: '跨境物流', icon: 'map', desc: '揽收、申报、清关、异常',
    cats: [
      {
        id: 'log-pickup', name: '揽收与下单', scene: 'work',
        items: [
          ["您好，我想寄一个包裹到美国", "Hi, I'd like to ship a parcel to the US.", ["寄快递", "国际件"], "ship 作动词 = 寄送，比 send 更专业。"],
          ["这个包裹大概多重", "How much does the parcel weigh, roughly?", ["重量", "称重"], "roughly 表示\"大概\"，口语高频。"],
          ["走空运还是海运", "Would you like air or sea freight?", ["空运", "海运"], "freight 是运输/运费的总称。"],
          ["大约多久能到", "How long will delivery take?", ["时效", "多久"], "问时效的通用句。"],
          ["空运五到七天，海运要三十天左右", "Air freight usually takes five to seven days; sea freight takes about thirty days.", ["时效", "报价"], "take + 时间 表\"需要多久\"。"],
          ["麻烦填一下这张申报单", "Please fill out this customs declaration form.", ["申报", "报关"], "customs declaration 报关单，固定术语。"],
          ["里面是什么物品", "What's inside the package?", ["品名", "查验"], "问品名的日常说法。"],
          ["申报价值是多少", "What's the declared value?", ["申报价值", "保险"], "declared value 申报价值，理赔按此计算。"],
          ["运费到付还是预付", "Is the freight prepaid or collect?", ["运费", "付款方式"], "prepaid 预付 / collect 到付，行业固定说法。"],
          ["您的包裹已经揽收了", "Your parcel has been picked up.", ["揽收", "通知"], "pick up 揽收。"],
          ["这是您的运单号", "Here's your tracking number.", ["运单号", "跟踪"], "tracking number 运单号/跟踪号。"],
          ["可以在网站上查物流状态", "You can track the shipment on our website.", ["查询", "物流状态"], "track 作动词 = 追踪物流。"]
        ]
      },
      {
        id: 'log-issue', name: '运输与异常', scene: 'work',
        items: [
          ["您的包裹清关时被扣了", "Your parcel is being held at customs.", ["清关", "扣关"], "be held at customs 被海关扣留。"],
          ["需要补一份商业发票", "We need an extra commercial invoice.", ["商业发票", "补件"], "commercial invoice 商业发票，清关必备。"],
          ["收件人地址写错了", "The recipient's address is incorrect.", ["地址错误", "改地址"], "recipient 收件人。"],
          ["请提供正确地址，我们安排改派", "Please give us the correct address so we can redirect it.", ["改派", "转发"], "redirect 改派/转寄。"],
          ["包裹在运输途中有破损", "The parcel was damaged in transit.", ["破损", "理赔"], "in transit 运输途中，固定短语。"],
          ["我们会帮您向快递公司索赔", "We'll help you file a claim with the carrier.", ["索赔", "承运商"], "file a claim 发起理赔。"],
          ["这票货已经发出去了", "This shipment has already left the warehouse.", ["发货", "出库"], "shipment 一票货。"],
          ["预计明天到达派送站", "It's expected to arrive at the delivery station tomorrow.", ["到站", "预计"], "be expected to 预计。"],
          ["海关要求提供收件人的税号", "Customs requires the recipient's tax ID.", ["税号", "清关"], "tax ID 税号，欧洲清关常见要求。"],
          ["这批货走散货拼箱", "This cargo will go as LCL.", ["拼箱", "散货"], "LCL = less than container load 拼箱。"],
          ["目的港的滞港费由谁承担", "Who covers the demurrage charges at the destination port?", ["滞港费", "目的港"], "demurrage 滞港费，行业术语。"],
          ["请把提单副本发给我", "Please send me a copy of the bill of lading.", ["提单", "单证"], "bill of lading (B/L) 提单。"]
        ]
      }
    ]
  },

  /* ---------------- 学校教育 ---------------- */
  {
    id: 'education', name: '学校教育', icon: 'pen', desc: '课堂组织、家校沟通',
    cats: [
      {
        id: 'edu-class', name: '课堂用语', scene: 'work',
        items: [
          ["上课了，请大家坐好", "Class begins. Please take your seats.", ["上课", "纪律"], "take one's seat 就座。"],
          ["把书翻到第十二页", "Open your books to page twelve.", ["翻书", "页码"], "page twelve 不加 the。"],
          ["谁想回答这个问题", "Who would like to answer this question?", ["提问", "互动"], "would like 比 want 委婉。"],
          ["再说一遍好吗", "Could you say that again, please?", ["重复", "听力"], "课堂最常用的礼貌重复句。"],
          ["大家跟我读", "Read after me, everyone.", ["带读", "跟读"], "read after sb 跟读。"],
          ["分组讨论三分钟", "Break into groups and discuss for three minutes.", ["分组", "讨论"], "break into groups 分组。"],
          ["有问题吗", "Any questions so far?", ["提问", "确认"], "so far 到目前为止，比 Any questions 更自然。"],
          ["请安静，听我说", "Quiet down, please. Listen to me.", ["安静", "纪律"], "quiet down 使安静。"],
          ["这道题的答案是什么", "What's the answer to this one?", ["答案", "讲解"], "answer to the question 固定搭配。"],
          ["铃响了，今天到这里", "That's the bell. That's all for today.", ["下课", "收尾"], "That's all for today 下课收尾句。"],
          ["作业写在练习册第五页", "Do the exercises on page five of your workbook.", ["作业", "练习册"], "workbook 练习册。"],
          ["下节课听写这些单词", "We'll have a spelling quiz on these words next class.", ["听写", "测验"], "spelling quiz 听写小测。"]
        ]
      },
      {
        id: 'edu-parent', name: '家校沟通', scene: 'work',
        items: [
          ["孩子今天在学校表现很好", "Your child did really well at school today.", ["表扬", "反馈"], "先扬后抑的沟通开场。"],
          ["他上课有点走神", "He gets a bit distracted in class.", ["走神", "提醒"], "get distracted 走神。"],
          ["作业经常没交", "He often doesn't hand in his homework.", ["作业", "缺交"], "hand in 上交。"],
          ["我们一起帮他赶上进度", "Let's work together to help him catch up.", ["补进度", "合作"], "catch up 赶上进度。"],
          ["最近的进步很明显", "The recent progress is really noticeable.", ["进步", "表扬"], "noticeable 明显的。"],
          ["家长会定在周四晚上", "The parent-teacher meeting is on Thursday evening.", ["家长会", "通知"], "parent-teacher meeting 家长会。"],
          ["请在这个通知上签字", "Please sign this notice.", ["签字", "通知"], "sign the notice 在通知上签字。"],
          ["孩子在学校不舒服，麻烦接一下", "Your child isn't feeling well. Could you pick them up?", ["接孩子", "身体不适"], "pick sb up 接人。"],
          ["需要请几天假吗", "Will she need a few days off?", ["请假", "病假"], "days off 休息日/假期。"],
          ["明天学校组织春游", "There's a school field trip tomorrow.", ["春游", "活动"], "field trip 校外实践活动。"],
          ["请给孩子带好水壶", "Please make sure your child brings a water bottle.", ["物品准备", "提醒"], "make sure 确保。"],
          ["有任何情况随时联系我", "Feel free to contact me anytime if anything comes up.", ["联系", "收尾"], "come up 出现状况。"]
        ]
      }
    ]
  },

  /* ---------------- IT / ERP / SaaS ---------------- */
  {
    id: 'it', name: 'IT / ERP / SaaS', icon: 'layers', desc: '售前演示、实施与支持',
    cats: [
      {
        id: 'it-sales', name: '需求与演示', scene: 'work',
        items: [
          ["我先简单介绍一下我们的产品", "Let me start with a quick intro to our product.", ["开场", "介绍"], "quick intro 比 detailed introduction 口语化。"],
          ["你们目前用的是什么系统", "What system are you currently using?", ["现状", "摸底"], "currently 目前，售前必问。"],
          ["主要的痛点是什么", "What are the biggest pain points?", ["痛点", "需求"], "pain point 痛点，行业黑话。"],
          ["我们先看一个演示", "Let's take a look at a quick demo.", ["演示", "Demo"], "demo 是 demonstration 的口语缩写。"],
          ["这个模块管进销存", "This module handles inventory and sales.", ["模块", "进销存"], "handle 负责，模块介绍高频。"],
          ["支持多仓库管理吗", "Does it support multi-warehouse management?", ["多仓库", "功能"], "multi-warehouse 多仓库。"],
          ["可以和现有系统对接吗", "Can it integrate with our existing systems?", ["对接", "集成"], "integrate with 与…集成。"],
          ["报价包含哪些服务", "What services are included in the quote?", ["报价", "服务范围"], "be included in 包含在。"],
          ["按年付有折扣吗", "Is there a discount for annual billing?", ["折扣", "订阅"], "annual billing 按年计费。"],
          ["免费试用多久", "How long is the free trial?", ["试用", "免费"], "free trial 免费试用。"],
          ["数据安全怎么保障", "How do you ensure data security?", ["数据安全", "合规"], "ensure 确保，比 make sure 正式。"],
          ["我把方案发您邮箱", "I'll email you the proposal.", ["方案", "跟进"], "proposal 方案，email 作动词。"]
        ]
      },
      {
        id: 'it-support', name: '实施与支持', scene: 'work',
        items: [
          ["实施周期大概六周", "The implementation takes about six weeks.", ["实施周期", "排期"], "implementation 实施。"],
          ["我们先做数据迁移", "We'll start with data migration.", ["数据迁移", "上线"], "migration 迁移。"],
          ["请提供一份用户名单", "Please provide a list of user accounts.", ["用户名单", "开通"], "user account 用户账号。"],
          ["培训定在周四下午", "The training session is set for Thursday afternoon.", ["培训", "排期"], "training session 培训场。"],
          ["系统今晚十点升级", "The system will be upgraded at ten tonight.", ["升级", "通知"], "be upgraded 被动语态表计划。"],
          ["升级期间会有短暂停机", "There will be a short downtime during the upgrade.", ["停机", "维护"], "downtime 停机时间。"],
          ["这个问题我们已经收到了", "We've received your issue report.", ["受理", "工单"], "issue report 问题报告/工单。"],
          ["我们会尽快修复", "We're working on a fix as soon as possible.", ["修复", "安抚"], "work on a fix 着手修复。"],
          ["新版本下周一发布", "The new release comes out next Monday.", ["发版", "时间"], "release 作名词 = 新版本。"],
          ["请清除缓存后重试", "Please clear the cache and try again.", ["缓存", "排查"], "clear the cache 清缓存，技术支持高频。"],
          ["您用的是哪个浏览器", "Which browser are you using?", ["浏览器", "排查"], "which browser 排查兼容性第一步。"],
          ["我远程看一下您的环境", "Let me take a look at your environment remotely.", ["远程", "支持"], "remotely 远程地。"]
        ]
      }
    ]
  }
];
