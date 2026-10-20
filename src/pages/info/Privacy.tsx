import SimplePage from "../../components/SimplePage";

export default function Privacy() {
  return (
    <SimplePage eyebrow="Policies" title="Privacy Policy">
      <p>Daily Drape respects your privacy. We collect only the information necessary to process your orders and improve your shopping experience, such as your name, email, phone number and delivery address.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>We never sell your personal data to third parties.</li>
        <li>Payment details are never stored on our servers — this demo store does not process real payments.</li>
        <li>Your data is protected using industry-standard practices, including database-level access control (Row Level Security).</li>
        <li>You may request access to or deletion of your data by contacting support.</li>
      </ul>
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        Placeholder policy — have this reviewed by a legal professional
        before publishing, and update it to reflect your actual data
        practices and applicable law (e.g. India's DPDP Act).
      </p>
    </SimplePage>
  );
}
