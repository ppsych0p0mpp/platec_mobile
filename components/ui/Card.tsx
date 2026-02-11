import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'gradient';
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200',
  };

  return (
    <div
      className={`rounded-2xl p-6 backdrop-blur-sm ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h3 className={`text-xl font-bold text-gray-900 ${className}`}>{children}</h3>;
}

export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
