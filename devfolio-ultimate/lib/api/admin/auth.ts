import { apiFetch } from "../config";
import { getBaseServerUrl } from "@/lib/utils";

export async function login(email: string, password: string) {
  const baseUrl = getBaseServerUrl();
  return await apiFetch(
    baseUrl,
    "/api/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    "admin_token"
  );
}
