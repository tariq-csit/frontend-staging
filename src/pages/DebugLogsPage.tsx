import { DebugPanel } from '@/components/debug/DebugPanel';
import { useNavigate } from 'react-router-dom';

export default function DebugLogsPage() {
  const navigate = useNavigate();

  return (
    <DebugPanel onClose={() => navigate(-1)} />
  );
}

