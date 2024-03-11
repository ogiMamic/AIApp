import create from "zustand";

interface SelectedItem {
  label: string;
  value: string;
}

interface CustomStoreState {
  selectedItems: SelectedItem[];
  addSelectedItem: (item: SelectedItem) => void;
  removeSelectedItem: (item: SelectedItem) => void;
  clearSelectedItems: () => void;
}

export const useCustomStore = create<CustomStoreState>((set) => ({
  selectedItems: [],
  addSelectedItem: (item) =>
    set((state) => ({ selectedItems: [...state.selectedItems, item] })),
  removeSelectedItem: (item) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter((i) => i.value !== item.value),
    })),
  clearSelectedItems: () => set({ selectedItems: [] }),
}));

export default useCustomStore;
