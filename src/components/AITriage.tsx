import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmergencyRequest } from '@/lib/types';
import { api } from '@/lib/api';
import { Sparkles, AlertTriangle, AlertCircle, Clock, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface TriageResult {
  id: string;
  patientName: string;
  severityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
}

export const AITriage = () => {
  const { t } = useTranslation();
  const [pendingEmergencies, setPendingEmergencies] = useState<EmergencyRequest[]>([]);
  const [triageQueue, setTriageQueue] = useState<TriageResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    setFetching(true);
    try {
      const data = await api.getPendingEmergencies();
      setPendingEmergencies(data);
    } catch (error) {
      toast.error('Failed to load pending emergencies');
    } finally {
      setFetching(false);
    }
  };

  const handleRunTriage = async () => {
    if (pendingEmergencies.length === 0) return;
    
    setLoading(true);
    try {
      const response = await api.getAITriage(pendingEmergencies);
      setTriageQueue(response.queue);
      toast.success('AI Triage complete');
    } catch (error) {
      toast.error('Failed to run AI triage. Check your API key.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (requestId: string) => {
    setDispatchingId(requestId);
    try {
      // Simulate getting offers and auto-accepting the best one
      await api.acceptOffer('auto-dispatch', requestId);
      toast.success('Ambulance dispatched successfully!');
      
      // Remove from lists
      setPendingEmergencies(prev => prev.filter(e => e.id !== requestId));
      if (triageQueue) {
        setTriageQueue(prev => prev ? prev.filter(q => q.id !== requestId) : null);
      }
    } catch (error) {
      toast.error('Failed to dispatch ambulance');
      console.error(error);
    } finally {
      setDispatchingId(null);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500 text-white border-red-600';
      case 'HIGH': return 'bg-orange-500 text-white border-orange-600';
      case 'MEDIUM': return 'bg-yellow-400 text-yellow-950 border-yellow-500';
      case 'LOW': return 'bg-green-500 text-white border-green-600';
      default: return 'bg-slate-500 text-white';
    }
  };

  if (fetching) {
    return <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Smart Triage
          </h2>
          <p className="text-muted-foreground">
            Analyze active emergencies to automatically generate a medical priority queue.
          </p>
        </div>
        <Button 
          onClick={handleRunTriage} 
          disabled={loading || pendingEmergencies.length === 0}
          className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0 shadow-lg shadow-indigo-500/30 text-white"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Run AI Triage
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Unprocessed Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Pending Requests ({pendingEmergencies.length})
            </CardTitle>
            <CardDescription>Raw emergency requests waiting for dispatch</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingEmergencies.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                <AlertCircle className="mb-2 h-8 w-8 opacity-20" />
                No pending emergencies in this area.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEmergencies.map((req) => (
                  <div key={req.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold">{req.patientName || 'Unknown Patient'}</span>
                      <span className="text-xs text-muted-foreground">ID: {req.id}</span>
                    </div>
                    <div className="mb-2 flex flex-wrap gap-2 text-sm">
                      <Badge variant="outline">{req.location.address}</Badge>
                      <Badge variant="secondary">{req.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      <span className="font-medium text-foreground">Symptoms:</span> {req.symptoms || req.emergencyType}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Triage Queue */}
        <Card className="border-indigo-500/20 shadow-lg shadow-indigo-500/5">
          <CardHeader className="bg-indigo-500/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <AlertTriangle className="h-5 w-5" />
              Priority Dispatch Queue
            </CardTitle>
            <CardDescription>Sorted by medical severity</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!triageQueue ? (
              <div className="flex h-32 flex-col items-center justify-center text-muted-foreground text-center">
                <Sparkles className="mb-2 h-8 w-8 opacity-20" />
                <p>Click "Run AI Triage" to generate<br/>the priority queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {triageQueue.map((item, index) => {
                  const req = pendingEmergencies.find(e => e.id === item.id);
                  return (
                    <div key={item.id} className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                      {/* Priority Number Indicator */}
                      <div className="flex flex-col items-center justify-center border-r border-border pr-4 shrink-0">
                        <span className="text-xs font-semibold text-muted-foreground mb-1">Priority</span>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold shadow-sm ${index === 0 ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                          #{index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-lg truncate">{item.patientName}</span>
                          <Badge className={getSeverityColor(item.severityLevel)}>{item.severityLevel}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.reasoning}
                        </p>
                        {req && (
                          <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
                             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                               <Badge variant="outline" className="bg-transparent">{req.location.address}</Badge>
                             </div>
                             <Button 
                               size="sm" 
                               className="h-8 gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white"
                               onClick={() => handleDispatch(req.id)}
                               disabled={dispatchingId === req.id}
                             >
                               {dispatchingId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Dispatch Ambulance'} 
                               <ArrowRight className="h-3 w-3" />
                             </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
