import { useState, useCallback } from 'react';

interface ValidationRules {
  [key: string]: (value: string) => string | undefined;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = useCallback((name: string, value: string) => {
    const validateField = rules[name];
    if (validateField) {
      const error = validateField(value);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
      return !error;
    }
    return true;
  }, [rules]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validate, clearErrors };
};