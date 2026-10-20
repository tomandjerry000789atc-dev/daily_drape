import SimplePage from "../../components/SimplePage";

export default function Terms() {
  return (
    <SimplePage eyebrow="Policies" title="Terms & Conditions">
      <p>By using the Daily Drape website, you agree to the following terms.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>All product images are for representation; actual colors may vary slightly due to screen settings.</li>
        <li>Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</li>
        <li>Daily Drape reserves the right to cancel orders in cases of pricing errors, stock unavailability, or suspected fraud.</li>
        <li>This is a demo storefront; any payment, order or account interaction is for demonstration purposes unless explicitly connected to live, production services.</li>
      </ul>
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        Placeholder terms — have these reviewed by a legal professional
        before publishing.
      </p>
    </SimplePage>
  );
}
