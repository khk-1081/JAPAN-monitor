"use strict";

/*
 * JAPAN-monitor：地震情報はP2P地震情報 API v2に接続
 * EEW（予報）はWolfx JMA EEW WebSocket APIに接続
 * 津波情報は画面確認用サンプルです。
 * 地図：国土地理院の白地図＋気象庁の地震情報区域境
 */

const SAMPLE_EARTHQUAKES = [
  {
    id: "sample-1",
    date: "2026/10/17 11:20",
    location: "宮城県沖",
    magnitude: "5.2",
    depth: "40",
    maximum: "4",
    tsunami: "心配なし",
    remarks: "この地震による津波の心配はありません。",
    areaIntensities: {
      222: "4",
      212: "3",
      250: "3",
      242: "2",
      232: "2"
    },
    center: [38.3, 142.0],
    points: [
      { position: [38.27, 140.87], intensity: "4" },
      { position: [38.43, 141.3], intensity: "4" },
      { position: [39.7, 141.15], intensity: "3" },
      { position: [37.75, 140.47], intensity: "3" },
      { position: [38.25, 140.34], intensity: "2" },
      { position: [39.72, 140.1], intensity: "2" }
    ]
  },
  {
    id: "sample-2",
    date: "2026/10/17 10:32",
    location: "茨城県南部",
    magnitude: "3.8",
    depth: "50",
    maximum: "2",
    tsunami: "心配なし",
    remarks: "この地震による津波の心配はありません。",
    areaIntensities: {
      301: "2",
      300: "1",
      331: "1",
      350: "1"
    },
    center: [36.1, 140.1],
    points: [
      { position: [36.08, 140.11], intensity: "2" },
      { position: [36.37, 140.47], intensity: "1" },
      { position: [35.86, 139.65], intensity: "1" },
      { position: [35.68, 139.76], intensity: "1" }
    ]
  },
  {
    id: "sample-3",
    date: "2026/10/17 09:18",
    location: "長野県中部",
    magnitude: "2.5",
    depth: "10",
    maximum: "1",
    tsunami: "心配なし",
    remarks: "この地震による津波の心配はありません。",
    areaIntensities: {
      421: "1"
    },
    center: [36.2, 137.9],
    points: [
      { position: [36.24, 137.97], intensity: "1" }
    ]
  }
];

const SAMPLE_TSUNAMI = {
  title: "大津波警報",
  announced: "2026/10/17 11:25",
  message:
    "大津波警報が発表されています。\n直ちに海岸から離れてください。",
  stations: [
    {
      name: "観測所A",
      position: [39.0, 141.75],
      arrival: "到達中",
      expectedTime: 660,
      expectedHeight: "10m超",
      observedHeight: null,
      grade: "major"
    },
    {
      name: "観測所B",
      position: [38.43, 141.3],
      arrival: "到達中",
      expectedTime: 665,
      expectedHeight: "5m",
      observedHeight: "1.2m",
      grade: "warning"
    },
    {
      name: "観測所C",
      position: [37.83, 140.96],
      arrival: "11:30",
      expectedTime: 690,
      expectedHeight: "5m",
      observedHeight: null,
      grade: "warning"
    },
    {
      name: "観測所D",
      position: [36.94, 140.91],
      arrival: "11:40",
      expectedTime: 700,
      expectedHeight: "1m",
      observedHeight: null,
      grade: "advisory"
    }
  ]
};

const INTENSITY_COLORS = {
  "1": { background: "#87CEEB", color: "#17374d" },
  "2": { background: "#8DB600", color: "#172000" },
  "3": { background: "#F7E200", color: "#302d0a" },
  "4": { background: "#F57C1F", color: "#241a06" },
  "5弱": { background: "#E03927", color: "#fff" },
  "5強": { background: "#B31B1B", color: "#fff" },
  "6弱": { background: "#C2185B", color: "#fff" },
  "6強": { background: "#4B0082", color: "#fff" },
  "7": { background: "#4D1A4F", color: "#fff" }
};

const LONG_PERIOD_COLORS = {
  "1": "#2D6CDF",
  "2": "#FFD400",
  "3": "#E4322B",
  "4": "#5C0A1A"
};

const JMA_AREA_CODE_DATA =
  "石狩地方北部:100|石狩地方中部:101|石狩地方南部:102|渡島地方北部:105|渡島地方東部:106|渡島地方西部:107|檜山地方:110|後志地方北部:115|後志地方東部:116|後志地方西部:117|北海道奥尻島:119|空知地方北部:120|空知地方中部:121" +
  "|空知地方南部:122|上川地方北部:125|上川地方中部:126|上川地方南部:127|留萌地方中北部:130|留萌地方南部:131|宗谷地方北部:135|宗谷地方南部:136|北海道利尻礼文:139|網走地方:140|北見地方:141|紋別地方:142|胆振地方西部:145|" +
  "胆振地方中東部:146|日高地方西部:150|日高地方中部:151|日高地方東部:152|十勝地方北部:155|十勝地方中部:156|十勝地方南部:157|釧路地方北部:160|釧路地方中南部:161|根室地方北部:165|根室地方中部:166|根室地方南部:167|青森県津軽北" +
  "部:200|青森県津軽南部:201|青森県三八上北:202|青森県下北:203|岩手県沿岸北部:210|岩手県沿岸南部:211|岩手県内陸北部:212|岩手県内陸南部:213|宮城県北部:220|宮城県南部:221|宮城県中部:222|秋田県沿岸北部:230|秋田県沿岸南部:23" +
  "1|秋田県内陸北部:232|秋田県内陸南部:233|山形県庄内:240|山形県最上:241|山形県村山:242|山形県置賜:243|福島県中通り:250|福島県浜通り:251|福島県会津:252|茨城県北部:300|茨城県南部:301|栃木県北部:310|栃木県南部:311|群馬" +
  "県北部:320|群馬県南部:321|埼玉県北部:330|埼玉県南部:331|埼玉県秩父:332|千葉県北東部:340|千葉県北西部:341|千葉県南部:342|東京都２３区:350|東京都多摩東部:351|東京都多摩西部:352|神津島:354|伊豆大島:355|新島:356|三" +
  "宅島:357|八丈島:358|小笠原:359|神奈川県東部:360|神奈川県西部:361|新潟県上越:370|新潟県中越:371|新潟県下越:372|新潟県佐渡:375|富山県東部:380|富山県西部:381|石川県能登:390|石川県加賀:391|福井県嶺北:400|福井県嶺南" +
  ":401|山梨県中・西部:411|山梨県東部・富士五湖:412|長野県北部:420|長野県中部:421|長野県南部:422|岐阜県飛騨:430|岐阜県美濃東部:431|岐阜県美濃中西部:432|静岡県伊豆:440|静岡県東部:441|静岡県中部:442|静岡県西部:443|愛知県" +
  "東部:450|愛知県西部:451|三重県北部:460|三重県中部:461|三重県南部:462|滋賀県北部:500|滋賀県南部:501|京都府北部:510|京都府南部:511|大阪府北部:520|大阪府南部:521|兵庫県北部:530|兵庫県南東部:531|兵庫県南西部:532|兵" +
  "庫県淡路島:535|奈良県:540|和歌山県北部:550|和歌山県南部:551|鳥取県東部:560|鳥取県中部:562|鳥取県西部:563|島根県東部:570|島根県西部:571|島根県隠岐:575|岡山県北部:580|岡山県南部:581|広島県北部:590|広島県南東部:591" +
  "|広島県南西部:592|徳島県北部:600|徳島県南部:601|香川県東部:610|香川県西部:611|愛媛県東予:620|愛媛県中予:621|愛媛県南予:622|高知県東部:630|高知県中部:631|高知県西部:632|山口県北部:700|山口県西部:702|山口県東部:70" +
  "3|山口県中部:704|福岡県福岡:710|福岡県北九州:711|福岡県筑豊:712|福岡県筑後:713|佐賀県北部:720|佐賀県南部:721|長崎県北部:730|長崎県南西部:731|長崎県島原半島:732|長崎県対馬:735|長崎県壱岐:736|長崎県五島:737|熊本県阿" +
  "蘇:740|熊本県熊本:741|熊本県球磨:742|熊本県天草・芦北:743|大分県北部:750|大分県中部:751|大分県南部:752|大分県西部:753|宮崎県北部平野部:760|宮崎県北部山沿い:761|宮崎県南部平野部:762|宮崎県南部山沿い:763|鹿児島県薩摩:77" +
  "0|鹿児島県大隅:771|鹿児島県十島村:774|鹿児島県甑島:775|鹿児島県種子島:776|鹿児島県屋久島:777|鹿児島県奄美北部:778|鹿児島県奄美南部:779|沖縄県本島北部:800|沖縄県本島中南部:801|沖縄県久米島:802|沖縄県大東島:803|沖縄県宮古島:" +
  "804|沖縄県石垣島:805|沖縄県与那国島:806|沖縄県西表島:807";

const JMA_STATION_AREA_DATA =
  "石狩市花川:100|石狩市聚富:100|札幌中央区北2条:101|江別市高砂町:101|千歳市北栄:102|新千歳空港:102|恵庭市漁平:102|八雲町上の湯:105|函館市尾札部町:106|函館市美原:106|七飯町桜町:106|渡島森町御幸町:106|渡島松前町福山:107" +
  "|渡島松前町清部:107|知内町小谷石:107|檜山江差町姥神:110|せたな町北檜山区豊岡:110|小樽市勝納町:115|積丹町日司町:115|余市町朝日町:115|倶知安町南1条:116|島牧村江ノ島:117|寿都町新栄:117|岩内町高台:117|奥尻町松江:119|北竜町" +
  "竜西:120|芦別市旭町:121|滝川市大町:121|夕張市若菜:122|岩見沢市5条:122|美唄市西5条:122|士別市朝日町:125|士別市東6条:125|名寄市大通:125|旭川市宮前1条:126|上川地方上川町越路:126|富良野市若松町:127|上富良野町大町:127" +
  "|南富良野町幾寅:127|羽幌町南3条:130|羽幌町焼尻:130|初山別村有明:130|留萌市大町:131|稚内市恵北:135|稚内市開運:135|宗谷枝幸町岬町:136|宗谷枝幸町本町:136|礼文町上泊埼:139|利尻富士町鬼脇:139|網走市台町:140|美幌町東3条:1" +
  "40|斜里町本町:140|北見市公園町:141|北見市常呂町東浜:141|北見市留辺蘂町温根湯温泉:141|紋別市南が丘町:142|遠軽町丸瀬布金湧山:142|雄武町雄武:142|胆振伊達市梅本:145|室蘭市山手町:146|苫小牧市末広町:146|登別市鉱山:146|白老町竹浦" +
  ":146|厚真町鹿沼:146|平取町仁世宇:150|新ひだか町静内山手町:151|新ひだか町静内御園:151|浦河町野深:152|浦河町潮見:152|えりも町本町:152|足寄町上螺湾:155|帯広市東4条:156|十勝清水町南4条:156|幕別町忠類明和:156|本別町北2丁目" +
  ":156|広尾町並木通:157|広尾町白樺通:157|弟子屈町美里:160|釧路市幸町:161|釧路市音別町尺別:161|厚岸町尾幌:161|浜中町湯沸:161|中標津町養老牛:165|標津町古多糠:165|羅臼町春日:165|別海町常盤:166|根室市弥栄:167|根室市豊里:" +
  "167|青森市花園:200|五所川原市栄町:200|五所川原市太田:200|平内町小湊:200|弘前市和田町:201|弘前市弥生:201|鰺ヶ沢町舞戸町鳴戸:201|深浦町長慶平:201|深浦町深浦岡町:201|八戸市島守:202|八戸市湊町:202|七戸町北天間舘:202|六ヶ" +
  "所村尾駮:202|六ヶ所村出戸:202|五戸町古舘:202|むつ市金曲:203|むつ市大畑町奥薬研:203|東通村砂子又蒲谷地:203|宮古市鍬ヶ崎:210|宮古市長沢:210|久慈市川崎町:210|久慈市枝成沢:210|山田町八幡町:210|田野畑村田野畑:210|岩手洋野町種" +
  "市:210|大船渡市大船渡町:211|大船渡市猪川町:211|釜石市只越町:211|盛岡市山王町:212|二戸市福岡:212|雫石町千刈田:212|雫石町西根上駒木野:212|葛巻町葛巻元木:212|八幡平市大更:212|花巻市大迫町:213|北上市柳原町:213|一関市大東町:" +
  "213|奥州市水沢大鐘町:213|気仙沼市赤岩:220|気仙沼市本吉町西川内:220|涌谷町新町裏:220|栗原市栗駒:220|登米市中田町:220|南三陸町志津川:220|大崎市古川三日町:220|大崎市古川大崎:220|仙台空港:221|柴田町船岡:221|丸森町上滝:221" +
  "|仙台青葉区大倉:222|仙台宮城野区五輪:222|石巻市泉町:222|石巻市大瓜:222|松島町高城:222|能代市緑町:230|能代市常盤山谷:230|男鹿市男鹿中:230|五城目町西磯ノ目:230|秋田市山王:231|秋田市雄和女米木:231|由利本荘市石脇:231|大館市" +
  "比内町味噌内:232|北秋田市花園町:232|横手市雄物川町今宿:233|湯沢市沖鶴:233|秋田美郷町六郷東根:233|仙北市角館町中菅沢:233|鶴岡市馬場町:240|鶴岡市温海川:240|酒田市飛島:240|酒田市亀ケ崎:240|遊佐町遊佐:240|遊佐町小原田:240|新" +
  "庄市東谷地田町:241|山形金山町中田:241|山形市緑町:242|河北町西里:242|米沢市駅前:243|米沢市アルカディア:243|山形小国町あけぼの:243|白鷹町黒鴨:243|福島市花園町:250|郡山市朝日:250|白河市郭内:250|大玉村南小屋:250|棚倉町棚倉中" +
  "居野:250|古殿町松川横川:250|田村市船引町:250|いわき市小名浜:251|いわき市三和町:251|川内村下川内:251|浪江町幾世橋:251|南相馬市原町区三島町:251|南相馬市鹿島区栃窪:251|会津若松市材木町:252|西会津町野沢:252|猪苗代町城南:252|" +
  "柳津町大成沢:252|南会津町田島:252|水戸市金町:300|常陸太田市町屋町:300|ひたちなか市山ノ上町:300|常陸大宮市中富町:300|土浦市常名:301|石岡市柿岡:301|茨城鹿嶋市鉢形:301|潮来市堀之内:301|利根町布川:301|坂東市岩井:301|筑西市舟" +
  "生:301|鉾田市鉾田:301|日光市瀬川:310|日光市中宮祠:310|大田原市黒羽田町:310|那須塩原市蟇沼:310|宇都宮市明保野町:311|栃木市旭町:311|益子町益子:311|那須烏山市神長:311|沼田市西倉内町:320|沼田市尾瀬高等学校:320|中之条町日影:" +
  "320|東吾妻町原町:320|前橋市昭和町:321|桐生市錦町:321|富岡市七日市:321|板倉町板倉:321|熊谷市桜町:330|本庄市児玉町:330|久喜市下早見:330|鳩山町大豆戸:330|川越市旭町:331|飯能市下直竹:331|さいたま浦和区高砂:331|秩父市上町" +
  ":332|小鹿野町両神薄:332|銚子市川口町:340|銚子市小畑新町:340|東金市東新宿:340|多古町多古:340|一宮町一宮:340|長南町総合グラウンド:340|香取市佐原平田:340|山武市松尾町富士見台:340|千葉中央区中央港:341|千葉美浜区ひび野:341|成" +
  "田国際空港:341|成田市名古屋:341|柏市旭町:341|浦安市日の出:341|館山市長須賀:342|木更津市太田:342|勝浦市墨名:342|鴨川市八色:342|鴨川市内浦:342|南房総市上堀:342|東京千代田区大手町:350|東京港区海岸:350|東京新宿区西新宿:35" +
  "0|東京墨田区横川:350|東京江東区青海:350|東京国際空港:350|東京杉並区阿佐谷:350|東京江戸川区中央:350|八王子市大横町:351|国分寺市並木町:351|青梅市東青梅:352|神津島村金長:354|伊豆大島町差木地:355|伊豆大島町元町:355|東京利島村東" +
  "山:356|新島村大原:356|新島村式根島:356|三宅村神着:357|三宅村坪田:357|御蔵島村西川:357|八丈町樫立:358|八丈町三根:358|青ヶ島村:358|小笠原村父島西町:359|小笠原村父島三日月山:359|小笠原村母島:359|横浜中区山手町:360|川崎" +
  "中原区小杉陣屋町:360|横須賀市光の丘:360|茅ヶ崎市茅ヶ崎:360|小田原市久野:361|秦野市曽屋:361|湯河原町中央:361|相模原中央区中央:361|相模原緑区若柳:361|甲府市飯田:411|身延町大磯小磯:411|甲州市塩山下於曽:411|大月市大月:412|上" +
  "野原市四方津:412|富士河口湖町船津:412|長野市箱清水:420|長野市松代:420|大町市役所:420|山ノ内町平穏:420|松本市沢村:421|上田市築地:421|諏訪市湖岸通り:421|佐久市下小田切:421|軽井沢町追分:421|安曇野市穂高支所:421|筑北村坂井:" +
  "421|飯田市高羽町:422|伊那市高遠町荊口:422|辰野町中央:422|飯島町飯島:422|泰阜村梨久保:422|糸魚川市一の宮:370|上越市中ノ俣:370|上越市大手町:370|長岡市幸町:371|小千谷市城内:371|出雲崎町米田:371|魚沼市下折立:371|南魚沼市" +
  "六日町:371|村上市塩町:372|五泉市村松乙:372|粟島浦村笹畑:372|阿賀野市畑江:372|胎内市新和町:372|新潟空港:372|新潟中央区美咲町:372|新潟秋葉区程島:372|新潟西蒲区巻仮設庁舎:372|佐渡市相川金山:375|佐渡市相川三町目:375|富山市石" +
  "坂:380|富山市八尾町福島:380|魚津市釈迦堂:380|立山町吉峰:380|富山朝日町道下:380|高岡市伏木:381|小矢部市泉町:381|南砺市天池:381|七尾市本府中町:390|輪島市舳倉島:390|輪島市鳳至町:390|珠洲市三崎町:390|羽咋市柳田町:390|志" +
  "賀町富来領家:390|能登町宇出津:390|金沢市西念:391|小松市小馬出町:391|加賀市直下町:391|津幡町加賀爪:391|福井市豊島:400|勝山市旭町:400|越前市高瀬:400|福井坂井市三国町陣ケ岡:400|敦賀市松栄町:401|福井美浜町新庄:401|高浜町宮崎" +
  ":401|高山市丹生川町森部:430|高山市桐生町:430|飛騨市神岡町殿:430|下呂市森:430|中津川市かやの木町:431|美濃加茂市太田町:431|白川町黒川:431|岐阜市加納二之丸:432|揖斐川町三輪:432|岐阜山県市谷合運動場:432|郡上市八幡町島谷:432|" +
  "熱海市網代:440|伊東市大原:440|下田市加増野:440|南伊豆町石廊崎:440|伊豆市中伊豆グラウンド:440|三島市東本町:441|富士宮市弓沢町:441|富士市富士総合運動公園:441|御殿場市萩原:441|島田市川根町家山:442|島田市元島田:442|静岡駿河区曲金" +
  ":442|静岡清水区千歳町:442|牧之原市鬼女新田:442|掛川市篠場:443|袋井市新屋:443|御前崎市御前崎:443|浜松中央区高丘東:443|浜松浜名区三ヶ日町:443|浜松浜名区滝沢町:443|豊橋市向山:450|新城市乗本:450|新城市作手清岳:450|田原市石神" +
  "町:450|田原市福江町:450|名古屋千種区日和町:451|岡崎市若宮町:451|一宮市千秋:451|豊田市小坂本町:451|豊田市大洞町:451|西尾市一色町:451|中部国際空港:451|常滑市飛香台:451|南知多町豊浜:451|愛西市稲葉町:451|四日市市日永:460" +
  "|鈴鹿市西条:460|津市島崎町:461|津市片田薬王寺町:461|松阪市上川町:461|伊賀市緑ケ丘本町:461|尾鷲市南陽町:462|三重御浜町寺谷総合公園:462|三重紀北町十須:462|伊勢市矢持町:462|志摩市志摩町越賀:462|彦根市城町:500|大津市御陵町:50" +
  "1|大津市南小松:501|近江八幡市桜宮町:501|甲賀市水口町:501|東近江市君ヶ畑町:501|福知山市内記:510|舞鶴市下福井:510|京丹後市弥栄町吉沢:510|京都中京区西ノ京:511|宇治市宇治琵琶:511|亀岡市安町:511|京丹波町坂原:511|大阪中央区大手前" +
  ":520|大阪国際空港:520|高槻市桃園町:520|箕面市箕面:520|岸和田市岸城町:521|富田林市本町:521|関西国際空港:521|大阪堺市中区深井清水町:521|豊岡市桜町:530|兵庫香美町香住区三川:530|朝来市和田山町枚田:530|神戸中央区脇浜:531|明石" +
  "市中崎:531|西宮市宮前町:531|加古川市加古川町:531|三木市細川町:531|三田市下深田:531|加西市下万願寺町:531|丹波篠山市北新町:531|加東市社:531|姫路市神子岡前:532|相生市旭:532|宍粟市山崎町中広瀬:532|洲本市物部:535|南あわじ市福" +
  "良:535|淡路市長澤:535|淡路市富島:535|奈良市西紀寺町:540|桜井市初瀬:540|平群町鳴川:540|大淀町桧垣本:540|天川村洞川:540|和歌山市男野芝丁:550|海南市下津:550|有田市箕島:550|有田市初島町:550|湯浅町青木:550|御坊市薗:550|高野町高野山中学校:550|みなべ町土井:550|紀の川市" +
  "粉河:550|田辺市中辺路町近露:551|新宮市新宮:551|白浜町消防本部:551|串本町潮岬:551|古座川町高池:551|鳥取市吉方:560|岩美町浦富:560|智頭町智頭:560|倉吉市岩倉長峯:562|米子市博労町:563|境港市東本町:563|松江市西津田:570|出" +
  "雲市今市町:570|出雲市坂浦町:570|雲南市大東町大東:570|浜田市大辻町:571|益田市匹見町石谷:571|島根美郷町君谷:571|隠岐の島町西町:575|隠岐の島町山田:575|津山市林田:580|新見市新見:580|美作市尾谷:580|倉敷市新田:581|備前市伊部:" +
  "581|赤磐市上市:581|浅口市天草公園:581|岡山北区桑田町:581|岡山北区足守:581|広島三次市十日市中:590|庄原市西城町熊野:590|北広島町都志見:590|北広島町有田:590|三原市円一町:591|広島空港:591|福山市松永町:591|広島中区上八丁堀:5" +
  "92|呉市宝町:592|呉市音戸中学校:592|東広島市黒瀬町:592|萩市土原:700|萩市見島宇津:700|下関市竹崎:702|下関市豊浦町川棚:702|宇部市野中:702|岩国市今津:703|田布施町下田布施:703|山口市前町:704|防府市寿:704|下松市瀬戸:704" +
  "|徳島市大和町:600|鳴門市撫養町:600|吉野川市鴨島町:600|美馬市穴吹ふれスポ公園:600|美馬市脇町:600|徳島三好市池田町サラダ:600|阿南市富岡町:601|那賀町横石:601|高松空港:610|高松市伏石町:610|東かがわ市西村:610|土庄町淵崎:610|" +
  "坂出市王越町:611|観音寺市坂本町:611|多度津町家中:611|今治市南宝来町二丁目:620|新居浜市一宮町:620|西条市丹原町鞍瀬:620|松山市北持田町:621|宇和島市住吉町:622|八幡浜市広瀬:622|大洲市豊茂:622|西予市野村町:622|愛媛鬼北町成川:62" +
  "2|室戸市吉良川町:630|室戸市室戸岬町:630|安芸市西浜:630|高知市本町:631|高知市春野町芳原:631|須崎市山手町:631|香美市土佐山田町宝町:631|香美市物部町神池:631|宿毛市小筑紫町田ノ浦:632|土佐清水市有永:632|土佐清水市足摺岬:632|四万" +
  "十町窪川中津川:632|黒潮町入野:632|福岡空港:710|福岡中央区大濠:710|福岡早良区板屋:710|福津市手光:710|糸島市志摩初:710|北九州八幡東区桃園:711|苅田町若久:711|飯塚市川島:712|福智町上野:712|大牟田市笹林:713|久留米市津福本町:" +
  "713|八女市黒木町北木屋:713|筑前町下高場:713|唐津市西城内:720|佐賀市駅前中央:721|太良町多良:721|嬉野市不動山:721|佐世保市干尽町:730|平戸市岩の上町:730|長崎市南山手:731|長崎市黒浜町:731|長崎市長浦町:731|諫早市東小路町:73" +
  "1|雲仙市国見町:732|雲仙市小浜町雲仙:732|長崎対馬市厳原町東里:735|長崎対馬市上県町飼所:735|長崎対馬市美津島町鴨居瀬:735|壱岐市芦辺町中野:736|五島市富江町繁敷:737|五島市木場町:737|南阿蘇村中松:740|八代市平山新町:741|八代市泉町:7" +
  "41|玉名市築地:741|宇城市松橋町:741|熊本西区春日:741|人吉市西間下町:742|多良木町多良木:742|芦北町芦北:743|上天草市大矢野町:743|天草市本町:743|天草市牛深町:743|中津市上宮永:750|国東市国見町西方寺:750|国東市鶴川:750|大分" +
  "市明野北:751|別府市鶴見:751|別府市天間:751|臼杵市乙見:751|佐伯市蒲江蒲江浦:752|佐伯市堅田:752|佐伯市蒲江猪串浦:752|豊後大野市三重町:752|日田市中津江村合瀬:753|日田市三本松:753|玖珠町帆足:753|延岡市天神小路:760|延岡市北方" +
  "総合運動公園:760|日向市亀崎:760|日向市大王谷運動公園:760|新富町上富田:760|宮崎都農町川北:760|高千穂町三田井:761|宮崎市霧島:762|日南市油津:762|日南市北郷町大藤:762|串間市奈留:762|都城市菖蒲原:763|都城市高崎町江平:763|小林" +
  "市真方:763|鹿児島市東郡元:770|鹿児島市下福元:770|枕崎市高見町:770|阿久根市赤瀬川:770|指宿市山川新生町:770|薩摩川内市中郷:770|さつま町宮之城屋地:770|霧島市隼人町内山田:770|鹿児島空港:770|伊佐市大口山野:770|鹿屋市新栄町:771" +
  "|錦江町田代麓:771|志布志市志布志町志布志:771|鹿児島十島村中之島徳之尾:774|薩摩川内市下甑町青瀬:775|西之表市住吉:776|西之表市西之表:776|南種子町中之下:776|屋久島町小瀬田:777|屋久島町口永良部島池田:777|屋久島町平内:777|瀬戸内町西古" +
  "見:778|龍郷町屋入:778|喜界町滝川:778|奄美市名瀬矢之脇町:778|天城町当部:779|和泊町国頭:779|知名町瀬利覚:779|与論町麦屋:779|名護市宮里:800|名護市豊原:800|国頭村奥:800|粟国村浜:800|伊平屋村我喜屋:800|那覇市樋川:801" +
  "|那覇空港:801|読谷村座喜味:801|南城市玉城字玉城:801|久米島町山城:802|久米島町謝名堂:802|南大東村在所:803|南大東村池之沢:803|北大東村黄金山:803|多良間村塩川:804|宮古島市平良下里:804|宮古島市城辺福北:804|宮古島市平良池間:80" +
  "4|宮古島市上野新里:804|宮古島市伊良部前里添:804|石垣市登野城:805|石垣市新川:805|石垣市平久保:805|与那国町祖納:806|与那国町久部良:806|竹富町大原:807|竹富町黒島:807|竹富町波照間:807|竹富町上原小学校:807";

function decodeLookupData(data) {
  return new Map(data.split("|").map((entry) => {
    const separator = entry.lastIndexOf(":");
    return [entry.slice(0, separator), Number(entry.slice(separator + 1))];
  }));
}

const JMA_AREA_CODE_BY_NAME = decodeLookupData(JMA_AREA_CODE_DATA);
const JMA_STATION_AREA_BY_NAME = decodeLookupData(JMA_STATION_AREA_DATA);
const EPSP_AREA_DATA =
  "10:北海道 石狩:43.062:141.354|15:北海道 渡島:41.82:140.753|20:北海道 檜山:41.859:140.128|25:北海道 後志:42.902:140.756|30:北海道 空知:4" +
  "3.198:141.767|35:北海道 上川:43.808:142.439|40:北海道 留萌:43.935:141.656|45:北海道 宗谷:45.398:141.7|50:北海道 網走:44.027:144.26" +
  "1|55:北海道 胆振:42.321:140.972|60:北海道 日高:42.173:142.768|65:北海道 十勝:42.93:143.208|70:北海道 釧路:42.977:144.345|75:北海道 根室" +
  ":43.33:145.585|100:青森津軽:40.759:140.428|105:青森三八上北:40.61:141.325|106:青森下北:41.293:141.183|110:岩手沿岸北部:39.843:141." +
  "796|111:岩手沿岸南部:39.082:141.709|115:岩手内陸:39.702:141.154|120:宮城北部:38.54:141.128|125:宮城南部:38.172:140.892|130:秋田沿岸:" +
  "39.72:140.104|135:秋田内陸:39.7:140.731|140:山形庄内:38.727:139.827|141:山形最上:38.765:140.302|142:山形村山:38.255:140.34|143" +
  ":山形置賜:37.922:140.117|150:福島中通り:37.401:140.36|151:福島浜通り:37.449:141.013|152:福島会津:37.46:139.841|200:茨城北部:36.457:1" +
  "40.486|205:茨城南部:36.083:140.076|210:栃木北部:36.961:140.046|215:栃木南部:36.426:139.803|220:群馬北部:36.678:138.999|225:群馬南" +
  "部:36.389:139.063|230:埼玉北部:36.147:139.388|231:埼玉南部:35.925:139.485|232:埼玉秩父:35.991:139.085|240:千葉北東部:35.707:140." +
  "564|241:千葉北西部:35.607:140.106|242:千葉南部:35.33:139.902|250:東京:35.699:139.502|255:伊豆諸島北部:34.377:139.257|260:伊豆諸島南部" +
  ":34.075:139.479|265:小笠原:27.094:142.191|270:神奈川東部:35.443:139.638|275:神奈川西部:35.348:139.139|300:新潟上越:37.147:138.2" +
  "36|301:新潟中越:37.446:138.851|302:新潟下越:37.948:139.327|305:新潟佐渡:38.018:138.368|310:富山東部:36.827:137.409|315:富山西部:36" +
  ".647:136.962|320:石川能登:37.39:136.899|325:石川加賀:36.561:136.656|330:福井嶺北:35.956:136.184|335:福井嶺南:35.461:135.857|34" +
  "0:山梨東部:35.551:138.905|345:山梨中・西部:35.608:138.464|350:長野北部:36.648:138.194|351:長野中部:36.238:137.972|355:長野南部:35.55" +
  "1:137.878|400:岐阜飛騨:36.146:137.252|405:岐阜美濃:35.544:136.907|410:静岡伊豆:34.976:138.946|411:静岡東部:35.161:138.676|415:" +
  "静岡中部:34.867:138.257|416:静岡西部:34.717:137.851|420:愛知東部:34.898:137.497|425:愛知西部:35.053:137.012|430:三重北中部:34.881:1" +
  "36.584|435:三重南部:34.211:136.337|440:滋賀北部:35.38:136.278|445:滋賀南部:35.067:136.025|450:京都北部:35.474:135.385|455:京都南部" +
  ":35.011:135.768|460:大阪北部:34.816:135.568|465:大阪南部:34.483:135.423|470:兵庫北部:35.544:134.82|475:兵庫南部:34.853:134.931" +
  "|480:奈良:34.396:135.857|490:和歌山北部:34.065:135.254|495:和歌山南部:33.678:135.348|500:鳥取東部:35.501:134.235|505:鳥取中・西部:35" +
  ".495:133.693|510:島根東部:35.367:132.754|515:島根西部:34.899:132.079|514:島根隠岐:36.209:133.321|520:岡山北部:35.069:134.004|5" +
  "25:岡山南部:34.655:133.919|530:広島北部:34.666:132.704|535:広島南部:34.341:132.907|540:山口北部:34.408:131.399|545:山口中・東部:34.0" +
  "5:131.804|541:山口西部:33.957:130.941|550:徳島北部:34.025:134.259|555:徳島南部:33.734:134.535|560:香川:34.342:134.046|570:愛媛" +
  "東予:33.919:133.181|575:愛媛中予:33.839:132.765|576:愛媛南予:33.362:132.51|580:高知東部:33.424:134.02|581:高知中部:33.559:133.52" +
  "9|582:高知西部:32.991:132.933|600:福岡福岡:33.59:130.401|601:福岡北九州:33.883:130.875|602:福岡筑豊:33.646:130.691|605:福岡筑後:33." +
  "319:130.508|610:佐賀北部:33.45:129.968|615:佐賀南部:33.181:130.143|620:長崎北部:33.179:129.715|625:長崎南部:32.843:130.053|630" +
  ":長崎壱岐・対馬:34.202:129.287|635:長崎五島:32.695:128.84|640:熊本阿蘇:32.951:131.12|641:熊本熊本:32.803:130.707|645:熊本球磨:32.24:1" +
  "30.897|646:熊本天草・芦北:32.233:130.439|650:大分北部:33.531:131.349|651:大分中部:33.239:131.609|655:大分西部:33.228:131.188|656:" +
  "大分南部:32.959:131.9|660:宮崎北部平野部:32.422:131.624|661:宮崎北部山沿い:32.467:131.158|665:宮崎南部平野部:31.601:131.378|666:宮崎南部山沿い" +
  ":31.928:131.007|670:鹿児島薩摩:31.813:130.304|675:鹿児島大隅:31.378:130.852|680:種子島・屋久島:30.732:130.996|685:鹿児島奄美:28.377:" +
  "129.493|700:沖縄本島北部:26.591:127.977|701:沖縄本島中南部:26.281:127.778|702:沖縄久米島:26.349:126.747|705:沖縄八重山:24.286:123.881" +
  "|706:沖縄宮古島:24.805:125.281|710:沖縄大東島:25.828:131.232";

const EPSP_AREA_BY_CODE = new Map(
  EPSP_AREA_DATA.split("|").map((entry) => {
    const [code, name, latitude, longitude] = entry.split(":");
    return [
      Number(code),
      {
        code: Number(code),
        name,
        position: [Number(latitude), Number(longitude)]
      }
    ];
  })
);

const JMA_SCALE_TO_INTENSITY = new Map([
  [10, "1"], [20, "2"], [30, "3"], [40, "4"],
  [45, "5弱"], [50, "5強"], [55, "6弱"], [60, "6強"], [70, "7"]
]);

function normalizeJmaName(value) {
  return String(value || "").normalize("NFKC").replace(/[\s　]/g, "");
}

function jmaAreaCodeForStation(name) {
  const normalizedName = normalizeJmaName(name);
  const exactMatch = JMA_STATION_AREA_BY_NAME.get(normalizedName);
  if (exactMatch) return exactMatch;

  const municipalityMatch = normalizedName.match(/^.*?(?:市|区|町|村)/);
  if (!municipalityMatch) return null;

  const municipalityName = municipalityMatch[0];
  const areaCodes = new Set(
    [...JMA_STATION_AREA_BY_NAME.entries()]
      .filter(([stationName]) => stationName.startsWith(municipalityName))
      .map(([, areaCode]) => areaCode)
  );
  return areaCodes.size === 1 ? [...areaCodes][0] : null;
}

function jmaScaleToIntensity(scale) {
  return JMA_SCALE_TO_INTENSITY.get(Math.trunc(Number(scale))) || null;
}

function intensityRank(intensity) {
  return ["1", "2", "3", "4", "5弱", "5強", "6弱", "6強", "7"].indexOf(intensity);
}

function normalizeP2PQuake(data) {
  const source = data.earthquake || {};
  const hypocenter = source.hypocenter || {};
  const areaIntensities = {};
  const unmatched = [];

  (data.points || []).forEach((point) => {
    const name = normalizeJmaName(point.addr);
    const areaCode = point.isArea
      ? JMA_AREA_CODE_BY_NAME.get(name)
      : jmaAreaCodeForStation(name);
    const intensity = jmaScaleToIntensity(point.scale);
    if (!areaCode || !intensity) {
      if (!areaCode && name) unmatched.push(name);
      return;
    }
    const current = areaIntensities[areaCode];
    if (!current || intensityRank(intensity) > intensityRank(current)) {
      areaIntensities[areaCode] = intensity;
    }
  });

  const latitude = Number(hypocenter.latitude);
  const longitude = Number(hypocenter.longitude);
  const hasCenter = Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  const tsunamiText = {
    None: "心配なし", Unknown: "不明", Checking: "調査中",
    NonEffective: "若干の海面変動", Watch: "津波注意報", Warning: "津波警報"
  }[source.domesticTsunami] || "情報なし";
  const issueTime = data.issue?.time || data.time || "";
  const eventKey = earthquakeEventKey(data);

  const maximum =
    jmaScaleToIntensity(source.maxScale) ||
    Object.values(areaIntensities).sort(
      (a, b) => intensityRank(b) - intensityRank(a)
    )[0] ||
    "不明";

  if (unmatched.length) {
    console.debug("区域に対応しなかった観測点:", [...new Set(unmatched)]);
  }

  return {
    id: eventKey,
    eventKey,
    issueTime,
    date: source.time || issueTime,
    location: hypocenter.name || "震源情報なし",
    magnitude: formatMagnitude(hypocenter.magnitude),
    depth: Number(hypocenter.depth) >= 0 ? String(hypocenter.depth) : "不明",
    maximum,
    tsunami: tsunamiText,
    remarks: data.comments?.freeFormComment || "",
    areaIntensities,
    center: hasCenter ? [latitude, longitude] : null,
    points: [],
    observationPoints: (data.points || [])
      .filter((point) => !point.isArea)
      .map((point) => ({
        address: normalizeJmaName(point.addr),
        intensity: jmaScaleToIntensity(point.scale)
      }))
      .filter((point) => point.address && point.intensity),
    live: true
  };
}

function earthquakeEventKey(data) {
  const earthquake = data.earthquake || {};
  const hypocenter = earthquake.hypocenter || {};
  const originTime = String(earthquake.time || "").trim();
  const latitude = Number(hypocenter.latitude);
  const longitude = Number(hypocenter.longitude);
  const location = String(hypocenter.name || "震源情報なし").trim();

  // 続報は情報ごとに data.id が変わるため、発生時刻と震央で地震を識別する。
  if (originTime) return `origin:${originTime}`;
  return [
    data.id || data.time || "unknown",
    location,
    Number.isFinite(latitude) ? latitude : "",
    Number.isFinite(longitude) ? longitude : ""
  ].join("|");
}

function upsertEarthquakeHistory(data, shouldRender = true) {
  const earthquake = normalizeP2PQuake(data);
  const existingIndex = earthquakeHistory.findIndex(
    (item) => item.eventKey === earthquake.eventKey
  );

  if (existingIndex < 0) {
    earthquakeHistory.push(earthquake);
  } else {
    const existing = earthquakeHistory[existingIndex];
    const existingIssueTime = parseJmaTime(existing.issueTime);
    const nextIssueTime = parseJmaTime(earthquake.issueTime);
    if (nextIssueTime >= existingIssueTime) {
      earthquakeHistory[existingIndex] = {
        ...earthquake,
        // 震源情報などの続報は震度観測点を含まないことがある。
        // その場合、既に届いた震度データを空で消さずに引き継ぐ。
        areaIntensities: Object.keys(earthquake.areaIntensities).length
          ? earthquake.areaIntensities
          : existing.areaIntensities,
        observationPoints: earthquake.observationPoints.length
          ? earthquake.observationPoints
          : existing.observationPoints,
        center: earthquake.center || existing.center,
        maximum: earthquake.maximum === "不明"
          ? existing.maximum
          : earthquake.maximum,
        location: earthquake.location === "震源情報なし"
          ? existing.location
          : earthquake.location,
        magnitude: earthquake.magnitude === "不明"
          ? existing.magnitude
          : earthquake.magnitude,
        depth: earthquake.depth === "不明"
          ? existing.depth
          : earthquake.depth,
        tsunami: earthquake.tsunami === "情報なし"
          ? existing.tsunami
          : earthquake.tsunami,
        id: existing.id,
        eventKey: existing.eventKey
      };
    } else if (
      Object.keys(earthquake.areaIntensities).length >
      Object.keys(existing.areaIntensities).length
    ) {
      // 発表時刻が同じでも、より詳細な震度情報があれば残す。
      earthquakeHistory[existingIndex] = {
        ...existing,
        ...earthquake,
        issueTime: existing.issueTime
      };
    }
  }

  earthquakeHistory.sort(
    (a, b) => parseJmaTime(b.issueTime) - parseJmaTime(a.issueTime)
  );
  earthquakeHistory.splice(100);
  if (shouldRender) renderEarthquakeHistory();
  return earthquakeHistory.find((item) => item.eventKey === earthquake.eventKey) || earthquake;
}

function parseJmaTime(value) {
  const match = String(value || "").match(
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/
  );
  if (!match) return 0;

  const [, year, month, day, hour, minute, second = "0"] = match;
  return new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` +
    `T${hour.padStart(2, "0")}:${minute}:${second}+09:00`
  ).getTime();
}

function wolfxEEWCenter(data) {
  const latitude = Number(data.Latitude);
  const longitude = Number(data.Longitude);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    (latitude === 0 && longitude === 0)
  ) {
    return null;
  }
  return [latitude, longitude];
}

function normalizeWolfxEEW(data) {
  const warnAreas = Array.isArray(data.WarnArea) ? data.WarnArea : [];
  const forecastAreas = [...new Set(
    warnAreas
      .filter((area) => area && area.Chiiki)
      .map((area) => String(area.Chiiki).trim())
      .filter(Boolean)
  )];
  const warningAreas = [...new Set(
    warnAreas
      .filter((area) => {
        const type = String(area?.Type || "").toLowerCase();
        return type.includes("警報") || type.includes("warning");
      })
      .map((area) => String(area.Chiiki || "").trim())
      .filter(Boolean)
  )];
  const magnitude = Number(data.Magnitude ?? data.Magunitude);
  const depth = Number(data.Depth);

  return {
    eventId: String(data.EventID || ""),
    serial: Number.isFinite(Number(data.Serial)) ? Number(data.Serial) : 0,
    announcedTime: String(data.AnnouncedTime || ""),
    originTime: String(data.OriginTime || ""),
    location: String(data.Hypocenter || "震央地名不明"),
    center: wolfxEEWCenter(data),
    magnitude: Number.isFinite(magnitude) && magnitude > 0
      ? formatMagnitude(magnitude)
      : "不明",
    depth: Number.isFinite(depth) && depth >= 0 ? String(depth) : "不明",
    maximum: String(data.MaxIntensity || "不明"),
    forecastAreas,
    warningAreas,
    isFinal: Boolean(data.isFinal),
    isAssumption: Boolean(data.isAssumption),
    isWarn: Boolean(data.isWarn),
    issueStatus: String(data.Issue?.Status || ""),
    receivedAt: Date.now(),
    live: true
  };
}

function addRecentEEWInformation(eew) {
  const id = `wolfx-eew-${eew.eventId}-${eew.serial}-${eew.announcedTime}`;
  if (recentIncomingInformationIds.has(id)) return;
  recentIncomingInformationIds.add(id);

  const timeMatch = eew.announcedTime.match(/\b\d{1,2}:\d{2}:\d{2}/);
  recentIncomingInformation.push({
    id,
    kind: "eew",
    category: "緊急地震速報",
    payload: {
      ...eew,
      forecastAreas: [...eew.forecastAreas],
      warningAreas: [...eew.warningAreas]
    },
    receivedAt: timeMatch ? timeMatch[0] : "時刻不明",
    fullTime: eew.announcedTime || "発表時刻不明",
    receivedTimestamp: parseJmaTime(eew.announcedTime),
    title: `EEW（${eew.isWarn ? "警報" : "予報"}）第${eew.serial || "?"}報`
  });
  recentIncomingInformation.sort(
    (a, b) => b.receivedTimestamp - a.receivedTimestamp
  );
  recentIncomingInformation.splice(2);
  renderRecentInformation();
}

function receiveWolfxMessage(data) {
  if (!data || data.type === "heartbeat" || data.type === "pong") return;
  if (data.type && data.type !== "jma_eew") return;
  if (!data.EventID && !data.isCancel) return;
  if (data.isTraining) return;

  const eventId = String(data.EventID || "");
  if (data.isCancel) {
    if (state.currentEEW?.eventId === eventId) {
      state.currentEEW = null;
      state.earthquakeMode = "normal";
      state.activeTab = "earthquake";
      render();
    }
    return;
  }

  const eew = normalizeWolfxEEW(data);
  const current = state.currentEEW;
  if (
    current &&
    current.eventId === eew.eventId &&
    (
      current.serial > eew.serial ||
      (
        current.serial === eew.serial &&
        current.announcedTime === eew.announcedTime &&
        current.isWarn === eew.isWarn
      )
    )
  ) {
    return;
  }

  state.currentEEW = eew;
  state.selectedIncomingInformation = null;
  state.activeTab = "earthquake";
  state.earthquakeMode = eew.isWarn ? "warning" : "forecast";
  state.eewStartedAt = performance.now();
  addRecentEEWInformation(eew);
  render();
}

function shakingEvaluationAreas(data) {
  return Object.entries(data.area_confidences || {})
    .map(([areaCode, evaluation]) => {
      const area = EPSP_AREA_BY_CODE.get(Number(areaCode));
      const count = Number(evaluation?.count);
      const confidence = Number(evaluation?.confidence);
      const display = String(evaluation?.display || "").trim();
      if (
        !area ||
        !Number.isFinite(count) ||
        count <= 0 ||
        !Number.isFinite(confidence) ||
        confidence < 0 ||
        display.toUpperCase() === "F" ||
        display.includes("非表示")
      ) {
        return null;
      }

      return {
        ...area,
        count,
        confidence,
        display
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence || b.count - a.count);
}

function receiveShakingEvaluation(data) {
  const eventKey = String(data.started_at || data.id || data.time || "");
  const globalConfidence = Number(data.confidence);
  const areas = globalConfidence > 0 ? shakingEvaluationAreas(data) : [];
  const previousCodes = state.shakingAreas.map((area) => area.code).join(",");
  const nextCodes = areas.map((area) => area.code).join(",");

  state.focusShakingReports =
    state.shakingEventKey !== eventKey || previousCodes !== nextCodes;
  state.shakingEventKey = eventKey;
  state.shakingAreas = areas;
  state.shakingUpdatedAt = Date.now();

  if (areas.length && !state.currentEEW) {
    state.earthquakeMode = "sensing";
  } else if (!areas.length && state.earthquakeMode === "sensing") {
    state.earthquakeMode = "normal";
  }

  if (
    state.earthquakeMode === "sensing" ||
    state.activeTab !== "earthquake"
  ) {
    state.activeTab = "earthquake";
    render();
    return;
  }

  renderShakingReports();
}

function receiveP2PMessage(data) {
  if (!data) return;
  if (data.code === 9611) {
    receiveShakingEvaluation(data);
    return;
  }
  if (data.code !== 551 || !data.earthquake) return;
  if (data.id && receivedP2PIds.has(data.id)) return;
  if (data.id) {
    receivedP2PIds.add(data.id);
    if (receivedP2PIds.size > 500) {
      receivedP2PIds.delete(receivedP2PIds.values().next().value);
    }
  }

  const issueTime = parseJmaTime(data.issue?.time || data.time);
  addRecentIncomingInformation(data);
  const earthquake = upsertEarthquakeHistory(data);
  if (issueTime && issueTime < state.latestQuakeIssueTime) return;

  state.latestQuakeIssueTime = issueTime || state.latestQuakeIssueTime;
  state.latestEarthquakeId = earthquake.id;
  state.selectedEarthquake = earthquake;
  state.selectedIncomingInformation = null;
  state.currentEEW = null;
  state.activeTab = "earthquake";
  state.earthquakeMode = "normal";
  render();
}

async function loadLatestP2PQuake() {
  try {
    const response = await fetch(
      "https://api.p2pquake.net/v2/history?codes=551&limit=100",
      { cache: "no-store" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const messages = await response.json();
    const quakeMessages = messages
      .filter((message) => message.code === 551 && message.earthquake)
      .sort((a, b) =>
        parseJmaTime(a.issue?.time || a.time) -
        parseJmaTime(b.issue?.time || b.time)
      );

    quakeMessages.forEach((message) =>
      upsertEarthquakeHistory(message, false)
    );
    quakeMessages.slice(-2).forEach(addRecentIncomingInformation);
    renderRecentInformation();

    const latest = [...quakeMessages].sort((a, b) =>
      parseJmaTime(b.issue?.time || b.time) -
      parseJmaTime(a.issue?.time || a.time)
    )[0];

    state.earthquakeHistoryLoaded = true;
    renderEarthquakeHistory();
    if (latest && !state.currentEEW) receiveP2PMessage(latest);
    quakeMessages.forEach((message) => {
      if (message.id) receivedP2PIds.add(message.id);
    });
    while (receivedP2PIds.size > 500) {
      receivedP2PIds.delete(receivedP2PIds.values().next().value);
    }
  } catch (error) {
    console.warn("P2P地震情報の初期取得に失敗しました。", error);
    state.earthquakeHistoryLoaded = true;
    renderEarthquakeHistory();
  }
}

function connectP2PRealtime() {
  if (
    p2pSocket &&
    (p2pSocket.readyState === WebSocket.OPEN ||
      p2pSocket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  const socket = new WebSocket("wss://api.p2pquake.net/v2/ws");
  p2pSocket = socket;

  socket.addEventListener("open", () => {
    p2pReconnectDelay = 1000;
    p2pConnected = true;
    updateConnectionStatus();
  });

  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      if (Array.isArray(message)) {
        message.forEach(receiveP2PMessage);
      } else {
        receiveP2PMessage(message);
      }
    } catch (error) {
      console.warn("P2P地震情報を読み取れませんでした。", error);
    }
  });

  socket.addEventListener("close", () => {
    if (p2pSocket !== socket) return;
    p2pSocket = null;
    p2pConnected = false;
    updateConnectionStatus();
    clearTimeout(p2pReconnectTimer);
    p2pReconnectTimer = setTimeout(connectP2PRealtime, p2pReconnectDelay);
    p2pReconnectDelay = Math.min(p2pReconnectDelay * 2, 30000);
  });

  socket.addEventListener("error", () => socket.close());
}

function connectWolfxRealtime() {
  if (
    wolfxSocket &&
    (wolfxSocket.readyState === WebSocket.OPEN ||
      wolfxSocket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  const socket = new WebSocket("wss://ws-api.wolfx.jp/jma_eew");
  wolfxSocket = socket;

  socket.addEventListener("open", () => {
    wolfxReconnectDelay = 1000;
    wolfxConnected = true;
    updateConnectionStatus();
  });

  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      if (Array.isArray(message)) {
        message.forEach(receiveWolfxMessage);
      } else {
        receiveWolfxMessage(message);
      }
    } catch (error) {
      console.warn("Wolfx EEWを読み取れませんでした。", error);
    }
  });

  socket.addEventListener("close", () => {
    if (wolfxSocket !== socket) return;
    wolfxSocket = null;
    wolfxConnected = false;
    updateConnectionStatus();
    clearTimeout(wolfxReconnectTimer);
    wolfxReconnectTimer = setTimeout(
      connectWolfxRealtime,
      wolfxReconnectDelay
    );
    wolfxReconnectDelay = Math.min(wolfxReconnectDelay * 2, 30000);
  });

  socket.addEventListener("error", () => socket.close());
}

const TSUNAMI_COLORS = {
  major: "#a000cf",
  warning: "#e53b32",
  advisory: "#ddc700"
};

const state = {
  activeTab: "earthquake",
  earthquakeMode: "normal",
  selectedEarthquake: SAMPLE_EARTHQUAKES[0],
  latestEarthquakeId: SAMPLE_EARTHQUAKES[0].id,
  eewStartedAt: 0,
  currentEEW: null,
  shakingEventKey: "",
  shakingAreas: [],
  shakingUpdatedAt: 0,
  focusShakingReports: false,
  latestQuakeIssueTime: 0,
  earthquakeHistoryLoaded: false,
  selectedIncomingInformation: null
};

const recentIncomingInformation = [];
const recentIncomingInformationIds = new Set();
const earthquakeHistory = [];

const panel = document.getElementById("information-panel");
const sidebar = document.querySelector(".sidebar");
const recentSection = document.getElementById("recent-section");
const recentList = document.getElementById("recent-list");
const caption = document.getElementById("map-caption");
const legend = document.getElementById("map-legend");
const mapError = document.getElementById("map-error");
const historyDialog = document.getElementById("history-dialog");
const connectionStatus = document.getElementById("connection-status");
const dataSourceBadge = document.getElementById("data-source-badge");

let map = null;
let overlay = null;
let shakingReportLayer = null;
let intensityAreaLayer = null;
let municipalityIntensityLayer = null;
const regionFeaturesByCode = new Map();
const regionFeatureLoads = new Map();
const municipalityFeaturesByCode = new Map();
const municipalityFeatureLoads = new Map();
const MUNICIPALITY_ZOOM_THRESHOLD = 9;
const EARTHQUAKE_MAX_ZOOM = MUNICIPALITY_ZOOM_THRESHOLD - 1;

function isEarthquakeMapActive() {
  return state.activeTab === "earthquake" && (
    state.earthquakeMode === "normal" ||
    (
      state.earthquakeMode === "incoming" &&
      state.selectedIncomingInformation?.kind === "earthquake"
    )
  );
}
const INTENSITY_FILL_OPACITY = 0.72;
const P_WAVE_SPEED_KM_S = 7;
const S_WAVE_SPEED_KM_S = 4;
let municipalityIndexPromise = null;
let intensityRenderSequence = 0;
let pWave = null;
let sWave = null;
let p2pSocket = null;
let p2pReconnectTimer = null;
let p2pReconnectDelay = 1000;
let p2pConnected = false;
let wolfxSocket = null;
let wolfxReconnectTimer = null;
let wolfxReconnectDelay = 1000;
let wolfxConnected = false;
const receivedP2PIds = new Set();

function updateConnectionStatus() {
  if (!connectionStatus) return;

  if (p2pConnected && wolfxConnected) {
    connectionStatus.textContent = "● P2P・Wolfx 接続中";
    connectionStatus.style.color = "#26843b";
  } else if (p2pConnected || wolfxConnected) {
    connectionStatus.textContent = p2pConnected
      ? "● P2P接続中・Wolfx再接続中"
      : "● Wolfx接続中・P2P再接続中";
    connectionStatus.style.color = "#8a652a";
  } else {
    connectionStatus.textContent = "● 再接続中…";
    connectionStatus.style.color = "#a22d25";
  }
}

function openBoundaryDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("このブラウザーでは地図データを保存できません"));
      return;
    }

    const request = indexedDB.open("japan-monitor-map", 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("boundaries")) {
        database.createObjectStore("boundaries", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readCachedJmaRegion(code) {
  const database = await openBoundaryDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("boundaries", "readonly");
    const request = transaction.objectStore("boundaries").get(`jma-area-20240520-${code}`);
    request.onsuccess = () => resolve(request.result?.feature || null);
    request.onerror = () => reject(request.error);
  });
}

async function cacheJmaRegion(code, feature) {
  const database = await openBoundaryDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("boundaries", "readwrite");
    transaction.objectStore("boundaries").put({
      id: `jma-area-20240520-${code}`,
      feature
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function fetchJmaRegionFeature(code) {
  if (regionFeaturesByCode.has(code)) {
    return regionFeaturesByCode.get(code);
  }
  if (regionFeatureLoads.has(code)) {
    return regionFeatureLoads.get(code);
  }

  const load = (async () => {
    try {
      const cached = await readCachedJmaRegion(code);
      if (cached) {
        regionFeaturesByCode.set(code, cached);
        return cached;
      }
    } catch {
      // IndexedDBが使えない場合もネットワークから取得します。
    }

    const url =
      `https://geoshape.ex.nii.ac.jp/jma/resource/` +
      `AreaForecastLocalE/20240520/${code}.geojson`;
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) throw new Error(`区域データ取得失敗: ${code}`);

    const data = await response.json();
    const feature = data.type === "FeatureCollection"
      ? data.features[0]
      : data.type === "Feature" ? data : null;
    if (!feature) throw new Error(`区域データ形式エラー: ${code}`);

    const taggedFeature = {
      ...feature,
      properties: {
        ...(feature.properties || {}),
        jmaRegionCode: code
      }
    };
    regionFeaturesByCode.set(code, taggedFeature);
    cacheJmaRegion(code, taggedFeature).catch(() => {});
    return taggedFeature;
  })();

  regionFeatureLoads.set(code, load);
  try {
    return await load;
  } finally {
    regionFeatureLoads.delete(code);
  }
}

async function fetchMunicipalityIndex() {
  if (municipalityIndexPromise) return municipalityIndexPromise;

  municipalityIndexPromise = (async () => {
    const cacheKey = "municipality-index-2026";
    try {
      const database = await openBoundaryDatabase();
      const cached = await new Promise((resolve, reject) => {
        const request = database
          .transaction("boundaries", "readonly")
          .objectStore("boundaries")
          .get(cacheKey);
        request.onsuccess = () => resolve(request.result?.index || null);
        request.onerror = () => reject(request.error);
      });
      if (cached && typeof cached === "object") return cached;
    } catch {
      // キャッシュが使えない場合はネットワークから取得します。
    }

    const response = await fetch("https://geoshape.ex.nii.ac.jp/city/code/", {
      cache: "force-cache"
    });
    if (!response.ok) throw new Error("市区町村一覧を取得できませんでした");

    const html = await response.text();
    const documentData = new DOMParser().parseFromString(html, "text/html");
    const index = [];

    documentData.querySelectorAll("tr").forEach((row) => {
      const cells = [...row.querySelectorAll("th, td")];
      const cellNames = cells.map((cell) => normalizeJmaName(cell.textContent));
      const rowText = row.textContent || "";
      const codeMatch = rowText.match(/(?:^|\D)(\d{5})(?:\D|$)/);
      if (!codeMatch) return;

      const municipalityCandidates = cellNames
        .filter((name) => name && /(市|区|町|村)$/.test(name));
      const municipalityName = municipalityCandidates[municipalityCandidates.length - 1];
      if (!municipalityName) return;

      const aliases = new Set([municipalityName]);
      if (municipalityName.endsWith("区")) {
        const parentCity = municipalityCandidates
          .slice(0, -1)
          .reverse()
          .find((name) => name.endsWith("市"));
        if (parentCity) {
          aliases.add(`${parentCity}${municipalityName}`);
          aliases.add(`${parentCity.slice(0, -1)}${municipalityName}`);
        }
        if (cellNames.includes("東京都")) {
          aliases.add(`東京${municipalityName}`);
        }
      }

      index.push({
        code: codeMatch[1],
        name: municipalityName,
        aliases: [...aliases]
      });
    });

    if (index.length < 100) {
      throw new Error("市区町村一覧の形式を読み取れませんでした");
    }

    try {
      const database = await openBoundaryDatabase();
      const transaction = database.transaction("boundaries", "readwrite");
      transaction.objectStore("boundaries").put({
        id: cacheKey,
        index
      });
    } catch {
      // IndexedDBが利用できなくても、今回の表示は続けます。
    }

    return index;
  })().catch((error) => {
    municipalityIndexPromise = null;
    throw error;
  });

  return municipalityIndexPromise;
}

function findMunicipalityCode(address, index) {
  const normalizedAddress = normalizeJmaName(address);
  const candidates = index
    .flatMap((entry) => entry.aliases.map((alias) => ({
      alias,
      code: entry.code
    })))
    .sort((a, b) => b.alias.length - a.alias.length);
  const match = candidates.find((candidate) =>
    normalizedAddress.includes(candidate.alias)
  );
  return match ? match.code : null;
}

async function fetchMunicipalityFeature(code) {
  if (municipalityFeaturesByCode.has(code)) {
    return municipalityFeaturesByCode.get(code);
  }
  if (municipalityFeatureLoads.has(code)) {
    return municipalityFeatureLoads.get(code);
  }

  const load = (async () => {
    const cacheId = `municipality-2026-${code}`;
    try {
      const database = await openBoundaryDatabase();
      const cached = await new Promise((resolve, reject) => {
        const request = database
          .transaction("boundaries", "readonly")
          .objectStore("boundaries")
          .get(cacheId);
        request.onsuccess = () => resolve(request.result?.feature || null);
        request.onerror = () => reject(request.error);
      });
      if (cached) {
        municipalityFeaturesByCode.set(code, cached);
        return cached;
      }
    } catch {
      // キャッシュが使えない場合はネットワークから取得します。
    }

    const response = await fetch(
      `https://geoshape.ex.nii.ac.jp/city/geojson/latest/${code}.geojson`,
      { cache: "force-cache" }
    );
    if (!response.ok) throw new Error(`市区町村境界を取得できません: ${code}`);

    const data = await response.json();
    const features = data.type === "FeatureCollection"
      ? data.features
      : data.type === "Feature" ? [data] : [];
    if (!features.length) throw new Error(`市区町村境界の形式エラー: ${code}`);

    const taggedFeatures = features.map((feature) => ({
      ...feature,
      properties: {
        ...(feature.properties || {}),
        municipalityCode: code
      }
    }));
    municipalityFeaturesByCode.set(code, taggedFeatures);

    try {
      const database = await openBoundaryDatabase();
      const transaction = database.transaction("boundaries", "readwrite");
      transaction.objectStore("boundaries").put({
        id: cacheId,
        feature: taggedFeatures
      });
    } catch {
      // IndexedDBが利用できなくても、今回の表示は続けます。
    }

    return taggedFeatures;
  })();

  municipalityFeatureLoads.set(code, load);
  try {
    return await load;
  } finally {
    municipalityFeatureLoads.delete(code);
  }
}

function intensityLabelPosition(feature) {
  const geometry = feature?.geometry;
  if (!geometry) return L.geoJSON(feature).getBounds().getCenter();

  const rings = geometry.type === "Polygon"
    ? [geometry.coordinates?.[0]]
    : geometry.type === "MultiPolygon"
      ? geometry.coordinates.map((polygon) => polygon?.[0])
      : [];

  let mainRing = null;
  let largestArea = 0;
  rings.forEach((ring) => {
    if (!Array.isArray(ring) || ring.length < 4) return;
    let area = 0;
    for (let i = 0; i < ring.length - 1; i += 1) {
      area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    }
    if (Math.abs(area) > largestArea) {
      largestArea = Math.abs(area);
      mainRing = ring;
    }
  });

  if (!mainRing) return L.geoJSON(feature).getBounds().getCenter();

  let minLat = Infinity;
  let maxLat = -Infinity;
  mainRing.forEach((coordinate) => {
    minLat = Math.min(minLat, coordinate[1]);
    maxLat = Math.max(maxLat, coordinate[1]);
  });

  let bestPosition = null;
  let widestSpan = 0;
  for (let step = 1; step < 20; step += 1) {
    const lat = minLat + ((maxLat - minLat) * step) / 20;
    const crossings = [];
    for (let i = 0; i < mainRing.length - 1; i += 1) {
      const [lon1, lat1] = mainRing[i];
      const [lon2, lat2] = mainRing[i + 1];
      if ((lat1 <= lat && lat2 > lat) || (lat2 <= lat && lat1 > lat)) {
        crossings.push(lon1 + ((lat - lat1) * (lon2 - lon1)) / (lat2 - lat1));
      }
    }
    crossings.sort((a, b) => a - b);
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      const span = crossings[i + 1] - crossings[i];
      if (span > widestSpan) {
        widestSpan = span;
        bestPosition = [lat, (crossings[i] + crossings[i + 1]) / 2];
      }
    }
  }

  return bestPosition || L.geoJSON(feature).getBounds().getCenter();
}

function intensityLabelTextColor(backgroundColor) {
  const match = String(backgroundColor).match(/^#([0-9a-f]{6})$/i);
  if (!match) return "#000000";

  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(match[1].slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  const blackContrast = (luminance + 0.05) / 0.05;
  const whiteContrast = 1.05 / (luminance + 0.05);
  return blackContrast >= whiteContrast ? "#000000" : "#ffffff";
}

function drawIntensityFeatures(features, intensities, targetLayer, propertyName) {
  if (!targetLayer) return;
  targetLayer.clearLayers();
  if (!features.length) return;

  L.geoJSON({
    type: "FeatureCollection",
    features
  }, {
    pane: "intensityAreaPane",
    style: (feature) => {
      const code = feature.properties[propertyName];
      const intensity = intensities[code];
      const colors = INTENSITY_COLORS[intensity] || INTENSITY_COLORS["1"];
      return {
        color: "#858a90",
        weight: 1.25,
        opacity: 1,
        fillColor: colors.background,
        fillOpacity: INTENSITY_FILL_OPACITY,
        interactive: false
      };
    }
  }).addTo(targetLayer);

  if (!document.getElementById("intensity-area-number-style")) {
    const style = document.createElement("style");
    style.id = "intensity-area-number-style";
    style.textContent =
      ".leaflet-div-icon.intensity-area-number-icon{background:transparent;border:0}";
    document.head.appendChild(style);
  }

  features.forEach((feature) => {
    const code = feature.properties[propertyName];
    const intensity = intensities[code];
    if (!intensity) return;

    const colors = INTENSITY_COLORS[intensity] || INTENSITY_COLORS["1"];
    const textColor = intensityLabelTextColor(colors.background);
    const fontSize = String(intensity).length > 1 ? 14 : 20;
    const icon = L.divIcon({
      className: "intensity-area-number-icon",
      html: `<span style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;box-sizing:border-box;border:2px solid #fff;border-radius:5px;background:${colors.background};color:${textColor};box-shadow:0 1px 5px rgba(0,0,0,.45);font-family:Arial,'Yu Gothic UI',sans-serif;font-size:${fontSize}px;font-weight:800;line-height:1">${escapeHTML(intensity)}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    L.marker(intensityLabelPosition(feature), {
      icon,
      pane: "markerPane",
      interactive: false,
      keyboard: false,
      zIndexOffset: 1000
    }).addTo(targetLayer);
  });
}
function fitEarthquakeMapToFeatures(earthquake, features) {
  if (!map || !earthquake.center || !features.length) return;

  const featureBounds = L.geoJSON({
    type: "FeatureCollection",
    features
  }).getBounds();
  if (!featureBounds.isValid()) return;

  const center = L.latLng(earthquake.center);
  const paddingFactor = 1.08;
  const latitudeRadius = Math.max(
    Math.abs(center.lat - featureBounds.getSouth()),
    Math.abs(featureBounds.getNorth() - center.lat),
    0.05
  ) * paddingFactor;
  const longitudeRadius = Math.max(
    Math.abs(center.lng - featureBounds.getWest()),
    Math.abs(featureBounds.getEast() - center.lng),
    0.05
  ) * paddingFactor;

  const centeredBounds = L.latLngBounds(
    [center.lat - latitudeRadius, center.lng - longitudeRadius],
    [center.lat + latitudeRadius, center.lng + longitudeRadius]
  );

  const fitZoom = map.getBoundsZoom(centeredBounds, false, [20, 20]);
  const zoom = Math.min(
    EARTHQUAKE_MAX_ZOOM,
    Math.max(map.getMinZoom(), fitZoom)
  );
  map.setView(center, zoom, { animate: false });
}

async function renderIntensityAreas(earthquake, fitMap = false) {
  if (!intensityAreaLayer || !municipalityIntensityLayer) return;
  const renderSequence = ++intensityRenderSequence;
  const areaIntensities = earthquake.areaIntensities || {};
  const useMunicipalities =
    map && map.getZoom() >= MUNICIPALITY_ZOOM_THRESHOLD &&
    Array.isArray(earthquake.observationPoints) &&
    earthquake.observationPoints.length > 0;

  if (useMunicipalities) {
    try {
      const municipalityIndex = await fetchMunicipalityIndex();
      if (renderSequence !== intensityRenderSequence) return;

      const municipalityIntensities = {};
      earthquake.observationPoints.forEach((point) => {
        const code = findMunicipalityCode(point.address, municipalityIndex);
        if (!code) return;
        const current = municipalityIntensities[code];
        if (!current || intensityRank(point.intensity) > intensityRank(current)) {
          municipalityIntensities[code] = point.intensity;
        }
      });

      const municipalityCodes = Object.keys(municipalityIntensities);
      if (municipalityCodes.length) {
        const featuresByMunicipality = await Promise.all(
          municipalityCodes.map((code) => fetchMunicipalityFeature(code))
        );
        if (
          renderSequence !== intensityRenderSequence ||
          !isEarthquakeMapActive() ||
          state.selectedEarthquake.id !== earthquake.id ||
          map.getZoom() < MUNICIPALITY_ZOOM_THRESHOLD
        ) return;

        const features = featuresByMunicipality.flat();
        if (features.length) {
          intensityAreaLayer.clearLayers();
          drawIntensityFeatures(
            features,
            municipalityIntensities,
            municipalityIntensityLayer,
            "municipalityCode"
          );
          if (fitMap) fitEarthquakeMapToFeatures(earthquake, features);
          return;
        }
      }
    } catch (error) {
      console.warn("市区町村の震度塗り分けに失敗しました。区域表示に切り替えます。", error);
    }
  }

  if (renderSequence !== intensityRenderSequence) return;
  municipalityIntensityLayer.clearLayers();

  const areaCodes = Object.keys(areaIntensities).map(Number);
  const activeFeatures = areaCodes
    .map((code) => regionFeaturesByCode.get(code))
    .filter(Boolean);
  if (activeFeatures.length) {
    drawIntensityFeatures(
      activeFeatures,
      areaIntensities,
      intensityAreaLayer,
      "jmaRegionCode"
    );
  } else {
    intensityAreaLayer.clearLayers();
  }

  const missingCodes = areaCodes.filter((code) => !regionFeaturesByCode.has(code));
  if (missingCodes.length === 0) {
    if (fitMap && activeFeatures.length) {
      fitEarthquakeMapToFeatures(earthquake, activeFeatures);
    }
    return;
  }

  try {
    await Promise.all(missingCodes.map(fetchJmaRegionFeature));
    if (
      renderSequence !== intensityRenderSequence ||
      !isEarthquakeMapActive() ||
      state.selectedEarthquake.id !== earthquake.id ||
      (map.getZoom() >= MUNICIPALITY_ZOOM_THRESHOLD && useMunicipalities)
    ) return;

    const features = areaCodes
      .map((code) => regionFeaturesByCode.get(code))
      .filter(Boolean);
    drawIntensityFeatures(
      features,
      areaIntensities,
      intensityAreaLayer,
      "jmaRegionCode"
    );
    if (fitMap) fitEarthquakeMapToFeatures(earthquake, features);
  } catch (error) {
    console.warn("震度区域を読み込めませんでした。", error);
  }
}

function initializeMap() {
  if (!window.L) {
    mapError.textContent =
      "地図ライブラリを読み込めませんでした。" +
      "インターネット接続を確認して再読み込みしてください。";
    mapError.hidden = false;
    return;
  }

  map = L.map("map", {
    zoomControl: false,
    minZoom: 5,
    maxZoom: 12
  }).setView([37.7, 139.5], 5);

  map.getContainer().style.backgroundColor = "#ffffff";
  map.createPane("intensityAreaPane");
  map.getPane("intensityAreaPane").style.zIndex = 340;
  map.getPane("intensityAreaPane").style.pointerEvents = "none";

  L.control.zoom({
    position: "topright"
  }).addTo(map);

  let loadedTileCount = 0;
  let failedTileCount = 0;

  const tiles = L.tileLayer(
    "https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png",
    {
      minZoom: 5,
      maxZoom: 14,
      noWrap: true,
      attribution:
        '<a href="https://maps.gsi.go.jp/development/ichiran.html"' +
        ' target="_blank" rel="noopener">地理院タイル（白地図）</a>'
    }
  );

  tiles.on("loading", () => {
    loadedTileCount = 0;
    failedTileCount = 0;
  });

  tiles.on("tileload", () => {
    loadedTileCount += 1;
    mapError.hidden = true;
  });

  tiles.on("tileerror", () => {
    failedTileCount += 1;
  });

  tiles.on("load", () => {
    if (loadedTileCount === 0 && failedTileCount > 0) {
      mapError.textContent =
        "国土地理院の白地図を読み込めませんでした。" +
        "接続を確認して、Ctrl＋F5で再読み込みしてください。";
      mapError.hidden = false;
    }
  });

  tiles.addTo(map);
  overlay = L.layerGroup().addTo(map);
  shakingReportLayer = L.layerGroup().addTo(map);
  intensityAreaLayer = L.layerGroup().addTo(map);
  municipalityIntensityLayer = L.layerGroup().addTo(map);
  map.on("zoomend", () => {
    if (isEarthquakeMapActive() && state.selectedEarthquake) {
      renderIntensityAreas(state.selectedEarthquake);
    }
  });
  map.attributionControl.addAttribution(
    '<a href="https://geoshape.ex.nii.ac.jp/jma/resource/AreaForecastLocalE/"' +
    ' target="_blank" rel="noopener">気象庁「地震情報／細分区域」GISデータ（NII加工）</a>' +
    '・<a href="https://www.data.jma.go.jp/eqev/data/kyoshin/jma-shindo.html"' +
    ' target="_blank" rel="noopener">気象庁震度観測点一覧表</a>' +
    '・市区町村境界：<a href="https://geoshape.ex.nii.ac.jp/city/"' +
    ' target="_blank" rel="noopener">Geoshape市区町村IDデータセット（CODH、CC BY 4.0）</a>'
  );
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function formatMagnitude(value) {
  const magnitude = Number(value);
  if (!Number.isFinite(magnitude) || magnitude < 0) return "不明";
  return magnitude.toFixed(1);
}

function updateClock() {
  document.getElementById("clock").textContent =
    new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date());
}

function clearMapOverlays() {
  pWave = null;
  sWave = null;

  if (overlay) {
    overlay.clearLayers();
  }

  intensityRenderSequence += 1;
  if (intensityAreaLayer) {
    intensityAreaLayer.clearLayers();
  }
  if (municipalityIntensityLayer) {
    municipalityIntensityLayer.clearLayers();
  }
}

function addEpicenter(position) {
  if (!overlay) return;

  const icon = L.divIcon({
    className: "epicenter-icon",
    html: '<div class="epicenter-mark">×</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  L.marker(position, {
    icon,
    zIndexOffset: 1000,
    interactive: false
  }).addTo(overlay);
}

function renderShakingReports() {
  if (!shakingReportLayer) return;
  shakingReportLayer.clearLayers();
  legend.querySelectorAll(".shaking-legend-entry").forEach(
    (item) => item.remove()
  );

  if (state.activeTab !== "earthquake" || !state.shakingAreas.length) {
    return;
  }

  state.shakingAreas.forEach((area) => {
    const icon = L.divIcon({
      className: "sensing-report-icon",
      html: '<span class="sensing-report-square"></span>',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    L.marker(area.position, {
      icon,
      zIndexOffset: 1800
    })
      .bindTooltip(
        `${area.name}　揺れ報告 ${area.count}件` +
        (area.display ? `　信頼度${area.display}` : ""),
        {
          direction: "top",
          offset: [0, -18],
          className: "station-label"
        }
      )
      .addTo(shakingReportLayer);
  });

  legend.insertAdjacentHTML("beforeend", `
    <span class="legend-item shaking-legend-entry">
      <i class="shaking-legend-square"></i>
      P2P揺れ報告
    </span>
  `);

  if (!state.focusShakingReports || !map) return;
  state.focusShakingReports = false;

  const positions = state.shakingAreas.map((area) => area.position);
  if (positions.length === 1) {
    map.setView(positions[0], 8, { animate: true });
  } else {
    map.fitBounds(L.latLngBounds(positions).pad(0.45), {
      maxZoom: 8,
      paddingTopLeft: [50, 90],
      paddingBottomRight: [120, 70],
      animate: true
    });
  }
}

function addIntensityPoint(point) {
  if (!overlay) return;

  const colors =
    INTENSITY_COLORS[point.intensity] || INTENSITY_COLORS["1"];
  const textColor = intensityLabelTextColor(colors.background);
  const fontSize = String(point.intensity).length > 1 ? 14 : 20;

  const icon = L.divIcon({
    className: "intensity-icon",
    html: `
      <div
        class="intensity-mark"
        style="display:grid;place-items:center;width:34px;height:34px;box-sizing:border-box;border:2px solid #fff;border-radius:5px;background:${colors.background};color:${textColor};box-shadow:0 1px 5px rgba(0,0,0,.45);font-family:Arial,'Yu Gothic UI',sans-serif;font-size:${fontSize}px;font-weight:800;line-height:1"
      >
        ${escapeHTML(point.intensity)}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  L.marker(point.position, {
    icon,
    interactive: false
  }).addTo(overlay);
}

function renderRecentInformation() {
  if (!recentIncomingInformation.length) {
    recentList.innerHTML = `
      <div class="recent-item">
        <strong>入電情報を待機中</strong>
      </div>
    `;
    return;
  }

  recentList.innerHTML = recentIncomingInformation.map((item) => `
    <div
      class="recent-item"
      data-recent-id="${escapeHTML(item.id)}"
      role="button"
      tabindex="0"
    >
      <time>${escapeHTML(item.receivedAt)}</time>
      <strong>${escapeHTML(item.title)}</strong>
    </div>
  `).join("");
}

function addRecentIncomingInformation(data) {
  if (!data || data.code !== 551 || !data.earthquake) return;

  const id = data.id || `${data.time || ""}-${data.issue?.type || ""}`;
  if (recentIncomingInformationIds.has(id)) return;
  recentIncomingInformationIds.add(id);
  if (recentIncomingInformationIds.size > 500) {
    recentIncomingInformationIds.delete(
      recentIncomingInformationIds.values().next().value
    );
  }

  const issueTitles = {
    ScalePrompt: "震度速報",
    Destination: "震源に関する情報",
    ScaleAndDestination: "震源・震度に関する情報",
    DetailScale: "各地の震度に関する情報",
    Foreign: "遠地地震に関する情報",
    Other: "地震に関する情報"
  };
  const timeMatch = String(data.time || "").match(/\b\d{1,2}:\d{2}:\d{2}/);

  recentIncomingInformation.push({
    id,
    kind: "earthquake",
    category: "地震情報",
    payload: data,
    eventKey: earthquakeEventKey(data),
    receivedAt: timeMatch ? timeMatch[0] : "時刻不明",
    fullTime: data.issue?.time || data.time || "発表時刻不明",
    receivedTimestamp: parseJmaTime(data.time),
    title: issueTitles[data.issue?.type] || "地震に関する情報"
  });
  recentIncomingInformation.sort(
    (a, b) => b.receivedTimestamp - a.receivedTimestamp
  );
  recentIncomingInformation.splice(2);
  renderRecentInformation();
}

function telegramIntensityGroupsHTML(data) {
  const points = Array.isArray(data.points) ? data.points : [];
  const stationPoints = points.filter((point) => !point.isArea);
  const displayPoints = stationPoints.length ? stationPoints : points;
  const groups = new Map();

  displayPoints.forEach((point) => {
    const intensity = jmaScaleToIntensity(point.scale);
    const name = normalizeJmaName(point.addr);
    if (!intensity || !name) return;
    if (!groups.has(intensity)) groups.set(intensity, new Set());
    groups.get(intensity).add(name);
  });

  return [...groups.entries()]
    .sort((a, b) => intensityRank(b[0]) - intensityRank(a[0]))
    .map(([intensity, names]) => `
      <section class="telegram-intensity-group">
        <h2>震度${escapeHTML(intensity)}</h2>
        <p>${[...names].map(escapeHTML).join("・")}</p>
      </section>
    `).join("");
}

function maximumIntensityPrefectures(data, maximum) {
  const points = Array.isArray(data.points) ? data.points : [];
  const stationPoints = points.filter((point) => !point.isArea);
  const displayPoints = stationPoints.length ? stationPoints : points;
  const prefectures = new Set();

  displayPoints.forEach((point) => {
    if (jmaScaleToIntensity(point.scale) !== maximum) return;
    const prefecture = normalizeJmaName(point.pref);
    if (prefecture) prefectures.add(prefecture);
  });

  return [...prefectures];
}

function tsunamiSentence(tsunami) {
  const sentences = {
    "心配なし": "この地震による津波の心配はありません。",
    "若干の海面変動": "若干の海面変動が予想されますが、被害の心配はありません。",
    "調査中": "この地震による津波の有無を調査しています。",
    "津波注意報": "この地震について、津波注意報が発表されています。",
    "津波警報": "この地震について、津波警報が発表されています。",
    "不明": "この地震による津波の有無は不明です。"
  };
  return sentences[tsunami] || "";
}

function earthquakeTelegramBodyHTML(data) {
  const earthquake = normalizeP2PQuake(data);
  const hasHypocenter = earthquake.location !== "震源情報なし";
  const maximumPrefectures = maximumIntensityPrefectures(
    data,
    earthquake.maximum
  );
  const maximumPlace = maximumPrefectures.length
    ? maximumPrefectures.map(escapeHTML).join("・")
    : "各地";
  const hypocenterDetails = [];

  if (hasHypocenter) {
    hypocenterDetails.push(
      `震源地は<strong>${escapeHTML(earthquake.location)}</strong>`
    );
  }
  if (earthquake.depth !== "不明") {
    hypocenterDetails.push(
      `震源の深さは<strong>${escapeHTML(`${earthquake.depth} km`)}</strong>`
    );
  }
  if (earthquake.magnitude !== "不明") {
    hypocenterDetails.push(
      `地震の規模を示すマグニチュードは<strong>${escapeHTML(earthquake.magnitude)}</strong>`
    );
  }

  const lead = hasHypocenter
    ? `${escapeHTML(earthquake.date || "発生時刻不明")}ごろ、<strong>${escapeHTML(earthquake.location)}</strong>を震源とする地震がありました。`
    : "各地の震度に関する情報が発表されました。";
  const maximumSentence = earthquake.maximum !== "不明"
    ? `<p>最大震度<strong>${escapeHTML(earthquake.maximum)}</strong>を<strong>${maximumPlace}</strong>で観測しました。</p>`
    : "";
  const tsunamiText = tsunamiSentence(earthquake.tsunami);
  const tsunamiHTML = tsunamiText
    ? `<p class="telegram-tsunami">${escapeHTML(tsunamiText).replace(
        /(心配はありません。|被害の心配はありません。|津波の有無を調査しています。|津波注意報が発表されています。|津波警報が発表されています。|津波の有無は不明です。)/,
        "<strong>$1</strong>"
      )}</p>`
    : "";
  const intensityGroups = telegramIntensityGroupsHTML(data);
  const intensityLead = intensityGroups && earthquake.maximum !== "不明"
    ? `<p class="telegram-intensity-lead">震度${escapeHTML(earthquake.maximum)}${earthquake.maximum === "1" ? "" : "以下"}を観測したのは以下の地域です。</p>`
    : "";
  const remarks = earthquake.remarks && !tsunamiText.includes(earthquake.remarks)
    ? `<p class="telegram-note">${escapeHTML(earthquake.remarks)}</p>`
    : "";

  return {
    earthquake,
    html: `
      <p class="telegram-lead">${lead}</p>
      ${hypocenterDetails.length ? `<p>${hypocenterDetails.join("。")}。</p>` : ""}
      ${maximumSentence}
      ${tsunamiHTML}
      ${intensityLead}
      ${intensityGroups}
      ${remarks}
    `
  };
}

function eewTelegramBodyHTML(eew) {
  const areas = eew.isWarn && eew.warningAreas?.length
    ? eew.warningAreas
    : eew.forecastAreas || [];

  return `
    <p class="telegram-lead">
      ${escapeHTML(eew.originTime || "発生時刻不明")}ごろ、
      <strong>${escapeHTML(eew.location || "震央地名不明")}</strong>で地震が発生しました。
    </p>
    <p>
      緊急地震速報（${eew.isWarn ? "警報" : "予報"}）の
      <strong>第${escapeHTML(eew.serial || "?")}報${eew.isFinal ? "（最終報）" : ""}</strong>です。
    </p>
    <p>
      推定最大震度は<strong>${escapeHTML(eew.maximum || "不明")}</strong>。
      地震の規模を示すマグニチュードは<strong>${escapeHTML(formatMagnitude(eew.magnitude))}</strong>。
      震源の深さは<strong>${escapeHTML(eew.depth === "不明" ? "不明" : `${eew.depth} km`)}</strong>です。
    </p>
    <p class="telegram-intensity-lead">対象地域は次のとおりです。</p>
    <section class="telegram-intensity-group">
      <p>${areas.length ? areas.map(escapeHTML).join("・") : "対象地域情報なし"}</p>
    </section>
  `;
}

function renderIncomingInformation() {
  const item = state.selectedIncomingInformation;
  if (!item) {
    state.earthquakeMode = "normal";
    renderNormalEarthquake();
    return;
  }

  let bodyHTML = "";
  let earthquake = null;
  let center = null;

  if (item.kind === "earthquake") {
    const telegram = earthquakeTelegramBodyHTML(item.payload);
    bodyHTML = telegram.html;
    earthquake = telegram.earthquake;
    center = earthquake.center;
  } else if (item.kind === "eew") {
    bodyHTML = eewTelegramBodyHTML(item.payload);
    center = item.payload.center;
  }

  panel.innerHTML = `
    <button type="button" class="telegram-back-tab" data-return-latest>
      <span aria-hidden="true">←</span> 最新の地震に戻る
    </button>
    <h1 class="panel-title telegram-title">${escapeHTML(item.title)}</h1>
    <div class="telegram-meta">
      <strong>${escapeHTML(item.category || "情報")}</strong>
      <time>${escapeHTML(item.fullTime || item.receivedAt)}</time>
    </div>
    <div class="telegram-divider" aria-hidden="true"></div>
    <div class="telegram-body">${bodyHTML}</div>
  `;

  recentSection.hidden = false;
  legend.innerHTML = "";
  caption.textContent = "直近の入電情報として受信した電文内容です。";
  if (dataSourceBadge) dataSourceBadge.textContent = "過去の入電情報";

  if (!map) return;

  if (earthquake) {
    state.selectedEarthquake = earthquake;
    renderIntensityAreas(earthquake, true);
    if (earthquake.center) addEpicenter(earthquake.center);
  } else if (center) {
    addEpicenter(center);
    map.setView(center, 7, { animate: false });
  }
}

function returnToLatestEarthquake() {
  const latestEarthquake = earthquakeHistory.find(
    (earthquake) => earthquake.id === state.latestEarthquakeId
  ) || earthquakeHistory[0];

  if (latestEarthquake) {
    state.selectedEarthquake = latestEarthquake;
  }
  state.selectedIncomingInformation = null;
  state.currentEEW = null;
  state.activeTab = "earthquake";
  state.earthquakeMode = "normal";
  render();
}

function renderNormalEarthquake() {
  const earthquake = state.selectedEarthquake;
  const latest = earthquake.id === state.latestEarthquakeId;

  if (dataSourceBadge) {
    dataSourceBadge.textContent = earthquake.live
      ? "P2P地震情報 リアルタイム"
      : "画面確認用";
  }

  panel.innerHTML = `
    <h1 class="panel-title">
      ${latest ? "最新の地震" : "過去の地震"}
    </h1>

    <div class="event-date">
      ${escapeHTML(earthquake.date)} ごろ
    </div>

    <div class="detail-body">
      <div class="main-box">
        <div class="label">震源地</div>
        <div class="value">${escapeHTML(earthquake.location)}</div>
      </div>

      <div class="detail-row">
        <span class="label">マグニチュード</span>
        <span class="value magnitude">
          ${escapeHTML(formatMagnitude(earthquake.magnitude))}
        </span>
      </div>

      <div class="detail-row">
        <span class="label">深さ</span>
        <span class="value depth">
          ${escapeHTML(earthquake.depth)} km
        </span>
      </div>

      <div class="detail-row">
        <span class="label">最大震度</span>
        <span class="value">
          ${escapeHTML(earthquake.maximum)}
        </span>
      </div>

      <div class="tsunami-status">
        津波　${escapeHTML(earthquake.tsunami)}
      </div>
    </div>

    <div class="remarks">
      <span class="remarks-title">備考</span>${escapeHTML(earthquake.remarks)}
    </div>
  `;

  recentSection.hidden = false;

  const intensities = [...new Set([
    ...Object.values(earthquake.areaIntensities || {}),
    ...earthquake.points.map((point) => point.intensity)
  ])].sort((a, b) => intensityRank(a) - intensityRank(b));

  legend.innerHTML = intensities.map((intensity) => `
    <span class="legend-item">
      <i
        class="legend-dot"
        style="background:${INTENSITY_COLORS[intensity].background}"
      ></i>
      震度${escapeHTML(intensity)}
    </span>
  `).join("");

  caption.textContent = earthquake.live
    ? "P2P地震情報から受信した気象庁の地震情報です。"
    : "震源・震度は画面確認用の架空データです。";

  if (!map) return;

  if (earthquake.center) {
    map.setView(earthquake.center, EARTHQUAKE_MAX_ZOOM, {
      animate: false
    });
  }

  renderIntensityAreas(earthquake, true);
  earthquake.points.forEach(addIntensityPoint);
  if (earthquake.center) addEpicenter(earthquake.center);
}

function shakingAreaRowsHTML(areas) {
  if (!areas.length) {
    return '<div class="alert-area-empty">検出地域を確認中</div>';
  }

  return areas.map((area) => `
    <div class="alert-area-row">
      <strong>${escapeHTML(area.name)}</strong>
      <span>
        ${escapeHTML(area.count)}件${
          area.display ? ` ／ 信頼度${escapeHTML(area.display)}` : ""
        }
      </span>
    </div>
  `).join("");
}

function eewTargetAreaRowsHTML(areas) {
  if (!areas.length) {
    return '<div class="alert-area-empty">対象地域情報なし</div>';
  }

  return areas.map((area) => `
    <div class="alert-area-row">
      <strong>${escapeHTML(area)}</strong>
    </div>
  `).join("");
}

function renderShakingDetection() {
  panel.innerHTML = `
    <h1 class="panel-title sensing">揺れを検出</h1>

    <div class="event-date">
      ${escapeHTML(
        new Intl.DateTimeFormat("ja-JP", {
          timeZone: "Asia/Tokyo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }).format(new Date(state.shakingUpdatedAt))
      )} 更新
    </div>

    <section class="alert-area-section sensing">
      <div class="alert-area-heading">揺れを検出した地域</div>
      ${shakingAreaRowsHTML(state.shakingAreas)}
    </section>

    <div class="remarks">
      <span class="remarks-title">備考</span>
      P2P地震情報ユーザーからの揺れ報告です。<br>
      気象庁の震度観測情報ではありません。
    </div>
  `;

  recentSection.hidden = false;
  legend.innerHTML = "";
  caption.textContent =
    "P2P地震情報の地震感知情報を地域単位で表示しています。";

  if (dataSourceBadge) {
    dataSourceBadge.textContent = "P2P 揺れ報告 リアルタイム";
  }
}

function renderEEW() {
  const liveEEW = state.currentEEW;
  const eew = liveEEW || {
    serial: 3,
    originTime: "2026/10/17 11:25:02",
    location: "宮城県沖",
    center: [38.5, 142.2],
    magnitude: "6.5",
    depth: "30",
    maximum: "5強",
    forecastAreas: ["東北"],
    warningAreas: ["東北"],
    isFinal: false,
    isAssumption: false,
    isWarn: state.earthquakeMode === "warning",
    live: false
  };
  const isWarning = eew.isWarn;
  const category = isWarning ? "警報" : "予報";
  const displayAreas = isWarning && eew.warningAreas?.length
    ? eew.warningAreas
    : eew.forecastAreas;
  const targetAreas = displayAreas.length
    ? displayAreas.join("・")
    : "対象地域情報なし";
  const reportSuffix = eew.isFinal ? "（最終報）" : "";
  const assumptionText = eew.isAssumption
    ? "\n仮定震源要素を使用しています。"
    : "";

  panel.innerHTML = `
    <h1 class="panel-title ${isWarning ? "warning" : "forecast"}">
      EEW（${category}）
      <span class="report-number">
        第${escapeHTML(eew.serial || "?")}報${escapeHTML(reportSuffix)} ／
        ${escapeHTML(eew.location)}で地震
      </span>
    </h1>

    <div class="event-date">
      ${escapeHTML(eew.originTime || "発生時刻不明")} 発生
    </div>

    <div class="detail-body">
      <div class="main-box intensity-box">
        <div class="label">推定最大震度</div>
        <div class="value">${escapeHTML(eew.maximum)}</div>
      </div>

      <div class="detail-row">
        <span class="label">マグニチュード</span>
        <span class="value magnitude">${escapeHTML(formatMagnitude(eew.magnitude))}</span>
      </div>

      <div class="detail-row">
        <span class="label">深さ</span>
        <span class="value depth">${escapeHTML(eew.depth)} km</span>
      </div>

      <div class="tsunami-status">津波　調査中</div>
    </div>

    ${isWarning ? `
      <section class="alert-area-section warning">
        <div class="alert-area-heading">警報対象地域</div>
        ${eewTargetAreaRowsHTML(displayAreas)}
      </section>
    ` : ""}

    <div class="remarks">
      <span class="remarks-title">備考</span>${
        isWarning
          ? `緊急地震速報（警報）が発表されました。\n${escapeHTML(targetAreas)}では強い揺れに警戒してください。`
          : `緊急地震速報（予報）が発表されました。\n予報対象地域：${escapeHTML(targetAreas)}\n今後の情報に注意してください。`
      }${escapeHTML(assumptionText)}
    </div>
  `;

  recentSection.hidden = false;

  if (dataSourceBadge) {
    dataSourceBadge.textContent = eew.live
      ? "Wolfx EEW リアルタイム"
      : "画面確認用";
  }

  if (eew.live) {
    legend.innerHTML = `
      <span class="legend-item">
        <i class="legend-dot" style="background:#2d6cdf"></i>
        P波（概算）
      </span>
      <span class="legend-item">
        <i class="legend-dot" style="background:#e4322b"></i>
        S波（概算）
      </span>
    `;
    caption.textContent =
      `Wolfxから受信した気象庁EEW（${category}）です。` +
      "波の円は震源時・震源位置・深さから一定速度で計算した概算です。";
  } else {
    legend.innerHTML = `
      <span class="legend-item">
        <i class="legend-dot" style="background:#2d6cdf"></i>
        P波
      </span>
      <span class="legend-item">
        <i class="legend-dot" style="background:#e4322b"></i>
        S波
      </span>
    `;
    caption.textContent =
      "波の円は動作確認用アニメーションです。実際の到達予測ではありません。";
  }

  if (!map) return;

  if (eew.center) {
    addEpicenter(eew.center);
    map.setView(eew.center, 7, { animate: false });
  }

  if (eew.center) {
    pWave = L.circle(eew.center, {
      radius: 0,
      color: "#2d6cdf",
      weight: 3,
      fill: false,
      interactive: false
    }).addTo(overlay);

    sWave = L.circle(eew.center, {
      radius: 0,
      color: "#e4322b",
      weight: 3,
      fill: false,
      interactive: false
    }).addTo(overlay);

    updateEEWWaveRadii();
  }
}

function tsunamiHeightText(station) {
  return station.observedHeight !== null
    ? `${station.observedHeight}観測`
    : `予想${station.expectedHeight}`;
}

function renderTsunami() {
  const tsunami = SAMPLE_TSUNAMI;
  const stations = [...tsunami.stations].sort(
    (a, b) => a.expectedTime - b.expectedTime
  );

  if (dataSourceBadge) {
    dataSourceBadge.textContent = "画面確認用";
  }

  panel.innerHTML = `
    <h1 class="panel-title tsunami">
      ${escapeHTML(tsunami.title)}
    </h1>

    <div class="event-date">
      ${escapeHTML(tsunami.announced)} 発表
    </div>

    <div class="remarks">${escapeHTML(tsunami.message)}</div>

    <table class="tsunami-table">
      <thead>
        <tr>
          <th>観測所</th>
          <th>到達予想・状況</th>
          <th>高さ</th>
        </tr>
      </thead>

      <tbody>
        ${stations.map((station) => `
          <tr>
            <td>${escapeHTML(station.name)}</td>
            <td>${escapeHTML(station.arrival)}</td>
            <td>
              <span class="height-value ${station.grade}">
                ${escapeHTML(tsunamiHeightText(station))}
              </span>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <p class="table-note">
      観測所・時刻・高さはすべて架空の例です。<br>
      観測値が入った地点は予想高さを観測値に置き換えています。
    </p>
  `;

  recentSection.hidden = true;

  legend.innerHTML = `
    <span class="legend-item">
      <i class="legend-dot" style="background:#a000cf"></i>
      大津波警報
    </span>
    <span class="legend-item">
      <i class="legend-dot" style="background:#e53b32"></i>
      津波警報
    </span>
    <span class="legend-item">
      <i class="legend-dot" style="background:#ddc700"></i>
      津波注意報
    </span>
  `;

  caption.textContent =
    "観測所とラベルの配置確認です。対象沿岸の色分けは次の実装で追加します。";

  if (!map) return;

  stations.forEach((station) => {
    const tooltip = document.createElement("span");

    tooltip.textContent =
      `${station.name}　${station.arrival}　` +
      tsunamiHeightText(station);

    L.circleMarker(station.position, {
      radius: 7,
      color: "#fff",
      weight: 2,
      fillColor: TSUNAMI_COLORS[station.grade],
      fillOpacity: 1
    })
      .bindTooltip(tooltip, {
        permanent: true,
        direction: "right",
        offset: [9, 0],
        className: "station-label"
      })
      .addTo(overlay);
  });

  map.fitBounds(
    L.latLngBounds(
      stations.map((station) => station.position)
    ).pad(0.4),
    {
      maxZoom: 7,
      paddingTopLeft: [25, 90],
      paddingBottomRight: [180, 70],
      animate: false
    }
  );
}

function updateTabs() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    const active = button.dataset.tab === state.activeTab;

    button.classList.toggle("active", active);

    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function render() {
  const warningSidebarActive =
    state.activeTab === "earthquake" &&
    state.earthquakeMode === "warning";
  sidebar?.classList.toggle("warning-mode", warningSidebarActive);

  clearMapOverlays();
  updateTabs();

  if (state.activeTab === "tsunami") {
    renderTsunami();
  } else if (state.earthquakeMode === "normal") {
    renderNormalEarthquake();
  } else if (state.earthquakeMode === "sensing") {
    renderShakingDetection();
  } else if (state.earthquakeMode === "incoming") {
    renderIncomingInformation();
  } else {
    renderEEW();
  }

  renderShakingReports();

  if (map) {
    requestAnimationFrame(() => map.invalidateSize());
  }
}

function selectPreview(type) {
  state.selectedIncomingInformation = null;
  if (type === "tsunami") {
    state.activeTab = "tsunami";
  } else {
    state.activeTab = "earthquake";
    state.earthquakeMode =
      type === "earthquake" ? "normal" : type;

    if (type === "earthquake") {
      state.currentEEW = null;
      state.selectedEarthquake = SAMPLE_EARTHQUAKES[0];
      state.latestEarthquakeId = SAMPLE_EARTHQUAKES[0].id;
    } else {
      state.eewStartedAt = performance.now();
    }
  }

  render();
}

document.querySelectorAll("[data-preview]").forEach((button) => {
  button.addEventListener("click", () => {
    selectPreview(button.dataset.preview);
  });
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeTab = button.dataset.tab;
    render();
  });
});

recentList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-recent-id]");
  if (!button) return;

  const item = recentIncomingInformation.find(
    (entry) => entry.id === button.dataset.recentId
  );
  if (!item) return;

  state.selectedIncomingInformation = item;
  state.currentEEW = null;
  state.activeTab = "earthquake";
  state.earthquakeMode = "incoming";
  if (item.kind === "earthquake") {
    state.selectedEarthquake = normalizeP2PQuake(item.payload);
  }
  render();
});

recentList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const item = event.target.closest("[data-recent-id]");
  if (!item) return;
  event.preventDefault();
  item.click();
});

panel.addEventListener("click", (event) => {
  if (!event.target.closest("[data-return-latest]")) return;
  returnToLatestEarthquake();
});

function renderEarthquakeHistory() {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;

  if (!earthquakeHistory.length) {
    historyList.innerHTML = `
      <p class="history-empty">
        ${state.earthquakeHistoryLoaded
          ? "地震履歴を取得できませんでした。時間をおいて再度お試しください。"
          : "地震履歴を読み込み中…"}
      </p>
    `;
    return;
  }

  historyList.innerHTML = earthquakeHistory.map((earthquake) => `
    <button
      type="button"
      class="history-entry"
      data-earthquake-id="${escapeHTML(earthquake.id)}"
    >
      ${escapeHTML(earthquake.date)} ごろ<br>
      <strong>${escapeHTML(earthquake.location)}</strong>
      ／ 最大震度${escapeHTML(earthquake.maximum)}
      ／ M${escapeHTML(formatMagnitude(earthquake.magnitude))}
    </button>
  `).join("");
}

renderEarthquakeHistory();

document.getElementById("history-button").addEventListener(
  "click",
  () => {
    renderEarthquakeHistory();
    historyDialog.showModal();
  }
);

document.getElementById("history-close").addEventListener(
  "click",
  () => historyDialog.close()
);

document.getElementById("history-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-earthquake-id]");
  if (!button) return;

  const earthquake = earthquakeHistory.find(
    (item) => item.id === button.dataset.earthquakeId
  );
  if (!earthquake) return;

  state.selectedEarthquake = earthquake;
  state.currentEEW = null;
  state.selectedIncomingInformation = null;
  state.activeTab = "earthquake";
  state.earthquakeMode = "normal";
  historyDialog.close();
  render();
});

function surfaceWaveRadiusMeters(speedKmPerSecond, elapsedSeconds, depthKm) {
  const travelledKm = speedKmPerSecond * Math.max(0, elapsedSeconds);
  if (travelledKm <= depthKm) return 0;

  return Math.sqrt(
    travelledKm * travelledKm - depthKm * depthKm
  ) * 1000;
}

function updateEEWWaveRadii() {
  if (
    state.activeTab !== "earthquake" ||
    state.earthquakeMode === "normal" ||
    !pWave ||
    !sWave
  ) {
    return;
  }

  const eew = state.currentEEW;
  if (eew?.live) {
    const originTimestamp = parseJmaTime(eew.originTime);
    const baseTimestamp = originTimestamp || eew.receivedAt || Date.now();
    const elapsedSeconds = Math.max(0, (Date.now() - baseTimestamp) / 1000);
    const parsedDepth = Number(eew.depth);
    const depthKm = Number.isFinite(parsedDepth) && parsedDepth >= 0
      ? parsedDepth
      : 0;

    pWave.setRadius(
      surfaceWaveRadiusMeters(P_WAVE_SPEED_KM_S, elapsedSeconds, depthKm)
    );
    sWave.setRadius(
      surfaceWaveRadiusMeters(S_WAVE_SPEED_KM_S, elapsedSeconds, depthKm)
    );
    return;
  }

  const sampleElapsed =
    ((performance.now() - state.eewStartedAt) / 1000) % 24;

  pWave.setRadius(20000 + sampleElapsed * 11000);
  sWave.setRadius(10000 + sampleElapsed * 6500);
}

function expireShakingReports() {
  if (
    !state.shakingAreas.length ||
    Date.now() - state.shakingUpdatedAt <= 120000
  ) {
    return;
  }

  state.shakingEventKey = "";
  state.shakingAreas = [];
  state.shakingUpdatedAt = 0;
  state.focusShakingReports = false;
  if (state.earthquakeMode === "sensing") {
    state.earthquakeMode = "normal";
    render();
  } else {
    renderShakingReports();
  }
}

initializeMap();
renderRecentInformation();
updateClock();
render();
connectP2PRealtime();
connectWolfxRealtime();
loadLatestP2PQuake();

setInterval(updateClock, 1000);
setInterval(updateEEWWaveRadii, 100);
setInterval(expireShakingReports, 1000);