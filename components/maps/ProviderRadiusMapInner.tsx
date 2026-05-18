"use client";

import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

const providerIcon = new L.DivIcon({
  html: `<div style="height:38px;width:38px;border-radius:999px;background:#B9F455;color:#07130E;display:grid;place-items:center;font-weight:900;border:3px solid white;box-shadow:0 12px 30px rgba(24,160,88,.4)">P</div>`,
  className: "",
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const customerIcon = new L.DivIcon({
  html: `<div style="height:38px;width:38px;border-radius:999px;background:#07130E;color:white;display:grid;place-items:center;font-weight:900;border:3px solid white;box-shadow:0 12px 30px rgba(7,19,14,.4)">C</div>`,
  className: "",
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

export default function ProviderRadiusMapInner({
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
  const providerPoints = providers.map((provider, index) => ({
    ...provider,
    lat: customerLocation.lat + 0.008 + index * 0.004,
    lng: customerLocation.lng - 0.008 + index * 0.004,
  }));

  return (
    <div className="h-[430px] overflow-hidden rounded-[2rem] bg-white p-3 shadow-premium">
      <MapContainer
        center={[customerLocation.lat, customerLocation.lng]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
          <Popup>{customerLocation.label}</Popup>
        </Marker>

        <Circle
          center={[customerLocation.lat, customerLocation.lng]}
          radius={8000}
          pathOptions={{ color: "#18A058", fillColor: "#18A058", fillOpacity: 0.08 }}
        />

        {providerPoints.map((provider) => (
          <Marker
            key={provider.provider_id}
            position={[provider.lat, provider.lng]}
            icon={providerIcon}
          >
            <Popup>
              <strong>{provider.name}</strong>
              <br />
              {provider.distance_miles} miles away
              <br />
              ETA {provider.eta_minutes} mins
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
