import ItemForm from '@/components/ItemForm';
import { requireUserPage } from '@/lib/auth';

export const metadata = { title: 'Sell an item' };

export default async function SellPage() {
  const user = await requireUserPage('/sell'); // logged-out visitors are sent to /login
  return (
    <div className="container page page-narrow">
      <header className="page-head">
        <h1>Sell an item</h1>
        <p className="muted">
          Describe your item honestly and add clear photos. Buyers will contact you through ReWear, and you arrange the exchange between yourselves.
        </p>
      </header>
      <ItemForm defaultLocation={user.location} />
    </div>
  );
}
