// This index file exports all compositions to be used in the application
// It also registers each composition with the compositionRegistry

import { SimpleStarsComposition, metadata as SimpleStarsMetadata } from './SimpleStarsComposition';
import { compositionRegistry } from '@/lib/registry';

// Register compositions
compositionRegistry.register(SimpleStarsMetadata);

// Re-export compositions for easy imports elsewhere
export { SimpleStarsComposition };

// Export a default object with all compositions for convenience
export default {
  SimpleStarsComposition,
  // Add more compositions here as they are created
};