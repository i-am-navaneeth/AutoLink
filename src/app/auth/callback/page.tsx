// app/auth/callback/page.tsx
import ClientCallback from './ClientCallback';

export default function AuthCallbackPage(): JSX.Element {
  return (
    <main>
      <ClientCallback />
      <div style={{ padding: 20 }}>
        <h2>Processing…</h2>
        <p>Please wait while we complete authentication.</p>
      </div>
    </main>
  );
}
