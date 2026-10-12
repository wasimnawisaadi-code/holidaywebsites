import { packageDetailsA } from "./package-details-a";
import { packageDetailsB } from "./package-details-b";
import { afghanistanDetails } from "./afghanistan-details";
import type { PackageDetail } from "./package-detail-types";

export type { PackageDetail, DayBlocks } from "./package-detail-types";

/** Full detail content for every holiday package, keyed by package slug. */
export const packageDetails: Record<string, PackageDetail> = {
  ...packageDetailsA,
  ...packageDetailsB,
  ...afghanistanDetails,
};

export function packageDetail(slug: string): PackageDetail | undefined {
  return packageDetails[slug];
}
