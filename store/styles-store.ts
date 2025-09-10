import { create } from "zustand"
import { db, type StylePreset, initializeDefaultPresets } from "@/lib/database"

interface StylesState {
  presets: StylePreset[]
  selectedPreset: StylePreset | null
  isLoading: boolean
  searchQuery: string
  loadPresets: () => Promise<void>
  createPreset: (preset: Omit<StylePreset, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updatePreset: (id: string, updates: Partial<StylePreset>) => Promise<void>
  deletePreset: (id: string) => Promise<void>
  selectPreset: (preset: StylePreset) => void
  setSearchQuery: (query: string) => void
  exportPresets: () => string
  importPresets: (jsonData: string) => Promise<void>
  getFilteredPresets: () => StylePreset[]
}

export const useStylesStore = create<StylesState>((set, get) => ({
  presets: [],
  selectedPreset: null,
  isLoading: false,
  searchQuery: "",

  loadPresets: async () => {
    set({ isLoading: true })
    try {
      await initializeDefaultPresets()
      const presets = await db.stylePresets.orderBy("name").toArray()
      set({ presets, isLoading: false })
    } catch (error) {
      console.error("Failed to load presets:", error)
      set({ isLoading: false })
    }
  },

  createPreset: async (presetData) => {
    const preset: StylePreset = {
      ...presetData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.stylePresets.add(preset)
    set((state) => ({ presets: [...state.presets, preset] }))
  },

  updatePreset: async (id, updates) => {
    const updatedPreset = { ...updates, updatedAt: new Date().toISOString() }
    await db.stylePresets.update(id, updatedPreset)

    set((state) => ({
      presets: state.presets.map((p) => (p.id === id ? { ...p, ...updatedPreset } : p)),
    }))
  },

  deletePreset: async (id) => {
    await db.stylePresets.delete(id)
    set((state) => ({
      presets: state.presets.filter((p) => p.id !== id),
      selectedPreset: state.selectedPreset?.id === id ? null : state.selectedPreset,
    }))
  },

  selectPreset: (preset) => set({ selectedPreset: preset }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  exportPresets: () => {
    const { presets } = get()
    return JSON.stringify(presets, null, 2)
  },

  importPresets: async (jsonData) => {
    try {
      const importedPresets: StylePreset[] = JSON.parse(jsonData)
      await db.stylePresets.bulkAdd(importedPresets)
      get().loadPresets()
    } catch (error) {
      throw new Error("Invalid JSON format")
    }
  },

  getFilteredPresets: () => {
    const { presets, searchQuery } = get()
    if (!searchQuery.trim()) return presets

    const query = searchQuery.toLowerCase()
    return presets.filter(
      (preset) =>
        preset.name.toLowerCase().includes(query) ||
        preset.description.toLowerCase().includes(query) ||
        preset.key.toLowerCase().includes(query) ||
        preset.vocal.toLowerCase().includes(query) ||
        preset.referenceArtists.some((artist) => artist.toLowerCase().includes(query)),
    )
  },
}))
