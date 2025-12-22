import { useState } from 'react';
import { debugLogger } from '@/lib/debugLogger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Trash2, X } from 'lucide-react';

interface DebugPanelProps {
  onClose?: () => void;
}

export function DebugPanel({ onClose }: DebugPanelProps) {
  const [logs, setLogs] = useState(debugLogger.getLogs());
  const [autoRefresh, setAutoRefresh] = useState(false);

  const refreshLogs = () => {
    setLogs(debugLogger.getLogs());
  };

  const clearLogs = () => {
    debugLogger.clearLogs();
    setLogs([]);
  };

  const downloadLogs = () => {
    const logsJson = debugLogger.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passkey-debug-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'debug':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  // Auto-refresh every second if enabled
  if (autoRefresh) {
    setTimeout(refreshLogs, 1000);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="text-xl font-bold">Passkey Debug Logs</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshLogs}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadLogs}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No logs yet. Try registering a passkey to see debug logs.
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-md p-3 font-mono text-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`font-semibold uppercase ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-800 dark:text-gray-200 mb-2">
                      {log.message}
                    </div>
                    {log.data && (
                      <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-x-auto">
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

