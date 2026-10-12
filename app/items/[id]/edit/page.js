import { notFound } from 'next/navigation';
import ItemForm from '@/components/ItemForm';
import { requireUserPage } from '@/lib/auth';
import { getItemById } from '@/lib/items';
import { isValidObjectId } from '@/lib/validation';

export const metadata = { title: 'Edit listing' };

export default async function EditItemPage({ params }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  const user = await requireUserPage(`/items/${id}/edit`);

  const item = await getItemById(id);
  // Someone else's listing looks exactly like a missing one.
  if (!item || item.sellerId !== user.id) notFound();

  return (
    <div className="container page page-narrow">
      <header className="page-head">
        <h1>Edit listing</h1>
      </header>
      <ItemForm item={item} />
    </div>
  );
}
