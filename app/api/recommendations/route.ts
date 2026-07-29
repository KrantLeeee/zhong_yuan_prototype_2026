const discoverBanners = [
  {
    id: "midyear",
    eyebrow: "2026年度",
    title: "向新深耕 掘金成长",
    subtitle: "A股中期投资策略报告会回放",
    action: "立即查看",
    tone: "gold",
    image: "/og-classic.png",
  },
  {
    id: "daily",
    eyebrow: "专属智能投顾",
    title: "AI日报 每日焕新",
    subtitle: "自选与持仓重点变化一屏掌握",
    action: "查看日报",
    tone: "red",
    image: "/ip/xiaoyuan-daily.webp",
  },
  {
    id: "strategy",
    eyebrow: "稳健投资专区",
    title: "穿越波动 寻找确定性",
    subtitle: "高股息与优质成长精选策略",
    action: "查看策略",
    tone: "green",
    image: "/og-classic.png",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get("placement");

  if (placement !== "discover-banner") {
    return Response.json({ items: [] });
  }

  return Response.json({
    placement,
    personalized: true,
    strategy: "prototype-user-profile-ranking",
    items: discoverBanners,
  });
}
