/** City → courier prefix used in auto tracking numbers. */
const CITY_PREFIX: Record<string, string> = {
  karachi: "KHI",
  lahore: "LHE",
  faisalabad: "FSD",
  islamabad: "ISB",
  rawalpindi: "RWP",
  multan: "MUX",
  peshawar: "PEW",
  quetta: "UET",
  hyderabad: "HDD",
};

export function vendorCityPrefix(city: string) {
  return CITY_PREFIX[city.trim().toLowerCase()] ?? "PK";
}

/**
 * Prefer an existing shipment tracking id, then a valid form override,
 * otherwise auto-generate from order number + vendor city.
 */
export function resolveTrackingNumber(input: {
  existing: string | null;
  fromForm?: string;
  orderNumber: string;
  vendorCity: string;
}) {
  const auto = generateVendorTrackingNumber({
    orderNumber: input.orderNumber,
    vendorCity: input.vendorCity,
  });
  if (input.existing) return input.existing;

  const fromForm = input.fromForm?.trim() || "";
  const formLooksValid =
    fromForm.length >= 8 &&
    !fromForm.endsWith("...") &&
    fromForm.toUpperCase() !== "PK-...";

  return formLooksValid ? fromForm : auto;
}

/**
 * Auto tracking id shared across all vendors.
 * Example: PK-KHI-20260912-4215
 */
export function generateVendorTrackingNumber(input: {
  orderNumber: string;
  vendorCity: string;
}) {
  const city = vendorCityPrefix(input.vendorCity);
  const orderPart = input.orderNumber.replace(/^PR-/i, "").trim();
  return `PK-${city}-${orderPart}`;
}

export function customerStatusNotification(input: {
  orderNumber: string;
  status: string;
  trackingNumber?: string | null;
  vendorName?: string | null;
}): { title: string; body: string } {
  const track = input.trackingNumber?.trim();
  const vendor = input.vendorName?.trim();

  switch (input.status) {
    case "IN_PRODUCTION":
      return {
        title: "Production started",
        body: track
          ? `${input.orderNumber}: ${vendor ?? "Your print partner"} started production. Tracking ${track}.`
          : `${input.orderNumber}: production has started on your order.`,
      };
    case "QC":
      return {
        title: "Quality check",
        body: track
          ? `${input.orderNumber}: in QC before dispatch. Tracking ${track}.`
          : `${input.orderNumber}: your order is in quality check.`,
      };
    case "SHIPPED":
      return {
        title: "Order shipped",
        body: track
          ? `${input.orderNumber}: shipped. Track with ${track}.`
          : `${input.orderNumber}: your order has been shipped.`,
      };
    case "OUT_FOR_DELIVERY":
      return {
        title: "Out for delivery",
        body: track
          ? `${input.orderNumber}: out for delivery. Tracking ${track}. Full COD may be due.`
          : `${input.orderNumber}: courier is on the way.`,
      };
    case "DELIVERED":
      return {
        title: "Order completed",
        body: track
          ? `${input.orderNumber}: delivered. Tracking ${track}. Thank you for ordering with Printora.`
          : `${input.orderNumber}: delivered. Order completed.`,
      };
    default:
      return {
        title: "Order update",
        body: `${input.orderNumber} is now ${input.status.replaceAll("_", " ").toLowerCase()}.`,
      };
  }
}
