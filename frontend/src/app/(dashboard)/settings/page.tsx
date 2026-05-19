'use client';

import React, { useState } from 'react';
import { Settings, User, Key, Eye, EyeOff, Copy, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [profileName, setProfileName] = useState('Super Admin');
  const [profileEmail, setProfileEmail] = useState('admin@learninghub.com');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Toggle variables states
  const [ambientOrbs, setAmbientOrbs] = useState(true);
  const [compactTables, setCompactTables] = useState(false);
  const [sandboxAutosave, setSandboxAutosave] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      toast.success("Node Profile synchronized successfully!");
    }, 800);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText("loki_live_sec_7a2b918f4a10e8d0e51381bf475c");
    toast.success("Developer Access Key copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-purple-400" />
          Workspace Configuration
        </h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">
          Manage privilege profile parameters, authorize developer API tokens, and adjust aesthetic parameters.
        </p>
      </div>

      {/* Settings Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Side: Profile & Access keys */}
        <div className="space-y-6 flex flex-col justify-start">
          
          {/* Card 1: Node Profile details */}
          <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
            <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 md:p-6 text-left">
              <CardHeader className="p-0 pb-4 border-b border-white/[0.04]">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-purple-400" />
                  Developer Profile Specification
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-light">
                  Update active account credentials.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 mt-4">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Node Handle</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="px-3.5 py-2 w-full text-xs rounded-xl bg-slate-900 border border-white/[0.05] text-white focus:outline-none focus:border-purple-500/50 transition-all font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Authorized Email</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="px-3.5 py-2 w-full text-xs rounded-xl bg-slate-900 border border-white/[0.05] text-white focus:outline-none focus:border-purple-500/50 transition-all font-semibold"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-xs font-bold h-10 rounded-xl border border-purple-400/20 shadow-[0_0_15px_rgba(147,51,234,0.15)] transition-all cursor-pointer flex items-center justify-center"
                    >
                      {savingProfile ? "Synchronizing Node..." : "Save Specifications"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Card 2: API keys and Access Tokens */}
          <div className="rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/20 via-white/[0.03] to-purple-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
            <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 md:p-6 text-left">
              <CardHeader className="p-0 pb-4 border-b border-white/[0.04]">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="h-4.5 w-4.5 text-indigo-400" />
                  Developer API Access Token
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-light">
                  Authenticate programmatic queries.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 mt-4 space-y-4">
                <div className="relative">
                  <input
                    type={apiKeyVisible ? "text" : "password"}
                    value="loki_live_sec_7a2b918f4a10e8d0e51381bf475c"
                    readOnly
                    className="pl-3.5 pr-20 py-2.5 w-full text-xs rounded-xl bg-slate-900 border border-white/[0.05] text-slate-300 focus:outline-none font-mono tracking-wider select-text"
                  />
                  <div className="absolute right-2 top-1.5 flex items-center gap-1.5">
                    <Button
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-lg bg-white/[0.01] hover:bg-white/[0.05] text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      {apiKeyVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      onClick={handleCopyKey}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-lg bg-white/[0.01] hover:bg-white/[0.05] text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-white/[0.04] bg-slate-900/20 text-[10px] text-slate-400 leading-relaxed font-light flex items-start gap-2.5">
                  <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Node Privilege Access scopes</span>
                    This credentials key possesses permission properties to authorize course outlines, code sandboxes, and quiz milestones telemetry registers.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Right Side: Aesthetics & Preferences */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] flex flex-col">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 md:p-6 flex-1 flex flex-col text-left">
            <CardHeader className="p-0 pb-4 border-b border-white/[0.04] shrink-0">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-purple-400" />
                Aesthetic & Interface Variables
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-500 font-light">
                Personalize workspace variables and performance parameters.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col justify-start mt-4 space-y-4">
              
              {/* Toggle Option 1 */}
              <button 
                onClick={() => { setAmbientOrbs(!ambientOrbs); toast.success(`Ambient mesh orbs ${!ambientOrbs ? 'enabled' : 'disabled'}`); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.04] bg-slate-900/10 hover:bg-slate-900/30 transition-all cursor-pointer select-none text-left"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Ambient Mesh Particle Orbs</span>
                  <span className="text-[10px] text-slate-500 font-light leading-relaxed block max-w-sm">
                    Activate floating purple-indigo backdrops inside auth cards. Disable for lower memory overhead.
                  </span>
                </div>
                <div className={`h-5 w-9 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${ambientOrbs ? 'bg-purple-600' : 'bg-slate-800'}`}>
                  <div className={`h-4 w-4 rounded-full bg-white transition-transform duration-300 ${ambientOrbs ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>

              {/* Toggle Option 2 */}
              <button 
                onClick={() => { setCompactTables(!compactTables); toast.success(`Compact layout ${!compactTables ? 'enabled' : 'disabled'}`); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.04] bg-slate-900/10 hover:bg-slate-900/30 transition-all cursor-pointer select-none text-left"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Compact Node Directory Layouts</span>
                  <span className="text-[10px] text-slate-500 font-light leading-relaxed block max-w-sm">
                    Reduce inner padding inside admin directories and audit timelines for high density.
                  </span>
                </div>
                <div className={`h-5 w-9 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${compactTables ? 'bg-purple-600' : 'bg-slate-800'}`}>
                  <div className={`h-4 w-4 rounded-full bg-white transition-transform duration-300 ${compactTables ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>

              {/* Toggle Option 3 */}
              <button 
                onClick={() => { setSandboxAutosave(!sandboxAutosave); toast.success(`Sandbox caching ${!sandboxAutosave ? 'enabled' : 'disabled'}`); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.04] bg-slate-900/10 hover:bg-slate-900/30 transition-all cursor-pointer select-none text-left"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Auto-Cache Code Playgrounds</span>
                  <span className="text-[10px] text-slate-500 font-light leading-relaxed block max-w-sm">
                    Save dynamic editor text buffers inside client memory to prevent page refresh loss.
                  </span>
                </div>
                <div className={`h-5 w-9 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${sandboxAutosave ? 'bg-purple-600' : 'bg-slate-800'}`}>
                  <div className={`h-4 w-4 rounded-full bg-white transition-transform duration-300 ${sandboxAutosave ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>

              <div className="pt-4 border-t border-white/[0.04] flex items-center gap-1.5 text-[10px] text-slate-500 font-light mt-auto">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Telemetry settings synchronized locally. Global changes take effect instantly.
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
