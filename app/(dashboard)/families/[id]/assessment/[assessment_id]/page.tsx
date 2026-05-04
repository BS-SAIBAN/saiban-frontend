'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';

/** Full-page assessment view replaced by modal on the assessment list; keep route for bookmarks and redirects. */
export default function AssessmentDetailRedirectPage() {
  const { id, assessment_id } = useParams<{ id: string; assessment_id: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/families/${id}/assessment?view=${assessment_id}`);
  }, [id, assessment_id, router]);

  return <FamilySubPageSkeleton variant="table" />;
}
