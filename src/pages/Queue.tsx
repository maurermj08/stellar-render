import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import supabase from "@/utils/supabase";
import { Loader, Clock, Download, Plus, Minus, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { compositions } from "@/compositions.config";

type RenderItem = {
  id: number;
  created_timestamp: string;
  finished_timestamp?: string;
  parameters?: Record<string, any>;
  video: string;
  uuid: string;
  user_id: string;
  composition?: string;
};

export function Queue() {
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .channel('renders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'renders'
        },
        () => {
          // Invalidate and refetch renders when any change occurs
          queryClient.invalidateQueries({ queryKey: ['renders'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: renders, isLoading } = useQuery({
    queryKey: ["renders"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("renders")
          .select("*")
          .order("created_timestamp", { ascending: false });

        if (error) {
          console.error("Error fetching renders:", error);
          throw error;
        }

        return data as RenderItem[];
      } catch (error) {
        console.error("Query error:", error);
        throw error;
      }
    },
  });

  const renderParameters = (video: string, parameters: Record<string, any> | undefined) => {
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return null;
    }
    const comp = compositions[video as keyof typeof compositions];
    if (!comp) return null;
    // @ts-expect-error: Suppress type error for editableFields type
    const editableFields = comp.editableFields as string[];
    const filteredEntries = Object.entries(parameters).filter(([key]) => editableFields.includes(key));
    if (filteredEntries.length === 0) {
      return null;
    }
    return (
      <div className="space-y-1">
        {filteredEntries.map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="font-medium">{key}:</span>{' '}
            {typeof value === 'string' && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) ? (
              <span className="inline-flex items-center gap-2">
                {value}
                <div
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: value }}
                />
              </span>
            ) : (
              String(value)
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 pt-8">
          <h1 className="text-2xl font-bold mb-6">Queue</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-24 w-36" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto md:px-4 sm:px-0 pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Queue</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {renders ? renders.length : 0} videos in queue
            </div>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renders?.map((render) => (
                <TableRow key={render.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-2">
                      <div className="text-left">
                        <span className="sm:inline hidden">{render.video || "Unknown Video"}</span>
                        <span className="sm:hidden inline">
                          {render.video && render.video.length > 16
                            ? render.video.slice(0, 13) + "..."
                            : render.video || "Unknown Video"}
                        </span>
                      </div>
                      {render.parameters && Object.keys(render.parameters).length > 0 && (
                        <Collapsible
                          open={openDetails[render.id]}
                          onOpenChange={(open: boolean) => setOpenDetails(prev => ({ ...prev, [render.id]: open }))}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-2 h-8 px-2 text-primary hover:text-white focus:text-white hover:bg-primary focus:bg-primary"
                            >
                              {openDetails[render.id] ? (
                                <Minus className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                              <span>View Details</span>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="text-sm text-muted-foreground bg-primary/5 rounded-md p-2 mt-2">
                            {renderParameters(render.video, render.parameters)}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(render.created_timestamp), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {!render.finished_timestamp ? (
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Processing</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-500">
                        <Check className="h-4 w-4" />
                        <span className="hidden sm:inline">Completed</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row justify-start gap-2">
                      {render.finished_timestamp && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 w-full sm:w-auto"
                            asChild
                          >
                            <a
                              href={`https://stellarvideos.nyc3.digitaloceanspaces.com/stellarvideos/videos/${render.uuid}.mp4`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View video ${render.video || 'Unknown Video'}`}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="hidden sm:inline">View</span>
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 w-full sm:w-auto"
                            onClick={async () => {
                              const url = `https://stellarvideos.nyc3.digitaloceanspaces.com/stellarvideos/videos/${render.uuid}.mp4`;
                              const filename = `${render.video || 'video'}.mp4`;
                              
                              setDownloading(prev => ({ ...prev, [render.id]: true }));
                              try {
                                const response = await fetch(url);
                                const blob = await response.blob();
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(blob);
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(link.href);
                              } catch (error) {
                                console.error('Download failed:', error);
                                // Fallback to opening in new tab
                                window.open(url, '_blank');
                              } finally {
                                setDownloading(prev => ({ ...prev, [render.id]: false }));
                              }
                            }}
                            aria-label={`Download video ${render.video || 'Unknown Video'}`}
                          >
                            {downloading[render.id] ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">
                              {downloading[render.id] ? "Downloading..." : "Download"}
                            </span>
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}