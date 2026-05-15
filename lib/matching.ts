import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { ProviderMatch } from "@/types";
export function distanceMiles(lat1:number,lon1:number,lat2:number,lon2:number){const r=3958.8,dLat=((lat2-lat1)*Math.PI)/180,dLon=((lon2-lon1)*Math.PI)/180,a=Math.sin(dLat/2)**2+Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLon/2)**2;return r*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))}
export function eta(distance:number){return Math.max(8,Math.round(distance*5+6))}
export async function findMatchedProviders({category,latitude,longitude,asapOnly=false}:{category:string;latitude:number;longitude:number;asapOnly?:boolean;}): Promise<ProviderMatch[]> {
 if(!hasSupabaseEnv) return [];
 const {data,error}=await supabase.from("provider_profiles").select("user_id,phone,skills,provider_mode,travel_radius_miles,base_latitude,base_longitude,rating,jobs_completed,response_speed,users(name)").in("provider_mode",asapOnly?["online"]:["online","busy"]).eq("verification_status","verified");
 if(error||!data) return [];
 return data.filter((p:any)=>(p.skills||[]).includes(category)).map((p:any)=>{const d=distanceMiles(latitude,longitude,Number(p.base_latitude||latitude),Number(p.base_longitude||longitude));return {provider_id:p.user_id,name:p.users?.name||"Verified provider",phone:p.phone||"",rating:Number(p.rating||0),jobs_completed:Number(p.jobs_completed||0),distance_miles:Number(d.toFixed(1)),eta_minutes:eta(d),response_speed:p.response_speed||"Usually responds fast",skills:p.skills||[],radius:Number(p.travel_radius_miles||10)}}).filter((p:any)=>p.distance_miles<=p.radius).sort((a:any,b:any)=>a.eta_minutes-b.eta_minutes||b.rating-a.rating).map(({radius,...p}:any)=>p);
}
