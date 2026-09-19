import { redirect } from "next/navigation";

/** Try-On is retired from the customer portal. */
export default function TryOnPage() {
  redirect("/customer");
}
