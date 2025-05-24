import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Player } from '@remotion/player';
import { compositions } from '../compositions.config';
import { z } from 'zod';
import supabase from '../utils/supabase';
import { v5 as uuidv5 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { add } from 'date-fns';
import { addSpacesToCamelCase } from "../lib/utils";
import type { CompositionMetadata } from '../lib/registry';
import { TokenIcon } from '@/components/icons/TokenIcon';

// Namespace for UUID generation
const NAMESPACE = "6189bbe8-92e9-4e34-b653-7258e0fc354b";

// Helper function to get input type based on Zod schema
const getInputTypeFromZodSchema = (schema: z.ZodTypeAny, key: string) => {
  // Handle ZodDefault by unwrapping the inner type
  const innerType = schema._def.typeName === 'ZodDefault' ? schema._def.innerType : schema;

  // Check final type
  if (innerType._def.typeName === 'ZodColor' || key.toLocaleLowerCase().endsWith('color')) {
    return 'color';
  }
  if (innerType._def.typeName === 'ZodNumber') {
    return 'number'; 
  }
  if (innerType._def.typeName === 'ZodString') {
    if (key.endsWith('Color') || key.toLowerCase() === 'color') {
      return 'color';
    }
    return 'text';
  }
  if (innerType._def.typeName === 'ZodBoolean') {
    return 'checkbox';
  }
  if (innerType._def.typeName === 'ZodEnum') {
    return 'select';
  }
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
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams<{ id: string }>();
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get current user session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Get user account for tokens
  const { data: account } = useQuery({
    queryKey: ['account', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('accounts')
        .select('tokens')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleGenerate = async () => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to generate a video",
        variant: "destructive",
      });
      return;
    }

    // Check if user has enough tokens (client-side validation only)
    if ((account?.tokens || 0) < composition.renderCost) {
      toast({
        title: "Error",
        description: "Not enough tokens to generate video",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate UUID for the render
      const dataToHash = JSON.stringify({
        video: id,
        parameters,
      });
      const uuid = uuidv5(dataToHash, NAMESPACE);

      // Create render entry (token deduction will be handled server-side)
      const { error } = await supabase
        .from('renders')
        .insert({
          user_id: session.user.id,
          video: id,
          parameters,
          uuid,
          version: 1, // Set initial version
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully submitted video for rendering! This process may take up to an hour, please check back soon.",
      });
      navigate('/queue');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (!id) {
    return <div>Error: Video ID not found in URL.</div>;
  }

  const selectedComp = compositions[id as keyof typeof compositions];
  const composition = {
    ...selectedComp,
    id,
    name: id,
    description: '',
    editableFields: [...selectedComp.editableFields], // Create a new mutable array
  } as unknown as CompositionMetadata;

  if (!composition) {
    return <div>Error: Composition with ID '{id}' not found.</div>;
  }

  const { component: Comp, width, height, fps, durationInFrames, schema, defaultProps } = composition;
  const videoName = id; // Removed 'name' property usage

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
    // Skip rendering if the field is not in editableFields
    if (!composition.editableFields.includes(key)) {
      return null;
    }

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
              inputMode="decimal"
              value={currentValue}
              onChange={(e) => updateParameter(key, parseFloat(e.target.value) || 0)}
              min={min}
              max={max}
              step={step}
              className="w-full px-3 py-2 bg-muted text-foreground rounded-md border border-border focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        );
      }
      case 'color':
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium mb-1 capitalize flex items-center gap-2">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type="color"
              value={currentValue}
              onChange={(e) => updateParameter(key, e.target.value)}
              className="h-10 w-20 p-1 rounded-md bg-muted"
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
              className="w-full px-3 py-2 bg-muted text-foreground rounded-md border border-border focus:border-primary focus:ring-1 focus:ring-primary"
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
                className="rounded border-border text-primary focus:ring-primary"
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
              className="w-full px-3 py-2 bg-muted text-foreground rounded-md border border-border focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto pt-2 pb-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumbs - only shown on md and larger screens */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">{addSpacesToCamelCase(videoName)}</span>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Customize {addSpacesToCamelCase(videoName)}</h1>
            <div className="bg-card rounded-lg overflow-hidden">
              <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
                <Player
                  component={Comp as React.ComponentType<Record<string, any>>}
                  compositionWidth={width}
                  compositionHeight={height}
                  controls
                  fps={fps}
                  durationInFrames={durationInFrames}
                  allowFullscreen={true}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  inputProps={parameters}
                  autoPlay
                  loop
                  acknowledgeRemotionLicense={true}
                />
              </div>
            </div>
          </div>
            
          {/* Parameters Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <div className="bg-card p-6 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.entries(shape).map(([key, fieldSchema]) => 
                  renderField(key, fieldSchema as z.ZodTypeAny)
                )}
              </div>
              <div className="mt-8">
                <button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={!session ? () => navigate('/auth') : handleGenerate}
                  disabled={!session ? false : (account?.tokens || 0) < composition.renderCost}
                >
                  {!session ? (
                    "Please login to generate"
                  ) : (account?.tokens || 0) < composition.renderCost ? (
                    `Not enough tokens (${composition.renderCost} required)`
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Generate Video</span>
                      <div className="flex items-center gap-1">
                        <TokenIcon className="w-3 h-3" />
                        <span className="text-xs font-semibold">{composition.renderCost}</span>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
