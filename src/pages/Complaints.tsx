
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Mic, FileImage, Flag, BarChart4, SendHorizontal } from 'lucide-react';
import ComplaintsList from '@/components/complaints/ComplaintsList';
import { toast } from 'sonner';

const Complaints = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock complaints for demonstration
  const [complaints, setComplaints] = useState([
    { id: 1, category: 'water', priority: 'high', content: 'Water supply has been irregular for the past week', source: 'text', status: 'pending', date: '2023-06-15' },
    { id: 2, category: 'energy', priority: 'medium', content: 'Frequent power cuts in the evening hours', source: 'text', status: 'in-progress', date: '2023-06-16' },
    { id: 3, category: 'water', priority: 'low', content: 'Water pressure is very low in our area', source: 'voice', status: 'resolved', date: '2023-06-10' },
  ]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setAudioUrl(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // In a real app, we would stop the actual recording here and process the audio
      setAudioUrl('recorded-audio-url.mp3'); // This would be a real URL in production
      toast.success('Voice recording saved!');
    } else {
      // Start recording - this would be implemented with the Web Audio API in a real app
      setIsRecording(true);
      toast.info('Recording started... Speak now');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!priority) {
      toast.error('Please select a priority');
      return;
    }
    
    let content = '';
    let source = activeTab;
    
    switch (activeTab) {
      case 'text':
        if (!complaintText.trim()) {
          toast.error('Please enter your complaint');
          return;
        }
        content = complaintText;
        break;
      case 'voice':
        if (!audioUrl) {
          toast.error('Please record your voice first');
          return;
        }
        content = 'Voice complaint recorded';
        break;
      case 'image':
        if (!selectedFile) {
          toast.error('Please upload an image or document');
          return;
        }
        content = `File uploaded: ${selectedFile.name}`;
        break;
    }
    
    // Add new complaint to the list
    const newComplaint = {
      id: complaints.length + 1,
      category,
      priority,
      content,
      source,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    
    setComplaints([newComplaint, ...complaints]);
    
    // Reset form
    setComplaintText('');
    setCategory('');
    setPriority('');
    setAudioUrl(null);
    setSelectedFile(null);
    
    toast.success('Complaint submitted successfully!');
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-8 px-4 md:px-6"
      >
        <h1 className="text-3xl font-bold mb-6">Complaint Management</h1>
        
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Complaint</CardTitle>
                <CardDescription>
                  Report issues related to water supply or energy services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="water">Water Supply</SelectItem>
                          <SelectItem value="energy">Energy/Electricity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Complaint Source</label>
                      <Tabs 
                        value={activeTab} 
                        onValueChange={handleTabChange}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="text" className="flex items-center gap-2">
                            <MessageSquare size={16} />
                            <span className="hidden sm:inline">Text</span>
                          </TabsTrigger>
                          <TabsTrigger value="voice" className="flex items-center gap-2">
                            <Mic size={16} />
                            <span className="hidden sm:inline">Voice</span>
                          </TabsTrigger>
                          <TabsTrigger value="image" className="flex items-center gap-2">
                            <FileImage size={16} />
                            <span className="hidden sm:inline">Image/Doc</span>
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="text" className="mt-4">
                          <Textarea
                            placeholder="Describe your complaint in detail..."
                            value={complaintText}
                            onChange={(e) => setComplaintText(e.target.value)}
                            className="min-h-[120px]"
                          />
                        </TabsContent>
                        
                        <TabsContent value="voice" className="mt-4">
                          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                            <Button 
                              type="button"
                              variant={isRecording ? "destructive" : "default"}
                              className="mb-2"
                              onClick={toggleRecording}
                            >
                              <Mic className="mr-2 h-4 w-4" />
                              {isRecording ? 'Stop Recording' : 'Start Recording'}
                            </Button>
                            {audioUrl && (
                              <div className="mt-4 w-full">
                                <p className="text-sm text-center mb-2">Recording saved</p>
                                {/* In a real app, you would display an audio player here */}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="image" className="mt-4">
                          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*, application/pdf"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            <Button 
                              type="button"
                              variant="outline"
                              className="mb-2"
                              onClick={handleBrowseClick}
                            >
                              <FileImage className="mr-2 h-4 w-4" />
                              Browse Files
                            </Button>
                            {selectedFile && (
                              <div className="mt-4">
                                <p className="text-sm text-center">{selectedFile.name}</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" onClick={handleSubmit}>
                  <SendHorizontal className="mr-2 h-4 w-4" />
                  Submit Complaint
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-7">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Complaint History</CardTitle>
                  <CardDescription>View and track your submitted complaints</CardDescription>
                </div>
                <Button variant="outline" className="gap-1.5" asChild>
                  <Link to="/complaints/analytics">
                    <BarChart4 size={16} />
                    <span className="hidden sm:inline">Analytics</span>
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <ComplaintsList complaints={complaints} />
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Complaints;
