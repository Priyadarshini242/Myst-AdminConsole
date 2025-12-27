import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage Google reCAPTCHA logic in React.
 * @param {string} siteKey - Google reCAPTCHA site key.
 * @param {number} resetInterval - Time in milliseconds to automatically reset the token (default: 110 seconds).
 */
const useGoogleRecaptcha = (siteKey, resetInterval = 110000) => {
  const [captchaToken, setCaptchaToken] = useState(null); // Current reCAPTCHA token
  const recaptchaRef = useRef(null); // Reference to the reCAPTCHA component

  // Callback to handle token changes
  const handleTokenChange = useCallback((newToken) => {
    console.log("captcha token ", newToken);
    setCaptchaToken(newToken || null);
  }, []);

  // Reset the reCAPTCHA and clear the token
  const resetRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
      setCaptchaToken(null);
    }
  }, []);

  // Automatically reset the token after the specified interval
  useEffect(() => {
    if (!captchaToken) return;

    const timeout = setTimeout(() => {
      resetRecaptcha();
    }, resetInterval);

    return () => clearTimeout(timeout);
  }, [captchaToken, resetInterval, resetRecaptcha]);

  return {
    captchaToken, // Current reCAPTCHA token
    recaptchaRef, // Ref for the reCAPTCHA component
    handleTokenChange, // Function to update token on change
    resetRecaptcha, // Function to manually reset reCAPTCHA
    siteKey, // reCAPTCHA site key
  };
};

export default useGoogleRecaptcha;
