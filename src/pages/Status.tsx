import { useQuery } from '@tanstack/react-query';
import supabase from '@/utils/supabase';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type Worker = {
  id: number;
  name: string;
  last_checked: string;
  renders: number;
};

export function Status() {
  const { data: workers, isLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("workers")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching workers:", error);
          throw error;
        }

        return data as Worker[];
      } catch (error) {
        console.error("Query error:", error);
        throw error;
      }
    },
  });

  const getTimestampColor = (timestamp: string) => {
    const now = new Date();
    const lastChecked = new Date(timestamp);
    const diffInMinutes = (now.getTime() - lastChecked.getTime()) / (1000 * 60);
    
    if (diffInMinutes > 60) return 'text-red-500';
    if (diffInMinutes > 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Status</h1>
        
        <div className="space-y-6">
          {/* Worker Status */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Worker Status</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : workers && workers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Name</TableHead>
                      <TableHead className="text-center">Last Checked</TableHead>
                      <TableHead className="text-center">Renders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell className="font-medium">
                          {worker.name}
                        </TableCell>
                        <TableCell className={getTimestampColor(worker.last_checked)}>
                          {formatDistanceToNow(new Date(worker.last_checked), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          {worker.renders}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">No workers found</p>
            )}
          </div>

          {/* Test error button */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Testing & Debugging</h2>
            <p className="text-muted-foreground mb-4">Use this button to test error reporting:</p>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => {throw new Error("This is your first error!");}}
            >
              Break the world
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}