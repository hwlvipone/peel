type AudioFeedback = (message: string) => void;

let activeAudio: HTMLAudioElement | null = null;
let activeFeedback: AudioFeedback | null = null;

export async function playPronunciation(src: string, feedback: AudioFeedback): Promise<void> {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio.onerror = null;
  }

  feedback('');
  const audio = new Audio(src);
  activeAudio = audio;
  activeFeedback = feedback;
  const fail = () => {
    if (activeAudio !== audio) return;
    audio.pause();
    activeAudio = null;
    activeFeedback?.("Couldn't play audio. Check whether your device is muted.");
    activeFeedback = null;
  };
  audio.onerror = fail;
  try {
    await audio.play();
    if (audio.paused && activeAudio === audio) fail();
  } catch {
    fail();
  }
}
