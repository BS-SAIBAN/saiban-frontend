'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';

export default function EditAssessmentPage() {
  const { id, assessment_id } = useParams<{ id: string; assessment_id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!id || !assessment_id) return;
    router.replace(`/families/${id}/assessment/new?edit=${assessment_id}`);
  }, [assessment_id, id, router]);

  return <FamilySubPageSkeleton variant="form" />;
}
