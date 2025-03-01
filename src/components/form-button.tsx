'use client';
import { useFormStatus } from 'react-dom';
import { Button } from './ui/button';

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function FormButton({ children, ...props }: FormButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || props.disabled}
      className={pending ? "opacity-50 cursor-not-allowed" : ""}
      {...props}
    >
      {pending ? 'Loading...' : children}
    </Button>
  );
}