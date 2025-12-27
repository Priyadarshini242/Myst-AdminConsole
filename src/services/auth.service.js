import { encryptData } from "../lib/encrypt";

const BASE_URL =
  "https://beanstalk.myskillstree.com";

export async function checkAccount(id) {
  const encryptedId = encryptData(id);

  const response = await fetch(
    `${BASE_URL}/skills/check/account/encrypt`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: encryptedId }),
    }
  );

  if (!response.ok) {
    throw new Error("API error");
  }

  return response.json();
}
