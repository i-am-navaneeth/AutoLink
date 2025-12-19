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
      return <PassengerHomeSkeleton />;
    }

    switch (userType) {
      case 'passenger':
        return <PassengerHome />;
      case 'pilot':
        return <PilotHome />;
      default:
        return <PassengerHomeSkeleton />;
    }
  };

  return (
    <AppLayout>
      {/* Main Content */}
      {renderContent()}

      {/* Pilot Modal */}
      {userType === 'pilot' && quickRideRequest && (
        <QuickRideRequestModal
          request={quickRideRequest}
          onClose={() => setQuickRideRequest(null)}
        />
      )}

      {/* Brand Signature – AutoLink Footer */}
<div className="mt-20 mb-6 flex items-center justify-center text-center select-none">
  <p
    className="text-[12px] sm:text-[13px] font-medium text-[#8A8D94]"
    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
  >
    <span className="font-semibold text-[#6B6F76]">AutoLink</span>
    <span className="mx-2">•</span>
    <span className="text-[#9A9CA3]">where tech meets tuktuk</span>
  </p>
</div>

    </AppLayout>
  );
}
