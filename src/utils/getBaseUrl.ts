export const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return (
      process.env.BACKEND_URL ||
      "https://movie-booking-backend-m0hk.onrender.com"
    );
  }
  return `http://localhost:${process.env.PORT || 4000}`;
};
