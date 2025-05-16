import { z } from "zod";

// Define the metadata schema for our compositions
export const compositionMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  durationInFrames: z.number().int().positive(),
  fps: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  component: z.any(), // Will be a React component
  schema: z.any(), // Will be a Zod schema
  defaultProps: z.record(z.any()), // Default props for the composition
  editableFields: z.array(z.string()),
  renderCost: z.number(),
  tags: z.array(z.string()).optional(),
  thumbnailUrl: z.string().optional(),
  previewVideoUrl: z.string().optional(),
});

export type CompositionMetadata = z.infer<typeof compositionMetadataSchema>;

// The registry is a map of composition IDs to their metadata
export class CompositionRegistry {
  private compositions = new Map<string, CompositionMetadata>();

  register(metadata: CompositionMetadata): void {
    if (this.compositions.has(metadata.id)) {
      console.warn(`Overwriting composition with ID "${metadata.id}"`);
    }
    this.compositions.set(metadata.id, metadata);
  }

  get(id: string): CompositionMetadata | undefined {
    return this.compositions.get(id);
  }

  getAll(): CompositionMetadata[] {
    return Array.from(this.compositions.values());
  }

  getAllByTag(tag: string): CompositionMetadata[] {
    return this.getAll().filter(
      (composition) => composition.tags?.includes(tag)
    );
  }
}

// Create and export a singleton instance of the registry
export const compositionRegistry = new CompositionRegistry();

// Export a helper function to get a component by ID
export const getComponent = (id: string) => {
  const composition = compositionRegistry.get(id);
  if (!composition) {
    throw new Error(`No composition found with ID "${id}"`);
  }
  return composition.component;
};

// Helper function to register all compositions from the config
export const registerCompositionsFromConfig = (config: Record<string, any>) => {
  Object.entries(config).forEach(([id, composition]) => {
    compositionRegistry.register({
      id,
      name: id, // You could add a display name in the config if needed
      description: '', // Could be added to config if needed
      durationInFrames: composition.durationInFrames,
      fps: composition.fps,
      width: composition.width,
      height: composition.height,
      component: composition.component,
      schema: composition.schema,
      defaultProps: composition.defaultProps,
      editableFields: composition.editableFields || [],
      renderCost: composition.renderCost || 0,
    });
  });
};

// Export a helper function to get all registered composition IDs
export const getRegisteredCompositionIds = () => {
  return compositionRegistry.getAll().map(comp => comp.id);
};