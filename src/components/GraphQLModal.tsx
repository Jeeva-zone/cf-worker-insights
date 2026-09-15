import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Database, Play, Sparkles, RefreshCw } from 'lucide-react';
import { CloudflareGraphQLQuerySample } from '../types';

interface GraphQLModalProps {
  isOpen: boolean;
  onClose: () => void;
  sample: CloudflareGraphQLQuerySample;
  isDarkMode: boolean;
  onTriggerTrafficBurst: () => void;
  onSimulateWorkerException: () => void;
}

export const GraphQLModal: React.FC<GraphQLModalProps> = ({
  isOpen,
  onClose,
  sample,
  isDarkMode,
  onTriggerTrafficBurst,
  onSimulateWorkerException
}) => {
  const [activeTab, setActiveTab] = useState<'query' | 'response' | 'simulation'>('query');
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = activeTab === 'query' 
      ? sample.query 
      : JSON.stringify(sample.responsePayload, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteMock = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setActiveTab('response');
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-700/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Cloudflare GraphQL API Schema</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                  workersInvocationsAdaptiveGroups
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Endpoint: <code className="font-mono text-orange-400">https://api.cloudflare.com/client/v4/graphql</code>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/30 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs and Action Bar */}
        <div className="px-5 py-2.5 border-b border-slate-700/20 flex items-center justify-between bg-slate-900/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('query')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'query'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GraphQL Query
            </button>
            <button
              onClick={() => setActiveTab('response')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'response'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              API Response Payload
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'simulation'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Edge Simulator
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'query' && (
              <button
                onClick={handleExecuteMock}
                disabled={isExecuting}
                className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs"
              >
                {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Execute Query</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'query' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-400 font-sans">
                Real query sent to Cloudflare Analytics GraphQL engine for invocations adaptive grouping:
              </div>
              <pre className="p-4 rounded-xl bg-black/60 border border-slate-800 text-orange-300 overflow-x-auto leading-relaxed">
                {sample.query}
              </pre>
              <div className="text-[11px] text-slate-400 font-sans">
                Variables:
              </div>
              <pre className="p-3 rounded-lg bg-black/40 border border-slate-800 text-slate-300 overflow-x-auto">
                {JSON.stringify(sample.variables, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'response' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                <span>Cloudflare GraphQL JSON response payload (200 OK):</span>
                <span className="text-emerald-400 font-mono">Status: 200 OK · Duration: 14ms</span>
              </div>
              <pre className="p-4 rounded-xl bg-black/60 border border-slate-800 text-emerald-400 overflow-x-auto leading-relaxed">
                {JSON.stringify(sample.responsePayload, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-orange-400" />
                <div>
                  <h4 className="font-bold">Edge Traffic Injection Sandbox</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Trigger synthetic traffic conditions on your Worker to test dashboard reaction, threshold alarms, and error logging.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-900/40 space-y-2">
                  <div className="font-bold text-slate-200">Simulate High-Traffic Spike</div>
                  <p className="text-[11px] text-slate-400">
                    Inject 500+ requests across global Anycast points to test quota burn-rate.
                  </p>
                  <button
                    onClick={() => {
                      onTriggerTrafficBurst();
                      onClose();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs transition-colors"
                  >
                    Inject Traffic Spike 🚀
                  </button>
                </div>

                <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-900/40 space-y-2">
                  <div className="font-bold text-slate-200">Trigger 1042 Worker Exception</div>
                  <p className="text-[11px] text-slate-400">
                    Simulate a V8 isolate memory spike or 10ms CPU timeout breach.
                  </p>
                  <button
                    onClick={() => {
                      onSimulateWorkerException();
                      onClose();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs transition-colors"
                  >
                    Trigger 1042 Exception ⚡
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-700/30 flex items-center justify-between text-xs text-slate-400 bg-slate-900/20 font-sans">
          <span>Schema: Cloudflare GraphQL API v4</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md border border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
