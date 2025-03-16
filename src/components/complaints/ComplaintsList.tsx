
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Droplet, Zap, MessageSquare, Mic, FileImage, Clock } from 'lucide-react';

type Complaint = {
  id: number;
  category: string;
  priority: string;
  content: string;
  source: string;
  status: string;
  date: string;
};

interface ComplaintsListProps {
  complaints: Complaint[];
}

const ComplaintsList: React.FC<ComplaintsListProps> = ({ complaints }) => {
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ComplaintsList;
