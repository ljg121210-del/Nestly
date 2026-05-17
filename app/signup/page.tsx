const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://nestly.network";

const { data, error } = await supabase.auth.signUp({
  email: form.email,
  password: form.password,
  options: {
    emailRedirectTo: `${appUrl}/login`,
    data: {
      full_name: form.full_name,
      role,
    },
  },
});

if (error) {
  console.error(error);
  alert(error.message);
  return;
}

router.push(
  `/verify?email=${encodeURIComponent(form.email)}&role=${role}`
);