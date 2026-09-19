import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const deliveryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const parentRoot = path.resolve(deliveryRoot, '..');
const fallbackProjectRoot = '/Users/zezeng/Desktop/Saas/WetBlessing';
const projectRoot = fs.existsSync(path.join(parentRoot, 'content/story.json')) ? parentRoot : fallbackProjectRoot;
const outputRoot = path.join(deliveryRoot, 'design');
const source = JSON.parse(fs.readFileSync(path.join(projectRoot, 'content/story.json')));
if (source.storyVersion === 'tomorrow.1' || source.documentType === 'runtime-story') {
  throw new Error('authoring.mjs is not the runtime generator and must not patch tomorrow.1. Use scripts/convert-proposal.mjs and scripts/compile-story.mjs.');
}
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'content/assets.manifest.json')));
const review = JSON.parse(fs.readFileSync(path.join(projectRoot, 'content/assets.visual-review.json')));
const beat = (speaker, text, thought = null) => ({ speaker, text, thought });
const choice = (text, targetNumber, effects = {}) => ({ text, targetNumber, effects });
const scenes = [];
function scene(number, slug, title, time, beats, options = []) {
  scenes.push({ number, id: `scene.${slug}`, title, time, beats, options });
}

scene(58, 'invitation', '那条消息没有发错', '周四夜／楼梯', [
  beat('Jade（拟定）', '我发的是“想见你”……不是缺一个帮忙的人。鞋都踩到你跟前了，还要我再说一遍？♡'),
  beat('Kai', '看懂了。所以我上来了。', '（トクン、トクン……她握着手机等我。玩笑卡在喉咙里，目光却先落到她敞开的领口。）'),
]);
scene(1, 'first.hand', '先把手给我', '周四夜／楼梯', [
  beat('Jade（拟定）', '最后一级有水。手给我……看台阶。等站稳了，再抬眼看我。♡'),
  beat('Kai', '那站稳以后……你还会松手吗？', '（她掌心又潮又热。トクン、トクン……手指刚扣上，我就知道自己不会先放开。）'),
]);
scene(6, 'stair.pause', '停在同一级', '周四夜／楼梯', [
  beat('Jade（拟定）', '泳池的试映还没开始。你可以在这儿多陪我一会儿……就我们两个。♡'),
  beat('Kai', '你特意挑这个没人催我们的地方？', '（砖墙把她的呼吸送得很近。她没回答，膝盖却轻轻撞上我的腿侧。）'),
]);
scene(5, 'opening.choice', '先回应谁', '周四夜／泳池入口', [
  beat('旁白', '学期末影展的第一次试映。几段还没说清的关系，连体温都挤到了同一扇门前。'),
  beat('Kai', '正式开始前，还有一点时间。今晚第一句认真话，我想对着她的眼睛说。'),
], [
  choice('给 Jade 送毛巾，把她的邀约接到手上', 59, { 'choice.firstVisit': 'jade' }),
  choice('陪 Mia 回宿舍取投影线，进她的房间', 74, { 'choice.firstVisit': 'mia' }),
  choice('去找若伊，问她为什么一直回头', 56, { 'choice.firstVisit': 'rae' }),
  choice('走到 Vanessa 身边，把毛巾递进她手里', 30, { 'choice.firstVisit': 'vanessa' }),
]);
scene(59, 'jade.towel', '毛巾上留着的温度', '周四夜／泳池', [
  beat('Jade（拟定）', '你真的拿来了……我以为你会在门口跟大家耗到散场。♡'),
  beat('Kai', '你在这边。我聊天的时候，毛巾一直热着。', '（她指尖擦过毛巾边。ビクッ……我还攥着另一头，像舍不得把温度交出去。）'),
]);
scene(2, 'jade.first.promise', '单独两个字', '周四夜／泳池', [
  beat('Jade（拟定）', '今晚是大家的试映。下次……我想单独约你。别带着别人，也别带着借口。♡'),
  beat('Kai', '我会给你一个认真的答复。你把“单独”说得这么轻，我下面可听得很重。'),
]);
scene(74, 'mia.cable', '不只是来取东西', '周四夜／宿舍；试映开始前', [
  beat('Mia', '线在箱子里。你站那么远……是怕多待一分钟，就舍不得从这个房间出去？♡'),
  beat('Kai', '我怕你一边翻箱子，一边又把真正想说的话藏进被子里。', '（她抬起眼，屏幕的光从锁骨上退下去。房间热起来了，只剩这句试探贴着皮肤走。）'),
]);
scene(3, 'mia.first.promise', '留给明天的话', '周四夜／宿舍', [
  beat('Mia', '我想说的是……明天搬最后几箱的时候，你还来不来？来了就别只站在门口。♡'),
  beat('Kai', '来。搬完之后，也留一点时间给我……关门的时间也算。'),
]);
scene(56, 'rae.badge', '回头找的那个人', '周四夜／储物柜旁', [
  beat('若伊', '看见我的证卡了？那就叫名字。别再喊“借过”，我又不是让你从身上挤过去。'),
  beat('Kai', '若伊。你等的人还没到？', '（她的视线越过我的肩。耳尖先红了。那种等一个人时装出来的从容，一下子就破了。）'),
]);
scene(4, 'rae.first.promise', '替她留一盏灯', '周四夜／储物柜旁', [
  beat('若伊', '他下课晚。待会儿灯暗下来，帮我给门口留一点亮……我要让他看见我在等。'),
  beat('Kai', '好。你也不用每次听见脚步，就假装自己只是在看钟。'),
]);
scene(30, 'vanessa.towel', '她伸出的手', '周四夜／泳池', [
  beat('Vanessa（拟定）', '谢谢。你递过来的时候……怎么又把眼睛移开了？♡'),
  beat('Kai', '因为一直看着你，我可能会忘了先松开毛巾。', '（ビクッ……！她指尖凉，毛巾却被她拉过去。我停了半拍，喉结还是滚了一下。）'),
]);
scene(37, 'vanessa.first.promise', '安静也算邀请', '周四夜／泳池边', [
  beat('Vanessa（拟定）', '别急着找话题。坐一会儿……我想有人陪我听水声。♡'),
  beat('Kai', '那我留在这里。等你想说的时候，第一句留给我。'),
]);
scene(8, 'screening.merge', '灯光暗下来以前', '周四夜／泳池入口', [
  beat('旁白', '试映开始。有人把身边的位置空出来，有人把目光、把呼吸都留给还没进门的人。'),
  beat('Kai', '片名叫《明天见》。现在听起来，倒像贴在耳边、又不敢咬实的约定。'),
]);
scene(64, 'goodnight.hand', '散场不是结束', '周四夜／返程楼梯', [
  beat('Jade（拟定）', '刚才那条路走得太快了。回去的时候……能不能慢一点？我想被你看着走。♡'),
  beat('Kai', '能。今晚不用再找一个“顺路”的借口。', '（她朝我伸手。掌心一热，我扶稳栏杆，把那一步送到她呼吸够得到的地方。）'),
]);
scene(10, 'night.afterglow', '第一次想保存的夜晚', '周四深夜／空走廊', [
  beat('Kai', '原来“明天见”三个字，也能在舌头上留这么久。'),
  beat('旁白', '试映顺利结束，明天的搬运也已经约好。走廊安静下来，身上却还留着别人的温度。'),
]);

scene(9, 'morning.box', '白天重新开场', '周五上午／走廊', [
  beat('旁白', '最后一批影展材料散在走廊上。远处的人抬起头，昨天没碰完的话，又有了落点。'),
  beat('Kai', '我来早了？还是有人比我更惦记……今天要把我留在旁边。'),
]);
scene(13, 'loose.tape', '先接住这一边', '周五上午／走廊', [
  beat('Kai', '等等，胶带开了。我扶住这里……你慢慢松手，别把手指也抽走。'),
  beat('旁白', '指尖停在纸箱两侧，几乎要碰上。一句平常的提醒，让呼吸都慢了半拍。'),
]);
scene(11, 'jade.signature', '两个不同的名字栏', '周五上午／迎新活动桌', [
  beat('Jade（拟定）', '这格写志愿者名字。旁边的联系方式……我自己也想留一份。♡ 你写的时候，不许写得跟公事一样。'),
  beat('Kai', '工作那份写清楚。你的那份，我亲手塞给你。', '（她把笔递过来，指尖擦过我的指节。トクン、トクン……我写名字时，笔都比平时沉。）'),
]);
scene(12, 'mia.elevator', '电梯里的一点私心', '周五上午／电梯', [
  beat('Mia', '只剩最后一箱了。等搬完……我是不是就没有理由把你关进电梯里了？♡'),
  beat('Kai', '你可以直接叫我的名字。理由不够的话，我可以帮你想得更过分一点。'),
]);
scene(18, 'two.promises', '两份约定撞在一起', '周五上午／电梯口', [
  beat('Mia', '你答应先陪我搬完。这句可不能又被“大家都在等”盖过去……你的手，现在是我的。'),
  beat('Jade（拟定）', '我也在等你确认试映名单。看着我们……把时间说清楚。别两头都想捂热。'),
  beat('Kai', '是我没排好。先履行已经答应的事……下一次约定，我会亲口咬到你耳朵边上。'),
]);
scene(19, 'misread.photo', '被截走的下半句', '周五中午／走廊', [
  beat('旁白', '碎屏手机里，两个人争执的那一瞬被留下了。照片能看见咬紧的唇，却装不下完整的对话。'),
  beat('Kai', '如果让别人替我们写标题，明天见面时，谁都会先被一个假故事堵得没法靠近。'),
]);
scene(20, 'own.words', '这一次自己解释', '周五中午／空走廊', [
  beat('Kai', '我不想让一句敷衍，把昨天那些认真盯过来的目光，都变成笑话。'),
  beat('Kai', '先把自己的失约解释清楚，再问她们愿不愿意让这张照片……连同呼吸一起被别人看见。'),
], [
  choice('当面承认时间冲突，让两人一起听见', 22, { 'choice.repair': 'together' }),
  choice('分别道歉，把各自的约定重新说清', 22, { 'choice.repair': 'separate' }),
]);
scene(22, 'mia.lunch', '坐下来才算道歉', '周五中午／食堂', [
  beat('Mia', '菜快凉了。坐下吧……我在意的从来不是你少搬了一只箱子。'),
  beat('Kai', '是我答应陪你的时候，不能一转头就把你晾成临时安排。'),
  beat('Mia', '嗯。记住你刚才说话的样子。我喜欢你这样看着我……不抢着结束。♡'),
]);
scene(23, 'reina.editor', '谁有权替照片命名', '周五下午／学生影展办公室', [
  beat('玲奈', '照片我看过了。先别急着证明谁没吃醋——你们到底想让别人看见什么？连呼吸都可以被写成标题。'),
  beat('Kai', '我想先听她们自己说。包括那些只愿意在夜里、贴着皮肤说的部分。'),
]);
scene(26, 'caption.choice', '给亲近留多少空白', '周五下午／办公室', [
  beat('玲奈', '我也有只想留给一个人看的照片。你看……连做影展的人，都有不想被灯光舔到的地方。'),
  beat('Kai', '那么这一次，标题由照片里的人来定。不想被看的部分，就只留给会吻她的人。'),
], [
  choice('邀请本人写下署名和想说的话', 61, { 'choice.publication': 'signed' }),
  choice('允许匿名，只保留本人愿意展示的内容', 61, { 'choice.publication': 'anonymous' }),
]);
scene(61, 'reina.private.answer', '她也有不从容的时候', '周五下午／办公室；转入玲奈视角', [
  beat('玲奈', '你们先去忙吧。程屿一会儿来……我约了他。♡'),
  beat('玲奈·内心', '（交往这么久，想到要见他……トクン、トクン……腿根已经先并紧了。袖口是假正经，雌穴却先一步发热。只有这件事，我不想练得太熟……♡）'),
  beat('玲奈与程屿', '玲奈：“我想吻你……可以吗？”程屿：“可以。我也想把你从文件上面抢回来。”'),
]);
scene(24, 'reina.kiss', '只有两个人的回答', '周五下午／办公室；玲奈视角', [
  beat('程屿（拟定）', '今天再忙，也想留这一会儿把你亲到说不出文件编号。♥'),
  beat('玲奈', '身为统筹……文件还摊着……我绝不该……（じゅぷ…）呜！发情肉口为什么擅自吞得这么紧……哈啊……门还虚掩着……～♥', '（不行……明明只是接吻……可耻核被他大腿一碾，脚趾就自己内扣。眼镜都在抖。乞食之水已经湿了内裤……身体完全变成贪婪的苗床了啊……ッ♥♥）'),
]);
scene(25, 'reina.door', '镜头回到工作伙伴', '周五下午／办公室门口；群像视角', [
  beat('玲奈', '丽娜，刚才等久了？进来吧……我把大家的留言整理好了。'),
  beat('旁白', '门边的回望收起了一点被亲过的笑意。丽娜扬了扬手里的稿子，玲奈把唇色压回去，目光转回眼前的人。'),
]);
scene(53, 'reina.release', '把误会还给当事人', '周五下午／办公室门口；Kai 视角', [
  beat('玲奈', '原来的标题撤下了。接下来想怎么出现，轮到你们自己说。别再让别人替你们的嘴编故事。'),
  beat('Kai', '那张照片的事，到这里说清楚。剩下的邀请，我不想再借影展的名义往她身上靠。'),
]);
scene(14, 'jade.after.practice', '训练结束之后', '周五夜／雨后步道', [
  beat('Jade（拟定）', '刚训练完，头发有点乱……身上也还热。你笑什么？♡'),
  beat('Kai', '因为你终于不用一边看我，一边替整场活动赶时间。汗还停在你锁骨上。'),
  beat('Jade（拟定）', '那就看久一点。今晚我也没有很想先走……你要是靠近，我不会先退。♡'),
]);
scene(16, 'vanessa.walk', '别把安静当作拒绝', '周五夜／步道', [
  beat('Vanessa（拟定）', '听说照片的事解决了。你终于肯用自己的话说清楚……不是用别人的标题。'),
  beat('Kai', '还有一句。和你走在一起的时候，我总想把路走长一点。', '（她的衣角掠过夜风，擦过我手背。我等着她回答，没有把这句收回成玩笑。）'),
]);
scene(27, 'library.threshold', '只留一盏灯', '周五夜／图书馆', [
  beat('旁白', '阅览室只剩一盏台灯。丽娜借了这个角落，给影展补最后一轮访谈……灯只够照见两个人的手。'),
  beat('Kai·内心', '（今晚每个人都比平时认真。灯这么近，再把话说轻一点，就像故意错过她的呼吸。）'),
]);
scene(28, 'lina.question', '丽娜不替你圆场', '周五夜／图书馆', [
  beat('丽娜（拟定）', '手机放下。你擅长对每个人说“我都可以”……那你自己到底想把谁按进怀里？'),
  beat('Kai', '还没想好。但我知道，不能靠谁先发消息、先把身体递过来，替我选。'),
]);
scene(29, 'mia.library.hand', '她先把话放轻', '周五夜／图书馆', [
  beat('Mia', '别把手缩回去。我只是想告诉你……午饭时那句话，我听进去了。♡'),
  beat('Kai', '那你也听我一句。下一次我来找你，会把时间留完整……连手也不抽走。', '（她的手覆着我的手背，热得发潮。我没有借这点温度，就擅自把关系说死。）'),
]);
scene(32, 'lina.exit', '走出访谈的答案', '周五夜／活动室门口', [
  beat('丽娜（拟定）', '访谈结束了。现在当朋友问一句：你敢不敢选了以后，不再给别人留可以往你身上靠的错觉？'),
  beat('Kai', '敢。但你得允许我把话说得笨一点……笨的时候，手可能会先碰到她。'),
]);
scene(36, 'lina.no.script', '没有满分台词', '周五夜／活动室沙发', [
  beat('丽娜（拟定）', '我不替你写告白。你停顿的时候，她也许正等着把膝盖靠过来。'),
  beat('Kai', '你呢？总替别人问这些……有没有一句是你自己想说的？'),
  beat('丽娜（拟定）', '有啊。我想把自己的片子拍完。下次记得认真看署名，别只顾着看谁在亲谁。'),
]);
scene(31, 'rae.laundry', '等待也有名字', '周五夜／洗衣房', [
  beat('若伊', '机器还要转很久。陪我站一会儿？我想练一句话……练到嘴不抖。♡'),
  beat('Kai', '给昨晚那个迟到的人？你看……连耳朵都先红着回答了。'),
]);
scene(35, 'rae.rehearsal', '不是借口的邀请', '周五夜／洗衣房门边', [
  beat('若伊', '“明天收衣服的时候一起走。”太普通了，是不是？普通到听不出我想被他带走。'),
  beat('Kai', '那就把“一起”说慢一点。你刚才回头的样子，腰都转过去了，可一点也不普通。'),
]);
scene(39, 'rae.message', '她自己发出的消息', '周五夜／洗衣房', [
  beat('若伊', '算了，我就写：陈越，明天我想和你约会。想靠近你。就这样。♡'),
  beat('Kai', '发吧。然后把手机放下，给自己留一口气……也给腿留一点发软的时间。', '（她没有让我替她按发送。那句邀请终于有了主人。她拇指按下的时候，胸口起伏得很明显。）'),
]);
scene(15, 'friday.close', '不必替每个人守夜', '周五深夜／空走廊', [
  beat('Kai', '今天先到这里。明天，我也该发出自己的邀请了……不再假装只是路过谁的身体。'),
  beat('旁白', '同样的走廊，留住了不同的一晚。没有新线索，只有一句已经想清楚、还发烫的话。'),
]);
scene(62, 'rae.saturday', '明天真的到了', '周六上午／储物柜旁', [
  beat('若伊', '他答应了。你别笑得比我还明显……我腿都还软着。♡'),
  beat('Kai', '我不笑。你先把准备了半天的那句，当面送进他嘴里。'),
]);
scene(52, 'rae.arrival', '门口换了等待的人', '周六上午／洗衣房门边；转入若伊视角', [
  beat('若伊', '陈越，你来得比约好的早……我还没把心跳按回去。♡'),
  beat('陈越（拟定）', '因为这是我们的第一次约会。我不想让你再回头找我……我想让你一开门就撞上我。'),
]);
scene(71, 'rae.commitment', '不再借别人的称呼', '周六上午／潮湿走廊；若伊视角', [
  beat('若伊', '那从今天起，我可以叫你男朋友了？叫完……就不许再让我在门口空等。♡'),
  beat('陈越（拟定）', '可以。我也想吻你……愿意吗？不愿意的话，现在就推开我。'),
  beat('若伊', '愿意。过来一点……这次我不想隔着门说。等下……那里会变奇怪的……♡'),
]);
scene(69, 'rae.first.kiss', '她终于没有看钟', '周六上午／走廊；若伊视角', [
  beat('若伊', '等很久的人不该……一吻就软……（ビクッ…！）❣ 唔、唇怎么可以这么烫……耻核自己挺起来了……哈啊……～♥', '（明明只是接吻……腰却自己送上去。耻核隔着裙子被他小腹顶到的瞬间，整根脊柱都在发麻。脚趾内扣，雌穴已经在渗乞食之水……ッ♥♥）'),
  beat('陈越（拟定）', '嗯。你发来的那句话，我看了好几遍……每一遍都想把你按在门上。♥'),
]);
scene(72, 'rae.kiss.answer', '把迟到留在昨天', '周六上午／同一走廊；若伊视角', [
  beat('若伊', '以后想见我，别等到收衣服的时候才说……想吻就现在说。腿还在抖……💦'),
  beat('陈越（拟定）', '好。比如现在，我还想把你留在这扇门后面。♥'),
]);
scene(44, 'rae.aftermath', '生活没有停在那一吻', '周六中午／洗衣房；Kai 视角', [
  beat('若伊', '约会第一件事，是一起报修漏水的机器。跟我想的不太一样……我还以为会先被他吻到站不稳。'),
  beat('Kai', '可你说起“一起”的时候，已经不需要练习了。嘴还红着，话倒是很稳。'),
]);
scene(45, 'editor.challenge', '别替别人宣布', '周六下午／走廊', [
  beat('宣传组同学（身份待核）', '如果每张照片都要解释那么多，开幕还怎么赶得上？'),
  beat('Kai', '那就少放一张。你看见的是画面，当事人明天还要贴着呼吸见面。'),
]);
scene(46, 'contributors', '让当事人说完', '周六下午／走廊', [
  beat('投稿女生（身份待核）', '这张可以展出。但别替我们写“终于在一起”——那不是我们的故事，也不是给你们意淫的标题。'),
  beat('投稿男生（身份待核）', '把她这句原话留下，就很好。别把我们的嘴，借给别人用。'),
]);
scene(48, 'choose.relationship', '发给一个人的邀请', '周六下午／走廊', [
  beat('Kai·内心', '（手机就在手边。没有人催我选。可我终于知道自己为什么一直没走……有些体温，已经先记住我了。）'),
  beat('Kai', '这次把名字写清楚。约会也好，先做朋友也好……都让对方听见完整的答案，听见表皮下面那句想靠近。'),
], [
  choice('约 Jade 单独见面，把她的主动按进一个真正的约会', 77, { 'relationship.route': 'jade' }),
  choice('约 Mia 见面，把陪伴变成一次可以关门的约会', 40, { 'relationship.route': 'mia' }),
  choice('约 Vanessa 见面，把没说完的话贴着她说清', 42, { 'relationship.route': 'vanessa' }),
  choice('暂不开始恋爱，和丽娜把作品做到最后', 41, { 'relationship.route': 'self' }),
]);

scene(77, 'jade.date', '这次就是约会', '周六夜／泳池', [
  beat('Jade（拟定）', '我答应你的约会了。今天不用等试映，也不用替谁赶时间……你的眼睛，可以只放在我身上。♡'),
  beat('Kai', '那让我也主动一次。今晚，你愿意吻我吗？愿意的话……我会吻到你站不稳。'),
  beat('Jade（拟定）', '愿意。地点听你的……别把“愿意”也忘在楼梯上。嘴还在维持从容……腰已经先湿了。♡'),
], [
  choice('留在池边，把吻压进她湿掉的呼吸里', 63, { 'choice.jadeSetting': 'pool', 'consent.jadeKiss': true }),
  choice('一起走到楼梯，在第一次停步的地方吻她', 65, { 'choice.jadeSetting': 'stairs', 'consent.jadeKiss': true }),
  choice('告诉她想慢一点，把亲吻留给下一次见面', 17, { 'choice.jadeSetting': 'later', 'consent.jadeKiss': false }),
]);
scene(63, 'jade.pool.kiss', '这一次不用猜', '周六夜／泳池', [
  beat('Jade（拟定）', '轮到你先靠近了……我还不该先认输……（ぐちゅっ…）呜！雌穴为什么隔着泳装擅自咬这么紧……别、别只亲嘴……哈啊……～♥'),
  beat('Kai·内心', '（水面的亮光还在晃。她舌尖很确定，髋却自己送上来。耻核被我小腹轻轻一蹭，大腿内侧就痉挛。乞食之水把布料濡湿了……ッ♥♥）'),
]);
scene(66, 'jade.pool.stay', '吻后仍然想说的话', '周六夜／同一泳池；同一次约会', [
  beat('Kai', '明天不用再给我安排一个帮忙的理由。直接约我。想被吻，也直接说。'),
  beat('Jade（拟定）', '那我现在就约。明天，后天……先从一起吃早餐开始。吃之前……也许还会先被你亲开。哈啊……♥'),
]);
scene(65, 'jade.stair.kiss', '回到第一次停步的地方', '周六夜／楼梯', [
  beat('Jade（拟定）', '第一晚我就在想，你什么时候才肯看懂……看懂我想被你按在这堵墙上。可我还在装从容……（ぐちゅ…）呜！发情肉口已经自己在舔你了……ッ♥'),
  beat('Kai', '看懂得有点晚。以后，我会把回应说早一点……吻也会早一点。'),
]);
scene(75, 'jade.stair.stay', '把手机留在台阶上', '周六夜／同一楼梯；同一次约会', [
  beat('Jade（拟定）', '消息可以等……我、我才没有那么想要……（じゅぷ…）哈啊……卑微肉缝却在发抖。这一分钟，留给我们……～♥'),
  beat('Kai·内心', '（她的话贴着这个吻落下来。唇瓣分开又咬上。大腿在打颤，脚趾扣着台阶，嘴里还在说“我们”。瞳孔已经散了……♥♥）'),
]);
scene(17, 'jade.slow', '慢一点也算向前', '周六夜／道别后的空走廊', [
  beat('Kai', '我想继续见你。这句话，不会因为今晚没有接吻就变轻……想吻你的那部分，还在喉咙里发烫。♡'),
  beat('旁白', '分别前，Jade 也给了同样认真的回答。走廊重新安静下来，明天的约会已经说定；没吻到的那口气，她让我下次来取。'),
]);

scene(40, 'mia.date.message', '她先承认期待', '周六下午／走廊；新增对白浮层', [
  beat('Mia·消息', '约会邀请，我答应了。只是见面之前，还有一件事想请你陪我说清楚……说清楚我不是只想让你搬箱子。♡'),
  beat('Kai·消息', '好。先听你说，再一起决定。你要是说想见我，我会回得很快。', '（她没有把约会藏在求助后面。我也终于不必假装自己只是恰好有空……空的是手，热的是别的地方。）'),
]);
scene(47, 'mia.own.caption', '她自己署名', '周六下午／走廊', [
  beat('Mia', '我可以参加影展，但介绍里只写我的作品。至于和谁约会、想被谁靠近，我会自己告诉朋友。'),
  beat('Kai', '听她的。还有，别再把那天搬箱子的事写成争夺谁。那不是争夺，是我没把她放在第一位。'),
]);
scene(7, 'mia.close.voice', '当着别人的面也算数', '周六傍晚／走廊', [
  beat('Mia', '刚才那句“听她的”……我很喜欢。你再靠近一点，我有句只想吹进你耳朵里的。♡'),
  beat('Kai', '现在呢？这么近，我已经能数你的睫毛了。'),
  beat('Mia', '我今天一直在期待我们的约会。不是期待有人替我搬东西……是期待你进门以后，我不想装成没事。♡'),
]);
scene(33, 'mia.open.door', '她等的是脚步声', '周六夜／宿舍门口', [
  beat('Mia', '进来吧。我刚才把开场白想了三遍，你一敲门，全忘了……不许笑我～♡ 门关上就好。'),
  beat('Kai', '那就从“我也很紧张”开始。我先说。紧张的时候，手会先想碰你。'),
]);
scene(38, 'mia.room.pause', '纸箱终于不再是理由', '周六夜／宿舍', [
  beat('Mia', '箱子已经不用搬了。你还坐在这里……我反而不知道手该放哪里。放你身上，好像又太直白。♡'),
  beat('Kai', '不用忙。今晚我就是来陪你的。手不知道放哪的话，先放我掌心里。', '（她的指尖停在床单边。腿却不自觉并了并。トクン、トクン……我看见她大腿内侧轻轻抽了一下。）'),
]);
scene(57, 'mia.kiss.invitation', '把想念说到面前', '周六夜／宿舍', [
  beat('Mia', '我好像一直在找借口留你……其实只是想和你近一点。近到呼吸能打在锁骨上。♡'),
  beat('Kai', 'Mia，我想吻你。可以吗？不可以说成玩笑。我想认真亲你。'),
  beat('Mia', '可以。你可以慢慢来……我也想靠近你。等下……那里会变奇怪的……♡'),
], [
  choice('等她靠近，把这个吻轻轻咬回去', 68, { 'consent.miaKiss': true }),
  choice('先把想说的话说完，今晚先不接吻', 79, { 'consent.miaKiss': false }),
]);
scene(68, 'mia.first.kiss', '不是被留下的客人', '周六夜／宿舍', [
  beat('Mia', '我、我才没有那么想要……（ビクッ…！）❣ 唇一碰上，雌穴就自己咬紧了……哈啊……乞食之水止不住……💦♥', '（不行……明明为什么会……可是耻核被狠狠碾过的瞬间……整根脊柱都在发麻……脑子里像被闪电击中……⚡⚡ 肉口流了这么多汁液……腰自己抬起来了啊……ッ♥♥）'),
  beat('Kai', '那就一起慢一点。我没有要赶的下一场……你可以抖，我不会停得太远。'),
]);
scene(73, 'mia.kiss.answer', '她也会主动叫停时间', '周六夜／同一宿舍；同一次约会', [
  beat('Mia', '再陪我一会儿。不是客气……我绝不该把腿张开成这样……（ぐちゅっ…）呜！贪婪的小口却在咬你……想被你压一会儿……💔♥'),
  beat('Kai', '我知道。因为我也还想留在这里……留在你发烫的呼吸里。♥', '（她说再陪一会儿的时候，腰还贴着我。床单已经湿了一小块。脚趾内扣，大腿内侧痉挛。不是插入，是吻把乞食之水吻出来的……身体却已经像要变成贪婪的苗床。♥♥）'),
]);
scene(79, 'mia.goodnight', '晚安之后还有明天', '周六夜／宿舍门口', [
  beat('Mia（延续身份待核）', '今天真的很开心。明天见的时候，不许装得好像什么都没发生……唇还肿着也要来。♡'),
  beat('Kai', '不会。我会直接走到你身边。今晚先好好睡……梦里要是还热，算我的。'),
]);
scene(43, 'mia.morning', '白天也会心动', '周日上午／宿舍；约好来取展品', [
  beat('Mia', '早。你真的没有换回那副“我只是来帮忙”的表情……眼睛还是昨晚那种。♡'),
  beat('Kai', '昨天已经说好了。白天，我也想认真和你约会。想牵你，也想在没人的转角再靠近一点。'),
]);
scene(51, 'mia.daylight.hand', '在人群里走到一起', '周日下午／校园', [
  beat('Mia', '手给我。这里人多，我不想一回头又得找你……也不想让别人以为你只是路过。♡'),
  beat('Kai', '我就在这儿。你不用把邀请说得像一句提醒。', '（她握住我的手，指缝里全是汗。这一次，我们没有先找一个搬东西的理由。）'),
]);
scene(83, 'mia.ordinary.promise', '普通的一天也约好', '周日下午／宿舍；送回展品后', [
  beat('Mia（延续身份待核）', '下周也来吗？没有箱子，没有影展，就是一起吃饭……吃完如果还想进门，也请直接说。♡'),
  beat('Kai', '来。你邀请我的时候，不需要先证明这一天有多特别。特别的是我想继续碰你。'),
]);

scene(42, 'vanessa.date.answer', '在白天回答你', '周六下午／泳池边', [
  beat('Vanessa（拟定）', '你的约会，我答应了。不过有句话，我想在白天先说……夜里说，我会更容易把身体也交出去。♡'),
  beat('Vanessa（拟定）', '我喜欢你陪我安静，也希望你愿意听我那些不那么好听的话。不好听的时候，也请不要松开手。'),
  beat('Kai', '愿意。你不用一直把每句话整理得很漂亮。乱掉的呼吸，我也想听。'),
]);
scene(34, 'vanessa.pool.door', '门留着，话说完', '周六夜／泳池侧门；训练结束', [
  beat('Vanessa（拟定）', '门先扶着。我不喜欢热闹……不代表我不想被喜欢，也不代表我不想被你碰到。♡'),
  beat('Kai', '那我记住这句。以后想靠近的时候，我会问你……不先替你把腿并上。'),
]);
scene(50, 'vanessa.hand', '把安静分给两个人', '周六夜／泳池', [
  beat('Vanessa（拟定）', '可以牵着。今天，我不想这么快说晚安……水声可以再长一点。♡'),
  beat('Kai', '那就再走一圈。走得慢一点也没关系。你要是冷，就再靠过来。', '（她的手留在我掌心，湿冷，却不肯抽走。水声填着停顿。我们不再把安静当成冷场。）'),
]);
scene(55, 'vanessa.rain.day', '不追着她猜', '周日下午／雨巷', [
  beat('旁白', '为了开幕时是否露脸的事，Vanessa 想一个人走一会儿。雨把脚步拉得很远，把她的背影淋得发亮。'),
  beat('Kai·内心', '（我想追上去，把她从雨里捞回来。又记起昨晚的约定：先问她需要什么，不替她把身体安排好。）'),
], [
  choice('发消息：愿意听你说，我在你需要的地方', 82, { 'choice.vanessaSupport': 'listen' }),
  choice('发消息：先给你独处的时间，晚些再联系', 82, { 'choice.vanessaSupport': 'space' }),
]);
scene(82, 'vanessa.rain.reply', '不是沉默的谜题', '周日夜／雨中街道；Vanessa 视角', [
  beat('Vanessa（拟定）·消息', '我不想把自己的脸放上宣传页。可我想见你。两件事，我现在分得清了……想见你，不是想见镜头。'),
  beat('Vanessa（拟定）·内心', '（写完最后一句，我没有删。喜欢一个人，不必连所有安静的地方都交出去。可大腿内侧还记得他掌心的温度……♡）'),
]);
scene(60, 'vanessa.rain.meeting', '先站稳，再说喜欢', '周日夜／雨巷', [
  beat('Kai', '我到了。这里的地有点滑，先别急……先让我扶住你。'),
  beat('Vanessa（拟定）', '你一出现，我准备好的解释又没用了……我就是想见你。想见得腿都软了。♡'),
]);
scene(78, 'vanessa.close.answer', '白雾之间的一句话', '周日夜／雨巷近景', [
  beat('Vanessa（拟定）', '你看，我现在说得一点也不从容。白雾都喷在你嘴边了……这次，你听懂了吧？♡'),
  beat('Kai', '听懂了。我也想吻你，可以吗？雨可以继续下，我问这句话不能省。'),
  beat('Vanessa（拟定）', '可以。或者我们先抱一会儿。今晚慢一点，我也喜欢……慢，不是不想要。♡'),
], [
  choice('轻声回应她，靠近把雨里的吻咬实', 67, { 'choice.vanessaIntimacy': 'kiss', 'consent.vanessaKiss': true }),
  choice('先相拥，等彼此身体都热了再吻她', 70, { 'choice.vanessaIntimacy': 'embraceThenKiss', 'consent.vanessaKiss': true }),
  choice('今晚陪她走回去，把亲吻留到下次见面', 21, { 'choice.vanessaIntimacy': 'later', 'consent.vanessaKiss': false }),
]);
scene(67, 'vanessa.rain.kiss', '没有说出口的半句', '周日夜／雨巷', [
  beat('Vanessa（拟定）', '我本来还想维持安静……（ドクンッ…）唔、唔……话全碎了……雌穴却在雨里发烫……眼前发白……🌀♥'),
  beat('Kai', '留着。我想以后也一直听你说……说不出来的时候，就用呼吸回答我。'),
]);
scene(70, 'vanessa.lamppost', '在路灯下得到回应', '周日夜／雨中路灯下；拥抱后的亲吻', [
  beat('Vanessa（拟定）', '你没有急着让我变成另一个人……所以我才更不该先软……（ぐちゅ…）呜！不知羞耻的突起自己在蹭你……哈啊……罩住我……♥'),
  beat('Kai', '那就照你喜欢的速度。靠近，也可以慢慢来。你要是发抖，我就抱紧一点。♥'),
]);
scene(76, 'vanessa.rain.stay', '不需要替雨夜命名', '周日夜／同一雨巷；同一次约会', [
  beat('Vanessa（拟定）', '展览里可以不出现这一晚……我、我还没有把身体交出去……（ぎち…ぎち…）可腿根已经夹紧了。我们自己记得，就很好……💦♥'),
  beat('Kai', '好。也不用别人看见，才算我们认真在一起。你的安静，我吻过就够了。♥'),
]);
scene(21, 'vanessa.slow', '安静有了新的含义', '周日夜／送别后的空走廊', [
  beat('Kai', '刚才她说，下次不用等雨下起来才来见她。没吻成的那口气，她让我收好。'),
  beat('Kai·内心', '（我把这句话记得很清楚。今晚没有吻，唇却还在发烫。也没有谁被留在原地……想要的那部分，只是被允许晚一点。）'),
]);

scene(41, 'lina.play', '她自己的作品', '周六下午／活动室', [
  beat('丽娜（拟定）', '这回先不聊你的恋爱。陪我试完这段互动作品，看完再说喜欢哪里……喜欢哪里，不许敷衍。'),
  beat('Kai', '好。我答应认真看，也认真听你介绍自己。你的名字，我会看完再叫。'),
]);
scene(49, 'lina.photo', '把创作者也拍进去', '周日下午／校园留影处', [
  beat('丽娜（拟定）', '平时总是我替别人拍。这张，终于轮到我站进来了。站进来的时候，请看着我，不是看着别人的恋爱。'),
  beat('Kai', '站稳。你的作品和你的名字，明天都会有人看见。我先看见。'),
]);
scene(80, 'exhibit.doorway', '投稿短篇：门边的一句话', '周一傍晚／影展开幕；授权照片回忆', [
  beat('投稿者甲（身份待核）', '“那天他送我回来。我握着门把，腿还在门缝里发软，忽然很想把一句话说清。”'),
  beat('照片题记·投稿者甲', '“不是忘了关门。是想问你，下次还来不来……来的话，门可以再关慢一点。”'),
]);
scene(81, 'exhibit.goodnight', '投稿短篇：不催促的晚安', '周一傍晚／影展开幕；另一组授权照片回忆', [
  beat('投稿者乙（身份待核）', '“他站在门口等我说完。我说，今天先到这里……不是不想要，是想把今晚留成还能继续的形状。”'),
  beat('照片题记·投稿者乙', '“喜欢你，也可以好好说晚安。明天，我还想见你。想见你把我叫进门里的那种见。”'),
]);
scene(54, 'sunset.ending', '明天见', '周一日落／校园路', [
  beat('Kai', '影展开幕了。原来走到最后，要说的还是最初那三个字。三个字下面，还压着没吻完的热。'),
  beat('Kai·内心', '（明天见。这次不借照片，不借别人的标题，由我自己说。想见的那个人，身上的味道我还记得。）'),
]);

const sequences = {
  opening: [58, 1, 6, 5],
  openingJade: [59, 2, 8],
  openingMia: [74, 3, 8],
  openingRae: [56, 4, 8],
  openingVanessa: [30, 37, 8],
  common: [8, 64, 10, 9, 13, 11, 12, 18, 19, 20, 22, 23, 26, 61, 24, 25, 53, 14, 16, 27, 28, 29, 32, 36, 31, 35, 39, 15, 62, 52, 71, 69, 72, 44, 45, 46, 48],
  jade: [77],
  jadePool: [63, 66, 54],
  jadeStairs: [65, 75, 54],
  jadeSlow: [17, 54],
  mia: [40, 47, 7, 33, 38, 57],
  miaKiss: [68, 73, 79],
  miaAfter: [79, 43, 51, 83, 54],
  vanessa: [42, 34, 50, 55, 82, 60, 78],
  vanessaKiss: [67, 76, 54],
  vanessaEmbrace: [70, 76, 54],
  vanessaSlow: [21, 54],
  self: [41, 49, 80, 81, 54],
};

const byNumber = new Map(scenes.map(entry => [entry.number, entry]));
const proposedCasting = {
  core: [
    { id: 'kai', name: 'Kai', age: 21, role: '主视角／影展志愿者', theme: '从谁都不想让失望，到对自己的邀请负责', status: 'reference-name-confirmed-scene-identity-pending' },
    { id: 'mia', name: 'Mia', age: 21, role: '核心关系线／新搬入宿舍的创作者', theme: '陪伴能否走出帮忙与客气，成为普通日常里的主动选择', status: 'some-visible-name-evidence-continuity-pending' },
    { id: 'jade', name: 'Jade', age: 22, role: '核心关系线／活动组织者与运动队成员', theme: '主动的人也希望得到主动回应；被需要与被喜欢的区别', status: 'proposed-casting-hair-discrepancy-pending' },
    { id: 'vanessa', name: 'Vanessa', age: 22, role: '核心关系线／泳队成员与影展参与者', theme: '愿意亲近与保留私人空间可以同时成立', status: 'proposed-casting-pending' },
  ],
  ensemble: [
    { id: 'lina', name: '丽娜', age: 21, role: '互动短片作者／访谈者；推动主角选择，也要求自己的作品被看见', status: 'green-haired-woman-proposed-casting-pending' },
    { id: 'rae', name: '若伊／Rae', age: 18, role: '独立恋爱支线主角；用亲自发出的邀请推动关系', status: 'name-age-visible-on-one-badge-other-continuity-pending' },
    { id: 'reina', name: '玲奈／Reina', age: 24, role: '学生影展统筹／研究生；已有稳定伴侣，处理照片授权冲突', status: 'some-visible-name-evidence-other-continuity-pending' },
    { id: 'chenyue', name: '陈越', age: 20, role: '若伊的约会对象，后成为男友', status: 'new-fictional-name-scene-casting-pending' },
    { id: 'chengyu', name: '程屿', age: 24, role: '玲奈的现任伴侣', status: 'new-fictional-name-scene-casting-pending' },
  ],
};

const stateDeclarations = {
  'choice.firstVisit': { type: 'enum', values: ['none', 'jade', 'mia', 'rae', 'vanessa'], initial: 'none' },
  'choice.repair': { type: 'enum', values: ['none', 'together', 'separate'], initial: 'none' },
  'choice.publication': { type: 'enum', values: ['none', 'signed', 'anonymous'], initial: 'none' },
  'relationship.route': { type: 'enum', values: ['none', 'jade', 'mia', 'vanessa', 'self'], initial: 'none' },
  'relationship.jade': { type: 'enum', values: ['acquaintance', 'dating'], initial: 'acquaintance' },
  'relationship.mia': { type: 'enum', values: ['acquaintance', 'dating'], initial: 'acquaintance' },
  'relationship.vanessa': { type: 'enum', values: ['acquaintance', 'dating'], initial: 'acquaintance' },
  'relationship.rae': { type: 'enum', values: ['invitation', 'couple'], initial: 'invitation' },
  'relationship.reina': { type: 'enum', values: ['couple'], initial: 'couple' },
  'consent.jadeKiss': { type: 'boolean', initial: false },
  'consent.miaKiss': { type: 'boolean', initial: false },
  'consent.vanessaKiss': { type: 'boolean', initial: false },
  'consent.raeKiss': { type: 'boolean', initial: false },
  'consent.reinaKiss': { type: 'boolean', initial: false },
  'choice.jadeSetting': { type: 'enum', values: ['none', 'pool', 'stairs', 'later'], initial: 'none' },
  'choice.vanessaSupport': { type: 'enum', values: ['none', 'listen', 'space'], initial: 'none' },
  'choice.vanessaIntimacy': { type: 'enum', values: ['none', 'kiss', 'embraceThenKiss', 'later'], initial: 'none' },
};

const equal = (state, value) => ({ state, equals: value });
const onCompleteEffects = {
  61: { 'consent.reinaKiss': true },
  71: { 'relationship.rae': 'couple', 'consent.raeKiss': true },
  77: { 'relationship.jade': 'dating' },
  40: { 'relationship.mia': 'dating' },
  42: { 'relationship.vanessa': 'dating' },
};
const kissGroups = { jade: [63, 66, 65, 75], mia: [68, 73], vanessa: [67, 70, 76], rae: [69, 72], reina: [24] };
const requiredStates = {};
for (const [character, numbers] of Object.entries(kissGroups)) {
  for (const number of numbers) requiredStates[number] = [equal(`consent.${character}Kiss`, true), equal(`relationship.${character}`, ['rae', 'reina'].includes(character) ? 'couple' : 'dating')];
}

const variations = {
  8: [
    { when: equal('choice.firstVisit', 'jade'), beatIndex: 1, beat: beat('Kai·内心', '（她把毛巾拢紧胸口，又看了我一眼。那句“单独约你”还烫着。灯一暗，我脑子里先出现的是她湿掉的锁骨。）') },
    { when: equal('choice.firstVisit', 'mia'), beatIndex: 1, beat: beat('Kai·内心', '（投影线接好了。Mia 望过来时唇还微张。她把“明天”说得很轻，我却记得房间里那一点热。）') },
    { when: equal('choice.firstVisit', 'rae'), beatIndex: 1, beat: beat('Kai·内心', '（门口留着灯。若伊每一次回头，腰线都跟着转。那些还没说清的邀请，现在全有了主人。）') },
    { when: equal('choice.firstVisit', 'vanessa'), beatIndex: 1, beat: beat('Kai·内心', '（坐在水边时的安静还贴在大腿上。Vanessa 没多说，我却开始等她下一句把我叫过去。）') },
  ],
  22: [
    { when: equal('choice.repair', 'together'), beatIndex: 0, beat: beat('Mia', '刚才当着我们两个人说清楚，比你左右解释半天好。坐吧，饭还热着，我的气也还没散完。') },
    { when: equal('choice.repair', 'separate'), beatIndex: 0, beat: beat('Mia', '你也跟 Jade 说清楚了？那就坐下。谢谢你没有拿她的体温来哄我。') },
  ],
  53: [
    { when: equal('choice.publication', 'signed'), beatIndex: 0, beat: beat('玲奈', '原来的标题撤下了。愿意署名的人，自己写题记；不愿意被灯光舔到的，我们另留位置。') },
    { when: equal('choice.publication', 'anonymous'), beatIndex: 0, beat: beat('玲奈', '匿名展区安排好了。哪怕不写名字，题记也必须是当事人点过头、亲口承认的那一句。') },
  ],
  82: [
    { when: equal('choice.vanessaSupport', 'listen'), beatIndex: 0, beat: beat('Vanessa（拟定）·消息', '我现在想说了。我不想露脸宣传，但我想见你。你还愿意听吗？听完如果还想来，我在雨里。') },
    { when: equal('choice.vanessaSupport', 'space'), beatIndex: 0, beat: beat('Vanessa（拟定）·消息', '谢谢你没有一直追问。我想清楚了：照片可以撤下，约会我还想继续。继续靠近你。') },
  ],
  79: [
    { when: equal('consent.miaKiss', false), beatIndex: 0, beat: beat('Mia（延续身份待核）', '今天把话说完，已经很好了。没有吻也没关系……明天见面的时候，也像今晚这样认真，好不好？♡') },
  ],
};

const endings = [
  { id: 'ending.jade', when: equal('relationship.route', 'jade'), title: '这次换我约你', beats: [beat('Jade·消息', '明早几点见？这次别等我把所有安排都写好……我想被你约到腿软。♡'), beat('Kai·消息', '八点，我来找你。早餐我选。下一次约会，也让我先开口……开口以后，吻也由我先来。♡')] },
  { id: 'ending.mia', when: equal('relationship.route', 'mia'), title: '不用理由也会来', beats: [beat('Mia·消息', '展品都搬完了。明天你还来吗？没有箱子，也请进来。♡'), beat('Kai·消息', '来。以后没有纸箱的时候，也给我留个一起吃饭的位置……饭后如果门还开着，我不会装没看见。')] },
  { id: 'ending.vanessa', when: equal('relationship.route', 'vanessa'), title: '把安静也留给彼此', beats: [beat('Vanessa·消息', '今天的展览很热闹。我想和你走一条安静的路……安静到可以重新牵手，也可以重新接吻。♡'), beat('Kai·消息', '好。路你选，我来见你。想说话和不想说话的时候，我都愿意听。想被吻的时候，也请直接靠过来。')] },
  { id: 'ending.self', when: equal('relationship.route', 'self'), title: '自己的下一幕', beats: [beat('丽娜·消息', '首映结束了。下次，轮到你交一份自己的作品。别再只写别人的体温。'), beat('Kai·消息', '好。我已经想好开头：一个终于肯说出自己想要什么、想靠近谁的人。')] },
];

const beatEndEffects = {
  24: { 'consent.reinaKiss': false },
  72: { 'consent.raeKiss': false },
  66: { 'consent.jadeKiss': false },
  75: { 'consent.jadeKiss': false },
  73: { 'consent.miaKiss': false },
  76: { 'consent.vanessaKiss': false },
};

for (const numbers of Object.values(sequences)) {
  for (let index = 0; index < numbers.length - 1; index += 1) {
    const entry = byNumber.get(numbers[index]);
    if (!entry.options.length) {
      const targetNumber = numbers[index + 1];
      if (entry.nextNumber && entry.nextNumber !== targetNumber) throw new Error(`Conflicting sequence ${entry.id}`);
      entry.nextNumber = targetNumber;
    }
  }
}

const endNotes = new Map([
  [65, '额外前景手臂的归属未确认；此楼梯吻分支仅保留在设计稿，不能作为已经核定的双人私密画面发布。'],
  [75, '与楼梯吻前一图都有额外前景手；不得裁掉、涂掉或用台词断言画中只有两个人。'],
  [14, '运动装高马尾女生较接近 Jade 参考图，但与金发楼梯／泳池组存在外观差异；同人设定为写作假设。'],
  [25, '前景长发人身份不明；丽娜可作为门外说话者，不能据台词把该人认定为绿发丽娜。'],
  [40, '原图手机文字不可可靠辨认；消息为另写的对白浮层，不能标成原图文字转录。'],
  [46, '两男一女的角色映射尚未确认；不用“左边／身后”等站位指令。'],
  [47, '蓝衣男拟作 Kai，另一男性为投稿沟通者；身份与横竖站位变化均待人工确认。'],
  [60, '原图俯身与竖图站立不一致。只许完整横图，不把竖图列为同动作切换。'],
  [79, '棕发米色连帽衫人物拟延续 Mia；这是作者配角方案，尚非人物核验结论。'],
  [80, '身份未确认；作为匿名成人投稿者的独立照片短篇，不强配到四位核心角色。'],
  [81, '身份未确认；与上一投稿短篇不是已核实的同一对人物，不把两图拼成同一夜。'],
  [83, '灰色连帽衫棕发人物拟延续 Mia；人物一致性与服装时间连续性待核。'],
]);

const routeNumbers = {
  jade: [77, 63, 66, 65, 75, 17],
  mia: [40, 47, 7, 33, 38, 57, 68, 73, 79, 43, 51, 83],
  vanessa: [42, 34, 50, 55, 82, 60, 78, 67, 70, 76, 21],
  self: [41, 49, 80, 81],
};

const nodes = scenes.map((entry, index) => {
  const original = source.nodes.find(node => node.id === `scene.${String(entry.number).padStart(3, '0')}`);
  if (!original) throw new Error(`Unknown source scene ${entry.number}`);
  const asset = manifest.images.find(image => image.id === original.assetKey);
  const observation = review.images.find(image => image.assetKey === original.assetKey);
  const pair = review.pairs.find(item => item.landscapeId === original.assetKey) ?? null;
  const route = Object.entries(routeNumbers).find(([, numbers]) => numbers.includes(entry.number))?.[0] ?? null;
  const requirements = [...(route ? [equal('relationship.route', route)] : []), ...(requiredStates[entry.number] ?? [])];
  return {
    id: entry.id,
    authoringOrder: index + 1,
    sourceSceneId: original.id,
    sourceSceneNumber: entry.number,
    title: entry.title,
    storyTime: entry.time,
    route,
    assetKey: asset.id,
    assetPath: asset.path,
    assetSha256: asset.sha256,
    visibleObservation: observation.visible,
    identityReviewStatus: 'pending',
    visualReleaseStatus: 'requires-human-review',
    specialReviewNote: endNotes.get(entry.number) ?? null,
    heatInventoryTag: entry.number >= 56 && entry.number <= 77,
    presentation: {
      desktopMode: 'fullLandscapeContain',
      mobileModeBeforeApproval: 'fullLandscapeContain',
      portraitCandidateAssetKey: pair?.portraitId ?? null,
      portraitAssessment: pair?.assessment ?? 'no-candidate',
      automaticPortraitSwapEnabled: false,
      afterApproval: pair?.assessment === 'consistent' ? 'allowExplicitPairSwap' : 'retainFullLandscapeContain',
      animation: 'static',
      voiceOrSoundAsset: null,
    },
    requirements,
    beats: entry.beats.map((value, beatIndex) => ({ id: `${entry.id}.beat.${beatIndex + 1}`, ...value })),
    beatVariations: variations[entry.number] ?? [],
    onCompleteEffects: { ...(onCompleteEffects[entry.number] ?? {}), ...(beatEndEffects[entry.number] ?? {}) },
    choices: entry.options.map((option, choiceIndex) => ({ id: `${entry.id}.choice.${choiceIndex + 1}`, text: option.text, target: byNumber.get(option.targetNumber).id, effects: option.effects })),
    next: entry.nextNumber ? byNumber.get(entry.nextNumber).id : null,
    endingResolver: entry.number === 54 ? { variants: endings, default: { kind: 'contentError', message: 'Ending reached without an explicit relationship route.' } } : null,
  };
});

const pairs = review.pairs.map(pair => {
  const node = nodes.find(entry => entry.assetKey === pair.landscapeId);
  const portrait = manifest.images.find(entry => entry.id === pair.portraitId);
  return {
    ...pair,
    nodeId: node.id,
    sourceSceneNumber: node.sourceSceneNumber,
    portraitPath: portrait.path,
    portraitSha256: portrait.sha256,
    enabled: false,
    proposedAfterApproval: pair.assessment === 'consistent' ? 'explicit-swap' : 'retain-landscape',
  };
}).sort((first, second) => first.sourceSceneNumber - second.sourceSceneNumber);

const document = {
  documentType: 'narrative-design-proposal',
  proposalSchemaVersion: 1,
  storyDesignVersion: 'tomorrow.1',
  runtimeCompatible: false,
  generatedFrom: { storyVersion: source.storyVersion, assetManifestVersion: manifest.schemaVersion, visualReviewVersion: review.reviewVersion },
  title: 'WetBlessing：明天见',
  language: 'zh-CN',
  premise: '一场由成年大学生筹办的学期末影展，因为一张被误读的合照，让 Kai 必须学会把每一次邀约说清楚。四个夜晚里，主动、陪伴、肉欲与私人空间各有不同的答案。',
  maturity: { allCharactersAdultByAuthoredSetting: true, explicitSexualActs: false, anatomicalSexualDescription: true, coercion: false },
  casting: proposedCasting,
  entry: byNumber.get(58).id,
  stateDeclarations,
  interactionContract: {
    beatsPerImage: { min: 2, max: 3 },
    firstBeatAppearsOnEntry: true,
    advanceConvention: 'N beats means N advances to leave the image: N-1 reveals and one next-image click or option selection.',
    thoughts: 'Shown with their owning beat; never a fourth click.',
    choices: 'Appear with the final beat; selecting an option replaces the next-image click.',
    variations: 'Mutually exclusive replacements of the indicated beat, never appended beats; base beat is explicit default.',
    completionOrder: ['read-final-beat', 'apply-onCompleteEffects', 'apply-selected-choice-effects', 'validate-target-requirements', 'enter-target'],
    consentLifetime: 'Only the explicitly invited encounter; cleared after its final kiss image. A dating state alone never authorizes a kiss image.',
    globalPauseExit: true,
    rewind: 'Restores the complete state snapshot at the earlier choice; never carries later consent backward.',
    commercialUiEnabled: false,
    imagesAreStatic: true,
  },
  nodes,
  portraitPairs: pairs,
  endings: endings.map(ending => ({ id: ending.id, title: ending.title, when: ending.when, terminalNode: byNumber.get(54).id })),
  commercial: {
    enabled: false,
    points: { enabled: false, spendPerDialogue: null, price: null },
    subscription: { enabled: false, price: null, period: null, contentCommitment: null },
    buyout: { enabled: false, price: null, scopeProposal: '完整现有故事、三条关系线、同行结局与已拥有路线的重玩' },
    login: { enabled: false, proposedAt: byNumber.get(20).id, optionalSavePromptAt: byNumber.get(10).id, reason: '第一晚只提供可忽略的保存提示；两个小段落后若启用购买，将账号提示合并进同一次确认，避免连续弹窗。' },
    purchase: { enabled: false, proposedAfter: byNumber.get(20).id, reason: '已见到人物、第一次选择及照片冲突；下一个完整段落将让玩家当面处理关系。', declineBehavior: '保留当前阅读位置，允许查看已读内容与退出；不消耗积分、不改变角色态度。', revealBeforeFirstChoice: true },
  },
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateProposal() {
  assert(nodes.length === 83, 'Exactly 83 nodes required');
  assert(new Set(nodes.map(node => node.id)).size === 83, 'Node IDs must be unique');
  assert(new Set(nodes.map(node => node.assetKey)).size === 83, 'Every landscape must have one authored node');
  const expectedLandscapes = manifest.images.filter(asset => asset.kind === 'scene' && asset.orientation === 'landscape');
  assert(expectedLandscapes.length === 83 && expectedLandscapes.every(asset => nodes.some(node => node.assetKey === asset.id)), 'Manifest landscape coverage');
  assert(pairs.length === 64 && new Set(pairs.map(pair => pair.portraitId)).size === 63, 'Portrait candidate coverage');
  assert(nodes.filter(node => node.heatInventoryTag).length === 22, 'Heat inventory coverage');
  const ids = new Map(nodes.map(node => [node.id, node]));
  const longTexts = new Set();
  for (const node of nodes) {
    assert(node.beats.length >= 2 && node.beats.length <= 3, `${node.id}: beat count`);
    assert([Boolean(node.next), Boolean(node.choices.length), Boolean(node.endingResolver)].filter(Boolean).length === 1, `${node.id}: one exit mode`);
    assert(!node.presentation.automaticPortraitSwapEnabled, `${node.id}: pending image cannot auto-swap`);
    for (const target of [node.next, ...node.choices.map(option => option.target)].filter(Boolean)) assert(ids.has(target), `Missing target ${target}`);
    for (const item of [...node.beats, ...node.beatVariations.map(variation => variation.beat)]) {
      if (item.thought) assert(item.thought.startsWith('（') && item.thought.endsWith('）'), `${node.id}: full-width thought parentheses`);
      const text = `${item.text}${item.thought ?? ''}`;
      const withoutOnomatopoeia = text.replace(/[（(][^）)]*[）)]/gu, '');
      assert(!/\.{3,}/u.test(text), `${node.id}: ascii ellipsis`);
      assert(!/(?<!…)…(?!…)|…{3,}/u.test(withoutOnomatopoeia), `${node.id}: nonstandard ellipsis outside onomatopoeia`);
      if (item.text.length >= 18) {
        assert(!longTexts.has(item.text), `${node.id}: duplicate long dialogue`);
        longTexts.add(item.text);
      }
    }
  }
  const pathResults = [];
  const visited = new Set();
  const initial = Object.fromEntries(Object.entries(stateDeclarations).map(([key, declaration]) => [key, declaration.initial]));
  function checkEffects(effects) {
    for (const [key, value] of Object.entries(effects)) {
      const declaration = stateDeclarations[key];
      assert(declaration, `Undeclared state ${key}`);
      assert(declaration.type === 'boolean' ? typeof value === 'boolean' : declaration.values.includes(value), `Invalid state value ${key}`);
    }
  }
  function walk(nodeId, state, seen, beatsRead) {
    const node = ids.get(nodeId);
    assert(!seen.includes(nodeId), `Unintentional loop ${nodeId}`);
    for (const condition of node.requirements) assert(state[condition.state] === condition.equals, `Unmet entry requirement ${nodeId}: ${condition.state}`);
    const enabledVariations = node.beatVariations.filter(variation => state[variation.when.state] === variation.when.equals);
    assert(new Set(enabledVariations.map(variation => variation.beatIndex)).size === enabledVariations.length, `Ambiguous beat replacement ${nodeId}`);
    for (const variation of node.beatVariations) assert(variation.beatIndex < node.beats.length, `Variation index ${nodeId}`);
    visited.add(nodeId);
    checkEffects(node.onCompleteEffects);
    const nextState = { ...state, ...node.onCompleteEffects };
    const nextSeen = [...seen, nodeId];
    const nextBeats = beatsRead + node.beats.length;
    if (node.endingResolver) {
      const matches = node.endingResolver.variants.filter(ending => nextState[ending.when.state] === ending.when.equals);
      assert(matches.length === 1, 'Exactly one ending must match');
      assert(matches[0].beats.length === node.beats.length, 'Ending variation must replace same beat count');
      const romanticRoutes = ['jade', 'mia', 'vanessa'].filter(character => nextState[`relationship.${character}`] === 'dating');
      assert(romanticRoutes.length === (nextState['relationship.route'] === 'self' ? 0 : 1), 'Exclusive main relationship');
      assert(Object.entries(nextState).filter(([key]) => key.startsWith('consent.')).every(([, value]) => value === false), 'Encounter consent must expire before ending');
      pathResults.push({ ending: matches[0].id, route: nextState['relationship.route'], nodes: nextSeen.length, beats: nextBeats });
    } else if (node.next) walk(node.next, nextState, nextSeen, nextBeats);
    else for (const option of node.choices) {
      checkEffects(option.effects);
      walk(option.target, { ...nextState, ...option.effects }, nextSeen, nextBeats);
    }
  }
  walk(document.entry, initial, [], 0);
  assert(visited.size === 83, 'All design nodes must be reachable');
  assert(new Set(pathResults.map(result => result.ending)).size === 4, 'All endings must be reachable');
  const integrityErrors = [];
  for (const asset of [...manifest.images, ...manifest.supportFiles]) {
    const digest = createHash('sha256').update(fs.readFileSync(path.join(projectRoot, 'public', asset.path))).digest('hex');
    if (digest !== asset.sha256) integrityErrors.push(asset.path);
  }
  assert(!integrityErrors.length, `Original integrity failures: ${integrityErrors.join(', ')}`);
  const routeStats = Object.fromEntries(['jade', 'mia', 'vanessa', 'self'].map(route => {
    const paths = pathResults.filter(result => result.route === route);
    return [route, { paths: paths.length, minNodes: Math.min(...paths.map(result => result.nodes)), maxNodes: Math.max(...paths.map(result => result.nodes)), minBeats: Math.min(...paths.map(result => result.beats)), maxBeats: Math.max(...paths.map(result => result.beats)) }];
  }));
  return {
    status: 'passed',
    checkedAt: new Date().toISOString(),
    landscapeNodes: nodes.length,
    beats: nodes.reduce((total, node) => total + node.beats.length, 0),
    thoughtsWithinBeats: nodes.flatMap(node => node.beats).filter(item => item.thought || item.speaker.endsWith('内心')).length,
    choicePoints: nodes.filter(node => node.choices.length).length,
    choiceOptions: nodes.flatMap(node => node.choices).length,
    conditionalBeatReplacements: nodes.flatMap(node => node.beatVariations).length,
    portraitLinks: pairs.length,
    uniquePortraits: new Set(pairs.map(pair => pair.portraitId)).size,
    portraitAssessments: Object.fromEntries(['consistent', 'composition-change', 'action-mismatch'].map(assessment => [assessment, pairs.filter(pair => pair.assessment === assessment).length])),
    heatAssets: nodes.filter(node => node.heatInventoryTag).length,
    exhaustiveDesignPaths: pathResults.length,
    endings: new Set(pathResults.map(result => result.ending)).size,
    routeStats,
    originalIntegrity: { images: manifest.images.length, fonts: manifest.supportFiles.length, result: 'sha256-match' },
    limitations: ['Design graph checks assume proposed casting can be approved.', 'No image was newly visually reviewed for this draft.', 'Human identity and portrait review remain pending.', 'Narrative quality and conversion have not been playtested.', 'Runtime tests and production build were not run for this document-only change.'],
  };
}

const validation = validateProposal();
const shortId = number => byNumber.get(number).id;
const nodeLabel = number => `旧图序 ${String(number).padStart(2, '0')}／${shortId(number)}`;
const sceneLabel = node => `S${String(node.authoringOrder).padStart(2, '0')}`;
const formatCondition = condition => `${condition.state} = ${JSON.stringify(condition.equals)}`;
const assessmentNames = { consistent: '助手预览一致；待人工批准', 'composition-change': '站位改变；本稿保留完整横图', 'action-mismatch': '动作不一致；禁止同节点替换' };
const heatReasons = {
  56: '开场任选相遇：回头与证卡建立若伊身份，同时埋下她在等别人。',
  57: 'Mia 线：她主动把陪伴说成亲近；这是邀请与选择点，不以姿态代替同意。',
  58: '全篇首图：用手机邀约和直接对白让玩家立刻进入一段有期待的关系。',
  59: 'Jade 开场支路：递毛巾把抽象邀约变成具体互动；不等付费才展示。',
  60: 'Vanessa 线：雨中赴约兑现“先问她需要什么”；保留横图姿态。',
  61: '共同段落：玲奈从统筹者切换到有私人恋爱生活的人，开启群像视角。',
  62: '共同段落：若伊第二天收到答复，回收最初回头等待的动作。',
  63: 'Jade 池边线：明确答应约会与亲吻后，展示第一次吻的回报。',
  64: '第一晚收尾：回到伸手的动作，形成可记住的约定；不是自动确立恋爱。',
  65: 'Jade 楼梯线：回到初见地点的关系回报；额外手臂问题阻止发布，待核。',
  66: 'Jade 池边线：同一次吻的后半段，把下一次约会说出口；不另算一次高潮。',
  67: 'Vanessa 亲吻选择：雨夜说清楚后，短促停顿比堆叠符号更重要。',
  68: 'Mia 亲吻选择：双向邀请兑现，紧张来自在意而不是失去自主。',
  69: '若伊支线：她与自己的约会对象亲吻；Kai 不进入这段亲密关系。',
  70: 'Vanessa 另一选择：先拥抱再亲吻；选项提前说明会吻，不能偷换“只抱抱”。',
  71: '若伊支线：先确认关系并互相答应亲吻，才进入吻图。',
  72: '若伊支线：同一场亲吻的回答，随后立即回到普通生活。',
  73: 'Mia 线：同一晚第二构图写吻后仍想留下；可写发软、湿意与迎合，不另写未出镜的插入情节。',
  74: 'Mia 开场支路：床边手机与门口来客服务于取线、约定和停顿，建立私下交流。',
  75: 'Jade 楼梯线：手机退到一旁，兑现专注；额外手臂问题同样待核。',
  76: 'Vanessa 线两种亲吻选择汇合：亲密无需公开证明，回收她的关系主题。',
  77: 'Jade 个人线入口：同一泳池从公共活动变为正式约会，由玩家决定亲近速度。',
};

const intro = `# WetBlessing：明天见\n\n完整剧情设计提案 · tomorrow.1 · 2026-09-17\n\n本稿供剧情与资源评审使用，未接入播放器，也未覆盖项目的 content/story.json。JSON 是本稿自带的提案结构：此前提供的“Schema”标题下没有实际字段定义，因此不声称兼容一个尚未提供的接口。\n\n## 1. 故事总纲\n\n**一句话：一场校园影展，让 Kai 从“谁都不想让失望”，走到“认真邀请一个人，也认真回应其他人”。**\n\n全体登场者按成年大学生或成年同龄创作者设定。连续时间为周四试映至周一开幕，没有先按付费章节切割。第一张就是楼梯边的邀约：“我发的是想见你，不是缺一个帮忙的人。”玩家不用先读设定集。\n\n- 周四夜：Jade 的直接邀请把玩家带进校园试映。四选一的短相遇，让玩家先表达关注对象；第一次选择之后两张图就有回应，再回到共同活动。若伊在等自己喜欢的人，不能把所有回头都误读为邀请主角。\n- 周五白天：搬箱子与活动安排撞车，Mia 和 Jade 都要求 Kai 把已经答应的事说清。一张争执照片被误读，制造“他们会怎样重新见面”的具体悬念。\n- 周五下午至周六：玲奈处理影展授权，也拥有自己的恋爱；丽娜追问 Kai 的真实意愿；若伊亲自发出约会邀请。三人的行动分别推动关系冲突、主角抉择和亲密关系的示范。照片误会在共同段落中有实质解决，不拖成永远不解释的误会。\n- 周六至周日：Kai 主动发出只给一个人的约会邀请。Mia 线写日常陪伴，Jade 线写主动回应，Vanessa 线写亲近与私人空间；也可以选择继续完成作品、暂不恋爱。\n- 周一日落：各线回到影展开幕后的校园路。同一张落日图承接不同消息，回答“明天还见不见”，而不是统一发一张好感度奖状。\n\n早期的吸引力来自角色有明确意图、玩家及时得到回应。两次热度提升之间必须有能理解人物的一句话；不把所有台词都写成同一种喘息，也不用连续吻图代替剧情进展。\n\n## 2. 角色关系与路线规则\n\n本稿将“四名核心角色”理解为参考图中的 Kai、Mia、Jade、Vanessa，其中 Kai 是主角，另三人为核心关系线。这是本稿的编排假设，并不表示已确认四位可攻略对象。\n\n| 人物 | 叙事身份与关系主题 | 独有说话方式 | 本线的情感回报 |\n| --- | --- | --- | --- |\n| Kai | 学会负责地表达自己的选择 | 开始爱打圆场，后期直接说“我想”“我来” | 不再靠安排与误会决定关系 |\n| Mia | 从被帮忙到被认真陪伴 | 嘴上借小事邀约，转折处会直说“不是客气” | 没有纸箱和任务的一天，也有人愿意来 |\n| Jade | 主动的人也需要被回应 | 问句利落，善于留一个让对方走近的停顿 | 对方主动安排下一次见面 |\n| Vanessa | 保留自我也能认真亲近 | 句子短，留白多，把边界说成真实需求 | 安静、拒绝公开与喜欢一个人同时被接受 |\n| 丽娜 | 拥有自己的创作目标 | 会问尖锐问题，不替主角写标准答案 | 同行线里自己的作品终于被看见 |\n| 若伊 | 从等待转为发出邀请 | 假装随口、藏不住期待，告白时反而干脆 | 她与陈越拥有自己的恋爱，不绕着 Kai 转 |\n| 玲奈 | 公共工作与私人生活并存 | 工作时准确，面对伴侣时允许自己停顿 | 既能安排开幕，也有自己的亲密生活 |\n\n陈越、程屿是为群像关系新增的文字角色名，分别拟对应若伊与玲奈画面中的成年伴侣；人物匹配仍待核验。其他投稿者不贸然命名。丽娜和玲奈均不是教师或掌握主角学业评价的人。\n\n### 视觉身份是本稿最大的待确认项\n\n- Jade 参考图是金棕高马尾运动装人物，楼梯／泳池金发女生的外观不同。本稿暂将这两组作为 Jade 写作，但**不得直接上线这种同人假设**。若不是同人，应以资源组拆分角色并重写相关关系，不能靠一句“换了造型”自动抹平。\n- 黑发泳池／雨景拟为 Vanessa，绿发人物拟为丽娜；画中男子拟为 Kai 或其他伴侣，均不属于已验证事实。\n- Mia、Reina 的部分图有姓名文字，Rae 的单张证卡可读姓名与 18；不因此把所有相似人物都视为核定。\n- 旧图序 65、75 有额外前景手，楼梯吻分支暂留设计稿，发布前必须解释画面人物关系；不能裁图消除问题。\n- 旧图序 80、81 分别成为两组匿名投稿短篇，不强认成同一个人或某位核心角色；79、83 拟延续 Mia，仍需核验。\n\n### 分支约束\n\n1. 首次拜访只改变开场两张图和汇合后的回应，不偷偷锁恋爱对象。后面仍可改变想法。\n2. 解释方式、影展署名方式与雨中支持方式都有对应对白变化；选择不增加“万能好感分”。\n3. 旧图序 48 明示选择关系线；选中后其他人物继续自己的生活，后续不会自动与另一个核心角色接吻。\n4. 开始约会与愿意接吻是两个不同状态。每次亲吻画面必须在前一图完成明确回应；同一晚的连续构图可共享该次邀请，结束后立即清除临时亲吻许可。\n5. 每个主角关系线都提供“慢一点”的有效去向；不扣分，不转入羞辱或失败结局。若伊／玲奈的亲吻是有明确视角切换的群像剧情，不是替玩家选亲密动作。\n6. 回看选项必须还原当时的完整状态；不能保留另一条线的约会和亲吻状态。暂停、退出随时可用，不以自动播放推动选择。\n\n### 每张图的点击与文本规则\n\n每图 2～3 个阅读拍。进入时显示第 1 拍；之后每次推进显示下一拍，最后一次推进切到下一图；选择替代最后一次推进。因此 2 拍图需 2 次操作离开，3 拍图需 3 次。独白随所属对白同拍出现，绝不再加一个隐藏的第 4 拍。条件对白替换原拍，不能追加。\n\n叙述者的“旁白”、具名人物的“内心”与正在说话的角色清楚区分。省略号在汉语台词里统一为“……”；假名拟声可在括号内使用单点省略。♡ 用于防线初裂；♥／♥♥ 用于身体先于自尊屈服；❣、💦、⚡、🌀、💔 用于对应的反射瞬间。拟声词用纯假名嵌在反抗句中间。没有声音素材，本稿不捏造音频文件。\n\n## 3. 83 张横屏场景的剧情位置\n\n表中 S01～S83 是**设计稿展示顺序**，不是一周目必须连续经过的编号。旧图序用于与现有 83 节点核对；资源键来自现有索引，不从文件名推断内容。每行都是独立节点，分支去向以 JSON 中的显式 target 为准。\n\n开场 → 四选一短相遇 → 共同影展事件 → 三条关系线或同行线 → 周一落日\n\n`;

function renderManuscript() {
  let markdown = intro;
  markdown += '| 稿序 | 旧图序 | 资源 ID | 时间／位置 | 节点与去向 |\n| --- | --- | --- | --- | --- |\n';
  for (const node of nodes) {
    const targets = node.choices.length ? node.choices.map(option => sceneLabel(nodes.find(target => target.id === option.target))).join('／') : node.next ? sceneLabel(nodes.find(target => target.id === node.next)) : '按关系线结局';
    markdown += `| ${sceneLabel(node)} | ${node.sourceSceneNumber} | ${node.assetKey} | ${node.storyTime} | ${node.title} → ${targets} |\n`;
  }
  markdown += '\n四张完全相同的空走廊原件（asset.image.014／.019／.021／.024）分别承担首夜收尾、周五收尾、Jade 慢行道别、解释方式选择。它们是同一视觉素材的不同叙事位置，不称为四张独有奖励图。\n\n';
  markdown += '## 4. 63 张竖屏图的配对与替换规则\n\n63 个独立竖屏资源对应 64 条候选关系，一张竖图被两个横图候选引用。61 条在低清预览中相符，2 条站位变化，1 条动作不一致。**现在的自动替换全部关闭，人工批准后才启用明确配对**。未批准或没有候选的节点统一显示完整横图，允许留边，不裁掉人物或用通用图代替。\n\n';
  markdown += '| 旧图序 | 横图 ID | 竖图 ID | 助手观察／拟定处理 |\n| --- | --- | --- | --- |\n';
  for (const pair of pairs) markdown += `| ${pair.sourceSceneNumber} | ${pair.landscapeId} | ${pair.portraitId} | ${assessmentNames[pair.assessment]} |\n`;
  markdown += '\n站位变化两组即旧图序 46、47，不能把竖图的前后关系写成已经成立的情节。旧图序 60 的俯身／站立差异明确禁止当作同一个动作自动替换。JSON 同时保留显式资源路径与 SHA-256，供之后逐项复核。\n\n';
  markdown += '## 5. 22 张 heat 图的剧情位置\n\nheat 是现有资源分组标签，不等于必须安排性行为，也不等于每张都是高潮。开场就使用邀约、毛巾、回望等适合当时关系的画面；接吻图安排在相应关系成立之后。第一轮只会看到自己走过的分支，不能承诺一次看到全部 22 张。\n\n';
  markdown += '| 旧图序 | 新位置 | 使用目的 |\n| --- | --- | --- |\n';
  for (const node of nodes.filter(entry => entry.heatInventoryTag).sort((first, second) => first.sourceSceneNumber - second.sourceSceneNumber)) markdown += `| ${node.sourceSceneNumber} | ${sceneLabel(node)}／${node.title} | ${heatReasons[node.sourceSceneNumber]} |\n`;
  markdown += '\n## 6. 全量对白、旁白、独白与选项\n\n“拟定／待核”是评审标记，不进入玩家看到的角色名。分支前显示的动作说明必须与随后图片一致，例如选择“先拥抱再亲吻”，不能用“只是抱抱”的选项跳进吻图。下列对白均为新写作，不是对原图手机文字的辨认或复述。\n\n';
  for (const node of nodes) {
    markdown += `### ${sceneLabel(node)} ${node.title}\n\n`;
    markdown += `- 节点：\`${node.id}\`；旧图序 ${node.sourceSceneNumber}；资源 \`${node.assetKey}\`。\n- 时间：${node.storyTime}。\n- 画面观察：${node.visibleObservation}\n`;
    if (node.specialReviewNote) markdown += `- 核验限制：${node.specialReviewNote}\n`;
    if (node.requirements.length) markdown += `- 进入条件：${node.requirements.map(formatCondition).join('；')}。\n`;
    markdown += '\n';
    node.beats.forEach((item, index) => {
      markdown += `**第 ${index + 1} 拍 · ${item.speaker}**\n\n${item.text}\n\n`;
      if (item.thought) markdown += `同拍独白：${item.thought}\n\n`;
    });
    if (node.beatVariations.length) {
      markdown += '**条件替换，同拍不加点击：**\n\n';
      for (const variation of node.beatVariations) markdown += `- ${formatCondition(variation.when)} → 第 ${variation.beatIndex + 1} 拍／${variation.beat.speaker}：${variation.beat.text}\n`;
      markdown += '\n';
    }
    if (node.choices.length) {
      markdown += '**末拍选择：**\n\n';
      for (const option of node.choices) {
        const target = nodes.find(entry => entry.id === option.target);
        markdown += `- 【${option.text}】→ ${sceneLabel(target)} ${target.title}。状态：${Object.entries(option.effects).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('；')}。\n`;
      }
      markdown += '\n';
    } else if (node.next) {
      const target = nodes.find(entry => entry.id === node.next);
      markdown += `**下一图：${sceneLabel(target)} ${target.title}。**\n\n`;
    } else markdown += '**结束：此处两拍由第 7 节对应结局完整替换。**\n\n';
  }
  markdown += '## 7. 汇合点、路线兑现与结局\n\n';
  markdown += `- 开场汇合：${nodeLabel(8)}，根据刚才见过谁替换内心独白；不会把未走过的邀约当作已发生。\n- 道歉方式汇合：${nodeLabel(22)}，同一顿饭用不同开场回应当面解释或分别沟通。\n- 影展表达汇合：${nodeLabel(53)}，明确反馈署名／匿名选择；每个人仍保留决定自己照片的权利。\n- 主关系分流：${nodeLabel(48)}，明确选 Jade、Mia、Vanessa 或同行，不用隐形阈值判定。\n- Mia 的亲吻／慢行汇合：${nodeLabel(79)}，道晚安的对白不同，但次日约会继续。\n- Vanessa 两种亲吻方式汇合：${nodeLabel(76)}；不亲吻的路径走旧图序 21，保留下一次约会。\n- 全部结局汇合：${nodeLabel(54)}，同一落日图替换为下列两拍消息。\n\n`;
  for (const ending of endings) {
    markdown += `### ${ending.title}\n\n条件：${formatCondition(ending.when)}。\n\n`;
    ending.beats.forEach((item, index) => { markdown += `${index + 1}. **${item.speaker}：** ${item.text}\n`; });
    markdown += '\n';
  }
  markdown += '### 篇幅与路线差异\n\n';
  markdown += '| 路线 | 单次经过图片数 | 阅读拍／推进操作数 | 内容定位 |\n| --- | --- | --- | --- |\n';
  const routeNames = { jade: ['Jade', '共线已有较多主动相遇，个人收尾较短'], mia: ['Mia', '约会、晚安、白天与日常承诺较完整'], vanessa: ['Vanessa', '泳池约会、雨中沟通与空间主题'], self: ['同行', '丽娜的创作与匿名投稿短篇，不恋爱也有收尾'] };
  for (const [route, stats] of Object.entries(validation.routeStats)) markdown += `| ${routeNames[route][0]} | ${stats.minNodes}～${stats.maxNodes} | ${stats.minBeats}～${stats.maxBeats} | ${routeNames[route][1]} |\n`;
  markdown += '\n这是资源支持下的不等长路线。Jade 分流后的新增内容明显较短，不能单独宣传成与 Mia 同等长度的付费篇章。若之后要求等长，优先重排共同段落、缩小承诺或减少路线数；不编造不存在的图片。按每拍约 4～7 秒可估阅读量，但实际时长必须通过试玩测量。\n\n';
  markdown += '## 8. 最后附加：积分、订阅与买断提案\n\n所有商业字段默认 enabled=false，价格为 null。本轮只讨论产品设计，不做登录、支付、订阅或假入口。\n\n**建议优先一次买断完整现有故事。** 素材与结局是固定内容，买断最容易解释。积分逐句扣除会打断对话节奏；在没有明确持续更新内容和频率前，订阅缺少稳定的购买理由。\n\n### 免费段如何建立购买意愿\n\n- 首图立即给出明确邀约，四张图内让玩家知道自己为什么来到这里；第一处选择马上带来两张不同画面，而不是等到结尾才体现作用。\n- 第一晚已经交付完整的小回报：单独相遇、汇合与散场约定。旧图序 10 只可提供可忽略的保存提示，不能靠注册阻断刚建立的节奏。\n- 第二个段落交付一起搬东西、两份约定冲突、误读照片与主角选择如何解释。旧图序 20 的最后选项先让玩家作出决定，再保留该选择，作为可能的试玩边界。\n- 玩家继续的理由是“我刚才的解释会得到怎样的回答”“我最后会主动约谁”，后续也确实给出不同对白与个人约会。不能只承诺再看一张更亲密的图。\n\n### 购买页案例，尚未启用\n\n> **把这段邀请说到最后。**\n> 解锁《明天见》完整故事：三条关系线、同行结局，以及已拥有内容的分支重玩。\n> **【购买完整故事 · 价格待定】**\n> 【暂时离开，保留当前进度】\n\n首屏在开始前简短说明“可免费体验开场，完整故事需购买”，不等玩家选到一半才透露收费。若需要账号，将其放在同一次购买确认里处理，不连续出现“先注册”和“再付费”两个拦截。购买之前说明 Jade 个人收尾较短、展示实际包含内容；不使用虚假倒计时或“拒绝后角色好感下降”。\n\n试用边界是在选择之后、下一场对白之前，不能把亲吻图片显示一半再遮住。用户不买时，保留选择与已读内容；再次回来能从原处继续。已买用户不再按选项收费。当前样例默认完全没有这些拦截。\n\n建议评估的指标是：首次选择完成率、第一晚完成率、试读边界到达率、看到购买说明后的购买率，以及购买后的继续阅读与结局完成率。没有真实数据，不能把任一放置点声称为最佳转化位置。先用试玩比较旧图序 20 后的悬念点与旧图序 53 后的完整误会收尾，再决定收费位置。\n\n## 本次核验与交付范围\n\n';
  markdown += `实际完成：${validation.landscapeNodes} 个横图节点、${validation.beats} 个基础阅读拍、${validation.choicePoints} 处选择／${validation.choiceOptions} 个选项、${validation.conditionalBeatReplacements} 处条件对白替换、${validation.heatAssets} 张 heat 图位置、${validation.uniquePortraits} 个竖屏资源的 ${validation.portraitLinks} 条候选映射、4 个结局。\n\n`;
  markdown += `实际通过：设计图的全部 ${validation.exhaustiveDesignPaths} 条选择组合可达；每图 2～3 拍；引用完整；路线互斥；亲吻节点所需条件成立；本次亲密状态会清除；长台词精确重复检查；150 张原图与 1 个字体的 SHA-256 完整性。\n\n`;
  markdown += '未执行：本轮未修改工程，因此没有重新跑工程测试或生产构建，也没有运行播放器、接入登录或交易。\n\n待核验：人物身份、额外前景手臂、横竖切换的人工批准、细节配图连续性、文学质量与真实试玩节奏。结构校验通过不等于这些事项已经通过。全部节点仍标 requires-human-review；63 张竖图并非已获准自动替换。\n\n交付文件：MANUSCRIPT.md（完整设计稿）、proposal.json（非运行时结构提案）、validation.json（本次检查结果）。项目中的 content/story.json 仍是唯一运行时剧情真源，本稿没有改变它。\n';
  return markdown;
}

const artifacts = {
  'MANUSCRIPT.md': renderManuscript(),
  'proposal.json': `${JSON.stringify(document, null, 2)}\n`,
  'validation.json': `${JSON.stringify(validation, null, 2)}\n`,
};

if (process.argv.includes('--write')) {
  for (const [filename, contents] of Object.entries(artifacts)) {
    fs.writeFileSync(path.join(outputRoot, filename), contents);
  }
  process.stdout.write(`${JSON.stringify(validation, null, 2)}\n`);
} else if (process.argv.includes('--patch')) {
  const patch = ['*** Begin Patch'];
  for (const [filename, contents] of Object.entries(artifacts)) {
    const target = path.join(outputRoot, filename);
    if (fs.existsSync(target)) patch.push(`*** Delete File: ${target}`);
    patch.push(`*** Add File: ${target}`, ...contents.trimEnd().split('\n').map(line => `+${line}`));
  }
  patch.push('*** End Patch');
  process.stdout.write(patch.join('\n'));
} else process.stdout.write(`${JSON.stringify(validation, null, 2)}\n`);
