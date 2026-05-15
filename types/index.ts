export type UserRole = "customer" | "provider" | "admin";
export type JobStatus = "requested" | "matched" | "quoted" | "assigned" | "payment_pending" | "paid" | "on_the_way" | "arrived" | "completed" | "cancelled";
export type BookingUrgency = "asap" | "today" | "scheduled";
export type QuoteStatus = "pending" | "accepted" | "declined" | "expired";
export type Job = { id:string; customer_id:string; provider_id?:string|null; provider_name?:string|null; provider_phone?:string|null; title:string; category:string; description?:string|null; location:string; latitude?:number|null; longitude?:number|null; urgency:BookingUrgency; status:JobStatus; scheduled_time?:string|null; created_at:string; };
export type Quote = { id:string; job_id:string; provider_id:string; provider_name?:string|null; provider_phone?:string|null; estimate_min:number; estimate_max:number; eta_text:string; message:string; status:QuoteStatus; created_at:string; };
export type ProviderMatch = { provider_id:string; name:string; phone:string; rating:number; jobs_completed:number; distance_miles:number; eta_minutes:number; response_speed:string; skills:string[]; };
