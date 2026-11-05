module.exports = ({ config }) => {
  const googleMapsApiKey =
    process.env.CUSTOMER_GOOGLE_MAPS_ANDROID_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    'AIzaSyDzq2am13zEbHJM_sgLAbyQVLygsPlceUs';

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};

