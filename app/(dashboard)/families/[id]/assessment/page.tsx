import { Suspense } from 'react';
import FamilyAssessmentClient from './FamilyAssessmentClient';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';

export default function FamilyAssessmentPage() {
  return (
    <Suspense fallback={<FamilySubPageSkeleton variant="table" />}>
      <FamilyAssessmentClient />
    </Suspense>
  );
}
