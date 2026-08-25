import { redirect } from "next/navigation";

export default function RegistrationsRedirectPage() {
  return redirect("/admin/users");
}
