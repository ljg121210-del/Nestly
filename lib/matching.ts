import { supabase, hasSupabaseEnv } from "@/lib/supabase";

export type MatchedProvider = {
  provider_id: string;
  name: string;
  phone: string;
  rating: number;
  jobs_completed: number;
  distance_miles: number;
  eta_minutes: number;
  skills: string[];
};

export function distanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radius = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateEta(distance: number) {
  return Math.max(8, Math.round(distance * 5 + 6));
}

export async function findAvailableProviders({
  category,
  latitude,
  longitude,
}: {
  category: string;
  latitude: number;
  longitude: number;
}) {
  if (!hasSupabaseEnv) return [];

  const { data, error } = await supabase
    .from("provider_profiles")
    .select(
      "user_id, phone, skills, provider_mode, travel_radius_miles, base_latitude, base_longitude, rating, jobs_completed, users(name)"
    )
    .eq("provider_mode", "online");

  if (error || !data) return [];

  return data
    .filter((provider: any) => (provider.skills || []).includes(category))
    .map((provider: any) => {
      const distance = distanceMiles(
        latitude,
        longitude,
        Number(provider.base_latitude || latitude),
        Number(provider.base_longitude || longitude)
      );

      return {
        provider_id: provider.user_id,
        name: provider.users?.name || "Provider",
        phone: provider.phone || "",
        rating: Number(provider.rating || 0),
        jobs_completed: Number(provider.jobs_completed || 0),
        distance_miles: Number(distance.toFixed(1)),
        eta_minutes: estimateEta(distance),
        skills: provider.skills || [],
        radius: Number(provider.travel_radius_miles || 10),
      };
    })
    .filter((provider: any) => provider.distance_miles <= provider.radius)
    .sort((a: any, b: any) => a.eta_minutes - b.eta_minutes)
    .map(({ radius, ...provider }: any) => provider);
}
