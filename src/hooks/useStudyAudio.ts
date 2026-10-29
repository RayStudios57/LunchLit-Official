import { useState, useEffect, useCallback } from 'react';
import { studyAudio, STUDY_TRACKS, AudioTrack } from '@/lib/studyAudio';

export function useStudyAudio() {
  const [isPlaying, setIsPlaying] = useState(studyAudio.getIsPlaying());
  const [trackId, setTrackId] = useState(studyAudio.getTrackId());
  const [volume, setVolumeState] = useState(studyAudio.getVolume());

  useEffect(() => {
    const unsub = studyAudio.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setTrackId(state.trackId);
      setVolumeState(state.volume);
    });
    return unsub;
  }, []);

  const play = useCallback(() => studyAudio.play(), []);
  const pause = useCallback(() => studyAudio.pause(), []);
  const togglePlay = useCallback(() => studyAudio.togglePlay(), []);
  const setTrack = useCallback((id: string) => studyAudio.setTrack(id), []);
  const setVolume = useCallback((val: number) => studyAudio.setVolume(val), []);

  const currentTrack = STUDY_TRACKS.find(t => t.id === trackId) || STUDY_TRACKS[0];

  return {
    isPlaying,
    trackId,
    currentTrack,
    volume,
    volumePercent: Math.round(volume * 100),
    tracks: STUDY_TRACKS,
    play,
    pause,
    togglePlay,
    setTrack,
    setVolume,
  };
}
