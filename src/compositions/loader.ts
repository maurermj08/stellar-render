import { compositionRegistry } from '../lib/registry';
import { compositions } from '../compositions.config';
import { registerCompositionsFromConfig } from '../lib/registry';

// Initialize the registry with all compositions from config
registerCompositionsFromConfig(compositions);

// Export a function to get a specific composition by ID
export const getComposition = (id: string) => {
  return compositionRegistry.get(id);
};

// Export a function to get all compositions
export const getAllCompositions = () => {
  return compositionRegistry.getAll();
};

// Export a function to get compositions by tag
export const getCompositionsByTag = (tag: string) => {
  return compositionRegistry.getAllByTag(tag);
};