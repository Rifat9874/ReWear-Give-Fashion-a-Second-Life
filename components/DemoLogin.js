'use client';

import { BagIcon, ShieldIcon, TagIcon, UserIcon } from './Icons';

const ICONS = { admin: ShieldIcon, seller: TagIcon, buyer: BagIcon, member: UserIcon };

// Cards under the login form. Clicking one asks the parent to fill in the form.
export default function DemoLogin({ accounts, selected, onPick }) {
  return (
    <section className="demo-login" aria-labelledby="demo-heading">
      <h2 id="demo-heading">Try a demo account</h2>
      <p className="muted">Click a card to fill in the login form, then press Log in.</p>
      <div className="demo-grid">
        {accounts.map((account) => {
          const Icon = ICONS[account.key] || UserIcon;
          return (
            <button key={account.key} type="button" className={`demo-card ${selected === account.key ? 'is-selected' : ''}`} onClick={() => onPick(account)} aria-pressed={selected === account.key}>
              <span className="demo-icon"><Icon /></span>
              <span className="demo-body">
                <strong>{account.label}</strong>
                <small>{account.text}</small>
              </span>
            </button>
          );
        })}
      </div>
      <p className="help" role="status" aria-live="polite">
        {selected ? `Filled in the ${accounts.find((a) => a.key === selected)?.label} account. Press Log in to continue.` : ''}
      </p>
    </section>
  );
}
