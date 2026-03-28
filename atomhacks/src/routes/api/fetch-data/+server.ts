import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
  const API_URL = "https://example.com/data";
  const API_KEY = process.env.MY_SECRET_API_KEY as string; // server-only

  const response = await fetch(API_URL, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return json(data);
};