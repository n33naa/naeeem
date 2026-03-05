
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { translateText } from '../services/geminiService';
import { 
  Mic, UserCircle, Brain, 
  Monitor, MessageCircle, 
  Briefcase, Coffee, 
  AlertCircle, Loader2, X, Radio, Target, Zap, 
  CheckCircle2, BarChart3, Star, Award, RotateCcw
} from 'lucide-react';

// Manual Base64 decoding implementation for cross-browser compatibility
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

// Manual Base64 encoding implementation for cross-browser compatibility
function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// Decodes raw PCM audio data into an AudioBuffer for playback
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.length / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SCENARIOS = [
  { 
    id: 'free_talk', 
    label: 'AI Coach', 
    icon: Brain, 
    difficulty: 'All Levels',
    color: 'cyan',
    goals: ['Express an opinion', 'Use a complex adjective', 'Ask for clarification'], 
    prompt: 'You are an English language coach. Practice conversation. Be engaging and correct user errors subtly. Keep responses natural and conversational.' 
  },
  { 
    id: 'job_interview', 
    label: 'Job Interview', 
    icon: Briefcase, 
    difficulty: 'Advanced',
    color: 'indigo',
    goals: ['Talk about experience', 'Use industry jargon', 'Ask about company culture'], 
    prompt: 'You are an HR manager at a tech company. Conduct a professional interview. Ask probing questions based on user answers.' 
  },
  { 
    id: 'restaurant', 
    label: 'Order Food', 
    icon: Coffee, 
    difficulty: 'Beginner',
    color: 'orange',
    goals: ['Ask for recommendation', 'Be polite', 'Request a modification'], 
    prompt: 'You are a waiter. Take the user\'s order and recommend dishes based on their preferences.' 
  },
  { 
    id: 'doctor', 
    label: 'Doctor Visit', 
    icon: AlertCircle, 
    difficulty: 'Intermediate',
    color: 'emerald',
    goals: ['Describe symptoms', 'Ask about treatment', 'Understand instructions'], 
    prompt: 'You are a doctor. Listen to the patient\'s symptoms and provide a diagnosis and treatment plan.' 
  },
  { 
    id: 'airport', 
    label: 'Airport Check-in', 
    icon: Monitor, 
    difficulty: 'Beginner',
    color: 'blue',
    goals: ['Check in luggage', 'Request a seat', 'Ask about gate'], 
    prompt: 'You are an airport check-in agent. Help the passenger with their flight details and luggage.' 
  },
];

const ConversationView: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputLevel, setInputLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [realtimeFeedback, setRealtimeFeedback] = useState<{correction?: string, explanation?: string, upgrade?: string} | null>(null);
  const [showTranslation, setShowTranslation] = useState<number | null>(null);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [isTranslating, setIsTranslating] = useState<number | null>(null);

  const inCtxRef = useRef<AudioContext | null>(null);
  const outCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0 && selectedScenario) {
      const lastText = messages[messages.length - 1].text.toLowerCase();
      selectedScenario.goals.forEach(goal => {
        const goalKeyword = goal.split(' ').pop()?.toLowerCase() || '';
        if (lastText.includes(goalKeyword) && !completedGoals.includes(goal)) {
          setCompletedGoals(prev => [...prev, goal]);
        }
      });
    }
  }, [messages, selectedScenario, completedGoals]);

  const handleTranslate = async (index: number, text: string) => {
    if (translations[index]) {
      setShowTranslation(showTranslation === index ? null : index);
      return;
    }
    
    setIsTranslating(index);
    const result = await translateText(text);
    setTranslations(prev => ({ ...prev, [index]: result }));
    setIsTranslating(null);
    setShowTranslation(index);
  };

  const stop = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    setIsThinking(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    activeSourcesRef.current.clear();
    
    if (inCtxRef.current) inCtxRef.current.close().catch(()=>{});
    if (outCtxRef.current) outCtxRef.current.close().catch(()=>{});
    
    inCtxRef.current = null;
    outCtxRef.current = null;
    
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    
    setInputLevel(0);
    if (messages.length > 2) setShowSummary(true);
    else setSelectedScenario(null);
  }, [messages]);

  const start = async (scenario: typeof SCENARIOS[0]) => {
    setError(null);
    setSelectedScenario(scenario);
    setIsConnecting(true);
    setShowSummary(false);
    setCompletedGoals([]);
    setMessages([]);
    nextStartTimeRef.current = 0;

    try {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      const inCtx = new AudioCtx({ sampleRate: 16000 });
      const outCtx = new AudioCtx({ sampleRate: 24000 });
      
      await inCtx.resume();
      await outCtx.resume();
      
      inCtxRef.current = inCtx;
      outCtxRef.current = outCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } 
      });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const micSource = inCtx.createMediaStreamSource(stream);
            const scriptNode = inCtx.createScriptProcessor(4096, 1, 1);
            scriptNode.onaudioprocess = (audioEvent) => {
              const inputData = audioEvent.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              setInputLevel(Math.sqrt(sum / inputData.length));
              
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 32768 : s * 32767;
              }
              
              if (sessionRef.current) {
                sessionRef.current.sendRealtimeInput({ 
                  media: { data: encode(new Uint8Array(pcm16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
                });
              }
            };
            micSource.connect(scriptNode);
            scriptNode.connect(inCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.modelTurn) setIsThinking(false);
            
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outCtxRef.current) {
              const ctx = outCtxRef.current;
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              const now = ctx.currentTime;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              source.onended = () => activeSourcesRef.current.delete(source);
              activeSourcesRef.current.add(source);
            }

            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'model') return [...prev.slice(0, -1), { role: 'model', text: last.text + text }];
                return [...prev, { role: 'model', text }];
              });
            }
            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              setIsThinking(true);
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'user') return [...prev.slice(0, -1), { role: 'user', text: last.text + text }];
                return [...prev, { role: 'user', text }];
              });
            }

            if (msg.toolCall) {
              msg.toolCall.functionCalls.forEach(call => {
                if (call.name === 'provideFeedback') {
                  setRealtimeFeedback(call.args as any);
                  // Auto-clear feedback after 8 seconds
                  setTimeout(() => setRealtimeFeedback(null), 8000);
                  
                  sessionRef.current?.sendToolResponse({
                    functionResponses: [{
                      name: 'provideFeedback',
                      id: call.id,
                      response: { status: 'received' }
                    }]
                  });
                }
              });
            }

            if (msg.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => { setError("Connection lost. Resetting neural link."); stop(); },
          onclose: () => stop(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `${scenario.prompt}. Current Objective: ${scenario.goals.join(' and ')}. Focus on natural conversation flow. 
          IMPORTANT: If the user makes a grammar mistake or if there is a significantly better way to say something, use the 'provideFeedback' tool immediately.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{
            functionDeclarations: [{
              name: "provideFeedback",
              parameters: {
                type: "OBJECT" as any,
                description: "Provide linguistic feedback to the user during conversation.",
                properties: {
                  correction: { type: "STRING" as any, description: "The corrected version of what the user just said." },
                  explanation: { type: "STRING" as any, description: "Brief explanation of the grammar rule." },
                  upgrade: { type: "STRING" as any, description: "A more advanced word or phrase." },
                }
              }
            }]
          }]
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setError("Audio engine failure. Check permissions.");
      setIsConnecting(false);
    }
  };

  if (showSummary) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 animate-in zoom-in-95 duration-500 pb-32">
        <div className="glass rounded-[3rem] p-12 border border-white/10 text-center space-y-10 shadow-2xl">
           <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(6,182,212,0.4)]">
              <Award className="w-12 h-12 text-black" />
           </div>
           <div className="space-y-4">
              <h2 className="luxury-text text-5xl font-black text-white uppercase tracking-tighter">Session Complete</h2>
              <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px]">Linguistic performance synchronized</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                 <p className="text-cyan-400 font-black text-2xl">{messages.filter(m => m.role === 'user').length}</p>
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Turns Taken</p>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                 <p className="text-purple-400 font-black text-2xl">{completedGoals.length} / {selectedScenario?.goals.length}</p>
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Missions Done</p>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                 <p className="text-emerald-400 font-black text-2xl">+{messages.length * 10} XP</p>
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Growth Sync</p>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                 <p className="text-orange-400 font-black text-2xl">
                   {Math.min(100, Math.floor((completedGoals.length / (selectedScenario?.goals.length || 1)) * 60 + (messages.length * 5)))}%
                 </p>
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Fluency Score</p>
              </div>
           </div>

           <div className="text-left space-y-4">
              <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] ml-2">Mission Logs</h4>
              <div className="space-y-3">
                 {selectedScenario?.goals.map((goal, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-5 rounded-2xl border ${completedGoals.includes(goal) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30'}`}>
                       {completedGoals.includes(goal) ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                       <span className="text-xs font-bold">{goal}</span>
                    </div>
                 ))}
              </div>
           </div>

           <button 
             onClick={() => { setShowSummary(false); setSelectedScenario(null); }}
             className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-3"
           >
              <RotateCcw className="w-5 h-5" /> Return to Hub
           </button>
        </div>
      </div>
    );
  }

  if (!selectedScenario && !isActive) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6 animate-in fade-in duration-700 pb-32">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-orange-50/10 text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
             <Radio className="w-4 h-4 animate-pulse" /> Neural Audio Matrix
          </div>
          <h2 className="luxury-text text-6xl md:text-8xl brand-gradient font-black tracking-tighter uppercase italic leading-none">Voice Hub</h2>
          <p className="text-slate-400 font-bold text-lg">Select a neural simulation to begin your immersion training.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SCENARIOS.map((scen) => (
            <button key={scen.id} onClick={() => start(scen)} className="group glass rounded-[3rem] p-2 shadow-2xl hover:-translate-y-2 transition-all border border-white/10">
              <div className="bg-slate-900/50 rounded-[2.5rem] p-8 flex flex-col items-start gap-6 h-[420px] border border-white/5 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${scen.color}-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-${scen.color}-500/20 transition-all`}></div>
                
                <div className="flex justify-between w-full items-start">
                  <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-${scen.color}-500 group-hover:text-black transition-all shadow-lg`}>
                    <scen.icon className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Difficulty</p>
                    <p className={`text-[10px] font-black text-${scen.color}-400 uppercase`}>{scen.difficulty}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black luxury-text text-white uppercase leading-tight">{scen.label}</h3>
                  <p className="text-white/40 text-xs font-medium line-clamp-2">{scen.prompt.split('.')[0]}.</p>
                </div>

                <div className="space-y-3 w-full text-left flex-1">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Missions:</p>
                  {scen.goals.map((g, gi) => (
                    <div key={gi} className="flex items-center gap-2 text-[10px] text-white/60 font-bold">
                      <Target className={`w-3 h-3 text-${scen.color}-400`} /> {g}
                    </div>
                  ))}
                </div>

                <div className={`w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest group-hover:bg-${scen.color}-400 transition-colors shadow-lg text-center`}>
                  Initiate Simulation
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[82vh] flex flex-col lg:flex-row gap-6 py-4 px-4 pb-24 relative overflow-hidden">
      
      {/* Session Controls & Visualizer */}
      <div className="lg:w-80 flex flex-col gap-6">
        <div className="glass rounded-[3rem] p-8 border border-white/10 space-y-10 shadow-2xl">
           <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${inputLevel > 0.05 ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse' : 'bg-white/5 text-cyan-400 border border-cyan-500/20'}`}>
                <Mic className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-white text-sm font-black uppercase tracking-widest">{selectedScenario?.label}</h4>
                <p className="text-cyan-400 text-[9px] font-black uppercase">{isActive ? 'Synchronized' : 'Bridging...'}</p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-end">
                 <h5 className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural Load</h5>
                 <span className="text-[10px] font-black text-cyan-400 uppercase tabular-nums">{Math.floor(inputLevel * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                 <div className="h-full bg-cyan-500 rounded-full transition-all duration-75 shadow-[0_0_10px_cyan]" style={{ width: `${Math.min(100, inputLevel * 300)}%` }}></div>
              </div>
           </div>

           <div className="space-y-4">
              <h5 className="text-[8px] font-black text-white/20 uppercase tracking-widest">Active Missions</h5>
              <div className="space-y-2">
                 {selectedScenario?.goals.map((goal, i) => (
                    <div key={i} className={`flex items-center gap-2 text-[10px] font-bold p-2 rounded-lg transition-all ${completedGoals.includes(goal) ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/40'}`}>
                       {completedGoals.includes(goal) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                       <span className="truncate">{goal}</span>
                    </div>
                 ))}
              </div>
           </div>

           <button onClick={stop} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
              Sever Link
           </button>
        </div>

        <div className="flex-1 glass rounded-[3rem] border border-white/10 hidden lg:flex flex-col items-center justify-center p-8 text-center opacity-30 group hover:opacity-100 transition-all">
           <Zap className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
           <p className="text-[8px] font-black text-white uppercase tracking-widest leading-relaxed">System is analyzing your fluency in real-time. Use keywords for missions.</p>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 glass rounded-[4rem] border border-white/10 shadow-2xl p-6 md:p-12 overflow-y-auto custom-scrollbar relative">
          {isConnecting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl z-30">
               <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mb-6" />
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 animate-pulse">Syncing Neural Frequencies...</p>
            </div>
          )}

          {realtimeFeedback && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md animate-in slide-in-from-top-10 duration-500 px-4">
              <div className="glass bg-cyan-500/10 border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <Zap className="w-5 h-5 text-black" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-center">
                      <h6 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Neural Correction</h6>
                      <button onClick={() => setRealtimeFeedback(null)} className="text-white/20 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {realtimeFeedback.correction && (
                      <p className="text-white font-bold text-sm leading-relaxed">
                        <span className="text-white/40 mr-2">Instead of what you said:</span>
                        "{realtimeFeedback.correction}"
                      </p>
                    )}
                    {realtimeFeedback.explanation && (
                      <p className="text-cyan-400/80 text-[10px] font-medium italic">
                        {realtimeFeedback.explanation}
                      </p>
                    )}
                    {realtimeFeedback.upgrade && (
                      <div className="pt-2 mt-2 border-t border-white/5">
                        <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Pro Tip</p>
                        <p className="text-white/60 text-xs font-medium italic">Try using: <span className="text-purple-400 font-bold">"{realtimeFeedback.upgrade}"</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isThinking && (
            <div className="fixed top-24 right-12 z-40 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-cyan-500/20 flex items-center gap-3 animate-in slide-in-from-right-10 duration-500">
               <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               </div>
               <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">AI Thinking</span>
            </div>
          )}
          
          <div className="space-y-12 pb-20">
            {messages.length === 0 && !isConnecting && (
              <div className="flex flex-col items-center justify-center py-40 opacity-20 text-center space-y-8">
                 <Brain className="w-24 h-24 text-cyan-400" />
                 <p className="font-black uppercase tracking-[0.5em] text-sm text-white italic">Interface Established</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-8 duration-500`}>
                <div className={`max-w-[85%] p-8 rounded-[3rem] shadow-2xl transition-all relative group ${m.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'glass bg-white/5 text-white border border-white/10 rounded-tl-none'}`}>
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2 opacity-30 text-[9px] font-black uppercase tracking-[0.3em]">
                        {m.role === 'model' ? <Monitor className="w-3.5 h-3.5" /> : <UserCircle className="w-3.5 h-3.5" />}
                        {m.role === 'model' ? 'Linguistic Mentor' : 'Learner Sync'}
                     </div>
                     {m.role === 'model' && (
                       <button 
                         onClick={() => handleTranslate(i, m.text)}
                         disabled={isTranslating === i}
                         className="opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full hover:bg-cyan-500 hover:text-black disabled:opacity-50"
                       >
                         {isTranslating === i ? 'Translating...' : (showTranslation === i ? 'Hide Translation' : 'Translate')}
                       </button>
                     )}
                   </div>
                   <p className="text-xl md:text-2xl font-bold leading-relaxed">{m.text}</p>
                   
                   {showTranslation === i && translations[i] && (
                     <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-2">Neural Translation</p>
                        <p className="text-lg text-white/60 font-medium italic leading-relaxed text-right" dir="rtl">
                          {translations[i]}
                        </p>
                     </div>
                   )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ConversationView;
