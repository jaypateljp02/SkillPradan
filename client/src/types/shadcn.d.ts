import '@/components/ui/badge';

declare module '@/components/ui/badge' {
  export interface BadgeProps {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  }
}