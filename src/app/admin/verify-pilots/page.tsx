import { createClient } from '@supabase/supabase-js';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type PilotRow = {
  id: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  documents: Record<string, string> | null; // FILE PATHS ONLY
  users: {
    email: string | null;
    full_name: string | null;
  } | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* 🔐 SIGNED URL GENERATOR (SERVER ONLY) */
async function getSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from('pilot-docs')
    .createSignedUrl(path, 60 * 10); // 10 minutes

  if (error) {
    console.error('Signed URL error:', error.message);
    return null;
  }

  return data.signedUrl;
}

export default async function VerifyPilotsPage() {
  const { data, error } = await supabase
    .from('pilots')
    .select(`
      id,
      verification_status,
      documents,
      users (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .returns<PilotRow[]>();

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading pilots: {error.message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-muted-foreground">
        No pilots found.
      </div>
    );
  }

  const DOC_LABELS: Record<string, string> = {
    driving_license: 'Driving License',
    vehicle_rc: 'Vehicle RC',
    insurance: 'Insurance',
    government_id: 'Government ID',
    profile_photo: 'Profile Photo',
  };

  const cards = await Promise.all(
    data.map(async (p) => {
      const signedDocs: Record<string, string | null> = {};

      for (const key of Object.keys(DOC_LABELS)) {
        const path = p.documents?.[key];
        signedDocs[key] = path
          ? await getSignedUrl(path)
          : null;
      }

      return (
        <Card key={p.id}>
          <CardHeader>
            <CardTitle>
              {p.users?.full_name ?? '—'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {p.users?.email ?? '—'}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-sm">
              Status:{' '}
              <strong>{p.verification_status}</strong>
            </div>

            {/* 📄 DOCUMENT PREVIEW */}
            <div className="border rounded-md p-3 space-y-2">
              <div className="font-semibold text-sm">
                Uploaded Documents
              </div>

              {Object.entries(DOC_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{label}</span>

                  {signedDocs[key] ? (
                    <a
                      href={signedDocs[key]!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">
                      Not uploaded
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* ✅ ACTIONS */}
            <div className="flex gap-3">
              <form action="/api/admin/pilots/approve" method="POST">
                <input type="hidden" name="id" value={p.id} />
                <Button
                  type="submit"
                  disabled={p.verification_status === 'approved'}
                >
                  Approve
                </Button>
              </form>

              <form action="/api/admin/pilots/reject" method="POST">
                <input type="hidden" name="id" value={p.id} />
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={p.verification_status === 'rejected'}
                >
                  Reject
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      );
    })
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Verify Pilots</h1>
      {cards}
    </div>
  );
}
