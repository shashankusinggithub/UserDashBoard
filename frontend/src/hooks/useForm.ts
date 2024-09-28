import { useState } from "react";

interface UseFormReturn<T> {
  values: T;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  resetForm: () => void;
  setValues: React.Dispatch<React.SetStateAction<T>>;
}

export function useForm<T>(initialState: T): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setValues(initialState);
  };

  return { values, handleChange, resetForm, setValues };
}
