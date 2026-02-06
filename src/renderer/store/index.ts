import { create } from 'zustand';
import { AppState } from './types';
import { createLayoutSlice } from './createLayoutSlice';
import { createFileSlice } from './createFileSlice';
import { createSettingsSlice } from './createSettingsSlice';
import { createLogSlice } from './createLogSlice';

export * from './types';

export const useAppStore = create<AppState>()((...a) => ({
    ...createLayoutSlice(...a),
    ...createFileSlice(...a),
    ...createSettingsSlice(...a),
    ...createLogSlice(...a),
}));
