/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Shield, Cpu, Activity, Database, AlertCircle, PlayCircle, RefreshCw, Layers } from 'lucide-react';
import { ActivityLog } from '../types';

interface DeveloperLogsViewProps {
  activityLogs: ActivityLog[];
}

export default function DeveloperLogsView({ activityLogs }: DeveloperLogsViewProps) {
  const [activeSchemaTab, setActiveSchemaTab] = useState('SCHEMA');
  const [simulatedResponse, setSimulatedResponse] = useState<string>('Run mock fetch triggers above...');
  const [isRunningTest, setIsRunningTest] = useState(false);

  const fetchCandidatesMockAPI = () => {
    setIsRunningTest(true);
    setSimulatedResponse('Performing GET /api/candidates via internal RPC proxies...');
    
    setTimeout(() => {
      setSimulatedResponse(`{
  "status": "success",
  "client_origin": "Cloud Run sandboxed container",
  "data_nodes_count": 6,
  "telemetry": {
    "engine_latency": "14ms",
    "cache_hit_ratio": "0.95"
  },
  "results": [
    {
      "id": "CAND001",
      "fullName": "Ahmed Abdelhamid",
      "phone": "+201012349988",
      "status": "HIRED",
      "team": "Team Pola"
    },
    {
      "id": "CAND002",
      "fullName": "Mustafa Mahmoud Aly",
      "phone": "+201123456789",
      "status": "INTERVIEW_SCHEDULED"
    }
  ]
}`);
      setIsRunningTest(false);
    }, 500);
  };

  const syncSchemaPrismaPrerun = () => {
    setIsRunningTest(true);
    setSimulatedResponse('Running prisma schema validation: npx prisma db push --skip-generate...');
    
    setTimeout(() => {
      setSimulatedResponse(`Prisma Schema Engine synchronization logs:
> Connecting to Supabase PostgreSQL database... (success)
> Analyzing 11 active schema models...
> Index sync checks completed successfully.
  Index candidates(recruiter_id, status) -> Verified
  Index notifications(user_id, read)     -> Verified
No modifications required. Database state fully synchronized compliant with schema.ts definitions.`);
      setIsRunningTest(false);
    }, 700);
  };

  return (
    <div className="space-y-6 font-sans pb-12 select-none">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal size={20} className="text-[#3B82F6]" />
          Technical Developer Desk console
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor system metrics, error lists, REST endpoint proxies, and execute administrative database operations.
        </p>
      </div>

      {/* TECH METRICS COUNTERS CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Cpu className="text-blue-500" size={24} />
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Memory Heap</span>
            <span className="text-sm font-bold text-slate-200 font-mono">14.2 MB / 512 MB</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Activity className="text-pink-500" size={24} />
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Request Latency</span>
            <span className="text-sm font-bold text-slate-200 font-mono">14 ms (vps)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Database className="text-purple-500" size={24} />
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Prisma active tables</span>
            <span className="text-sm font-bold text-slate-200 font-mono">13 PostgreSQL</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Shield className="text-emerald-500" size={24} />
          <div>
            <span className="text-[9px] text-slate-505 font-bold uppercase block">OAuth Security</span>
            <span className="text-sm font-bold text-slate-200 font-mono">JWT SEC-HS256</span>
          </div>
        </div>

      </div>

      {/* RE-ENTRY INTERACTIVE CONSOLE ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* API test triggers panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111827] border border-[#334155]/60 flex flex-col justify-between gap-4 h-full">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">
              Telemetry commands
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Trigger simulated API proxies to verify payload returns without exposing sensitive corporate keys to client networks.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={fetchCandidatesMockAPI}
              disabled={isRunningTest}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-xs text-left px-3 border border-slate-800 hover:border-blue-500 rounded-xl text-slate-200 transition-all flex items-center justify-between"
            >
              <span className="font-mono text-[11px] text-blue-400 font-bold">GET /api/candidates</span>
              <PlayCircle size={14} className="text-slate-500" />
            </button>

            <button
              onClick={syncSchemaPrismaPrerun}
              disabled={isRunningTest}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-xs text-left px-3 border border-slate-800 hover:border-pink-500 rounded-xl text-slate-200 transition-all flex items-center justify-between"
            >
              <span className="font-mono text-[11px] text-pink-400 font-bold">PRISMA Sync push</span>
              <RefreshCw size={12} className={isRunningTest ? 'animate-spin' : 'text-slate-500'} />
            </button>
          </div>

          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-[10.5px] leading-relaxed text-red-400 mt-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>Developer permissions permit complete system wipes in production. Modify credentials carefully.</span>
          </div>
        </div>

        {/* Live terminal response view */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#111827] border border-[#334155]/60 flex flex-col gap-3 min-h-[300px]">
          <div className="flex border-b border-slate-800 pb-2 mb-1 justify-between items-center select-none">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Console Standard Output (Stdout)
            </h3>
            <button
              onClick={() => setSimulatedResponse('Run mock commands on the left panel.')}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear screen
            </button>
          </div>

          <pre className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[11px] text-blue-400 overflow-x-auto overflow-y-auto whitespace-pre leading-relaxed select-text min-h-[220px]">
            {simulatedResponse}
          </pre>
        </div>

      </div>

    </div>
  );
}
