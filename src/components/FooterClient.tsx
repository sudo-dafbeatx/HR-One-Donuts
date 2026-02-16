'use client';

import EditableText from '@/components/cms/EditableText';
import EditableText from '@/components/cms/EditableText';

interface FooterClientProps {
  copyKey: string;
  className?: string;
  as?: 'span' | 'p' | 'h5' | 'div';
}

export default function FooterClient({ copyKey, className = '', as = 'h5' }: FooterClientProps) {
  return <EditableText copyKey={copyKey} as={as} className={className} />;
}
