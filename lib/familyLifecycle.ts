export const familyStatusLabel: Record<string, string> = {
  pending_assessment: 'Intake',
  assessed: 'Under Review',
  scoring: 'Under Review',
  approved: 'Registered',
  rejected: 'Not Registered',
  reassessment: 'Re-intake Required',
};

export const getFamilyStatusLabel = (status?: string) =>
  familyStatusLabel[status || ''] || (status ? status.replace(/_/g, ' ') : 'Unknown');

