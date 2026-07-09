import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Users, AlertCircle, Check } from "lucide-react";

interface EventSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectionComplete?: () => void;
}

export function EventSelectionModal({ open, onOpenChange, onSelectionComplete }: EventSelectionModalProps) {
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [registering, setRegistering] = useState(false);

  const { data: activeEvents } = trpc.event.activeEvents.useQuery();
  const { data: myRegistrations } = trpc.event.myRegistrations.useQuery();
  
  const registerMutation = trpc.event.register.useMutation();
  const utils = trpc.useUtils();

  const handleToggleEvent = (eventId: number) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const handleRegisterAll = async () => {
    setRegistering(true);
    try {
      for (const eventId of selectedEventIds) {
        if (!myRegistrations?.some((e) => e.id === eventId)) {
          await registerMutation.mutateAsync({ eventId });
        }
      }
      await utils.event.myRegistrations.invalidate();
      setSelectedEventIds([]);
      onOpenChange(false);
      onSelectionComplete?.();
    } catch (error) {
      console.error("Failed to register for events:", error);
    } finally {
      setRegistering(false);
    }
  };

  const registeredIds = myRegistrations?.map((e) => e.id) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Events to Register</DialogTitle>
          <DialogDescription>
            Select one or multiple events to participate in. You can switch between events at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {activeEvents && activeEvents.length > 0 ? (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Card className="border-blue-100 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Total Events</div>
                        <div className="font-bold text-lg text-blue-700">{activeEvents.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-green-100 bg-green-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Registered</div>
                        <div className="font-bold text-lg text-green-700">{registeredIds.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-amber-100 bg-amber-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Selected</div>
                        <div className="font-bold text-lg text-amber-700">{selectedEventIds.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Events List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {activeEvents.map((event) => {
                  const isRegistered = registeredIds.includes(event.id);
                  const isSelected = selectedEventIds.includes(event.id);

                  return (
                    <Card
                      key={event.id}
                      className={`cursor-pointer transition-all border-2 ${
                        isRegistered
                          ? "border-green-200 bg-green-50/50 opacity-60"
                          : isSelected
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => !isRegistered && handleToggleEvent(event.id)}
                            disabled={isRegistered}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{event.name}</h3>
                              {isRegistered && (
                                <Badge className="bg-green-100 text-green-700 border-0">Registered</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              {event.submissionDeadline && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Deadline: {new Date(event.submissionDeadline).toLocaleDateString()}
                                </div>
                              )}
                              {event.status && (
                                <Badge
                                  variant="outline"
                                  className="capitalize text-xs"
                                >
                                  {event.status.replace(/_/g, " ")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Info */}
              {selectedEventIds.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-blue-700">
                    You've selected <strong>{selectedEventIds.length}</strong> event(s). You'll be able to submit projects to each registered event.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No Active Events</h3>
              <p className="text-gray-500 mt-1">Check back soon for upcoming competitions</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedEventIds([]);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegisterAll}
            disabled={selectedEventIds.length === 0 || registering}
            className="bg-[#0F2A4A]"
          >
            {registering ? "Registering..." : `Register for ${selectedEventIds.length} Event(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
