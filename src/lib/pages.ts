import type { PageSeo } from "./seo";
import { seo as home } from "@/app/(pages)/(home)/seo";
import { seo as services } from "@/app/(pages)/services/(hub)/seo";
import { seo as whoWeHelp } from "@/app/(pages)/who-we-help/seo";
import { seo as pricing } from "@/app/(pages)/pricing/seo";
import { seo as freeTools } from "@/app/(pages)/free-tools/(hub)/seo";
import { seo as complianceChecker } from "@/app/(pages)/free-tools/uk-short-let-compliance-checker/seo";
import { seo as businessRatesChecker } from "@/app/(pages)/free-tools/holiday-let-business-rates-checker/seo";
import { seo as londonNightsCounter } from "@/app/(pages)/free-tools/london-90-night-counter/seo";
import { seo as certificateReminders } from "@/app/(pages)/free-tools/holiday-let-certificate-reminders/seo";
import { seo as visitorLevyCalculator } from "@/app/(pages)/free-tools/uk-visitor-levy-calculator/seo";
import { seo as guestRegisterBuilder } from "@/app/(pages)/free-tools/guest-register-template/seo";
import { seo as houseRulesGenerator } from "@/app/(pages)/free-tools/house-rules-generator/seo";
import { seo as aiReadinessScore } from "@/app/(pages)/free-tools/airbnb-ai-readiness-score/seo";
import { seo as titleChecker } from "@/app/(pages)/free-tools/airbnb-title-checker/seo";
import { seo as photoShotList } from "@/app/(pages)/free-tools/airbnb-photo-shot-list/seo";
import { seo as descriptionBuilder } from "@/app/(pages)/free-tools/airbnb-description-builder/seo";
import { seo as longStay } from "@/app/(pages)/free-tools/long-stay-discount-calculator/seo";
import { seo as ukRules } from "@/app/(pages)/uk-short-let-rules/seo";
import { seo as guestCommunication } from "@/app/(pages)/services/guest-communication/seo";
import { seo as listingOptimisation } from "@/app/(pages)/services/listing-optimisation/seo";
import { seo as pricingOptimisation } from "@/app/(pages)/services/pricing-optimisation/seo";
import { seo as cleaningCoordination } from "@/app/(pages)/services/cleaning-coordination/seo";
import { seo as laundryMaintenance } from "@/app/(pages)/services/laundry-and-maintenance/seo";
import { seo as reviewManagement } from "@/app/(pages)/services/review-management/seo";
import { seo as financeCheck } from "@/app/(pages)/services/finance-check/seo";
import { seo as directBookingWebsites } from "@/app/(pages)/services/direct-booking-websites/seo";
import { seo as seoForShortLets } from "@/app/(pages)/services/seo-for-short-lets/seo";
import { seo as socialMedia } from "@/app/(pages)/services/social-media/seo";
import { seo as systemise } from "@/app/(pages)/services/systemise-your-business/seo";

/** Every public page. Add new pages here so they appear in the sitemap. */
export const allPages: PageSeo[] = [
  home,
  services,
  whoWeHelp,
  pricing,
  freeTools,
  complianceChecker,
  businessRatesChecker,
  londonNightsCounter,
  certificateReminders,
  visitorLevyCalculator,
  guestRegisterBuilder,
  houseRulesGenerator,
  aiReadinessScore,
  titleChecker,
  photoShotList,
  descriptionBuilder,
  longStay,
  ukRules,
  // Service pages
  guestCommunication,
  listingOptimisation,
  pricingOptimisation,
  cleaningCoordination,
  laundryMaintenance,
  reviewManagement,
  financeCheck,
  directBookingWebsites,
  seoForShortLets,
  socialMedia,
  systemise,
];
