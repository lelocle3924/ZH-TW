import { type TTSEngine, type TTSSpeaker } from "./tts";

const browserEngineType = "browser" as const;

export const browserEngine: TTSEngine = {
  name: "Browser Native TTS",
  type: browserEngineType,
  handlesPlayback: true, // Bypass Web Audio API playAudio

  async checkStatus(): Promise<boolean> {
    return 'speechSynthesis' in window;
  },

  async getSpeakers(): Promise<TTSSpeaker[]> {
    if (!('speechSynthesis' in window)) return [];
    
    // We need to wait for voices to be loaded sometimes
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      await new Promise<void>((resolve) => {
        const onChange = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', onChange);
          resolve();
        };
        window.speechSynthesis.addEventListener('voiceschanged', onChange);
        // Timeout just in case
        setTimeout(resolve, 1000);
      });
      voices = window.speechSynthesis.getVoices();
    }

    // Filter traditional chinese and generic chinese voices ideally
    // But since users might want to pick whatever, let's group all available voices.
    // Group them by language
    const groups = new Map<string, typeof voices>();
    for (const voice of voices) {
      const lang = voice.lang || 'Unknown';
      const existing = groups.get(lang) ?? [];
      existing.push(voice);
      groups.set(lang, existing);
    }

    return Array.from(groups.entries()).map(([lang, langVoices]) => {
      return {
        id: lang,
        name: lang, // E.g. zh-TW, en-US
        styles: langVoices.map((v) => ({
          id: v.voiceURI,
          name: v.name,
        })),
      };
    });
  },

  async synthesize(text: string, voiceId?: string): Promise<ArrayBuffer> {
    if (!('speechSynthesis' in window)) return new ArrayBuffer(0);

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceId) {
      const voices = window.speechSynthesis.getVoices();
      const selected = voices.find(v => v.voiceURI === voiceId);
      if (selected) {
        utterance.voice = selected;
      }
    } else {
      // Default to picking a Chinese voice if none selected
      const voices = window.speechSynthesis.getVoices();
      const zhTwVoice = voices.find(v => v.lang.startsWith('zh-'));
      if (zhTwVoice) {
        utterance.voice = zhTwVoice;
      }
    }

    return new Promise((resolve) => {
      utterance.onend = () => {
        resolve(new ArrayBuffer(0));
      };
      utterance.onerror = (e) => {
        console.error("Browser TTS error:", e);
        // Resolve anyway so we don't block the queue completely
        resolve(new ArrayBuffer(0));
      };
      
      window.speechSynthesis.speak(utterance);
    });
  }
};
