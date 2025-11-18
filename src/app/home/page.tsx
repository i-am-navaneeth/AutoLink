'use client';

import { AppLayout } from '@/components/layout/app-layout';
import PassengerHome from '@/components/passenger/passenger-home';
import PilotHome from '@/components/pilot/pilot-home';
import PassengerHomeSkeleton from '@/components/skeletons/passenger-home-skeleton';
import PilotHomeSkeleton from '@/components/skeletons/pilot-home-skeleton';
import { useUser } from '@/context/user-context';
import QuickRideRequestModal from '@/components/pilot/quick-ride-request-modal';

export default function HomePage() {
  const { userType, quickRideRequest, setQuickRideRequest } = useUser();

  const renderContent = () => {
    if (!userType) {
      // The skeleton will be based on a generic or default userType until it's loaded
      // For this example, let's default to showing passenger skeleton
      return <PassengerHomeSkeleton />;
    }
    switch (userType) {
      case 'passenger':
        return <PassengerHome />;
      case 'pilot':
        return <PilotHome />;
      default:
        // This case should ideally not be reached if userType is guaranteed to be one of the above
        return <PassengerHomeSkeleton />;
    }
  };

  return (
    <AppLayout>
      {renderContent()}
      {userType === 'pilot' && quickRideRequest && (
        <QuickRideRequestModal request={quickRideRequest} onClose={() => setQuickRideRequest(null)} />
      )}
    </AppLayout>
  );
}
