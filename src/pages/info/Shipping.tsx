import SimplePage from "../../components/SimplePage";

export default function Shipping() {
  return (
    <SimplePage eyebrow="Policies" title="Shipping Policy">
      <p>We currently ship across India. Orders are processed within 1-2 business days and delivered within 4-7 business days depending on your pin code.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Free shipping on orders above ₹1,999.</li>
        <li>A flat shipping fee of ₹99 applies to orders below ₹1,999.</li>
        <li>Delivery timelines may vary during sale periods or for remote pin codes.</li>
        <li>You will receive a tracking number once your order is shipped.</li>
      </ul>
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        Placeholder policy — confirm real shipping partners, timelines and
        charges before publishing.
      </p>
    </SimplePage>
  );
}
