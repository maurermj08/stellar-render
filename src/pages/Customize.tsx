import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Player, Thumbnail } from '@remotion/player';
import { compositions } from '../compositions.config';
import { z } from 'zod';

// Helper function to get input type based on Zod schema
const getInputTypeFromZodSchema = (schema: z.ZodTypeAny, key: string) => {
  console.log(`Checking type for field "${key}":`, {
    originalType: schema._def.typeName,
    innerType: schema._def.innerType?._def.typeName,
    fullSchema: schema,
  });

  // Handle ZodDefault by unwrapping the inner type
  const innerType = schema._def.typeName === 'ZodDefault' ? schema._def.innerType : schema;

  // Log the unwrapped type
  console.log(`Unwrapped type for "${key}":`, {
    unwrappedType: innerType._def.typeName,
    fullInnerType: innerType,
  });

  // Check final type
  if (innerType._def.typeName === 'ZodColor' || key.endsWith('Color')) {
    console.log(`Field "${key}" detected as color input`);
    return 'color';
  }
  if (innerType._def.typeName === 'ZodNumber') {
    console.log(`Field "${key}" detected as number input`);
    return 'number'; 
  }
  if (innerType._def.typeName === 'ZodString') {
    if (key.endsWith('Color')) {
      console.log(`Field "${key}" detected as color input (by name)`);
      return 'color';
    }
    console.log(`Field "${key}" detected as text input`);
    return 'text';
  }
  if (innerType._def.typeName === 'ZodBoolean') {
    console.log(`Field "${key}" detected as checkbox input`);
    return 'checkbox';
  }
  if (innerType._def.typeName === 'ZodEnum') {
    console.log(`Field "${key}" detected as select input`);
    return 'select';
  }
  console.log(`Field "${key}" defaulting to text input`);
  return 'text';
};

// Helper function to get min/max/step values from number schema
const getNumberConstraints = (schema: z.ZodNumber) => {
  const checks = schema._def.checks || [];
  let min: number = -Infinity;
  let max: number = Infinity;
  let step: number | 'any' = 'any';

  checks.forEach((check: any) => {
    if (check.kind === 'min') min = check.value;
    if (check.kind === 'max') max = check.value;
    if (check.type === 'integer') step = 1;
  });

  return { min, max, step };
};

export function Customize() {
  const { id } = useParams<{ id: string }>();
  const [parameters, setParameters] = useState<Record<string, any>>({});

  if (!id) {
    return <div>Error: Video ID not found in URL.</div>;
  }

  const composition = compositions[id as keyof typeof compositions];

  if (!composition) {
    return <div>Error: Composition with ID '{id}' not found.</div>;
  }

  const { component: Comp, width, height, fps, durationInFrames, schema, defaultProps } = composition;
  const videoName = id; // Removed 'name' property usage
  const thumbnailFrame = Math.min(10, Math.floor(durationInFrames / 2));

  // Initialize parameters with defaultProps if not already set
  useState(() => {
    setParameters(defaultProps || {});
  });

  // Get shape of schema
  const shape = (schema as z.ZodObject<any>).shape || {};

  // Update a single parameter
  const updateParameter = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Render form field based on schema type
  const renderField = (key: string, fieldSchema: z.ZodTypeAny) => {
    const inputType = getInputTypeFromZodSchema(fieldSchema, key);
    const defaultValue = (defaultProps as Record<string, any>)?.[key] ?? fieldSchema._def.defaultValue?.() ?? '';
    const currentValue = parameters[key] ?? defaultValue;

    switch (inputType) {
      case 'number': {
        const { min, max, step } = getNumberConstraints(fieldSchema as z.ZodNumber);
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type="number"
              value={currentValue}
              onChange={(e) => updateParameter(key, parseFloat(e.target.value) || 0)}
              min={min}
              max={max}
              step={step}
              className="w-full px-3 py-2 bg-card-hover rounded-md border border-border"
            />
          </div>
        );
      }
      case 'color':
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium mb-1 capitalize flex items-center gap-2">
              {key.replace(/([A-Z])/g, ' $1').trim()}
              <div 
                className="w-6 h-6 rounded-md border border-border"
                style={{ backgroundColor: currentValue }}
              />
            </label>
            <input
              type="color"
              value={currentValue}
              onChange={(e) => updateParameter(key, e.target.value)}
              className="h-10 w-20 p-1 rounded-md"
            />
          </div>
        );
      case 'select': {
        const options = (fieldSchema as z.ZodEnum<[string, ...string[]]>)._def.values;
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <select
              value={currentValue}
              onChange={(e) => updateParameter(key, e.target.value)}
              className="w-full px-3 py-2 bg-card-hover rounded-md border border-border"
            >
              {options.map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      }
      case 'checkbox':
        return (
          <div key={key} className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentValue}
                onChange={(e) => updateParameter(key, e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          </div>
        );
      default:
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => updateParameter(key, e.target.value)}
              className="w-full px-3 py-2 bg-card-hover rounded-md border border-border"
            />
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Preview Section */}
        <div>
          <h1 className="text-2xl font-bold mb-3">Preview {videoName}</h1>
          <div className="bg-card p-6 rounded-lg space-y-6">
            <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
              <Player
                component={Comp as React.ComponentType<Record<string, any>>}
                compositionWidth={width}
                compositionHeight={height}
                controls
                fps={fps}
                durationInFrames={durationInFrames}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                inputProps={parameters}
                autoPlay
                loop
              />
            </div>
            
            {/* Parameters Form */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Parameters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(shape).map(([key, fieldSchema]) => 
                  renderField(key, fieldSchema as z.ZodTypeAny)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Section */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Thumbnail {videoName}</h2>
          <div className="bg-card p-2 rounded-lg">
            <div className="relative w-full max-w-[600px]" style={{ aspectRatio: `${width}/${height}` }}>
              <Thumbnail
                component={Comp as React.ComponentType<Record<string, any>>}
                compositionWidth={width}
                compositionHeight={height}
                fps={fps}
                frameToDisplay={thumbnailFrame}
                durationInFrames={durationInFrames}
                inputProps={parameters}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
