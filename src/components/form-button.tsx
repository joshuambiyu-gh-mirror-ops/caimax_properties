'use client';
import { useFormStatus } from 'react-dom';
import { Button } from './ui/button';  // Assuming you have a custom ShadCN Button

interface FormButtonProps {
  children: React.ReactNode;
}

export default function FormButton({ children }: FormButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}  // Disable the button when the form is submitting
      className={pending ? "opacity-50 cursor-not-allowed" : ""}  // Optional: to show loading state visually
    >
      {pending ? 'Loading...' : children}  {/* Display loading text while pending */}
    </Button>
  );
}
