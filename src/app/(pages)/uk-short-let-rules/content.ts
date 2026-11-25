import type { FaqEntry } from "@/lib/seo";

/**
 * All content for the UK short-let rules hub. Re-check monthly and update
 * `brand.content.rulesLastChecked` in src/config/brand.ts when you do.
 */

export type NationKey = "all" | "england" | "london" | "scotland" | "wales" | "ni";
export type TopicKey = "all" | "permission" | "safety" | "guests" | "money" | "running";
export type StatusKind = "law" | "coming" | "platform" | "contract";

export const statusStyles: Record<StatusKind, { bg: string; fg: string }> = {
  law: { bg: "#E8EEF3", fg: "#14212B" },
  coming: { bg: "#FFF1CC", fg: "#6B4A00" },
  platform: { bg: "#EEEAF6", fg: "#4B3A75" },
  contract: { bg: "#F2F3F5", fg: "#3A4650" },
};

export const statusKey: { kind: StatusKind; t: string; d: string }[] = [
  { kind: "law", t: "Law now", d: "In force today" },
  { kind: "coming", t: "Coming", d: "Confirmed, not yet live" },
  { kind: "platform", t: "Platform rule", d: "Airbnb policy, not law" },
  { kind: "contract", t: "Contract rule", d: "Your mortgage or lease" },
];

export const heroSummary = [
  "Rules depend on where your property is. ",
  { b: "Scotland" },
  " requires a licence. ",
  { b: "Northern Ireland" },
  " requires Tourism NI certification. ",
  { b: "Wales" },
  " requires registration by 31 March 2027, and Cardiff starts a visitor levy on 1 April 2027. ",
  { b: "England" },
  " has no licence yet, but a national register is due by March 2027, and London limits entire-home short lets to 90 nights a year without planning permission. Everywhere: a fire risk assessment, a yearly gas check, and holiday-let income taxed like other rental income.",
] as const;

export const nations: { key: NationKey; t: string }[] = [
  { key: "all", t: "All" },
  { key: "england", t: "England" },
  { key: "london", t: "London" },
  { key: "scotland", t: "Scotland" },
  { key: "wales", t: "Wales" },
  { key: "ni", t: "N. Ireland" },
];

export const heroNations: { key: NationKey; t: string }[] = [
  { key: "england", t: "England" },
  { key: "london", t: "London" },
  { key: "scotland", t: "Scotland" },
  { key: "wales", t: "Wales" },
  { key: "ni", t: "Northern Ireland" },
];

export const topics: { key: TopicKey; t: string }[] = [
  { key: "all", t: "All topics" },
  { key: "permission", t: "Permission to let" },
  { key: "safety", t: "Safety" },
  { key: "guests", t: "Guests and bookings" },
  { key: "money", t: "Tax and money" },
  { key: "running", t: "Running the property" },
];

export const timeline: { d: string; t: string; w: string; live: boolean }[] = [
  { d: "From 1 May 2026", t: "Renters’ Rights Act phase 1: assured shorthold tenancies and Section 21 abolished", w: "England", live: true },
  { d: "24 July 2026", t: "Edinburgh Visitor Levy: 5% on the first 5 nights", w: "Edinburgh", live: true },
  { d: "January 2027", t: "Glasgow visitor levy: 5%", w: "Glasgow", live: false },
  { d: "By March 2027", t: "National short-term let register expected to be fully operational", w: "England", live: false },
  { d: "31 March 2027", t: "Deadline to register all visitor accommodation (free)", w: "Wales", live: false },
  { d: "1 April 2027", t: "Cardiff visitor levy: £1.30 per person per night", w: "Cardiff", live: false },
  { d: "April 2027", t: "Aberdeen visitor levy: 7%", w: "Aberdeen", live: false },
  { d: "6 April 2027", t: "Property income tax rates rise to 22% / 42% / 47%", w: "E, W, NI", live: false },
  { d: "6 April 2027", t: "Making Tax Digital for qualifying income over £30,000", w: "UK", live: false },
  { d: "June 2027", t: "Stirling visitor levy: 3% (first 7 nights)", w: "Stirling", live: false },
  { d: "July 2027", t: "West Dunbartonshire visitor levy: 5%", w: "W. Dunbartonshire", live: false },
  { d: "6 April 2028", t: "Making Tax Digital for qualifying income over £20,000", w: "UK", live: false },
  { d: "To be confirmed", t: "Mayors and strategic authorities get powers to charge a visitor levy", w: "England", live: false },
  { d: "To be confirmed", t: "Possible change to the 182-day business rates threshold", w: "Wales", live: false },
];

type Cell = { t: string; tone?: "yes" | "alert" };
export const quickGrid: { k: string; v: Cell[] }[] = [
  { k: "Licence or registration", v: [{ t: "Register due by March 2027" }, { t: "Licence required now", tone: "alert" }, { t: "Register by 31 March 2027" }, { t: "Tourism NI certificate now", tone: "alert" }] },
  { k: "Planning limits", v: [{ t: "London: 90 nights (entire homes)" }, { t: "Control areas, e.g. all of Edinburgh" }, { t: "Some councils, via use classes" }, { t: "Ask your council" }] },
  { k: "Visitor levy", v: [{ t: "Coming (mayoral areas)" }, { t: "Edinburgh live; more in 2027" }, { t: "Cardiff from April 2027" }, { t: "None" }] },
  { k: "Fire risk assessment", v: [{ t: "Yes", tone: "yes" }, { t: "Yes", tone: "yes" }, { t: "Yes", tone: "yes" }, { t: "Yes", tone: "yes" }] },
  { k: "Annual gas safety check", v: [{ t: "Yes", tone: "yes" }, { t: "Yes", tone: "yes" }, { t: "Yes", tone: "yes" }, { t: "Yes", tone: "yes" }] },
  { k: "EICR (electrics report)", v: [{ t: "Strongly advised" }, { t: "Required for licence", tone: "alert" }, { t: "Strongly advised" }, { t: "Strongly advised" }] },
  { k: "Second-home council tax premium", v: [{ t: "Up to 100%" }, { t: "Up to 100%" }, { t: "Up to 300%" }, { t: "N/A (domestic rates)" }] },
];

export type Rule = {
  /** Card id for deep links, e.g. /uk-short-let-rules#gas-safety (used by the compliance checker). */
  anchor?: string;
  /** Extra ids that also open this card. */
  aliases?: string[];
  /** Slug of a tool to link from this card ("Check if you qualify"), shown once the tool is live. */
  tool?: string;
  /** Button text for the tool link (default "Check if you qualify"). */
  toolLabel?: string;
  /** Added to the tool link, e.g. "?item=gas" to highlight one item. */
  toolQuery?: string;
  topic: Exclude<TopicKey, "all">;
  /** Nations the rule applies to; "uk" = everywhere. */
  n: Array<"uk" | Exclude<NationKey, "all">>;
  kind: StatusKind;
  status: string;
  where: string;
  q: string;
  a: string;
  todo: string[];
  src: string;
};

export const rules: Rule[] = [
  { topic: "permission", n: ["london"], kind: "law", status: "Law now", where: "Greater London, entire homes", anchor: "london-90-nights", tool: "london-90-night-counter", toolLabel: "Count my nights", q: "Is there a 90-day rule for Airbnb in London?", a: "Yes. In London, using a home as short-term sleeping accommodation (stays under 90 consecutive nights) counts as a change of use needing planning permission, unless the total is 90 nights or fewer in a calendar year and the person providing it pays council tax on the property. Go over 90 nights without planning permission and the council can take enforcement action. Airbnb automatically blocks entire-home London listings after 90 booked nights a year, unless you show it you have permission.", todo: ["Count nights across all platforms and direct bookings: the limit is per property, not per platform.", "Want more than 90 nights? Apply to your borough for planning permission, or switch to stays of 90+ nights.", "Renting a private room in the home you live in is treated differently by Airbnb’s cap. Check with your borough."], src: "Deregulation Act 2015, s.44 and Explanatory Notes; Airbnb Help Centre, article 1340" },
  { topic: "permission", n: ["england"], kind: "law", status: "Law now · decided locally", where: "England", anchor: "planning-permission", q: "Do I need planning permission for a short let in England?", a: "There’s no national rule outside London. Your local planning authority decides, based on how the property is used and its impact on neighbours. A property let back-to-back all year with frequent guest turnover is more likely to be seen as a change of use than a home let occasionally. The previous government proposed a new “C5” short-let use class; as of November 2026 it hasn’t been introduced.", todo: ["Ask your council’s planning team before buying or converting a property for short lets.", "Keep records of how the property is used."], src: "GOV.UK, Letting out a self-catering holiday home in England" },
  { topic: "permission", n: ["england"], kind: "coming", status: "Coming · by March 2027", where: "England", anchor: "england-register", q: "Do I need to register my short let in England?", a: "Not yet. A mandatory national register for short-term and holiday lets is expected to be fully operational by March 2027. The government has said it will be online, “light touch” and low cost. Fees, the information required and penalties haven’t been published yet.", todo: ["Get your documents in order now (fire risk assessment, gas certificate, insurance), so registering is quick.", "Sign up for rule-change alerts: we’ll update this card the day details are published."], src: "GOV.UK self-catering holiday home guidance; Propertymark, Parliamentary answers, 3 September 2026" },
  { topic: "permission", n: ["uk"], kind: "contract", status: "Contract rule", where: "UK", anchor: "mortgage-consent", q: "Do I need my mortgage lender’s permission to do Airbnb?", a: "Usually, yes. Many residential and buy-to-let mortgages don’t allow holiday or short-term letting without the lender’s consent. Letting without it can breach your mortgage terms. Holiday-let mortgages exist for this use.", todo: ["Read your mortgage offer for “letting” or “holiday let” conditions.", "Ask your lender for written consent, or switch to a holiday-let mortgage.", "Tell your insurer too: standard home insurance may not cover paying guests."], src: "Your mortgage terms" },
  { topic: "permission", n: ["england", "wales"], kind: "contract", status: "Contract rule · case law", where: "England and Wales", anchor: "lease-covenants", q: "Can I Airbnb my leasehold flat?", a: "Check your lease first. Many leases say the flat may only be used as a “private residence” or ban subletting. In Nemcova v Fairfield Rents (2016), the Upper Tribunal found that short lets to business visitors of around 90 days a year breached a “private residence” covenant, because short-stay guests don’t occupy it as a home. The result depends on your lease wording, but a breach can put the lease at risk.", todo: ["Read the user and subletting clauses in your lease.", "Ask the freeholder for written consent if needed.", "Get legal advice if the wording is unclear."], src: "Nemcova v Fairfield Rents Ltd [2016] UKUT 303 (LC)" },
  { topic: "permission", n: ["england"], kind: "law", status: "Law now · since 1 May 2026", where: "England", anchor: "landlord-consent", aliases: ["right-to-rent", "renters-rights-act"], q: "Is rent-to-rent serviced accommodation still allowed after the Renters’ Rights Act?", a: "Since 1 May 2026, assured shorthold tenancies and fixed terms have been replaced by periodic assured tenancies in England. Holiday lets have always been outside the assured tenancy system. But the label isn’t what counts: a long stay used as someone’s main home with exclusive possession (for example, a contractor staying for months) can be a tenancy in law, whatever you call it. Rent-to-rent operators also need the owner’s written consent to sublet for short stays.", todo: ["Use a written agreement with the owner that clearly allows short-term letting.", "Check the owner’s mortgage, insurance and any head lease allow it.", "For long contractor stays, get advice on whether your agreement could become a tenancy."], src: "GOV.UK, Renters’ Rights Act 2025 roadmap; Housing Act 1988, Schedule 1" },
  { topic: "safety", n: ["uk"], kind: "law", status: "Law now", where: "UK (England and Wales detail)", anchor: "fire-risk-assessment", tool: "holiday-let-certificate-reminders", toolLabel: "Set a reminder", toolQuery: "?item=fra", q: "Does a holiday let need a fire risk assessment?", a: "Yes. If you charge guests to stay and it isn’t your private home, the Regulatory Reform (Fire Safety) Order 2005 applies, even for one night. The “responsible person” (usually the owner or manager) must carry out a suitable fire risk assessment, record the findings, and review it regularly, usually yearly and after any significant change. Home Office guidance for small premises (up to 10 guests or 2 floors) covers interlinked smoke alarms, heat alarms in kitchens, fire doors, escape routes and fire information for guests. In a block of flats, you must also cooperate with the managing agent.", todo: ["Complete and record a fire risk assessment (yourself if competent, or use a professional).", "Fit mains-powered, interlinked smoke alarms and a kitchen heat alarm; test monthly.", "Exit doors must open from inside without a key.", "Leave a fire escape plan and the full address and postcode in the welcome guide."], src: "Home Office, Making your small paying guest accommodation safe from fire" },
  { topic: "safety", n: ["uk"], kind: "law", status: "Law now", where: "UK", anchor: "gas-safety", tool: "holiday-let-certificate-reminders", toolLabel: "Set a reminder", toolQuery: "?item=gas", q: "Do holiday lets need a gas safety certificate?", a: "Yes. HSE treats rented holiday accommodation (cottages, flats, chalets, caravans, narrowboats) as covered by the landlord gas safety duties. Every gas appliance and flue you provide must be checked every 12 months by a Gas Safe registered engineer, and you must keep the record.", todo: ["Book an annual gas safety check and keep each record.", "Fit a CO alarm in any room with a fuel-burning appliance (a licence condition in Scotland).", "Leave the gas safety record where guests can see it."], src: "HSE, Landlords and gas safety FAQs" },
  { topic: "safety", n: ["uk"], kind: "law", status: "Law in Scotland · advised elsewhere", where: "UK", anchor: "electrical-safety", tool: "holiday-let-certificate-reminders", toolLabel: "Set a reminder", toolQuery: "?item=eicr", q: "Is an EICR (electrical report) a legal requirement for an Airbnb?", a: "In Scotland, yes: a short-term let licence needs an Electrical Installation Condition Report (at least every five years) and portable appliance testing (PAT). In England, the EICR law for landlords is written for tenancies, not holiday lets, but you still have to keep guests safe, and GOV.UK points holiday-let owners to the electrical safety standards. Most insurers and agencies expect an EICR.", todo: ["Get an EICR from a qualified electrician every five years.", "PAT-test appliances you provide."], src: "Licensing of Short-term Lets (Scotland) Order 2022, Schedule 3; GOV.UK self-catering guidance" },
  { topic: "safety", n: ["uk"], kind: "law", status: "Law now", where: "UK", anchor: "furniture-fire-safety", q: "Do sofas and mattresses in a holiday let need fire labels?", a: "Yes. Upholstered furniture and mattresses you supply in a letting business must meet the Furniture and Furnishings (Fire) (Safety) Regulations 1988. In Scotland, keeping proof is a licence condition.", todo: ["Check for permanent fire labels before buying second-hand furniture.", "Keep receipts or photos of labels as proof."], src: "Scotland Order 2022, Schedule 3; mygov.scot" },
  { topic: "safety", n: ["uk"], kind: "law", status: "Law now", where: "UK", anchor: "legionella", tool: "holiday-let-certificate-reminders", toolLabel: "Set a reminder", toolQuery: "?item=legionella", q: "Do I need a legionella risk assessment for a holiday let?", a: "Yes. Under health and safety law, anyone providing accommodation as a business should assess the risk of legionella from water systems, especially where properties sit empty between guests or have hot tubs. In Scotland, it’s a licence condition.", todo: ["Do a simple written legionella risk assessment.", "Flush taps and showers after empty periods; keep hot water hot.", "Follow HSE guidance for hot tubs."], src: "Scotland Order 2022, Schedule 3; HSE legionella guidance" },
  { topic: "guests", n: ["uk"], kind: "law", status: "Law now · often missed", where: "UK", anchor: "guest-register", tool: "guest-register-template", toolLabel: "Make my guest register", q: "Do I have to keep a record of my guests?", a: "Yes. The Immigration (Hotel Records) Order 1972 applies to any “hotel or other premises” providing sleeping accommodation for reward, which includes holiday lets. For every guest aged 16 or over, record their full name, nationality and arrival date. For guests who aren’t British, Irish or Commonwealth citizens, also record their passport number and place of issue (or other ID) and next destination. Keep records for at least 12 months; police can ask to see them.", todo: ["Collect names and nationality of all adult guests at check-in (online forms work well).", "Store records securely and delete them after 12 months unless you need them longer."], src: "Immigration (Hotel Records) Order 1972, articles 3–5" },
  { topic: "guests", n: ["england"], kind: "law", status: "Law now", where: "England", q: "Do I need to do Right to Rent checks for Airbnb guests?", a: "Not for genuine holiday stays. Right to Rent checks apply where someone will use the property as their only or main home. The Home Office says short, leisure-based lettings can be treated as holiday accommodation, but bookings of three months or more, or repeatedly extended stays, may suggest it’s becoming someone’s home and could need checks.", todo: ["For very long or open-ended bookings, check the Home Office landlord’s guide."], src: "Home Office, Landlord’s guide to right to rent checks (1 October 2026)" },
  { topic: "guests", n: ["uk"], kind: "law", status: "Law now", where: "UK", anchor: "cancellation-policy", q: "Do guests have a 14-day right to cancel a direct booking?", a: "No. The usual 14-day cooling-off period for online and phone purchases doesn’t apply to accommodation booked for a specific date or period. Your own cancellation policy decides refunds, so it must be clear, fair and shown before the guest pays.", todo: ["Publish your cancellation policy on your booking page and in the confirmation."], src: "Consumer Contracts Regulations 2013, reg. 28(1)(h)" },
  { topic: "guests", n: ["england", "wales"], kind: "law", status: "Law now", where: "England and Wales", q: "Do I need to protect a holiday let deposit?", a: "No. Tenancy deposit protection is for assured tenancies, and genuine holiday lets aren’t tenancies of that kind. You should still explain in writing when and why a damage deposit may be kept, and return it promptly.", todo: [], src: "Housing Act 1988, Schedule 1" },
  { topic: "guests", n: ["england", "wales"], kind: "law", status: "Law now", where: "England and Wales", q: "What can I do if a guest won’t leave?", a: "Guests on a genuine holiday let are “excluded occupiers”, so once the stay ends you don’t need a court order to regain possession. But if the arrangement isn’t really a holiday (for example, someone living there for months), it may be a tenancy, and normal eviction rules apply. Never use force: call the police if there’s a risk and get legal advice.", todo: [], src: "Protection from Eviction Act 1977, s.3A; Shelter England" },
  { topic: "guests", n: ["uk"], kind: "law", status: "Law now", where: "UK", anchor: "assistance-dogs", tool: "house-rules-generator", toolLabel: "Write my house rules", q: "Can I refuse a guest with an assistance dog?", a: "No. Under the Equality Act 2010 (and equivalent law in Northern Ireland), refusing a disabled guest because of their assistance dog is likely to be unlawful discrimination, even if your listing is “no pets”. You can’t charge a pet fee for an assistance dog either.", todo: ["Add “assistance dogs always welcome” to your house rules.", "Brief your cleaners and co-hosts."], src: "Equality Act 2010; Guide Dogs UK" },
  { topic: "guests", n: ["uk"], kind: "platform", status: "Platform rule + data law", where: "UK", anchor: "cameras", tool: "house-rules-generator", toolLabel: "Write my house rules", q: "Can I have security cameras in my Airbnb?", a: "Not inside. Airbnb banned all indoor security cameras from 30 April 2024. Outdoor and doorbell cameras must be disclosed in your listing. If a camera captures areas beyond your property, such as the street or a neighbour’s garden, UK data protection law applies.", todo: ["Remove any indoor cameras.", "Disclose outdoor and doorbell cameras in the listing.", "Point cameras at your own property only and keep footage secure."], src: "Airbnb policy, March 2024; GOV.UK, Domestic CCTV" },
  { topic: "guests", n: ["uk"], kind: "law", status: "Law now · since 6 April 2025", where: "UK", anchor: "all-in-pricing", q: "Can I advertise a price and add the cleaning fee later?", a: "No. Under the Digital Markets, Competition and Consumers Act 2024, the headline price must include all unavoidable fees, such as a mandatory cleaning fee. The same law bans fake reviews and hiding negative ones. This matters most on your own website, social media and direct booking pages.", todo: ["Show the total price, including mandatory fees, wherever a price appears.", "Never post or buy fake reviews, or remove genuine negative ones."], src: "CMA price transparency guidance; DMCC Act 2024" },
  { topic: "guests", n: ["uk"], kind: "platform", status: "Platform rule", where: "Airbnb listings", q: "Can I ask Airbnb guests to book with me directly next time?", a: "Not through Airbnb. Its off-platform policy doesn’t allow hosts to use Airbnb messages or listings to send guests elsewhere to book or pay. Platform rules aren’t law, but breaking them can get your listing suspended. Grow direct bookings through your own website, social media and Google instead.", todo: [], src: "Airbnb Help Centre, Off-platform policy (article 2799)" },
  { topic: "money", n: ["uk"], kind: "law", status: "Law now · abolished 6 April 2025", where: "UK", q: "Is the furnished holiday lettings (FHL) tax regime still available?", a: "No. From 6 April 2025, holiday-let income is taxed like any other property income. Mortgage interest only gets basic-rate relief, new furniture is claimed through replacement of domestic items relief, capital gains reliefs such as Business Asset Disposal Relief no longer apply (with some transitional protection), and the income no longer counts as earnings for pension relief.", todo: ["Speak to an accountant about how this changes your profit after tax."], src: "GOV.UK, Abolition of the furnished holiday lettings tax regime" },
  { topic: "money", n: ["england", "wales", "ni"], kind: "coming", status: "Coming · 6 April 2027", where: "England, Wales and NI", anchor: "property-income-tax", tool: "short-let-profit-calculator", toolLabel: "Estimate my tax", q: "Is tax on rental income going up?", a: "Yes. From 6 April 2027, property income will have its own tax rates: 22% basic, 42% higher and 47% additional rate, 2 percentage points above current rates. Scotland will set its own property income rates.", todo: [], src: "GOV.UK technical note, Changes to tax rates for property, savings and dividend income" },
  // VERIFY: VAT threshold, Making Tax Digital thresholds and dates, and the FHL abolition dates before launch.
  { topic: "money", n: ["uk"], kind: "law", status: "Law now", where: "UK", anchor: "vat", tool: "short-let-profit-calculator", toolLabel: "Check my figures", q: "Do I need to register for VAT on a holiday let?", a: "Short-term holiday accommodation is standard-rated for VAT. You must register if your VAT-taxable turnover goes over the registration threshold (£90,000 since 1 April 2024) in any rolling 12 months, or you expect it to in the next 30 days alone. Once registered, your prices include VAT, so a fifth of a 20%-VAT price goes to HMRC.", todo: ["Add up your booking income (including cleaning fees) over the last 12 months, every month.", "If you’re getting close, speak to an accountant before you go over."], src: "GOV.UK, How VAT works: when to register; VAT Notice 709/3" },
  { topic: "money", n: ["uk"], kind: "coming", status: "Coming · from 6 April 2026", where: "UK", anchor: "making-tax-digital", tool: "short-let-profit-calculator", toolLabel: "Check my figures", q: "Does Making Tax Digital apply to holiday let income?", a: "Yes, for individuals. Making Tax Digital for Income Tax means keeping digital records and sending quarterly updates with compatible software. It applies from April 2026 if your qualifying income (property plus self-employment, before expenses) is over £50,000, from April 2027 over £30,000, and from April 2028 over £20,000.", todo: ["Add up your gross property and self-employment income.", "Choose MTD-compatible software or ask your accountant."], src: "GOV.UK, Check if you’re eligible for Making Tax Digital for Income Tax" },
  { topic: "money", n: ["uk"], kind: "law", status: "Law now · since 6 April 2025", where: "UK", anchor: "fhl-abolished", tool: "short-let-profit-calculator", toolLabel: "See my profit after tax", q: "What happened to the furnished holiday lettings tax rules?", a: "The furnished holiday lettings (FHL) tax regime was abolished from 6 April 2025 (1 April 2025 for companies). Holiday lets are now taxed like other property income: mortgage interest gets a basic-rate tax credit instead of a full deduction, capital allowances no longer apply to new spending, and the income no longer counts as relevant earnings for pensions.", todo: ["Check how mortgage interest now affects your tax.", "Ask an accountant about transitional rules for capital allowances and capital gains."], src: "GOV.UK, Abolition of the furnished holiday lettings tax regime" },
  { topic: "money", n: ["uk"], kind: "law", status: "Law now", where: "UK", q: "Does Airbnb tell HMRC how much I earn?", a: "Yes. Under the digital platform reporting rules (in force since 1 January 2024), platforms like Airbnb report hosts’ earnings to HMRC every year, with the first reports sent in January 2025. It doesn’t create a new tax, but HMRC can match platform data against tax returns.", todo: ["Declare all short-let income, from every platform and direct bookings."], src: "Airbnb UK newsroom" },
  { topic: "money", n: ["uk"], kind: "law", status: "Law now · phasing in", where: "UK", q: "Do I need to use Making Tax Digital for my holiday let?", a: "If your qualifying income from self-employment and property was over £50,000 in 2024–25, you should have started using Making Tax Digital for Income Tax from 6 April 2026: digital records and quarterly updates through compatible software. The threshold drops to £30,000 from April 2027 and £20,000 from April 2028.", todo: [], src: "GOV.UK, Making Tax Digital for Income Tax" },
  { topic: "money", n: ["uk"], kind: "law", status: "Law now", where: "UK", q: "Is Airbnb income tax-free if I rent a room in my home?", a: "Possibly. The Rent a Room scheme lets you earn up to £7,500 a year tax-free (£3,750 if you share the income) from furnished accommodation in your only or main home. It doesn’t cover homes converted into separate flats. A £1,000 property allowance can cover very small amounts of property income.", todo: [], src: "GOV.UK, Rent a room in your home" },
  { topic: "money", n: ["uk"], kind: "law", status: "Law now", where: "UK", q: "Do I charge VAT on a holiday let?", a: "Only if you’re VAT registered. Holiday accommodation is standard-rated, and the hotel “reduced value rule” for stays over 28 days doesn’t apply to holiday accommodation. You must register once VAT-taxable turnover goes over the threshold (£90,000 when checked).", todo: [], src: "HMRC VAT Notice 709/3; GOV.UK, Register for VAT" },
  { topic: "money", n: ["england"], kind: "law", status: "Law now", where: "England", anchor: "business-rates-england", tool: "holiday-let-business-rates-checker", q: "Does my holiday let pay business rates or council tax?", a: "In England, a self-catering property is assessed for business rates only if it’s available to let for at least 140 days in the coming 12 months and was actually let for at least 70 days in the previous 12 (lets of 28 days or fewer). The Valuation Office Agency decides. Small business rate relief can then reduce or remove the bill (full relief up to £12,000 rateable value, usually for your only business property). Otherwise it pays council tax, and most councils can charge a second homes premium of up to 100% (since April 2025), with some exceptions.", todo: ["Keep booking records and adverts as evidence for the VOA.", "Check your council’s second homes premium policy."], src: "VOA criteria; Levelling-up and Regeneration Act 2023; council premium pages" },
  { topic: "money", n: ["england", "scotland", "wales"], kind: "law", status: "Law now · set by each council", where: "England, Scotland and Wales", anchor: "second-homes-premium", tool: "holiday-let-business-rates-checker", q: "Do second homes pay a council tax premium?", a: "They can. A furnished property that isn’t anyone’s main home, and doesn’t meet the tests for business rates, pays council tax, and many councils add a second-home premium on top. Councils in England and Scotland can charge a premium of up to 100% (up to double the normal bill), and councils in Wales up to 300%. Each council decides whether to charge it, how much, and any exceptions.", todo: ["Check whether your holiday let meets the day-count tests for business rates.", "Look up your council’s second-home premium and its exceptions.", "Budget for the premium if your property stays on council tax."], src: "GOV.UK, Council tax on second homes and empty properties; Scottish Government; Welsh Government" },
  { topic: "money", n: ["england", "scotland", "wales"], kind: "law", status: "Live in Edinburgh · coming elsewhere", where: "Scotland, Wales, England", anchor: "visitor-levy", tool: "uk-visitor-levy-calculator", toolLabel: "Calculate the levy", q: "Is there a tourist tax on short lets in the UK?", a: "Yes, in some places. Edinburgh charges 5% on the first 5 nights for stays from 24 July 2026, including short-term lets. Glasgow (5%, January 2027), Aberdeen (7%, April 2027), Stirling (3%, first 7 nights, June 2027) and West Dunbartonshire (5%, July 2027) follow. In Wales, Cardiff charges £1.30 per person per night from 1 April 2027 (75p for hostels and camping). In England, mayoral and foundation strategic authorities will get powers to charge a percentage levy, including on short lets, each setting its own start date.", todo: ["Check your council’s levy page and register as a provider where required.", "Show the levy clearly in your pricing."], src: "City of Edinburgh Council; VisitScotland; Welsh Government; GOV.UK Visitor Levy response" },
  { topic: "running", n: ["england", "wales"], kind: "law", status: "Law now · often missed", where: "England and Wales", anchor: "commercial-waste", q: "Can I put holiday let rubbish in household bins?", a: "No. Under the Controlled Waste (England and Wales) Regulations 2012, waste from a home used in a business to provide self-catering accommodation is commercial waste, whether the property pays council tax or business rates. You need a commercial collection and a waste transfer note. In Wales, workplace recycling rules (from 6 April 2024) also require businesses to separate recycling.", todo: ["Arrange a commercial waste contract and keep the waste transfer note.", "Tell guests how to sort their rubbish."], src: "Controlled Waste Regulations 2012, Schedule 1; South Hams Council; Welsh Government" },
  { topic: "running", n: ["uk"], kind: "law", status: "Law now", where: "UK", anchor: "tv-licence", q: "Do I need a TV licence for my holiday let?", a: "Yes, if you provide a TV or device for guests to watch live TV or BBC iPlayer. Short-stay self-catering needs a Hotel and Mobile Units TV Licence, which covers up to 15 units for one fee. Guests’ home licences don’t cover them. A music licence (PPL PRS) usually isn’t needed if you have fewer than four self-catering units, it’s your only holiday business, and facilities are for guests only.", todo: [], src: "VisitBritain, TV and copyright licences" },
  { topic: "running", n: ["uk"], kind: "law", status: "Law now", where: "UK", anchor: "food-business", q: "Do I need to register as a food business?", a: "If you serve or supply food or drink, such as breakfast in a B&B, you must register with your council at least 28 days before you start. A self-catering let that supplies no food doesn’t need to. If you provide hampers or breakfast packs, ask your council’s environmental health team.", todo: [], src: "VisitBritain, Food safety and hygiene" },
  { topic: "running", n: ["england", "wales"], kind: "law", status: "Law now · only sometimes", where: "England and Wales", q: "Does a holiday let need an EPC?", a: "Only in some cases. GOV.UK says a holiday let needs an EPC if it’s let for a combined 4 months or more in any 12 months, with stays under 31 days, and guests pay the energy costs. If energy is included in the price, an EPC usually isn’t required. Minimum energy rating rules for landlords apply to tenancies, not holiday lets.", todo: [], src: "GOV.UK, Guide to EPCs for the marketing, sale and let of dwellings" },
  { topic: "running", n: ["uk"], kind: "law", status: "Law in Scotland · advised elsewhere", where: "UK", anchor: "insurance", q: "Does my holiday let need special insurance?", a: "In Scotland, buildings insurance and public liability insurance are licence conditions. Elsewhere, GOV.UK advises holiday-let insurance, public liability cover and buildings and contents cover suitable for short-term letting. Standard home insurance often doesn’t cover paying guests.", todo: [], src: "Scotland Order 2022, Schedule 3; GOV.UK self-catering guidance" },
  { topic: "permission", n: ["scotland"], kind: "law", status: "Law now", where: "Scotland", anchor: "scotland-licence", aliases: ["scotland-licence-number"], q: "Do I need a licence for a short-term let in Scotland?", a: "Yes. Every short-term let in Scotland needs a council licence, including home sharing and home letting. Existing hosts had to apply by 1 October 2023; new hosts can’t take bookings until licensed. Mandatory conditions include gas safety, EICR and PAT, fire and CO alarms, furniture fire safety, a legionella assessment, buildings and public liability insurance, maximum occupancy, and displaying the licence and safety information. Every listing or advert must show your licence number and, where required, your EPC rating.", todo: ["Check your council’s extra conditions and fees.", "Add your licence number to every listing, including your website and social media."], src: "Licensing of Short-term Lets (Scotland) Order 2022, Schedule 3; mygov.scot" },
  { topic: "permission", n: ["scotland"], kind: "law", status: "Law now", where: "Scotland (e.g. Edinburgh)", anchor: "scotland-control-areas", q: "What is a short-term let control area?", a: "Councils can make control areas where letting a whole property that isn’t your main home needs planning permission. The whole City of Edinburgh has been a control area since 5 September 2022. There, you need planning permission (or to have applied) before you can be licensed for secondary letting.", todo: [], src: "City of Edinburgh Council, Short-term lets" },
  { topic: "money", n: ["scotland"], kind: "law", status: "Law now", where: "Scotland", anchor: "business-rates-scotland", tool: "holiday-let-business-rates-checker", q: "Business rates or council tax in Scotland?", a: "A second home available as a holiday let for 140 days or more in a financial year, and actually let for 70 nights or more, may be assessed for non-domestic rates instead of council tax. Otherwise, councils can charge a second homes premium of up to 100% (since April 2024).", todo: [], src: "SPICe, Second homes in Scotland (May 2025)" },
  { topic: "permission", n: ["wales"], kind: "law", status: "Law now · deadline 31 March 2027", where: "Wales", anchor: "wales-register", q: "Do I need to register my holiday let in Wales?", a: "Yes. Anyone taking bookings for stays of 31 nights or fewer in Wales, including self-catering lets, rooms in your home, B&Bs and glamping, must register with the Welsh Revenue Authority by 31 March 2027, even if your council doesn’t charge a visitor levy. It’s free and you get a registration number. Report changes, such as selling, within 30 days. Missing the deadline can lead to a penalty.", todo: [], src: "Welsh Government, Registering visitor accommodation" },
  { topic: "money", n: ["wales"], kind: "law", status: "Law now", where: "Wales", anchor: "business-rates-wales", tool: "holiday-let-business-rates-checker", q: "How many days must a Welsh holiday let be let for business rates?", a: "To be business rated, a self-catering property in Wales must be available for at least 252 days and actually let for at least 182 days in 12 months, and intended to continue being let. From April 2026, the 182 days can be averaged over 2 or 3 years, and up to 14 days donated to a registered charity can count. Otherwise it pays council tax, and councils can charge a premium of up to 300%. The Welsh Government consulted in August 2026 on adjusting the threshold.", todo: [], src: "Conwy Council; Welsh Government; Financial Reporter, 11 August 2026" },
  { topic: "permission", n: ["wales"], kind: "law", status: "Law now · decided locally", where: "Wales", q: "Do I need planning permission for a holiday let in Wales?", a: "Wales has separate planning use classes for main homes (C3), second homes (C5) and short-term lets (C6). Councils can use Article 4 directions to require planning permission to switch between them. Gwynedd introduced the first in 2024, but the High Court quashed its confirmation in 2025, so check your council’s current position.", todo: [], src: "Browne Jacobson, 31 October 2025" },
  { topic: "permission", n: ["ni"], kind: "law", status: "Law now", where: "Northern Ireland", anchor: "ni-certificate", q: "Do I need a licence for Airbnb in Northern Ireland?", a: "Yes. It’s illegal to offer tourist accommodation in Northern Ireland without a Tourism NI certificate, under the Tourism (Northern Ireland) Order 1992. Airbnb-style lets are usually certified as self-catering: £40 per unit (maximum £350) for four years. Get certified before advertising or taking bookings. Operating without one can lead to a fine of up to £2,500, imprisonment, or both.", todo: [], src: "Tourism NI, What do you need to consider" },
];

export const myths = [
  { h: "“You need a licence to Airbnb in England.”", t: "Not yet. A national register is due by March 2027. Scotland and Northern Ireland do require one now." },
  { h: "“London Airbnbs are illegal after 90 days.”", t: "Only without planning permission, and the limit covers short stays in the whole property, counted across all platforms." },
  { h: "“All holiday lets need an EPC.”", t: "Only if let 4+ months a year and guests pay the energy bills (England and Wales)." },
  { h: "“Guests can cancel within 14 days for free.”", t: "No. Dated accommodation is exempt; your cancellation policy decides." },
  { h: "“I have to protect the damage deposit.”", t: "Not for genuine holiday lets." },
  { h: "“I can refuse dogs, full stop.”", t: "Not assistance dogs." },
  { h: "“Business rates are always cheaper.”", t: "Only if you meet the letting tests, and relief often depends on it being your only business property." },
  { h: "“Holiday lets still get special tax breaks.”", t: "The FHL regime ended on 6 April 2025." },
  { h: "“There’s no need to keep guest details.”", t: "You must record names and nationality of adult guests (and more for some overseas guests) for 12 months." },
  { h: "“Holiday let rubbish can go in my household bin.”", t: "It’s commercial waste in England and Wales." },
];

export const checklist = [
  "Planning checked with your council (London: count your nights)",
  "Licence or registration for your nation",
  "Written consent: lender, freeholder, insurer",
  "Fire risk assessment, written and reviewed yearly",
  "Interlinked smoke alarms, kitchen heat alarm, CO alarm",
  "Gas safety record every 12 months",
  "EICR every 5 years, plus PAT",
  "Furniture fire labels",
  "Legionella risk assessment",
  "Guest register kept 12 months",
  "Clear cancellation policy and all-in prices",
  "Commercial waste contract",
  "TV licence if you provide TV",
  "All income declared; MTD if over threshold",
  "Letting-day records for business rates",
  "Visitor levy registered and charged where it applies",
];

export const sources = [
  "GOV.UK, Letting out a self-catering holiday home in England",
  "Deregulation Act 2015, s.44 and Explanatory Notes",
  "Airbnb Help Centre: articles 1340, 2799, 1534",
  "Propertymark, National short-term lets register promised by March 2027",
  "GOV.UK, Implementing the Renters’ Rights Act 2025: roadmap",
  "Nemcova v Fairfield Rents Ltd [2016] UKUT 303 (LC)",
  "Home Office, Making your small paying guest accommodation safe from fire",
  "HSE, Landlords and gas safety FAQs",
  "Licensing of Short-term Lets (Scotland) Order 2022, Schedule 3; mygov.scot",
  "Immigration (Hotel Records) Order 1972",
  "Home Office, Landlord’s guide to right to rent checks (October 2026)",
  "Consumer Contracts Regulations 2013, reg. 28",
  "Protection from Eviction Act 1977, s.3A; Shelter England",
  "GOV.UK, Domestic CCTV",
  "CMA, Price transparency guidance (DMCC Act 2024)",
  "GOV.UK, Abolition of the FHL tax regime",
  "GOV.UK, Changes to tax rates for property income: technical note",
  "GOV.UK, Making Tax Digital for Income Tax",
  "GOV.UK, Rent a room in your home",
  "HMRC, VAT Notice 709/3",
  "GOV.UK, Visitor Levy in England: government response",
  "City of Edinburgh Council: Visitor Levy; Short-term lets",
  "VisitScotland, Visitor levy",
  "Welsh Government: Visitor levy; Registering visitor accommodation",
  "Controlled Waste (England and Wales) Regulations 2012, Schedule 1",
  "VisitBritain: TV and copyright licences; Food safety and hygiene",
  "GOV.UK, Guide to energy performance certificates",
  "SPICe, Second homes in Scotland (May 2025)",
  "Conwy County Borough Council, Self-catering properties",
  "Tourism NI, What do you need to consider",
];

export const changelog = [{ d: "17 November 2026", t: "Page published. All rules checked against official sources." }];

export const faq: FaqEntry[] = [
  { q: "Is Airbnb legal in the UK?", a: "Yes, but rules depend on where you are. Scotland needs a licence, Northern Ireland needs Tourism NI certification, Wales needs registration by 31 March 2027, and London limits entire-home short lets to 90 nights a year without planning permission." },
  { q: "What is the 90-day rule in London?", a: "You can let a whole home for short stays for up to 90 nights a calendar year without planning permission, as long as you pay council tax on it. More than that needs planning permission." },
  { q: "Do I need a licence for a short-term let in England?", a: "Not yet. A national register is expected to be fully operational by March 2027." },
  { q: "Does a holiday let need a gas safety certificate?", a: "Yes. Gas appliances must be checked every 12 months by a Gas Safe registered engineer." },
  { q: "Does a holiday let need a fire risk assessment?", a: "Yes. Paying-guest accommodation is covered by fire safety law even for one night, and you must record your assessment." },
  { q: "Do I need to keep guest records?", a: "Yes. Record the full name and nationality of every guest aged 16 or over, plus passport details and next destination for some overseas guests, and keep records for 12 months." },
  { q: "Is there a tourist tax on Airbnbs?", a: "In Edinburgh, yes (5% on the first 5 nights). Glasgow, Aberdeen, Stirling, West Dunbartonshire and Cardiff start in 2027, and English mayoral areas are getting powers to introduce one." },
  { q: "Does Airbnb report my income to HMRC?", a: "Yes. Platforms report hosts’ earnings to HMRC every year under the digital platform reporting rules." },
  { q: "Is holiday let income taxed differently now?", a: "Since 6 April 2025, it’s taxed like other property income, and from 6 April 2027 property income rates rise to 22%, 42% and 47% in England, Wales and Northern Ireland." },
  { q: "Can I put my holiday let rubbish in household bins?", a: "No. In England and Wales, it’s commercial waste and needs a commercial collection." },
];
