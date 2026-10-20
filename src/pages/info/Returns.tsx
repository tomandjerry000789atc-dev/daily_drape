import SimplePage from "../../components/SimplePage";

export default function Returns() {
  return (
    <SimplePage eyebrow="Policies" title="Returns & Refunds">
      <p>We want you to love your Daily Drape purchase. If something isn't right, you can request a return within 7 days of delivery.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Items must be unused, unwashed and in original packaging with tags intact.</li>
        <li>Certain items such as innerwear, jewellery and sale items marked "final sale" are not eligible for return.</li>
        <li>Refunds are processed to the original payment method within 5-7 business days of receiving the returned item.</li>
        <li>For Cash on Delivery orders, refunds are issued as store credit or bank transfer.</li>
      </ul>
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        Placeholder policy — align with your actual returns process and
        courier/reverse-pickup partner before publishing.
      </p>
    </SimplePage>
  );
}
