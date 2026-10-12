import Link from 'next/link';

export const metadata = { title: 'Community guidelines' };

export default function GuidelinesPage() {
  return (
    <div className="container page page-narrow prose">
      <h1>Community guidelines</h1>
      <p className="lead">A few simple habits keep ReWear friendly and help you buy and sell second-hand clothes safely.</p>

      <h2>If you are selling</h2>
      <ul>
        <li>Use your own clear photos and show any marks, stains or wear.</li>
        <li>Describe the item honestly, including size, brand and condition.</li>
        <li>Share a general area (for example Dhanmondi, Dhaka), never your home address.</li>
        <li>Only list clothing and accessories you are allowed to sell. Counterfeit goods are not permitted.</li>
        <li>Mark items as reserved or sold so buyers do not waste their time.</li>
      </ul>

      <h2>If you are buying</h2>
      <ul>
        <li>Ask questions before you travel. Request extra photos or measurements if you need them.</li>
        <li>Meet in a busy public place, preferably in daylight, and consider bringing a friend.</li>
        <li>Inspect the item before you pay. Pay only when you are happy with it.</li>
        <li>Be careful with advance payments, especially to people you do not know.</li>
        <li>Be wary of deals that seem too good to be true or sellers who rush you.</li>
      </ul>

      <h2>Your privacy</h2>
      <p>
        Your email address is only shown to the other person after a seller accepts an inquiry. Do not share passwords, one-time
        codes or banking details with anyone.
      </p>

      <h2>What is not allowed</h2>
      <ul>
        <li>Misleading, fake or scam listings.</li>
        <li>Offensive or inappropriate content.</li>
        <li>Harassment of other members.</li>
      </ul>

      <h2>Report a problem</h2>
      <p>
        Use <strong>Report this listing</strong> on any item page. A moderator will review it and may remove the listing.
        ReWear does not verify seller identity or guarantee any product, so please use your own judgment.
      </p>
      <p><Link href="/browse" className="btn btn-primary">Back to browsing</Link></p>
    </div>
  );
}
