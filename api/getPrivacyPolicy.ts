import axios from "axios";

export const getPrivacyPolicy = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/privacy-policy`
  );

  return res.data.data;
};
