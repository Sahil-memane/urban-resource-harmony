
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Droplet, Zap, MessageSquare, Mic, FileImage, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

type Complaint = {
  id: number;
  category: string;
  priority: string;
  content: string;
  source: string;
  status: string;
  date: string;
  userId: string;
  response?: string;
  resolvedDate?: string;
};

interface AdminComplaintsListProps {
  complaints: Complaint[];
  onResolve?: (id: number, response: string) => void;
  isResolved: boolean;
}

const AdminComplaintsList: React.FC<AdminComplaintsListProps> = ({ complaints, onResolve, isResolved }) => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleOpenResolveDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponse('');
    setDialogOpen(true);
  };

  const handleResolveComplaint = () => {
    if (selectedComplaint && onResolve) {
      onResolve(selectedComplaint.id, response);
      setDialogOpen(false);
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
            {!isResolved && <TableHead>Action</TableHead>}
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
                  {complaint.date}
                </div>
              </TableCell>
              {isResolved && (
                <TableCell className="hidden md:table-cell max-w-[12rem] truncate">
                  {complaint.response}
                </TableCell>
              )}
              {!isResolved && (
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleOpenResolveDialog(complaint)}
                  >
                    <CheckCircle size={14} />
                    Resolve
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
    </div>
  );
};

export default AdminComplaintsList;
