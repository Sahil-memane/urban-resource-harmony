import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Droplet, Zap, MessageSquare, Mic, FileImage, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Complaint = {
  id: string;
  category: string;
  priority: string;
  content: string;
  source: string;
  status: string;
  date: string;
  response?: string;
  attachment_url?: string;
};

interface ComplaintsListProps {
  complaints: Complaint[];
}

const ComplaintsList: React.FC<ComplaintsListProps> = ({ complaints }) => {
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'water':
        return <Droplet size={16} className="text-blue-500" />;
      case 'energy':
        return <Zap size={16} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const renderSourceIcon = (source: string) => {
    switch (source) {
      case 'text':
        return <MessageSquare size={16} />;
      case 'voice':
        return <Mic size={16} />;
      case 'image':
        return <FileImage size={16} />;
      default:
        return null;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    switch (priority) {
      case 'high':
        variant = "destructive";
        break;
      case 'medium':
        variant = "default";
        break;
      case 'low':
        variant = "secondary";
        break;
    }
    
    return (
      <Badge variant={variant} className="capitalize">
        {priority}
      </Badge>
    );
  };

  const renderStatusBadge = (status: string) => {
    let className = "capitalize ";
    
    switch (status) {
      case 'pending':
        className += "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500";
        break;
      case 'in-progress':
        className += "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
        break;
      case 'resolved':
        className += "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
        break;
    }
    
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const openComplaintDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setDialogOpen(true);
  };

  const renderAttachment = (complaint: Complaint) => {
    if (!complaint.attachment_url) return null;
    
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(complaint.attachment_url);
    const isAudio = /\.(mp3|wav|ogg)$/i.test(complaint.attachment_url);
    const isPdf = /\.pdf$/i.test(complaint.attachment_url);
    
    if (isImage) {
      return (
        <div className="mt-4 rounded-md overflow-hidden border">
          <img 
            src={complaint.attachment_url} 
            alt="Attachment" 
            className="max-w-full h-auto max-h-[300px] object-contain mx-auto"
          />
        </div>
      );
    } else if (isAudio) {
      return (
        <div className="mt-4">
          <audio controls className="w-full">
            <source src={complaint.attachment_url} type="audio/wav" />
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    } else if (isPdf) {
      return (
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline" size="sm">
            <a href={complaint.attachment_url} target="_blank" rel="noopener noreferrer">
              <FileImage className="mr-2 h-4 w-4" />
              View PDF Document
            </a>
          </Button>
        </div>
      );
    } else {
      return (
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline" size="sm">
            <a href={complaint.attachment_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Attachment
            </a>
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="overflow-x-auto">
      {complaints.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No complaints submitted yet</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="hidden sm:table-cell">Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableCell className="flex items-center gap-1.5">
                  {renderCategoryIcon(complaint.category)}
                  <span className="capitalize">{complaint.category}</span>
                </TableCell>
                <TableCell>{renderPriorityBadge(complaint.priority)}</TableCell>
                <TableCell className="hidden md:table-cell max-w-[12rem] truncate">
                  {complaint.content}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    {renderSourceIcon(complaint.source)}
                    <span className="capitalize sr-only">{complaint.source}</span>
                  </div>
                </TableCell>
                <TableCell>{renderStatusBadge(complaint.status)}</TableCell>
                <TableCell className="hidden sm:table-cell whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="opacity-70" />
                    {formatDate(complaint.date)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => openComplaintDetails(complaint)}
                  >
                    <span className="sr-only">Show details</span>
                    <ExternalLink size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedComplaint && (
                <>
                  {renderCategoryIcon(selectedComplaint.category)}
                  <span className="capitalize">{selectedComplaint?.category} Complaint</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <div className="mt-1">{renderPriorityBadge(selectedComplaint.priority)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{renderStatusBadge(selectedComplaint.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {renderSourceIcon(selectedComplaint.source)}
                    <span className="capitalize">{selectedComplaint.source}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Submitted</p>
                  <p className="mt-1">{formatDate(selectedComplaint.date)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p>{selectedComplaint.content}</p>
                </div>
              </div>
              
              {selectedComplaint.attachment_url && (
                <div>
                  <p className="text-sm text-muted-foreground">Attachment</p>
                  {renderAttachment(selectedComplaint)}
                </div>
              )}
              
              {selectedComplaint.response && (
                <div>
                  <p className="text-sm text-muted-foreground">Response</p>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p>{selectedComplaint.response}</p>
                  </div>
                </div>
              )}
              
              {selectedComplaint.status === 'pending' && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-md">
                  <AlertCircle size={16} className="text-yellow-500" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    Your complaint is pending review by our team.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintsList;
