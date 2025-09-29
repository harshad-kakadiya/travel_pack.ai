import React from 'react';
type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { slug: string };
export default function AffiliateLink({ slug, children, ...props }: Props) {
  return <a href={`/go/${slug}`} rel="nofollow sponsored" {...props}>{children}</a>;
}
