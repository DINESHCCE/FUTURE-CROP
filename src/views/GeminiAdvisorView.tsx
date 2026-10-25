import React, { useState, useRef, useEffect } from 'react';
import { Commodity, MarketRecord, ForecastResult, Language } from '../types';
import { MarketLocation } from '../data/agriDatasets';
import { TRANSLATIONS } from '../utils/translations';
import {
  Sparkles,
  Send,
  Volume2,
  Bot,
  User,
  HelpCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

interface GeminiAdvisorViewProps {
  commodity: Commodity;
  market: MarketLocation;
  forecastResult: ForecastResult | null;
  language: Language;
  initialPrompt?: string;
}

export const GeminiAdvisorView: React.FC<GeminiAdvisorViewProps> = ({
  commodity,
  market,
  forecastResult,
  language,
  initialPrompt,
}) => {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize welcoming message
  useEffect(() => {
    const welcomeEn = `Welcome! I am your FutureCrop Agricultural Intelligence Assistant powered by Google Gemini 3.8 Flash.
Currently assisting you on **${commodity.nameEn}** at **${market.nameEn}** (Current Modal Price: ₹${forecastResult?.currentPrice || '---'}/Quintal).

Ask me anything about:
- Market price dynamics and seasonal festival demand (e.g. Pongal, Diwali, wedding season)
- Storage life and post-harvest preservation tactics
- Explaining Mandi "Modal Price" and auction lot pricing in plain terms
- Evaluating transport freight vs market price differences across Tamil Nadu`;

    const welcomeTa = `வணக்கம்! நான் உங்கள் FutureCrop வேளாண் மற்றும் சந்தை விலை ஆலோசகர் (Google Gemini 3.8 Flash).
தற்போது **${market.nameTa}** சந்தையில் **${commodity.nameTa}** (தற்போதைய மாதிரி விலை: ₹${forecastResult?.currentPrice || '---'}/குவிண்டால்) குறித்து உங்களுக்கு வழிகாட்ட தயாராக உள்ளேன்.

நீங்கள் என்னிடம் கேட்கலாம்:
- சந்தை விலை மாற்றங்கள் மற்றும் திருவிழா கால தேவைகள் (பொங்கல், தீபாவளி, முகூர்த்த நாட்கள்)
- பயிரை சேமித்து வைக்கும் முறைகள் மற்றும் எடை குறைவு (Shrinkage) தடுப்பது எப்படி
- மாதிரி விலை (Modal Price) என்றால் என்ன?
- போக்குவரத்து செலவு மற்றும் தொலைதூர சந்தை லாபக் கணக்கீடு`;

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: language === 'ta' ? welcomeTa : welcomeEn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'FutureCrop Agri AI',
      },
    ]);
  }, [commodity.id, market.id, language]);

  // Handle incoming initial prompt if triggered from another view
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language,
          context: {
            commodity: language === 'ta' ? commodity.nameTa : commodity.nameEn,
            market: language === 'ta' ? market.nameTa : market.nameEn,
            currentPrice: forecastResult?.currentPrice,
            predictedPrice: forecastResult?.predictedFinalPrice,
            priceChangePercent: forecastResult?.priceChangePercent,
            trend: forecastResult?.trend,
            horizon: forecastResult?.horizonDays,
            shelfLifeDays: commodity.shelfLifeDays,
          },
        }),
      });

      const data = await response.json();
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || (language === 'ta' ? 'பதில் கிடைக்கவில்லை.' : 'No response returned.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'Gemini 3.8 Flash',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: language === 'ta'
            ? 'மன்னிக்கவும், சர்வர் இணைப்பில் தாமதம் உள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : 'Sorry, unable to connect to Gemini API. Please check your network connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const quickQuestionsList = language === 'ta'
    ? [
        `${commodity.nameTa} விலை ஏன் திடீரென மாறுகிறது?`,
        `மாதிரி விலை (Modal Price) என்றால் என்ன? எப்படி கணக்கிடப்படுகிறது?`,
        `கோயம்பேடு மற்றும் ஒட்டன்சத்திரம் சந்தைகளிடையே விலை வேறுபாடு ஏன்?`,
        `${commodity.nameTa} பயிரை சேமித்து வைக்கலாமா அல்லது உடனே விற்கலாமா?`,
        `போக்குவரத்து செலவு மற்றும் கமிஷன் கழித்து நிகர லாபம் காண்பது எப்படி?`,
      ]
    : [
        `Why do ${commodity.nameEn} prices fluctuate in ${market.nameEn}?`,
        `What is Mandi Modal Price and how is it determined?`,
        `Why is there a price gap between Koyambedu and Oddanchatram?`,
        `Should I store ${commodity.nameEn} or sell immediately?`,
        `How do transportation costs impact my net realized earnings?`,
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Sparkles className="w-5 h-5 text-emerald-700" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                {t.advisorTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t.advisorSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Gemini 3.8 Flash (Server-Side)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-stone-50/40">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-emerald-800 text-white rounded-tr-xs'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>

                  <div
                    className={`mt-2 pt-1.5 flex items-center justify-between text-[10px] ${
                      isUser ? 'text-emerald-200 border-t border-emerald-700' : 'text-stone-400 border-t border-stone-100'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleSpeak(m.id, m.text)}
                        className="flex items-center gap-1 text-emerald-700 font-semibold hover:text-emerald-900 cursor-pointer ml-3"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{speakingId === m.id ? (language === 'ta' ? 'நிறுத்து' : 'Stop') : t.readAloud}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-xs p-4 text-xs text-stone-500 shadow-2xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>
                  {language === 'ta'
                    ? 'ஜெமினி AI வேளாண் நுண்ணறிவு பதிலைத் தயாரிக்கிறது...'
                    : 'Gemini AI is formulating agricultural advice...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 overflow-x-auto flex gap-1.5 scrollbar-thin">
          <span className="text-[11px] font-bold text-stone-500 shrink-0 self-center mr-1">
            {t.quickQuestions}:
          </span>
          {quickQuestionsList.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 text-xs font-medium transition-all whitespace-nowrap cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage(inputValue);
            }}
            placeholder={t.askPlaceholder}
            className="flex-1 bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
          />

          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>{t.sendQuestion}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
