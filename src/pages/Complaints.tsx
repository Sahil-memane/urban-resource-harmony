import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Mic, 
  FileImage, 
  Flag, 
  BarChart4, 
  SendHorizontal,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import ComplaintsList from '@/components/complaints/ComplaintsList';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { uploadFile } from '@/utils/fileUpload';
import Chatbot from '@/components/chatbot/Chatbot';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];
const ALLOWED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/mpeg',
];

const Complaints = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: isRoleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState('text');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [extractionLoading, setExtractionLoading] = useState(false);
  const [extractedContent, setExtractedContent] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  type SpeechRecognitionType = {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    start: () => void;
    stop: () => void;
  };
  
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const [transcription, setTranscription] = useState('');
  
  const fetchComplaints = async () => {
    try {
      setIsLoadingComplaints(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session');
        setIsLoadingComplaints(false);
        return;
      }
      
      console.log('Fetching complaints for user:', session.user.id);
      
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching complaints:', error);
        throw error;
      }
      
      console.log('Fetched complaints:', data);
      
      if (data) {
        setComplaints(data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setIsLoadingComplaints(false);
    }
  };

  useEffect(() => {
    if (!isRoleLoading && userRole && userRole !== 'citizen') {
      navigate('/admin');
    } else if (!isRoleLoading && userRole === 'citizen') {
      fetchComplaints();
    }
  }, [userRole, isRoleLoading, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setAudioUrl(null);
    setSelectedFile(null);
    setAudioBlob(null);
    setTranscription('');
    setSubmissionError(null);
    setExtractedContent(null);
  };

  const extractContentFromAttachment = async (file: File | Blob, fileType: 'image' | 'pdf' | 'audio'): Promise<string | null> => {
    try {
      setExtractionLoading(true);
      
      const fileUrl = URL.createObjectURL(file);
      
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });
      
      console.log(`Extracting content from ${fileType} attachment`);
      
      const { data, error } = await supabase.functions.invoke('extract-content', {
        body: {
          fileUrl: base64Data,
          fileType
        }
      });
      
      if (error) {
        console.error('Error extracting content:', error);
        return null;
      }
      
      if (data && data.extracted) {
        setExtractedContent(data.extracted);
        console.log('Extracted content:', data.extracted);
        return data.extracted;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting content from attachment:', error);
      return null;
    } finally {
      setExtractionLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return;
      }
      
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error('File type not allowed. Please upload a valid image or PDF.');
        return;
      }
      
      setSelectedFile(file);
      
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      const content = await extractContentFromAttachment(file, fileType);
      
      if (content) {
        toast.success('Content extracted from file for AI analysis');
      }
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        stream.getTracks().forEach(track => track.stop());
        
        if (audioBlob.size > 0) {
          const content = await extractContentFromAttachment(audioBlob, 'audio');
          if (content) {
            toast.success('Audio transcribed for AI analysis');
          }
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info('Recording started... Speak now');
      
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition() as SpeechRecognitionType;
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';
          
          recognitionRef.current.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }
            
            setTranscription(finalTranscript || interimTranscript);
          };
          
          recognitionRef.current.start();
        }
      } catch (err) {
        console.error('Speech recognition not supported', err);
      }
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Could not access your microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      toast.success('Voice recording saved!');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const getPriorityFromAI = async (text: string) => {
    try {
      setPredictionLoading(true);
      
      if (!text.trim() && !extractedContent) {
        console.log('[Debug] No text or extracted content, defaulting to medium priority');
        setPriority('medium');
        return 'medium';
      }
      
      const completeText = extractedContent 
        ? `${text}\n[EXTRACTED CONTENT: ${extractedContent}]` 
        : text;
      
      const payload = { 
        complaintText: completeText, 
        category,
        source: activeTab,
        attachmentUrl: audioUrl || (selectedFile ? URL.createObjectURL(selectedFile) : null),
        attachmentContent: extractedContent
      };
      
      console.log('[Debug] Sending to AI for priority detection:', payload);
      
      const { data, error } = await supabase.functions.invoke('ai-priority', {
        body: payload
      });
      
      console.log('[Debug] AI Priority raw response:', data, error);
      
      if (error) {
        console.error('[Debug] AI Priority error:', error);
        setPriority('medium');
        return 'medium';
      }
      
      if (data && data.priority) {
        const priorityValue = data.priority.toString().toLowerCase();
        console.log(`[Debug] AI analysis determined priority: ${priorityValue}`);
        
        if (!['low', 'medium', 'high'].includes(priorityValue)) {
          console.warn(`[Debug] Unexpected priority value: ${priorityValue}, defaulting to medium`);
          setPriority('medium');
          return 'medium';
        }
        
        setPriority(priorityValue);
        toast.success(`AI analysis determined priority: ${priorityValue}`);
        return priorityValue;
      } else {
        console.warn('[Debug] No priority returned from AI, using medium');
        setPriority('medium');
        return 'medium';
      }
    } catch (error) {
      console.error('[Debug] Error getting AI priority:', error);
      setPriority('medium');
      return 'medium';
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    
    let content = '';
    let source = activeTab;
    let attachment_url = null;
    
    try {
      setIsSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to submit a complaint');
        navigate('/login');
        return;
      }
      
      switch (activeTab) {
        case 'text':
          if (!complaintText.trim()) {
            toast.error('Please enter your complaint');
            setIsSubmitting(false);
            return;
          }
          content = complaintText;
          break;
        case 'voice':
          if (!audioBlob) {
            toast.error('Please record your voice first');
            setIsSubmitting(false);
            return;
          }
          
          content = transcription.trim() || extractedContent || 'Voice complaint recorded (no transcription available)';
          break;
        case 'image':
          if (!selectedFile) {
            toast.error('Please upload an image or document');
            setIsSubmitting(false);
            return;
          }
          content = extractedContent || `Image complaint: ${selectedFile.name || 'Image-based complaint'}`;
          break;
      }
      
      let determinedPriority = await getPriorityFromAI(content);
      console.log('[Debug] Using AI-determined priority:', determinedPriority);
      
      if (activeTab === 'voice' && audioBlob) {
        const audioFile = new File([audioBlob], 'voice-recording.wav', { type: 'audio/wav' });
        
        attachment_url = await uploadFile(audioFile, 'audio');
        
        if (!attachment_url) {
          console.error('Failed to upload audio file');
          throw new Error('Failed to upload audio file');
        }
        console.log('Uploaded audio file:', attachment_url);
      } else if (activeTab === 'image' && selectedFile) {
        attachment_url = await uploadFile(selectedFile, 'image');
        
        if (!attachment_url) {
          console.error('Failed to upload image file');
          throw new Error('Failed to upload image file');
        }
        console.log('Uploaded image file:', attachment_url);
      }
      
      const newComplaint = {
        user_id: session.user.id,
        category,
        priority: determinedPriority,
        content,
        source,
        status: 'pending',
        attachment_url
      };
      
      console.log('[Debug] Submitting complaint with data:', newComplaint);
      
      const { data, error } = await supabase
        .from('complaints')
        .insert([newComplaint])
        .select();
      
      if (error) {
        console.error('[Debug] Database error during insert:', error);
        throw error;
      }
      
      console.log('[Debug] Insert successful, returned data:', data);
      
      if (data && data.length > 0) {
        toast.success('Complaint submitted successfully!');
        
        setComplaintText('');
        setCategory('');
        setPriority('');
        setAudioUrl(null);
        setAudioBlob(null);
        setSelectedFile(null);
        setTranscription('');
        setExtractedContent(null);
        
        fetchComplaints();
      } else {
        throw new Error('No data returned from database');
      }
    } catch (error: any) {
      console.error('[Debug] Error submitting complaint:', error);
      setSubmissionError(error.message || 'Unknown error occurred');
      toast.error('Failed to submit complaint: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRoleLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading...</p>
        </div>
      </MainLayout>
    );
  }

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
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Priority</label>
                        {predictionLoading && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            AI determining priority...
                          </div>
                        )}
                      </div>
                      
                      <div className="relative">
                        <Select 
                          value={priority} 
                          onValueChange={setPriority}
                          disabled={predictionLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="AI will determine priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground mt-1">
                          AI will automatically determine priority based on your complaint
                        </div>
                      </div>
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
                              disabled={extractionLoading}
                            >
                              {isRecording ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Stop Recording
                                </>
                              ) : (
                                <>
                                  <Mic className="mr-2 h-4 w-4" />
                                  Start Recording
                                </>
                              )}
                            </Button>
                            
                            {audioUrl && (
                              <div className="mt-4 w-full">
                                <p className="text-sm text-center mb-2">Recording saved</p>
                                <audio controls className="w-full">
                                  <source src={audioUrl} type="audio/wav" />
                                  Your browser does not support audio playback.
                                </audio>
                              </div>
                            )}
                            
                            {(transcription || extractedContent) && (
                              <div className="mt-4 w-full">
                                <p className="text-sm font-medium mb-1">
                                  {extractionLoading ? (
                                    <span className="flex items-center">
                                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                      Analyzing audio...
                                    </span>
                                  ) : (
                                    "Content detected:"
                                  )}
                                </p>
                                <div className="p-3 bg-muted rounded">
                                  <p className="text-sm">
                                    {transcription || extractedContent || "Processing..."}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="image" className="mt-4">
                          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept={ALLOWED_IMAGE_TYPES.join(',')}
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            <Button 
                              type="button"
                              variant="outline"
                              className="mb-2"
                              onClick={handleBrowseClick}
                              disabled={extractionLoading}
                            >
                              {extractionLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <FileImage className="mr-2 h-4 w-4" />
                                  Browse Files
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                              Max file size: 10MB<br />
                              Accepted formats: JPG, PNG, GIF, WEBP, PDF
                            </p>
                            {selectedFile && (
                              <div className="mt-4 text-center">
                                <p className="text-sm">{selectedFile.name}</p>
                                {selectedFile.type.startsWith('image/') && (
                                  <div className="mt-2 max-h-[150px] overflow-hidden rounded">
                                    <img 
                                      src={URL.createObjectURL(selectedFile)} 
                                      alt="Preview" 
                                      className="max-h-[150px] object-contain mx-auto"
                                    />
                                  </div>
                                )}
                                
                                {extractedContent && (
                                  <div className="mt-4 p-3 bg-muted rounded text-left">
                                    <p className="text-sm font-medium mb-1">AI analysis of content:</p>
                                    <p className="text-sm">{extractedContent}</p>
                                  </div>
                                )}
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
                {submissionError && (
                  <div className="w-full mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {submissionError}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !category || extractionLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="mr-2 h-4 w-4" />
                      Submit Complaint
                    </>
                  )}
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
                {isLoadingComplaints ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Flag className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No complaints yet</h3>
                    <p className="text-muted-foreground mt-1 max-w-xs">
                      Submit your first complaint using the form to start tracking it here.
                    </p>
                  </div>
                ) : (
                  <ComplaintsList complaints={complaints} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
      
      <Chatbot />
    </MainLayout>
  );
};

export default Complaints;
