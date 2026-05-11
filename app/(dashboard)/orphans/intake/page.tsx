'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Baby, Home, User, FileText, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import SBFamilyRegistrationForm from '@/components/families/SBFamilyRegistrationForm';
import OrphanProfileForm from '@/components/orphans/OrphanProfileForm';

type IntakeStep = 'welcome' | 'family' | 'orphan' | 'complete';

export default function SBIntakePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<IntakeStep>('welcome');
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleFamilyCreated = (id: string) => {
    setFamilyId(id);
    setCurrentStep('orphan');
  };

  const handleOrphanCreated = () => {
    setCurrentStep('complete');
  };

  const resetIntake = () => {
    setFamilyId(null);
    setCurrentStep('welcome');
    setError('');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      {error && (
        <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: 12, borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {currentStep === 'welcome' && (
        <WelcomeStep onStart={() => setCurrentStep('family')} />
      )}

      {currentStep === 'family' && (
        <FamilyStep 
          onFamilyCreated={handleFamilyCreated}
          onBack={() => setCurrentStep('welcome')}
        />
      )}

      {currentStep === 'orphan' && familyId && (
        <OrphanStep 
          familyId={familyId}
          onOrphanCreated={handleOrphanCreated}
          onBack={() => setCurrentStep('family')}
        />
      )}

      {currentStep === 'complete' && (
        <CompleteStep 
          familyId={familyId}
          onNewIntake={resetIntake}
          onViewFamily={() => familyId && router.push(`/families/${familyId}`)}
        />
      )}
    </div>
  );
}

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24' }}>
        <Baby size={40} style={{ color: 'white' }} />
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16', color: 'var(--text-primary)' }}>
        SB Intake Process
      </h1>
      <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 600, margin: '0 auto 32' }}>
        This guided process will help you register a new Saiban (Orphan) case. 
        You'll need to provide family information, orphan details, and complete the assessment form.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, maxWidth: 800, margin: '0 auto 40' }}>
        <StepCard
          icon={<Home size={24} />}
          title="Family Registration"
          description="Create SB family with household details"
          stepNumber={1}
        />
        <StepCard
          icon={<User size={24} />}
          title="Orphan Profile"
          description="Register orphan child with complete details"
          stepNumber={2}
        />
        <StepCard
          icon={<FileText size={24} />}
          title="Assessment"
          description="Complete orphan assessment form"
          stepNumber={3}
        />
      </div>

      <button
        onClick={onStart}
        style={{
          padding: '12px 32px',
          borderRadius: 8,
          border: '1px solid var(--accent)',
          background: 'var(--accent)',
          color: 'white',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        Start Intake Process <ArrowRight size={20} />
      </button>
    </div>
  );
}

function FamilyStep({ onFamilyCreated, onBack }: { onFamilyCreated: (id: string) => void, onBack: () => void }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Home size={24} /> Family Registration
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 14 }}>
            Step 1 of 3: Register the SB family
          </p>
        </div>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      
      <SBFamilyRegistrationFormWrapper onFamilyCreated={onFamilyCreated} />
    </div>
  );
}

function OrphanStep({ familyId, onOrphanCreated, onBack }: { familyId: string, onOrphanCreated: () => void, onBack: () => void }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <User size={24} /> Orphan Profile
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 14 }}>
            Step 2 of 3: Register the orphan child
          </p>
        </div>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      
      <OrphanProfileForm familyId={familyId} />
    </div>
  );
}

function CompleteStep({ familyId, onNewIntake, onViewFamily }: { familyId: string | null, onNewIntake: () => void, onViewFamily: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24' }}>
        <CheckCircle2 size={40} style={{ color: 'white' }} />
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16', color: 'var(--text-primary)' }}>
        SB Intake Complete
      </h1>
      <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40' }}>
        The SB family and orphan profile have been successfully registered. 
        You can now conduct the orphan assessment or register another case.
      </p>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <button
          onClick={onViewFamily}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: '1px solid var(--accent)',
            background: 'var(--accent)',
            color: 'white',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FileText size={20} /> Conduct Assessment
        </button>
        <button
          onClick={onNewIntake}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Baby size={20} /> Register Another Case
        </button>
      </div>
    </div>
  );
}

function StepCard({ icon, title, description, stepNumber }: { icon: any, title: string, description: string, stepNumber: number }) {
  return (
    <div style={{ padding: 24, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 4 }}>
          Step {stepNumber}
        </div>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

// Wrapper component to handle family creation callback
function SBFamilyRegistrationFormWrapper({ onFamilyCreated }: { onFamilyCreated: (id: string) => void }) {
  return (
    <SBFamilyRegistrationForm onFamilyCreated={onFamilyCreated} />
  );
}
