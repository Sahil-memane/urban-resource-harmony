
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Droplet, Zap, MessageSquare, Mic, FileImage, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type Complaint = {
  id: string;
  category: string;
  priority: string;
  content: string;
  source: string;
  status: string;
  date: string;
  user_id: string;
  response?: string;
  resolved_date?: string;
  resolved_by?: string;
  attachment_url?: string;
};

interface AdminComplaintsListProps {
  complaints: Complaint[];
  onResolve?: (id: string, response: string) => void;
  isResolved: boolean;
}

const AdminComplaintsList: React.FC<AdminComplaintsListProps> = ({ complaints, onResolve, isResolved }) => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  // Function to render the category icon
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

  // Function to render the source icon
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

  // Function to render priority badge
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

  // Function to render status badge
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

  // Function to format dates
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleOpenResolveDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponse('');
    setDialogOpen(true);
  };

  const handleOpenDetailsDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setViewDetailsOpen(true);
  };

  const handleResolveComplaint = () => {
    if (selectedComplaint && onResolve) {
      onResolve(selectedComplaint.id, response);
      setDialogOpen(false);
    }
  };

  // Function to render attachment
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
            <source src={complaint.attachment_url} />
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="hidden sm:table-cell">Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            {isResolved && <TableHead className="hidden md:table-cell">Response</TableHead>}
            <TableHead>Action</TableHead>
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
                  {formatDate(isResolved && complaint.resolved_date ? complaint.resolved_date : complaint.date)}
                </div>
              </TableCell>
              {isResolved && (
                <TableCell className="hidden md:table-cell max-w-[12rem] truncate">
                  {complaint.response}
                </TableCell>
              )}
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleOpenDetailsDialog(complaint)}
                  >
                    <ExternalLink size={14} />
                    Details
                  </Button>
                  
                  {!isResolved && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleOpenResolveDialog(complaint)}
                    >
                      <CheckCircle size={14} />
                      Resolve
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Resolve Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
            <DialogDescription>
              Provide a response to the citizen's complaint before marking it as resolved.
            </DialogDescription>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">Complaint Details:</h4>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="mb-2">{selectedComplaint.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {renderCategoryIcon(selectedComplaint.category)}
                      <span className="capitalize">{selectedComplaint.category}</span>
                    </div>
                    <div>•</div>
                    <div>{renderPriorityBadge(selectedComplaint.priority)}</div>
                  </div>
                </div>
                
                {selectedComplaint.attachment_url && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Attachment:</h4>
                    {renderAttachment(selectedComplaint)}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="response" className="text-sm font-medium">
                  Your Response:
                </label>
                <Textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Explain how you resolved this issue..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleResolveComplaint}
              disabled={!response.trim()}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedComplaint && (
                <>
                  {renderCategoryIcon(selectedComplaint.category)}
                  <span className="capitalize">{selectedComplaint?.category} Complaint Details</span>
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
                  <p className="text-sm text-muted-foreground">
                    {selectedComplaint.status === 'resolved' ? 'Resolved Date' : 'Submission Date'}
                  </p>
                  <p className="mt-1">
                    {formatDate(selectedComplaint.status === 'resolved' ? 
                      selectedComplaint.resolved_date || selectedComplaint.date : 
                      selectedComplaint.date)}
                  </p>
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
              
              {!isResolved && (
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => {
                      setViewDetailsOpen(false);
                      handleOpenResolveDialog(selectedComplaint);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Resolve Complaint
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminComplaintsList;
