import axios from "axios";

export const getPrivacyPolicy = async () => {
  const res = await axios.get(
    `https://ixoye-backend-production.up.railway.app/api/privacy-policy`,
  );

  return res.data.data;
};
