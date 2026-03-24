import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApplicationStatus, JobApplication } from "@/types/job";
import { STATUS_CONFIG } from "@/types/job";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { isPast, parseISO } from "date-fns";
import { ExternalLink, Mail, MapPin, MoreHorizontal } from "lucide-react";

interface JobBoardProps {
  applications: JobApplication[];
  onSelect: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
}

const COLUMNS: ApplicationStatus[] = ["saved", "applied", "interviewing", "offer", "rejected"];

export function JobBoard({
  applications,
  onSelect,
  onDelete,
  onArchive,
  onUpdateStatus
}: JobBoardProps) {

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    onUpdateStatus(draggableId, destination.droppableId as ApplicationStatus);
  };

  return (
    <div className="flex-1 overflow-x-auto p-4 lg:p-6 no-scrollbar">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 h-full min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
          {COLUMNS.map((column) => {
            const columnApps = applications.filter((app) => app.status === column);
            const config = STATUS_CONFIG[column];

            return (
              <div key={column} className="flex flex-col w-[280px] lg:w-auto h-full bg-background/40 rounded-xl border border-border/50">
                <div className="p-3 border-b border-border/30 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${config.color.replace('status-', 'bg-')}`} />
                    <h3 className="text-[12px] font-bold uppercase tracking-wider text-foreground/80">{config.label}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground font-medium">
                      {columnApps.length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={column}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-2 space-y-2 overflow-y-auto transition-colors no-scrollbar ${
                        snapshot.isDraggingOver ? "bg-primary/5" : ""
                      }`}
                    >
                      {columnApps.map((app, index) => {
                        const isOverdue = app.followUpDate && isPast(parseISO(app.followUpDate)) && !["rejected", "offer"].includes(app.status);
                        
                        return (
                        <Draggable key={app.id} draggableId={app.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                              className={`group relative rounded-xl border p-3 shadow-sm transition-all ${
                                isOverdue
                                  ? "border-amber-500/50 bg-amber-500/[0.03] hover:bg-amber-500/[0.08]"
                                  : "border-border/50 bg-card hover:border-primary/20"
                              } ${
                                snapshot.isDragging ? "shadow-xl ring-2 ring-primary/20 scale-[1.02] z-50" : ""
                              }`}
                              onClick={() => onSelect(app)}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-[13px] font-semibold text-foreground line-clamp-1">{app.jobTitle}</h4>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-foreground transition-all">
                                          <MoreHorizontal className="h-3.5 w-3.5" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem onClick={() => onSelect(app)}>Edit</DropdownMenuItem>
                                        {app.companyEmail && (
                                            <DropdownMenuItem
                                            onClick={() => {
                                                const subject = encodeURIComponent(`Checking in: Application for ${app.jobTitle} at ${app.company}`);
                                                const body = encodeURIComponent(`Hi there,\n\nI hope this email finds you well.\n\nI recently applied for the ${app.jobTitle} position at ${app.company} and wanted to reiterate my interest in the role.\n\nBest regards,\n[Your Name]`);
                                                window.open(`mailto:${app.companyEmail}?subject=${subject}&body=${body}`, "_blank");
                                            }}
                                            >
                                            <Mail className="mr-2 h-4 w-4" />
                                            <span>Draft Follow-up</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => onArchive(app.id, !app.archived)}>
                                          {app.archived ? "Unarchive" : "Archive"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => onDelete(app.id)}
                                          className="text-destructive focus:text-destructive"
                                        >
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-[12px] text-muted-foreground line-clamp-1">{app.company}</p>
                                    {app.jobPostingUrl && (
                                        <a
                                            href={app.jobPostingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  {app.officeLocation && (
                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                                      <MapPin className="h-2.5 w-2.5" />
                                      {app.officeLocation.split(',')[0]}
                                    </span>
                                  )}
                                  {app.followUpDate && (
                                      <span className="text-[10px] text-muted-foreground/40 tabular-nums ml-auto">
                                          Due: {new Date(app.followUpDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                      </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )})}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
