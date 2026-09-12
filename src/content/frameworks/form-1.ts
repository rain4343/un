import type { FormItem, LocaleText } from "./types";
import type { FormSectionId } from "./types";

export const SECTION_TITLES: Record<FormSectionId, LocaleText> = {
  BUILDING: {
    en: "Building",
    ar: "المبنى",
    ckb: "بالەخانە",
  },
  WASH: {
    en: "Water & Sanitation",
    ar: "المياه والصرف الصحي",
    ckb: "ئاو و ئاودەست",
  },
  CANTEEN: {
    en: "Canteen / Store",
    ar: "المقصف / المتجر",
    ckb: "فروشگا / حانووت",
  },
  LEARNING: {
    en: "Educational & Learning Environment",
    ar: "بيئة التربية والتعليم",
    ckb: "ژینگەی پەروەردە و فێرکردن",
  },
  TEACHERS: {
    en: "Teachers",
    ar: "المعلمات والمعلمون",
    ckb: "مامۆستایان",
  },
  ADMINISTRATION: {
    en: "School Administration",
    ar: "إدارة الروضة / المدرسة",
    ckb: "بەڕێوەبەرایەتی قوتابخانه",
  },
  CURRICULA: {
    en: "Curricula & Programs",
    ar: "المناهج والبرامج",
    ckb: "پرۆگرامەکان",
  },
  COUNCIL: {
    en: "Parents & Teachers Council",
    ar: "مجلس الآباء والمعلمات",
    ckb: "ئنجومەنی دایباب و مامۆستایان",
  },
};

function item(
  id: string,
  section: FormSectionId,
  en: string,
  ar: string,
  ckb: string,
): FormItem {
  return { id, section, prompt: { en, ar, ckb } };
}

export const FORM_1_ITEMS: FormItem[] = [
  item("bldg.cleanliness", "BUILDING", "Cleanliness of the building and premises", "نظافة المبنى والساحات", "پاکوخاوێنی بالەخانە و پێشەهاتەکان"),
  item("bldg.physical_access", "BUILDING", "Physical accessibility of the facility", "سهولة الوصول المادي إلى المرفق", "دەستڕاگەیشتنی فیزیکی بۆ دامەزراوەکە"),
  item("bldg.disability_access", "BUILDING", "Access for children with disabilities", "إمكانية وصول الأطفال ذوي الإعاقة", "دەستڕاگەیشتن بۆ منداڵانی خاوەن پێداویستی تایبەت"),
  item("bldg.noise", "BUILDING", "Noise levels are appropriate for learning", "مستويات الضوضاء مناسبة للتعلم", "ئاستی دەنگەدەنگ گونجاوە بۆ فێربوون"),
  item("bldg.gardens", "BUILDING", "Gardens are safe, clean, and usable", "الحدائق آمنة ونظيفة وقابلة للاستخدام", "باخچەکان سەلامەت و پاک و بەکارهێنراون"),
  item("bldg.playgrounds", "BUILDING", "Playgrounds are safe and adequate", "الملاعب آمنة وكافية", "یاریگاکان سەلامەت و پێویستن"),
  item("bldg.roofs_gutters", "BUILDING", "Roofs and gutters are sound and maintained", "الأسطح والمزاريب سليمة وتُصان", "بان و ئاوبەرییەکان تەندروست و چاککراونەوە"),
  item("bldg.natural_light", "BUILDING", "Natural classroom lighting is adequate", "الإضاءة الطبيعية في الصفوف كافية", "ڕووناکی سروشتی پۆلەکان بەسە"),
  item("bldg.class_ratio", "BUILDING", "Student-to-class ratios are within acceptable limits", "نسبة الأطفال إلى الصف ضمن الحدود المقبولة", "ڕێژەی منداڵ بۆ پۆل لە سنووری پەسەنددایە"),

  item("wash.handwashing", "WASH", "Handwashing stations are clean and usable", "محطات غسل اليدين نظيفة وصالحة للاستخدام", "وێستگەکانی شوشتنی دەست پاک و بەکارهێنراون"),
  item("wash.toilets_operational", "WASH", "Toilets are operational", "المراحيض تعمل", "ئاودەستەکان کاردەکەن"),
  item("wash.toilet_ratio", "WASH", "Toilet-to-student ratios meet standards", "نسبة المراحيض إلى الأطفال تستوفي المعايير", "ڕێژەی ئاودەست بۆ منداڵ پێوەرەکان دەپێکێت"),
  item("wash.separated", "WASH", "Boys' and girls' facilities are separated", "مرافق الفتيان والفتيات منفصلة", "ئاودەستی کوڕان و کچان جیاکراونەتەوە"),
  item("wash.safe_water", "WASH", "Safe water sources are available", "مصادر مياه آمنة متوفرة", "سەرچاوەی ئاوی سەلامەت بەردەستە"),
  item("wash.tank_hygiene", "WASH", "Water tanks are hygienic and maintained", "خزانات المياه نظيفة وتُصان", "تەنکی ئاو پاک و چاککراونەوە"),
  item("wash.drinking_water", "WASH", "Drinking water is available for all children", "مياه الشرب متاحة لجميع الأطفال", "ئاوی خواردنەوە بۆ هەموو منداڵان بەردەستە"),

  item("canteen.cleanliness", "CANTEEN", "Canteen / store cleanliness", "نظافة المقصف / المتجر", "پاکوخاوێنی فروشگا / حانووت"),
  item("canteen.health", "CANTEEN", "Health and food-safety standards are met", "تُستوفى معايير الصحة وسلامة الغذاء", "پێوەرەکانی تەندروستی و سەلامەتی خۆراک جێبەجێ دەکرێن"),
  item("canteen.child_friendly", "CANTEEN", "The space is child-friendly", "المكان ملائم للأطفال", "شوێنەکە دۆستی منداڵە"),
  item("canteen.pricing", "CANTEEN", "Prices are affordable", "الأسعار في متناول الجميع", "نرخەکان گونجاون"),
  item("canteen.equal_access", "CANTEEN", "Equal purchasing access for all children, especially the first circle", "فرص شراء متساوية لجميع الأطفال، ولا سيما الحلقة الأولى", "دەستڕاگەیشتنی یەکسان بۆ کڕین، بەتایبەت بازنەی یەکەم"),

  item("learn.no_violence", "LEARNING", "Absence of violence and discrimination", "غياب العنف والتمييز", "نەبوونی توندوتیژی و جیاکاری"),
  item("learn.psych_comfort", "LEARNING", "Children's psychological comfort is protected", "الراحة النفسية للأطفال محمية", "ئاسوودەیی دەروونی منداڵان پارێزراوە"),
  item("learn.dropout", "LEARNING", "Dropout is tracked and followed up", "يُتابع التسرب ويُعالج", "وازهێنان تۆمار دەکرێت و شوێنی دەخرێت"),
  item("learn.sports_art", "LEARNING", "Sports and art activities are offered", "تُقدم أنشطة رياضية وفنية", "چالاکی وەرزشی و هونەری پێشکەش دەکرێن"),
  item("learn.competitions", "LEARNING", "Student competitions are organized", "تُنظم مسابقات للأطفال", "پێشبڕکێی منداڵان ڕێکدەخرێت"),
  item("learn.class_activities", "LEARNING", "Classroom activities are regular and inclusive", "الأنشطة الصفية منتظمة وشاملة", "چالاکی پۆل ڕێکوپێک و گشتگیرن"),
  item("learn.library", "LEARNING", "A functioning library is available", "مكتبة عاملة متوفرة", "کتێبخانەیەکی کارا بەردەستە"),
  item("learn.science_labs", "LEARNING", "Science labs / discovery corners are used", "تُستخدم مختبرات العلوم / أركان الاستكشاف", "تاقیگەی زانست / گۆشەی دۆزینەوە بەکاردەهێنرێن"),
  item("learn.field_trips", "LEARNING", "Scientific field trips are conducted", "تُنفذ رحلات علمية ميدانية", "گەشتی زانستی مەیدانی ئەنجام دەدرێن"),

  item("tch.staffing", "TEACHERS", "Staff sizing is adequate for enrolment", "حجم الهيئة التعليمية كافٍ للتسجيل", "ژمارەی ستاف بەشی تۆمارکردن دەکات"),
  item("tch.participation", "TEACHERS", "Children have opportunities to participate", "لدى الأطفال فرص للمشاركة", "منداڵان دەرفەتی بەشدارییان هەیە"),
  item("tch.class_mgmt", "TEACHERS", "Classroom management is positive and consistent", "إدارة الصف إيجابية ومتسقة", "بەڕێوەبردنی پۆل ئەرێنی و جێگیرە"),
  item("tch.open_questions", "TEACHERS", "Teachers use open-ended questioning", "يستخدم المعلمون الأسئلة المفتوحة", "مامۆستایان پرسیاری کراوە بەکاردەهێنن"),
  item("tch.certification", "TEACHERS", "Teachers hold required training certifications", "المعلمون حاصلون على شهادات التدريب المطلوبة", "مامۆستایان بڕوانامەی ڕاهێنانی پێویستیان هەیە"),
  item("tch.friendly_school", "TEACHERS", "Practice adheres to child-friendly school principles", "الممارسة تلتزم بمبادئ المدرسة الصديقة للطفل", "پراکتیک پابەندی بنەماکانی قوتابخانەی دۆستی منداڵە"),
  item("tch.collaboration", "TEACHERS", "Collaboration with peers, children, and parents", "التعاون مع الزملاء والأطفال وأولياء الأمور", "هاوکاری لەگەڵ هاوکاران، منداڵان، و دایک و باوک"),

  item("adm.friendly", "ADMINISTRATION", "Administration is child- and staff-friendly", "الإدارة ودية تجاه الأطفال والكادر", "بەڕێوەبەرایەتی دۆستی منداڵ و ستافە"),
  item("adm.responsive", "ADMINISTRATION", "Responsive to student and teacher demands", "تستجيب لمطالب الأطفال والمعلمين", "وەڵامدەرەوەی داواکاری منداڵ و مامۆستایانە"),
  item("adm.advancement", "ADMINISTRATION", "Efforts toward school / kindergarten advancement", "جهود للنهوض بالروضة / المدرسة", "هەوڵ بۆ پێشخستنی باخچە / قوتابخانە"),
  item("adm.meetings", "ADMINISTRATION", "Participation in required meetings", "المشاركة في الاجتماعات المطلوبة", "بەشداری لە کۆبوونەوە پێویستەکان"),
  item("adm.records", "ADMINISTRATION", "Record keeping is complete and up to date", "حفظ السجلات مكتمل ومحدّث", "تۆمارکردن تەواو و نوێیە"),
  item("adm.cfs_network", "ADMINISTRATION", "Friendly schools network training is applied", "يُطبق تدريب شبكة المدارس الصديقة", "ڕاهێنانی تۆڕی قوتابخانە دۆستەکان جێبەجێ دەکرێت"),
  item("adm.regional", "ADMINISTRATION", "Regional coordination is active", "التنسيق الإقليمي فاعل", "هاوئاهەنگی ناوچەیی چالاکە"),

  item("cur.textbooks", "CURRICULA", "Textbooks are available for children", "الكتب المدرسية متوفرة للأطفال", "کتێبەکان بۆ منداڵان بەردەستن"),
  item("cur.tools", "CURRICULA", "Teaching tools and materials are available", "أدوات ومواد التعليم متوفرة", "ئامراز و کەرەستەی فێرکردن بەردەستن"),
  item("cur.lab_library_use", "CURRICULA", "Library and science lab utilization", "استخدام المكتبة ومختبر العلوم", "بەکارهێنانی کتێبخانە و تاقیگەی زانست"),
  item("cur.daily_life", "CURRICULA", "Curriculum connects to children's daily lives", "المنهج يرتبط بحياة الأطفال اليومية", "پرۆگرام پەیوەندی بە ژیانی ڕۆژانەی منداڵانەوە هەیە"),

  item("cou.home_visits", "COUNCIL", "Home visits are conducted", "تُجرى زيارات منزلية", "سەردانی ماڵەوە ئەنجام دەدرێت"),
  item("cou.support", "COUNCIL", "Material and financial support is provided", "يُقدم دعم مادي ومالي", "پشتگیری ماددی و دارایی پێشکەش دەکرێت"),
  item("cou.documentation", "COUNCIL", "Council activities are documented", "تُوثق أنشطة المجلس", "چالاکی ئەنجومەن بەڵگەدار دەکرێن"),
  item("cou.problem_solving", "COUNCIL", "Collaborative problem-solving with the kindergarten", "حل المشكلات بالتعاون مع الروضة", "چارەسەری کێشە بە هاوکاری باخچە"),
  item("cou.meetings", "COUNCIL", "Structured meeting schedule is followed", "يُلتزم بجدول اجتماعات منظم", "خشتەی کۆبوونەوەی ڕێکخراو جێبەجێ دەکرێت"),
];
