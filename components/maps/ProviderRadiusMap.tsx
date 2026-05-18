"use client";

import dynamic from "next/dynamic";

const ProviderRadiusMapInner = dynamic(() => import("./ProviderRadiusMapInner"), {
  ssr: false,
});

export function ProviderRadiusMap({
  customerLocation,
  providers,
}: {
  customerLocation: { lat: number; lng: number; label: string };
  providers: Array<{
    provider_id: string;
    name: string;
    distance_miles: number;
    eta_minutes: number;
  }>;
}) {
  return <ProviderRadiusMapInner customerLocation={customerLocation} providers={providers} />;
}
