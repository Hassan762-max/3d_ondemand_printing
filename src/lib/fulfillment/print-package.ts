import type { Order, OrderItem, Product, Design, Vendor, Shipment } from "@prisma/client";

export type PrintPackageItem = {
  title: string;
  product: string;
  category: string;
  size: string;
  color: string;
  quantity: number;
  designTitle: string | null;
  designUrl: string | null;
  placement: Record<string, unknown>;
};

export type PrintPackage = {
  version: 1;
  generatedAt: string;
  orderNumber: string;
  orderId: string;
  status: string;
  vendor: {
    businessName: string;
    city: string;
    phone: string;
  } | null;
  shipping: {
    name: string;
    phone: string;
    city: string;
    address: string;
    province: string | null;
  };
  payment: {
    advanceAmount: number;
    remainingAmount: number;
    currency: string;
  };
  shipment: {
    carrier: string | null;
    trackingNumber: string | null;
    status: string | null;
  };
  items: PrintPackageItem[];
};

export function buildPrintPackage(order: Order & {
  items: (OrderItem & {
    product: Pick<Product, "name" | "category">;
    design: Pick<Design, "title" | "imageUrl"> | null;
  })[];
  vendor: Pick<Vendor, "businessName" | "city" | "phone"> | null;
  shipments: Pick<Shipment, "carrier" | "trackingNumber" | "status">[];
}): PrintPackage {
  const shipment = order.shipments[0];
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    orderNumber: order.orderNumber,
    orderId: order.id,
    status: order.status,
    vendor: order.vendor
      ? {
          businessName: order.vendor.businessName,
          city: order.vendor.city,
          phone: order.vendor.phone,
        }
      : null,
    shipping: {
      name: order.shippingName,
      phone: order.shippingPhone,
      city: order.shippingCity,
      address: order.shippingAddress,
      province: order.shippingProvince,
    },
    payment: {
      advanceAmount: order.advanceAmount,
      remainingAmount: order.remainingAmount,
      currency: order.currency,
    },
    shipment: {
      carrier: shipment?.carrier ?? null,
      trackingNumber: shipment?.trackingNumber ?? null,
      status: shipment?.status ?? null,
    },
    items: order.items.map((item) => {
      let placement: Record<string, unknown> = {};
      try {
        placement = JSON.parse(item.placementJson || "{}") as Record<string, unknown>;
      } catch {
        placement = {};
      }
      return {
        title: item.title,
        product: item.product.name,
        category: item.product.category,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        designTitle: item.design?.title ?? null,
        designUrl: item.design?.imageUrl ?? null,
        placement,
      };
    }),
  };
}
