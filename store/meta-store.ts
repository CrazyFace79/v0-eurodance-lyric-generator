import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useHistoryStore } from "./history-store"

interface MetaState {
  bpm: number
  key: string
  vocal: string
  era: string
  mood: string
  stylePercentage: number
  weirdnessPercentage: number
  acapellaOnly: boolean
  noInstruments: boolean
  dryVocals: boolean
  introWithoutKick: boolean
  referenceNotes: string
  referenceArtists: string[]
  presetId: string
  style: string
  setBpm: (bpm: number) => void
  setKey: (key: string) => void
  setVocal: (vocal: string) => void
  setEra: (era: string) => void
  setMood: (mood: string) => void
  setStylePercentage: (percentage: number) => void
  setWeirdnessPercentage: (percentage: number) => void
  setAcapellaOnly: (enabled: boolean) => void
  setNoInstruments: (enabled: boolean) => void
  setDryVocals: (enabled: boolean) => void
  setIntroWithoutKick: (enabled: boolean) => void
  setReferenceNotes: (notes: string) => void
  setReferenceArtists: (artists: string[]) => void
  setPresetId: (id: string) => void
  setStylePct: (percentage: number) => void
  setWeirdPct: (percentage: number) => void
  setStyle: (style: string) => void
  generateStyleLine: () => string
  saveToHistory: (lyrics: string) => Promise<void>
}

export const useMetaStore = create<MetaState>()(
  persist(
    (set, get) => ({
      bpm: 148,
      key: "D# minor",
      vocal: "female",
      era: "2000s",
      mood: "euphoric",
      stylePercentage: 80,
      weirdnessPercentage: 20,
      acapellaOnly: false,
      noInstruments: false,
      dryVocals: false,
      introWithoutKick: true,
      referenceNotes: "",
      referenceArtists: [],
      presetId: "original_gospel_148",
      style: "",
      setBpm: (bpm) => set({ bpm }),
      setKey: (key) => set({ key }),
      setVocal: (vocal) => set({ vocal }),
      setEra: (era) => set({ era }),
      setMood: (mood) => set({ mood }),
      setStylePercentage: (percentage) => set({ stylePercentage: percentage }),
      setWeirdnessPercentage: (percentage) => set({ weirdnessPercentage: percentage }),
      setAcapellaOnly: (enabled) => set({ acapellaOnly: enabled }),
      setNoInstruments: (enabled) => set({ noInstruments: enabled }),
      setDryVocals: (enabled) => set({ dryVocals: enabled }),
      setIntroWithoutKick: (enabled) => set({ introWithoutKick: enabled }),
      setReferenceNotes: (notes) => set({ referenceNotes: notes }),
      setReferenceArtists: (artists) => set({ referenceArtists: artists }),
      setPresetId: (id) => set({ presetId: id }),
      setStylePct: (percentage) => set({ stylePercentage: percentage }),
      setWeirdPct: (percentage) => set({ weirdnessPercentage: percentage }),
      setStyle: (style) => set({ style }),
      generateStyleLine: () => {
        const state = get()
        const parts = [
          `${state.era} Remember Dance`,
          `${state.bpm} BPM`,
          `key ${state.key}`,
          `emotional ${state.vocal} vocals with reverb and delay`,
        ]

        if (state.introWithoutKick) parts.push("intro with pads only (no kick)")
        if (!state.noInstruments) {
          parts.push("driving hi-hats", "bright trance leads", "rolling bassline")
        }
        if (state.dryVocals) parts.push("dry vocals")
        if (state.acapellaOnly) parts.push("acapella only")

        parts.push(`${state.mood} and nostalgic`, "clean club mix")

        if (state.referenceArtists.length > 0) {
          parts.push(`in the style of ${state.referenceArtists.join(", ")}`)
        }

        return parts.join(", ")
      },
      saveToHistory: async (lyrics: string) => {
        const state = get()
        const historyStore = useHistoryStore.getState()

        // Create hash for deduplication
        const hash = btoa(`${state.style}-${lyrics}`).slice(0, 16)

        await historyStore.addEntry({
          style: state.style,
          lyrics,
          bpm: state.bpm,
          key: state.key,
          presetId: state.presetId,
          toggles: {
            acapellaOnly: state.acapellaOnly,
            noInstruments: state.noInstruments,
            dryVocals: state.dryVocals,
            introWithoutKick: state.introWithoutKick,
          },
          hash,
          pinned: false,
        })
      },
    }),
    {
      name: "vdamm-meta-store",
    },
  ),
)
