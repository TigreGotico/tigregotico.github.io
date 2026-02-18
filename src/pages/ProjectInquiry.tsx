import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Mail, MapPin, Send, Mic, Volume2, Bot, Server, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

const WEB3FORMS_ACCESS_KEY = "7d2b3f4c-7eef-4b64-a99c-d1321d1b79a3";

interface FormData {
  // Project Overview
  clientName: string;
  email: string;
  company: string;
  useCaseSummary: string;

  // Audio Source
  audioSource: string[];
  audioSourceOther: string;

  // Audio Format
  sampleRate: string[];
  codec: string[];
  codecOther: string;
  monoStereo: string;
  averageDuration: string;

  // Acoustic Environment
  acousticEnvironment: string[];
  acousticNotes: string;

  // Language Requirements
  languages: string;
  bilingualCodeSwitching: string;
  domainSpecificTerminology: string;
  terminologyExamples: string;

  // ASR Requirements
  asrAccuracyLevel: string;
  asrLatencyTarget: string;
  asrConcurrency: string;
  asrPunctuation: string;
  asrTimestamps: string;
  asrDiarization: string;
  asrPainPoints: string[];
  asrPainPointsNotes: string;

  // TTS Requirements
  ttsLanguagesVoices: string;
  ttsStyle: string[];
  ttsVoiceCloning: string;
  ttsRealTimeStreaming: string;
  ttsConcurrency: string;
  ttsAverageOutputLength: string;

  // Voice Assistant
  vaIntentDetection: string;
  vaEntityExtraction: string;
  vaWakeWord: string;
  vaOnDeviceConstraints: string;
  vaHardware: string;

  // Deployment
  deploymentEnvironment: string[];
  deployCpuOnly: string;
  deployGpuAvailable: string;
  deployContainersOk: string;
  deployMaxResources: string;
  deployDataLeaveEnvironment: string;
  deployCompliance: string[];
  deployComplianceOther: string;

  // Integration
  inputFormat: string[];
  inputFormatOther: string;
  outputFormat: string[];
  outputFormatOther: string;
  existingPipelineTools: string;
  preferredLanguages: string[];
  preferredLanguagesOther: string;

  // Success Criteria
  successAccuracy: string;
  successLatency: string;
  successUptime: string;
  successCostLimit: string;

  // Risks / Notes
  risksNotes: string;
}

const ProjectInquiry = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    email: '',
    company: '',
    useCaseSummary: '',
    audioSource: [],
    audioSourceOther: '',
    sampleRate: [],
    codec: [],
    codecOther: '',
    monoStereo: '',
    averageDuration: '',
    acousticEnvironment: [],
    acousticNotes: '',
    languages: '',
    bilingualCodeSwitching: '',
    domainSpecificTerminology: '',
    terminologyExamples: '',
    asrAccuracyLevel: '',
    asrLatencyTarget: '',
    asrConcurrency: '',
    asrPunctuation: '',
    asrTimestamps: '',
    asrDiarization: '',
    asrPainPoints: [],
    asrPainPointsNotes: '',
    ttsLanguagesVoices: '',
    ttsStyle: [],
    ttsVoiceCloning: '',
    ttsRealTimeStreaming: '',
    ttsConcurrency: '',
    ttsAverageOutputLength: '',
    vaIntentDetection: '',
    vaEntityExtraction: '',
    vaWakeWord: '',
    vaOnDeviceConstraints: '',
    vaHardware: '',
    deploymentEnvironment: [],
    deployCpuOnly: '',
    deployGpuAvailable: '',
    deployContainersOk: '',
    deployMaxResources: '',
    deployDataLeaveEnvironment: '',
    deployCompliance: [],
    deployComplianceOther: '',
    inputFormat: [],
    inputFormatOther: '',
    outputFormat: [],
    outputFormatOther: '',
    existingPipelineTools: '',
    preferredLanguages: [],
    preferredLanguagesOther: '',
    successAccuracy: '',
    successLatency: '',
    successUptime: '',
    successCostLimit: '',
    risksNotes: '',
  });

  const sections = [
    { title: 'Project Overview', icon: CheckCircle2 },
    { title: 'Audio & Input', icon: Mic },
    { title: 'Language & ASR', icon: Mic },
    { title: 'TTS Requirements', icon: Volume2 },
    { title: 'Voice Assistant', icon: Bot },
    { title: 'Deployment', icon: Server },
    { title: 'Integration & Success', icon: Shield },
  ];

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    const currentValues = formData[field] as string[];
    if (checked) {
      setFormData({ ...formData, [field]: [...currentValues, value] });
    } else {
      setFormData({ ...formData, [field]: currentValues.filter(v => v !== value) });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatFormDataForEmail = () => {
    return `
PROJECT SCOPING FORM SUBMISSION
================================

1. PROJECT OVERVIEW
-------------------
Client Name: ${formData.clientName}
Email: ${formData.email}
Company: ${formData.company}
Use Case Summary: ${formData.useCaseSummary}

2. AUDIO & INPUT CHARACTERISTICS
---------------------------------
Audio Source: ${formData.audioSource.join(', ')}${formData.audioSourceOther ? ` (Other: ${formData.audioSourceOther})` : ''}
Sample Rate: ${formData.sampleRate.join(', ')}
Codec: ${formData.codec.join(', ')}${formData.codecOther ? ` (Other: ${formData.codecOther})` : ''}
Mono/Stereo: ${formData.monoStereo}
Average Duration: ${formData.averageDuration}
Acoustic Environment: ${formData.acousticEnvironment.join(', ')}
Acoustic Notes: ${formData.acousticNotes}

3. LANGUAGE REQUIREMENTS
------------------------
Languages: ${formData.languages}
Bilingual/Code-switching: ${formData.bilingualCodeSwitching}
Domain-specific Terminology: ${formData.domainSpecificTerminology}
Terminology Examples: ${formData.terminologyExamples}

4. ASR (SPEECH-TO-TEXT) REQUIREMENTS
-------------------------------------
Accuracy Level: ${formData.asrAccuracyLevel}
Latency Target: ${formData.asrLatencyTarget}
Concurrency: ${formData.asrConcurrency}
Punctuation Needed: ${formData.asrPunctuation}
Timestamps Needed: ${formData.asrTimestamps}
Speaker Diarization: ${formData.asrDiarization}
Pain Points: ${formData.asrPainPoints.join(', ')}
Pain Points Notes: ${formData.asrPainPointsNotes}

5. TTS (TEXT-TO-SPEECH) REQUIREMENTS
-------------------------------------
Languages/Voices: ${formData.ttsLanguagesVoices}
Style: ${formData.ttsStyle.join(', ')}
Voice Cloning Required: ${formData.ttsVoiceCloning}
Real-time Streaming: ${formData.ttsRealTimeStreaming}
Concurrency: ${formData.ttsConcurrency}
Average Output Length: ${formData.ttsAverageOutputLength}

6. VOICE ASSISTANT REQUIREMENTS
--------------------------------
Intent Detection: ${formData.vaIntentDetection}
Entity Extraction: ${formData.vaEntityExtraction}
Wake Word: ${formData.vaWakeWord}
On-device Constraints: ${formData.vaOnDeviceConstraints}
Hardware: ${formData.vaHardware}

7. DEPLOYMENT CONSTRAINTS
--------------------------
Environment: ${formData.deploymentEnvironment.join(', ')}
CPU Only: ${formData.deployCpuOnly}
GPU Available: ${formData.deployGpuAvailable}
Containers OK: ${formData.deployContainersOk}
Max Resource Usage: ${formData.deployMaxResources}
Data Leave Environment: ${formData.deployDataLeaveEnvironment}
Compliance: ${formData.deployCompliance.join(', ')}${formData.deployComplianceOther ? ` (Other: ${formData.deployComplianceOther})` : ''}

8. INTEGRATION DETAILS
-----------------------
Input Format: ${formData.inputFormat.join(', ')}${formData.inputFormatOther ? ` (Other: ${formData.inputFormatOther})` : ''}
Output Format: ${formData.outputFormat.join(', ')}${formData.outputFormatOther ? ` (Other: ${formData.outputFormatOther})` : ''}
Existing Pipeline Tools: ${formData.existingPipelineTools}
Preferred Languages: ${formData.preferredLanguages.join(', ')}${formData.preferredLanguagesOther ? ` (Other: ${formData.preferredLanguagesOther})` : ''}

9. SUCCESS CRITERIA
--------------------
Accuracy Threshold: ${formData.successAccuracy}
Latency Threshold: ${formData.successLatency}
Stability/Uptime: ${formData.successUptime}
Cost Limit: ${formData.successCostLimit}

10. RISKS / NOTES
------------------
${formData.risksNotes}
    `;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Project Scoping Form - ${formData.clientName} (${formData.company})`,
          from_name: formData.clientName,
          email: formData.email,
          message: formatFormDataForEmail(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Form submitted successfully!",
          description: "We'll review your project requirements and get back to you within 24-48 hours.",
        });
        // Reset form
        setFormData({
          clientName: '',
          email: '',
          company: '',
          useCaseSummary: '',
          audioSource: [],
          audioSourceOther: '',
          sampleRate: [],
          codec: [],
          codecOther: '',
          monoStereo: '',
          averageDuration: '',
          acousticEnvironment: [],
          acousticNotes: '',
          languages: '',
          bilingualCodeSwitching: '',
          domainSpecificTerminology: '',
          terminologyExamples: '',
          asrAccuracyLevel: '',
          asrLatencyTarget: '',
          asrConcurrency: '',
          asrPunctuation: '',
          asrTimestamps: '',
          asrDiarization: '',
          asrPainPoints: [],
          asrPainPointsNotes: '',
          ttsLanguagesVoices: '',
          ttsStyle: [],
          ttsVoiceCloning: '',
          ttsRealTimeStreaming: '',
          ttsConcurrency: '',
          ttsAverageOutputLength: '',
          vaIntentDetection: '',
          vaEntityExtraction: '',
          vaWakeWord: '',
          vaOnDeviceConstraints: '',
          vaHardware: '',
          deploymentEnvironment: [],
          deployCpuOnly: '',
          deployGpuAvailable: '',
          deployContainersOk: '',
          deployMaxResources: '',
          deployDataLeaveEnvironment: '',
          deployCompliance: [],
          deployComplianceOther: '',
          inputFormat: [],
          inputFormatOther: '',
          outputFormat: [],
          outputFormatOther: '',
          existingPipelineTools: '',
          preferredLanguages: [],
          preferredLanguagesOther: '',
          successAccuracy: '',
          successLatency: '',
          successUptime: '',
          successCostLimit: '',
          risksNotes: '',
        });
        setCurrentSection(0);
      } else {
        throw new Error(result.message || 'Form submission failed');
      }
    } catch (error) {
      toast({
        title: "Error submitting form",
        description: "Please try again or contact us directly via email.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const contactCardVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
    hover: {
      x: 5,
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  const CheckboxGroup = ({ 
    label, 
    options, 
    field, 
    showOther = false,
    otherField 
  }: { 
    label: string; 
    options: string[]; 
    field: keyof FormData;
    showOther?: boolean;
    otherField?: keyof FormData;
  }) => (
    <div className="space-y-3">
      <Label className="text-foreground font-medium">{label}</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${field}-${option}`}
              checked={(formData[field] as string[]).includes(option)}
              onCheckedChange={(checked) => handleCheckboxChange(field, option, checked as boolean)}
            />
            <label htmlFor={`${field}-${option}`} className="text-sm text-muted-foreground cursor-pointer">
              {option}
            </label>
          </div>
        ))}
      </div>
      {showOther && otherField && (
        <Input
          placeholder="Other (specify)"
          value={formData[otherField] as string}
          onChange={(e) => handleInputChange(otherField, e.target.value)}
          className="mt-2"
        />
      )}
    </div>
  );

  const RadioGroup = ({ 
    label, 
    options, 
    field,
    columns = 2
  }: { 
    label: string; 
    options: string[]; 
    field: keyof FormData;
    columns?: number;
  }) => (
    <div className="space-y-3">
      <Label className="text-foreground font-medium">{label}</Label>
      <div className={`grid grid-cols-${columns} md:grid-cols-${Math.min(columns + 1, 4)} gap-3`}>
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <input
              type="radio"
              id={`${field}-${option}`}
              name={field}
              value={option}
              checked={formData[field] === option}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-4 h-4 text-primary"
            />
            <label htmlFor={`${field}-${option}`} className="text-sm text-muted-foreground cursor-pointer">
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <motion.div className="space-y-6" variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">1. Project Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="clientName" className="text-foreground font-medium">
                  Your Name *
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company" className="text-foreground font-medium">
                Company / Organization
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="useCaseSummary" className="text-foreground font-medium">
                Use Case Summary (1-2 sentences) *
              </Label>
              <Textarea
                id="useCaseSummary"
                value={formData.useCaseSummary}
                onChange={(e) => handleInputChange('useCaseSummary', e.target.value)}
                required
                rows={3}
                className="mt-2"
                placeholder="Briefly describe what you're looking to build..."
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div className="space-y-6" variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">2. Audio & Input Characteristics</h3>
            
            <CheckboxGroup
              label="Audio Source"
              options={['Microphone', 'Call center / telephony', 'Mobile app', 'Browser', 'Embedded device', 'Uploaded audio files']}
              field="audioSource"
              showOther
              otherField="audioSourceOther"
            />

            <div className="border-t pt-4">
              <h4 className="font-medium text-foreground mb-4">Audio Format</h4>
              
              <CheckboxGroup
                label="Sample Rate"
                options={['8 kHz', '16 kHz', '44.1 kHz', '48 kHz']}
                field="sampleRate"
              />

              <div className="mt-4">
                <CheckboxGroup
                  label="Codec"
                  options={['PCM', 'WAV', 'MP3', 'Opus', 'G.711 µ-law', 'G.711 A-law']}
                  field="codec"
                  showOther
                  otherField="codecOther"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-foreground font-medium">Mono / Stereo</Label>
                  <Input
                    value={formData.monoStereo}
                    onChange={(e) => handleInputChange('monoStereo', e.target.value)}
                    placeholder="e.g., Mono"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-foreground font-medium">Average Duration</Label>
                  <Input
                    value={formData.averageDuration}
                    onChange={(e) => handleInputChange('averageDuration', e.target.value)}
                    placeholder="e.g., 30 seconds"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <CheckboxGroup
                label="Acoustic Environment"
                options={['Quiet', 'Office', 'Noisy background', 'Multi-speaker', 'Far-field']}
                field="acousticEnvironment"
              />
              <div className="mt-3">
                <Label className="text-foreground font-medium">Notes</Label>
                <Textarea
                  value={formData.acousticNotes}
                  onChange={(e) => handleInputChange('acousticNotes', e.target.value)}
                  placeholder="Any additional notes about the acoustic environment..."
                  rows={2}
                  className="mt-2"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div className="space-y-6" variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">3. Language Requirements</h3>
            
            <div>
              <Label className="text-foreground font-medium">Languages</Label>
              <Input
                value={formData.languages}
                onChange={(e) => handleInputChange('languages', e.target.value)}
                placeholder="e.g., English, Spanish, Portuguese"
                className="mt-2"
              />
            </div>

            <RadioGroup
              label="Bilingual / Code-switching?"
              options={['Yes', 'No']}
              field="bilingualCodeSwitching"
            />

            <RadioGroup
              label="Domain-specific terminology?"
              options={['Yes', 'No']}
              field="domainSpecificTerminology"
            />

            {formData.domainSpecificTerminology === 'Yes' && (
              <div>
                <Label className="text-foreground font-medium">Terminology Examples</Label>
                <Input
                  value={formData.terminologyExamples}
                  onChange={(e) => handleInputChange('terminologyExamples', e.target.value)}
                  placeholder="e.g., Medical terms, legal jargon..."
                  className="mt-2"
                />
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">4. ASR (Speech-to-Text) Requirements</h3>
              
              <RadioGroup
                label="Expected Accuracy Level"
                options={['High', 'Medium', 'Good enough']}
                field="asrAccuracyLevel"
              />

              <div className="mt-4">
                <RadioGroup
                  label="Latency Target"
                  options={['<300ms', '<1s', 'Streaming but not strict', 'Batch/offline']}
                  field="asrLatencyTarget"
                  columns={2}
                />
              </div>

              <div className="mt-4">
                <Label className="text-foreground font-medium">Concurrency (Expected simultaneous users/channels)</Label>
                <Input
                  value={formData.asrConcurrency}
                  onChange={(e) => handleInputChange('asrConcurrency', e.target.value)}
                  placeholder="e.g., 100"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <RadioGroup label="Punctuation needed?" options={['Yes', 'No']} field="asrPunctuation" />
                <RadioGroup label="Timestamps needed?" options={['Yes', 'No']} field="asrTimestamps" />
                <RadioGroup label="Speaker diarization?" options={['Yes', 'No']} field="asrDiarization" />
              </div>

              <div className="mt-4">
                <CheckboxGroup
                  label="Current Pain Points"
                  options={['Accuracy', 'Latency', 'Stability', 'Cost', 'Legal / data privacy', 'Model limitations', 'Integration issues']}
                  field="asrPainPoints"
                />
                <div className="mt-3">
                  <Label className="text-foreground font-medium">Notes</Label>
                  <Textarea
                    value={formData.asrPainPointsNotes}
                    onChange={(e) => handleInputChange('asrPainPointsNotes', e.target.value)}
                    placeholder="Any additional notes about pain points..."
                    rows={2}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div className="space-y-6" variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">5. TTS (Text-to-Speech) Requirements</h3>
            
            <div>
              <Label className="text-foreground font-medium">Languages / Voices</Label>
              <Input
                value={formData.ttsLanguagesVoices}
                onChange={(e) => handleInputChange('ttsLanguagesVoices', e.target.value)}
                placeholder="e.g., English (US Female), Portuguese (Male)"
                className="mt-2"
              />
            </div>

            <CheckboxGroup
              label="Style"
              options={['Neutral', 'Conversational', 'Emotional']}
              field="ttsStyle"
            />

            <RadioGroup
              label="Voice cloning required?"
              options={['Yes', 'No']}
              field="ttsVoiceCloning"
            />

            <div className="border-t pt-4">
              <h4 className="font-medium text-foreground mb-4">Performance</h4>
              
              <RadioGroup
                label="Real-time streaming?"
                options={['Yes', 'No']}
                field="ttsRealTimeStreaming"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-foreground font-medium">Concurrency</Label>
                  <Input
                    value={formData.ttsConcurrency}
                    onChange={(e) => handleInputChange('ttsConcurrency', e.target.value)}
                    placeholder="e.g., 50 simultaneous"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-foreground font-medium">Average Output Length</Label>
                  <Input
                    value={formData.ttsAverageOutputLength}
                    onChange={(e) => handleInputChange('ttsAverageOutputLength', e.target.value)}
                    placeholder="e.g., 2-3 sentences"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div className="space-y-6" variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">6. Voice Assistant Requirements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RadioGroup label="Intent detection?" options={['Yes', 'No']} field="vaIntentDetection" />
              <RadioGroup label="Entity extraction?" options={['Yes', 'No']} field="vaEntityExtraction" />
              <RadioGroup label="Wake word?" options={['Yes', 'No']} field="vaWakeWord" />
              <RadioGroup label="On-device constraints?" options={['Yes', 'No']} field="vaOnDeviceConstraints" />
            </div>

            {formData.vaOnDeviceConstraints === 'Yes' && (
              <div>
                <Label className="text-foreground font-medium">Hardware Specifications</Label>
                <Input
                  value={formData.vaHardware}
                  onChange={(e) => handleInputChange('vaHardware', e.target.value)}
                  placeholder="e.g., Raspberry Pi 4, ARM Cortex..."
                  className="mt-2"
                />
              </div>
            )}
          </motion.div>
        );

      case 5:
        return (
          <motion.div className="space-y-6" variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">7. Deployment Constraints</h3>
            
            <CheckboxGroup
              label="Environment"
              options={['On-premises', "Client's cloud", 'Our cloud', 'Hybrid']}
              field="deploymentEnvironment"
            />

            <div className="border-t pt-4">
              <h4 className="font-medium text-foreground mb-4">Infrastructure</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RadioGroup label="CPU only?" options={['Yes', 'No']} field="deployCpuOnly" />
                <RadioGroup label="GPU available?" options={['Yes', 'No']} field="deployGpuAvailable" />
                <RadioGroup label="Containers OK?" options={['Yes', 'No']} field="deployContainersOk" />
              </div>

              <div className="mt-4">
                <Label className="text-foreground font-medium">Max allowed resource usage</Label>
                <Input
                  value={formData.deployMaxResources}
                  onChange={(e) => handleInputChange('deployMaxResources', e.target.value)}
                  placeholder="e.g., 8GB RAM, 4 CPU cores"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-foreground mb-4">Security Requirements</h4>
              
              <RadioGroup
                label="Data allowed to leave environment?"
                options={['Yes', 'No']}
                field="deployDataLeaveEnvironment"
              />

              <div className="mt-4">
                <CheckboxGroup
                  label="Compliance required"
                  options={['GDPR', 'HIPAA', 'ISO']}
                  field="deployCompliance"
                  showOther
                  otherField="deployComplianceOther"
                />
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div className="space-y-6" variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">8. Integration Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CheckboxGroup
                label="Input format"
                options={['JSON', 'Text', 'Audio']}
                field="inputFormat"
                showOther
                otherField="inputFormatOther"
              />
              <CheckboxGroup
                label="Output format"
                options={['JSON', 'Text', 'Audio']}
                field="outputFormat"
                showOther
                otherField="outputFormatOther"
              />
            </div>

            <div>
              <Label className="text-foreground font-medium">Existing pipeline tools/libraries</Label>
              <Input
                value={formData.existingPipelineTools}
                onChange={(e) => handleInputChange('existingPipelineTools', e.target.value)}
                placeholder="e.g., Apache Kafka, Redis..."
                className="mt-2"
              />
            </div>

            <CheckboxGroup
              label="Preferred programming languages"
              options={['Python', 'JavaScript', 'Go', 'Rust', 'Java']}
              field="preferredLanguages"
              showOther
              otherField="preferredLanguagesOther"
            />

            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">9. Success Criteria</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground font-medium">Accuracy threshold</Label>
                  <Input
                    value={formData.successAccuracy}
                    onChange={(e) => handleInputChange('successAccuracy', e.target.value)}
                    placeholder="e.g., >95% WER"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-foreground font-medium">Latency threshold</Label>
                  <Input
                    value={formData.successLatency}
                    onChange={(e) => handleInputChange('successLatency', e.target.value)}
                    placeholder="e.g., <500ms"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-foreground font-medium">Stability / Uptime</Label>
                  <Input
                    value={formData.successUptime}
                    onChange={(e) => handleInputChange('successUptime', e.target.value)}
                    placeholder="e.g., 99.9%"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-foreground font-medium">Cost limit</Label>
                  <Input
                    value={formData.successCostLimit}
                    onChange={(e) => handleInputChange('successCostLimit', e.target.value)}
                    placeholder="e.g., $X per 1000 requests"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">10. Risks / Unknowns / Notes</h3>
              <Textarea
                value={formData.risksNotes}
                onChange={(e) => handleInputChange('risksNotes', e.target.value)}
                placeholder="Any concerns, risks, or additional notes..."
                rows={4}
                className="mt-2"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />

      <main className="pt-24 pb-16">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back to Contact Link */}
          <motion.div variants={itemVariants} className="mb-8">
            <Link 
              to="/contact" 
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contact
            </Link>
          </motion.div>

          <motion.div
            className="text-center mb-12"
            variants={itemVariants}
          >
            <motion.div
              className="mb-8"
              variants={itemVariants}
            >
              <motion.div
                className="w-16 h-0.5 bg-primary mx-auto mb-4"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              ></motion.div>
              <motion.div
                className="w-8 h-0.5 bg-primary/60 mx-auto"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              ></motion.div>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-8 tracking-tight"
              variants={itemVariants}
            >
              Project Inquiry
            </motion.h1>

            <motion.div
              className="w-24 h-0.5 bg-primary mx-auto mb-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            ></motion.div>

            <motion.p
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4 font-light"
              variants={itemVariants}
            >
              Complete this detailed project scoping form to help us understand your voice AI requirements. 
              We'll review your submission and get back to you within 24-48 hours.
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Section Navigation */}
            <motion.div
              className="lg:col-span-1"
              variants={itemVariants}
            >
              <Card className="shadow-gothic border-0 bg-white dark:bg-gray-800 sticky top-24">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-4">Sections</h3>
                  <nav className="space-y-2">
                    {sections.map((section, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSection(index)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          currentSection === index
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <section.icon className="w-4 h-4" />
                        <span>{section.title}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <motion.div
                className="mt-6 space-y-4"
                variants={containerVariants}
              >
                {[
                  {
                    icon: Mail,
                    title: 'Email',
                    content: 'jarbasai@mailfence.com',
                    bgColor: 'bg-primary',
                  },
                  {
                    icon: MapPin,
                    title: 'Office',
                    content: 'Matosinhos, Portugal',
                    bgColor: 'bg-primary',
                  },
                ].map((contact, index) => (
                  <motion.div
                    key={index}
                    variants={contactCardVariants}
                    whileHover="hover"
                    custom={index}
                  >
                    <div className="flex items-start space-x-3">
                      <motion.div
                        className={`w-10 h-10 ${contact.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <contact.icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{contact.title}</h3>
                        <p className="text-sm text-muted-foreground">{contact.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Form */}
            <motion.div
              className="lg:col-span-3"
              variants={itemVariants}
            >
              <Card className="shadow-gothic border-0 bg-white dark:bg-gray-800">
                <CardContent className="p-8">
                  {/* Progress bar */}
                  <div className="mb-8">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Progress</span>
                      <span>{Math.round(((currentSection + 1) / sections.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {renderSection()}

                    <div className="flex justify-between mt-8 pt-6 border-t dark:border-gray-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                        disabled={currentSection === 0}
                      >
                        Previous
                      </Button>

                      {currentSection < sections.length - 1 ? (
                        <Button
                          type="button"
                          onClick={() => setCurrentSection(currentSection + 1)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Next Section
                        </Button>
                      ) : (
                        <motion.div
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 px-8 shadow-gothic"
                          >
                            {isSubmitting ? (
                              <motion.div
                                className="flex items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <motion.div
                                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                ></motion.div>
                                Submitting...
                              </motion.div>
                            ) : (
                              <>
                                <Send className="mr-3 w-5 h-5" />
                                Submit Project Scope
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
      <Footer/>
    </div>
  );
};

export default ProjectInquiry;
