"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrder, type OrderActionResult } from "@/lib/actions/orders";
import { computeOrderTotals, DESIGN_SIDE_PRICE } from "@/lib/orders/pricing";
import { formatPkr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: OrderActionResult = { ok: false };

const PK_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Other",
];

function resolveInitialCity(defaultCity?: string) {
  if (defaultCity && PK_CITIES.includes(defaultCity) && defaultCity !== "Other") {
    return { citySelect: defaultCity, otherCity: "" };
  }
  if (defaultCity) {
    return { citySelect: "Other", otherCity: defaultCity };
  }
  return { citySelect: "Lahore", otherCity: "" };
}

export function CheckoutForm({
  subtotal,
  defaultName,
  defaultCity,
  defaultPhone,
  defaultProvince,
  paymentProviderLabel,
}: {
  subtotal: number;
  defaultName?: string;
  defaultCity?: string;
  defaultPhone?: string;
  defaultProvince?: string;
  paymentProviderLabel: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(placeOrder, initial);
  const initialCity = resolveInitialCity(defaultCity);
  const [citySelect, setCitySelect] = useState(initialCity.citySelect);
  const [otherCity, setOtherCity] = useState(initialCity.otherCity);

  const shippingCity = citySelect === "Other" ? otherCity : citySelect;

  const totals = useMemo(
    () => computeOrderTotals(subtotal, shippingCity || "Other"),
    [subtotal, shippingCity],
  );

  useEffect(() => {
    if (state.ok && state.orderId) {
      router.push(`/orders/${state.orderId}`);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5 rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
          Delivery details
        </h2>
        <div>
          <Label htmlFor="shippingName">Full name</Label>
          <Input
            id="shippingName"
            name="shippingName"
            required
            defaultValue={defaultName}
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="shippingPhone">Phone (WhatsApp preferred)</Label>
          <Input
            id="shippingPhone"
            name="shippingPhone"
            required
            placeholder="03XXXXXXXXX"
            autoComplete="tel"
            defaultValue={defaultPhone}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            City
            <select
              value={citySelect}
              onChange={(e) => setCitySelect(e.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
            >
              {PK_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div>
            <Label htmlFor="shippingProvince">Province (optional)</Label>
            <Input
              id="shippingProvince"
              name="shippingProvince"
              placeholder="Punjab"
              defaultValue={defaultProvince}
            />
          </div>
        </div>
        {citySelect === "Other" ? (
          <div>
            <Label htmlFor="shippingCity">Your city</Label>
            <Input
              id="shippingCity"
              name="shippingCity"
              required
              value={otherCity}
              onChange={(e) => setOtherCity(e.target.value)}
              placeholder="Enter city name"
            />
          </div>
        ) : (
          <input type="hidden" name="shippingCity" value={citySelect} />
        )}
        <div>
          <Label htmlFor="shippingAddress">Address</Label>
          <Input
            id="shippingAddress"
            name="shippingAddress"
            required
            placeholder="House, street, area"
            autoComplete="street-address"
          />
        </div>
        <div>
          <Label htmlFor="notes">Order notes (optional)</Label>
          <Input id="notes" name="notes" placeholder="Gate code, preferred delivery window…" />
        </div>
        {state.message && !state.ok ? (
          <p className="text-sm text-[var(--danger)]">{state.message}</p>
        ) : null}
      </div>

      <div className="h-fit rounded-2xl bg-[var(--ink)] p-6 text-[var(--paper)] lg:sticky lg:top-24">
        <p className="text-xs uppercase tracking-[0.14em] text-white/45">Payment</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">
          {paymentProviderLabel.replaceAll("_", " ")}
        </h2>
        <p className="mt-3 text-sm text-white/65">
          Pay the full order total on delivery (COD). Print fee is{" "}
          {formatPkr(DESIGN_SIDE_PRICE)} per side (Front and/or Back) — no
          separate sticker charge.
        </p>

        <dl className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-white/55">Subtotal</dt>
            <dd>{formatPkr(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/55">Delivery</dt>
            <dd>{formatPkr(totals.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-white/10 pt-3 font-medium">
            <dt>Due on delivery (COD)</dt>
            <dd className="text-[var(--accent-bright)]">
              {formatPkr(totals.totalPayable)}
            </dd>
          </div>
        </dl>

        <Button
          type="submit"
          variant="secondary"
          className="mt-8 w-full"
          disabled={pending || subtotal <= 0}
        >
          {pending ? "Placing order…" : `Place order · ${formatPkr(totals.totalPayable)} COD`}
        </Button>
        <p className="mt-4 text-xs text-white/40">
          Gateway-ready architecture · currently {paymentProviderLabel} provider
        </p>
      </div>
    </form>
  );
}
