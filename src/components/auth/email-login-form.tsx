import { useState } from 'react';

const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);

async function sendMagicLink() {
  if (!email) {
    alert('Enter email');
    return;
  }

  setLoading(true);
  try {
    const res = await fetch('/api/send-magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    });

    const json = await res.json();
    if (!res.ok) {
      console.error(json);
      alert(json.error || 'Error sending magic link');
      return;
    }

    alert('Magic link sent — check your inbox.');
    setEmail('');
  } catch (err: any) {
    console.error(err);
    alert(err.message || 'Unexpected error');
  } finally {
    setLoading(false);
  }
}
