import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { isTrustedOrigin } from "@/lib/csrf";
import { getContentStore } from "@/lib/contentStore";

// One-time migration tool: seeds Netlify Blobs with the exact content that used to live in
// content/*.json, preserving fields (like category schemaType) that the admin UI doesn't expose.
// Delete this route once migration is confirmed — it isn't meant to stay in the app long-term.

const categories = [
  {
    slug: "hotels",
    schemaType: "Hotel",
    translations: { en: { name: "Hotels" }, ar: { name: "الفنادق" } },
  },
  {
    slug: "electronics",
    schemaType: "Product",
    translations: { en: { name: "Electronics" }, ar: { name: "إلكترونيات" } },
  },
  {
    slug: "services",
    schemaType: "Service",
    translations: { en: { name: "Services" }, ar: { name: "خدمات" } },
  },
  {
    slug: "home-goods",
    schemaType: "Product",
    translations: { en: { name: "Home Goods" }, ar: { name: "مستلزمات المنزل" } },
  },
];

const tags = [
  { slug: "family", translations: { en: { name: "family" }, ar: { name: "عائلة" } } },
];

const reviews = [
  {
    slug: "example-hotel",
    categorySlug: "hotels",
    tags: ["family"],
    rating: 4.5,
    price: { amount: 450, currency: "SAR" },
    media: [
      {
        type: "photo",
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      },
    ],
    affiliateLinks: [
      { label: "Book on Booking.com", url: "https://example.com/book/example-hotel" },
    ],
    publishedAt: "2026-07-03",
    translations: {
      en: {
        title: "Seaside Grand Hotel",
        summary: "A relaxed beachfront hotel with excellent breakfast and friendly staff.",
        body: "We spent four nights at the Seaside Grand Hotel and came away impressed. The rooms are spacious, the beds are comfortable, and the balcony views of the water are hard to beat.\n\nBreakfast is included and easily the best part of the stay — a huge spread of fresh fruit, pastries, and made-to-order eggs. Staff were consistently helpful, from early check-in to late-night questions about local restaurants.\n\nThe only downside was slow elevator service during peak morning hours. Otherwise, this is an easy recommendation for anyone visiting the area.",
        pros: ["Steps from the beach", "Excellent breakfast", "Friendly, responsive staff"],
        cons: ["Elevators get slow at peak times", "Parking costs extra"],
      },
      ar: {
        title: "فندق سي سايد جراند",
        summary: "فندق مريح على الشاطئ بإفطار ممتاز وطاقم عمل ودود.",
        body: "قضينا أربع ليالٍ في فندق سي سايد جراند وخرجنا معجبين. الغرف واسعة، والأسرّة مريحة، وإطلالة الشرفة على الماء لا تُضاهى.\n\nالإفطار مشمول في السعر وهو أفضل جزء في الإقامة — تشكيلة كبيرة من الفواكه الطازجة والمعجنات والبيض المُحضّر حسب الطلب. كان الطاقم متعاونًا باستمرار، من تسجيل الوصول المبكر إلى الأسئلة المتأخرة حول المطاعم المحلية.\n\nالعيب الوحيد كان بطء المصاعد في أوقات الذروة الصباحية. بخلاف ذلك، هذه توصية سهلة لأي شخص يزور المنطقة.",
        pros: ["على بعد خطوات من الشاطئ", "إفطار ممتاز", "طاقم عمل ودود وسريع الاستجابة"],
        cons: ["المصاعد بطيئة في أوقات الذروة", "مواقف السيارات برسوم إضافية"],
      },
    },
    seo: {
      metaTitle: { en: "", ar: "" },
      metaDescription: { en: "", ar: "" },
      targetKeywords: "",
      socialTitle: { en: "", ar: "" },
      socialDescription: { en: "", ar: "" },
    },
  },
  {
    slug: "wireless-earbuds",
    categorySlug: "electronics",
    tags: [],
    rating: 4,
    price: { amount: 249, currency: "SAR" },
    promoCode: "TECH15",
    media: [
      {
        type: "photo",
        url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&q=80",
      },
      { type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    ],
    affiliateLinks: [
      { label: "Amazon", url: "https://example.com/buy/wireless-earbuds-amazon" },
      { label: "Noon", url: "https://example.com/buy/wireless-earbuds-noon" },
    ],
    publishedAt: "2026-06-20",
    translations: {
      en: {
        title: "AeroBuds Pro Wireless Earbuds",
        summary:
          "Solid noise cancellation and battery life for the price, though the case feels a bit cheap.",
        body: "I have been using the AeroBuds Pro daily for about a month, mostly for calls and commuting. Noise cancellation handles traffic and office chatter well, and I consistently get close to the advertised 6 hours per charge.\n\nPairing is fast and they reconnect reliably to my phone after being in the case. The touch controls took a few days to get used to but are fine now.\n\nThe charging case feels a little plasticky and picks up scratches easily, which is the one thing keeping this from a full recommendation.",
        pros: ["Strong noise cancellation for the price", "Reliable reconnect", "Long battery life"],
        cons: ["Charging case feels cheap", "Touch controls need a short learning curve"],
      },
      ar: {
        title: "سماعات إيروبَدز برو اللاسلكية",
        summary:
          "إلغاء ضوضاء جيد وعمر بطارية طويل مقابل السعر، لكن العلبة تبدو رخيصة بعض الشيء.",
        body: "أستخدم سماعات إيروبَدز برو يوميًا منذ نحو شهر، غالبًا للمكالمات والتنقل. إلغاء الضوضاء يتعامل بشكل جيد مع ضجيج المرور والمكتب، وأحصل باستمرار على ما يقارب 6 ساعات لكل شحنة كما هو معلن.\n\nالاقتران سريع وتعيد الاتصال بهاتفي بشكل موثوق بعد إخراجها من العلبة. أخذت أزرار اللمس بضعة أيام للتعوّد عليها لكنها أصبحت مريحة الآن.\n\nعلبة الشحن تبدو بلاستيكية بعض الشيء وتلتقط الخدوش بسهولة، وهذا هو الأمر الوحيد الذي يمنعها من توصية كاملة.",
        pros: ["إلغاء ضوضاء قوي مقابل السعر", "إعادة اتصال موثوقة", "عمر بطارية طويل"],
        cons: ["علبة الشحن تبدو رخيصة", "أزرار اللمس تحتاج فترة تعوّد قصيرة"],
      },
    },
    seo: {
      metaTitle: { en: "", ar: "" },
      metaDescription: { en: "", ar: "" },
      targetKeywords: "",
      socialTitle: { en: "", ar: "" },
      socialDescription: { en: "", ar: "" },
    },
  },
];

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = getContentStore();

  // Refuse to run again once the store already has real data — this seeds a fixed, one-time
  // snapshot, and re-running it after real edits have happened would silently wipe them out.
  const existing = await store.get("categories.json", { type: "json" });
  const force = request.nextUrl.searchParams.get("force") === "true";
  if (Array.isArray(existing) && existing.length > 0 && !force) {
    return NextResponse.json(
      {
        error:
          "Content store already has data — refusing to overwrite. Pass ?force=true if you really want to reset it to this fixed snapshot.",
      },
      { status: 409 }
    );
  }

  await store.setJSON("categories.json", categories);
  await store.setJSON("tags.json", tags);
  for (const review of reviews) {
    await store.setJSON(`reviews/${review.slug}.json`, review);
  }

  return NextResponse.json({
    ok: true,
    seeded: { categories: categories.length, tags: tags.length, reviews: reviews.length },
  });
}
