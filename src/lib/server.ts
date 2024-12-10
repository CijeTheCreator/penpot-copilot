import axios from "axios";

const ADDRESS = "https://activity-tracker-backend-wtih.onrender.com";
export async function check_user(userId: string) {
  const response = await axios.post(`${ADDRESS}/check_user`, {
    userId,
  });
  return response.data.isPresent;
}
export async function appendToDb(userId: string, encryptedContent: string) {
  const response = await axios.post(`${ADDRESS}/append_to_db`, {
    userId,
    encryptedContent,
  });
  return response.data;
}
