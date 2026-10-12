'use client';

import { useState } from 'react';
import AuthForm from './AuthForm';
import DemoLogin from './DemoLogin';

// Holds the login form and (optionally) the demo cards, so a card can fill the form.
export default function LoginSection({ next, demo }) {
  const [fill, setFill] = useState({ key: '', email: '', password: '', version: 0 });

  function pick(account) {
    // Changing "version" gives the form a new key, so it restarts with the new values.
    setFill((current) => ({ key: account.key, email: account.email, password: demo.password, version: current.version + 1 }));
  }

  return (
    <>
      <AuthForm key={fill.version} mode="login" next={next} initialValues={{ email: fill.email, password: fill.password }} focusSubmit={Boolean(fill.key)} />
      {demo ? <DemoLogin accounts={demo.accounts} selected={fill.key} onPick={pick} /> : null}
    </>
  );
}
