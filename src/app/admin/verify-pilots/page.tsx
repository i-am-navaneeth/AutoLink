'use client';

import { useEffect, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Pilot } from '@/lib/types';
import Image from 'next/image';
import { CheckCircle, ShieldAlert } from 'lucide-react';

export default function AdminVerifyPilotsPage() {
  const db = useFirestore();
  const { data: pilots, isLoading } = useCollection<Pilot>(db ? collection(db, 'pilots') : null);
  const { toast } = useToast();

  const handleVerification = async (pilotId: string, isVerified: boolean) => {
    if (!db) return;
    const pilotRef = doc(db, 'pilots', pilotId);
    try {
      await updateDoc(pilotRef, { verified: !isVerified });
      toast({
        title: 'Pilot Status Updated',
        description: `Pilot has been ${!isVerified ? 'verified' : 'un-verified'}.`,
      });
    } catch (error) {
      console.error('Error updating pilot verification:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the pilot\'s verification status.',
      });
    }
  };

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle>Admin - Pilot Verification</CardTitle>
          <CardDescription>Review and approve new pilot applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading pilots...</TableCell>
                </TableRow>
              )}
              {pilots && pilots.map((pilot) => (
                <TableRow key={pilot.id}>
                  <TableCell className="font-medium">{pilot.name}</TableCell>
                  <TableCell>
                    <div>{pilot.email}</div>
                    <div>{pilot.mobile}</div>
                  </TableCell>
                  <TableCell>
                    {pilot.licenseImageUrl ? (
                       <a href={pilot.licenseImageUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                         View License
                       </a>
                    ) : (
                      'Not uploaded'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={pilot.isVerified ? 'default' : 'destructive'}>
                      {pilot.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={pilot.isVerified ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleVerification(pilot.id, pilot.isVerified)}
                    >
                      {pilot.isVerified ? (
                        <>
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Revoke
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify Pilot
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && pilots?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No pilots have registered yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
