import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { AlertEmail } from '../../types';
import {
  Mail,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertTriangle,
  Send,
  Building2,
  Radio
} from 'lucide-react';

interface DemoMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmailId?: string | null;
}

export const DemoMailboxModal: React.FC<DemoMailboxModalProps> = ({
  isOpen,
  onClose,
  selectedEmailId: initialSelectedId
}) => {
  const { emails, approveAlertViaEmail, refreshEmails } = useSimulation();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  if (!isOpen) return null;

  // Selected email or default to first
  const filteredEmails = emails.filter(e => {
    if (filter === 'PENDING') return e.status === 'SENT';
    if (filter === 'APPROVED') return e.status === 'APPROVED';
    return true;
  });

  const activeEmail = (selectedId ? emails.find(e => e.id === selectedId) : null) || filteredEmails[0] || emails[0];
  const pendingCount = emails.filter(e => e.status === 'SENT').length;

  const handleApprove = async (email: AlertEmail) => {
    setIsApproving(true);
    try {
      await approveAlertViaEmail(email.alertId);
    } finally {
      setIsApproving(false);
    }
  };

  const copyApprovalLink = (email: AlertEmail) => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');
    const link = `${apiBase}/api/alerts/${email.alertId}/email-approve?token=${email.approvalToken}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-command-950 border border-command-750 shadow-2xl w-full max-w-5xl h-[88vh] max-h-[850px] flex flex-col rounded-sm overflow-hidden font-mono">
        
        {/* Government Header Bar */}
        <div className="bg-command-900 border-b border-command-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-command-950 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-bold tracking-wider text-slate-100 font-display uppercase">
                  State Emergency Operation Centre (SEOC) Dispatch Mailbox
                </h3>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-xs text-[10px] bg-sky-950/80 border border-sky-600/50 text-sky-300">
                  OFFICIAL SECURE INBOX
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Uttarakhand State Disaster Management Authority • Automated Email Authorization Feed
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={refreshEmails}
              className="px-2 py-1 bg-command-800 hover:bg-command-700 text-slate-300 text-xs rounded-xs transition-colors hidden sm:inline-flex items-center space-x-1"
              title="Refresh Mailbox"
            >
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Sync Feed</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 p-1.5 rounded hover:bg-command-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mailbox Subheader */}
        <div className="bg-command-900/60 border-b border-command-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Mailbox Address:</span>
            <span className="px-2 py-0.5 bg-command-950 border border-command-750 text-slate-200 text-[11px] rounded-xs font-mono font-medium">
              seoc-duty-magistrate@uk.gov.in
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-0.5 text-xs rounded-xs transition-colors ${
                filter === 'ALL' ? 'bg-command-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({emails.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-2.5 py-0.5 text-xs rounded-xs transition-colors flex items-center space-x-1 ${
                filter === 'PENDING'
                  ? 'bg-rose-950/80 border border-rose-600/60 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Pending Action</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-2.5 py-0.5 text-xs rounded-xs transition-colors ${
                filter === 'APPROVED' ? 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Broadcasted ({emails.filter(e => e.status === 'APPROVED').length})
            </button>
          </div>
        </div>

        {/* Mailbox Body: Split Pane */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Left Pane: Message List */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-command-800 flex flex-col bg-command-950 overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Mail className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-60" />
                <p>No dispatch messages in this folder.</p>
                <p className="text-[10px] text-slate-600 mt-1 font-sans">
                  Switch to Heavy Rain or Flash Flood scenario to auto-dispatch threat memos.
                </p>
              </div>
            ) : (
              filteredEmails.map(email => {
                const isSelected = activeEmail?.id === email.id;
                const isPending = email.status === 'SENT';

                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedId(email.id)}
                    className={`text-left p-3 border-b border-command-800/80 transition-colors relative flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-command-900 border-l-2 border-l-sky-400'
                        : 'hover:bg-command-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-200 truncate max-w-[180px]">
                        {email.villageName} ({email.district})
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">
                      {email.subject}
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-slate-500">Risk Score: {email.riskScore}/100</span>
                      {isPending ? (
                        <span className="px-1.5 py-0.5 rounded-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[9px] flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>SIGN-OFF REQ</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[9px] flex items-center space-x-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>BROADCASTED</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Pane: Message Viewer */}
          <div className="flex-1 flex flex-col bg-command-900 overflow-y-auto">
            {activeEmail ? (
              <div className="p-4 sm:p-6 space-y-4">
                
                {/* Official Letterhead */}
                <div className="border-b border-command-750 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-sky-400 text-xs">
                        <Building2 className="w-4 h-4" />
                        <span className="font-bold tracking-wider">STATE EMERGENCY OPERATION CENTRE (SEOC)</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-100 mt-1 font-display">
                        {activeEmail.subject}
                      </h4>
                    </div>

                    {activeEmail.status === 'APPROVED' ? (
                      <div className="px-2.5 py-1 bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[11px] font-bold rounded-xs flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>EXECUTIVE BROADCAST AUTHORIZED</span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 bg-rose-950/90 border border-rose-500/60 text-rose-300 text-[11px] font-bold rounded-xs flex items-center space-x-1.5 animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>ACTION REQUIRED: SIGN-OFF PENDING</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs bg-command-950 p-2.5 border border-command-800/80 font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px]">FROM: </span>
                      <span className="text-slate-200">{activeEmail.sender}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">TO: </span>
                      <span className="text-slate-200">{activeEmail.recipient}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">TIMESTAMP: </span>
                      <span className="text-slate-200">{new Date(activeEmail.sentAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">DISPATCH REF: </span>
                      <span className="text-sky-300">{activeEmail.alertId}</span>
                    </div>
                  </div>
                </div>

                {/* Threat Telemetry Briefing */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                    Automated Hydro-Meteorological Intelligence Assessment
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-command-950 p-2.5 border border-command-800">
                      <span className="text-[10px] text-slate-500 block">Target Catchment</span>
                      <strong className="text-slate-100 text-sm">{activeEmail.villageName}</strong>
                      <span className="text-[10px] text-slate-400 block">{activeEmail.district}</span>
                    </div>
                    <div className="bg-command-950 p-2.5 border border-command-800">
                      <span className="text-[10px] text-slate-500 block">Rainfall Rate</span>
                      <strong className="text-sky-300 text-sm">{activeEmail.rainfall.toFixed(1)} mm/hr</strong>
                      <span className="text-[10px] text-slate-400 block">IMD: {activeEmail.warning}</span>
                    </div>
                    <div className="bg-command-950 p-2.5 border border-command-800">
                      <span className="text-[10px] text-slate-500 block">Deterministic Risk</span>
                      <strong className={`text-sm ${activeEmail.riskScore > 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {activeEmail.riskScore} / 100
                      </strong>
                      <span className="text-[10px] text-slate-400 block">{activeEmail.riskLevel} TIER</span>
                    </div>
                    <div className="bg-command-950 p-2.5 border border-command-800">
                      <span className="text-[10px] text-slate-500 block">Broadcast Mode</span>
                      <strong className="text-emerald-400 text-sm">CAP v1.2 / PA</strong>
                      <span className="text-[10px] text-slate-400 block">Siren & SMS Gateway</span>
                    </div>
                  </div>

                  {/* Justification Box */}
                  <div className="bg-command-950 p-3.5 border border-command-800 space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                      Threat Factor Explanation
                    </span>
                    <p className="text-xs text-slate-300 font-sans italic leading-relaxed">
                      "{activeEmail.reason}"
                    </p>
                  </div>

                  {/* Executive Action Directives */}
                  <div className="bg-command-950/60 p-3.5 border border-command-800 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block flex items-center space-x-1.5">
                      <Radio className="w-3.5 h-3.5 text-sky-400" />
                      <span>Executive Directives Upon Sign-Off</span>
                    </span>
                    <ul className="text-xs text-slate-400 font-sans list-disc list-inside space-y-1">
                      <li>Automated sound blast over Village Public Address & Early Warning Tower siren network.</li>
                      <li>Priority SMS blast via National Disaster Management Authority (NDMA) Cell Broadcast channel.</li>
                      <li>Immediate mobilization notice to District Emergency Operation Center (DEOC) & SDRF rescue battalion.</li>
                    </ul>
                  </div>
                </div>

                {/* Primary Action Button Box */}
                <div className="pt-2">
                  {activeEmail.status === 'SENT' ? (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                          onClick={() => handleApprove(activeEmail)}
                          disabled={isApproving}
                          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                        >
                          {isApproving ? (
                            <>
                              <Clock className="w-4 h-4 animate-spin" />
                              <span>RECORDING EXECUTIVE SIGN-OFF...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>APPROVE & AUTHORIZE EMERGENCY BROADCAST</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => copyApprovalLink(activeEmail)}
                          className="w-full sm:w-auto px-4 py-3 bg-command-800 hover:bg-command-750 text-slate-300 transition-colors flex items-center justify-center space-x-1.5 text-xs border border-command-700"
                          title="Copy direct verification link"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Direct Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Direct Approval Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 font-sans">
                        Authorizing will permanently record your digital credential in the State Emergency Operation Centre immutable log, update the live dashboard, and initiate broadcast protocols.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                            Executive Broadcast Authorization Executed
                          </h5>
                          <p className="text-[11px] text-emerald-400 font-sans mt-0.5">
                            Signed off at {activeEmail.approvedAt || 'Recent'} by {activeEmail.approvedBy || 'SEOC Duty Officer'}.
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-emerald-300 font-bold px-2 py-1 bg-emerald-900/60 rounded">
                        ACTIVE BROADCAST
                      </span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <Mail className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p>Select an email from the left pane to view details.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
