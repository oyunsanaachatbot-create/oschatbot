// components/ChatView.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { ChatSession, Message, Settings, Persona } from '../types';
import { Icon } from './Icon';
import { WelcomeView } from './WelcomeView';
import { MessageBubble } from './MessageBubble';
import { ChatInput, ChatInputRef } from './chat/ChatInput';
import { SuggestedReplies } from './SuggestedReplies';
import { useLocalization } from '../contexts/LocalizationContext';
import { InternalView } from './common/InternalView';
import { ChatHeader } from './chat/ChatHeader';

interface ChatViewProps {
  chatSession: ChatSession | null;
  personas: Persona[];

  onSendMessage: (message: string, files: File[], toolConfig: any) => void;
  isLoading: boolean;
  settings: Settings;
  onCancelGeneration: () => void;

  onSetModelForActiveChat: (model: string) => void;
  currentModel: string;
  onSetCurrentModel: (model: string) => void;
  availableModels: string[];

  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;

  onNewChat: () => void;
  onImageClick: (src: string) => void;

  suggestedReplies: string[];

  onDeleteMessage: (id: string) => void;
  onUpdateMessageContent: (id: string, newContent: string) => void;
  onRegenerate: () => void;
  onEditAndResubmit: (id: string, newContent: string) => void;
  onShowCitations: (chunks: any[]) => void;

  // Study mode
  onToggleStudyMode: (chatId: string, enabled: boolean) => void;
  isNextChatStudyMode: boolean;
  onToggleNextChatStudyMode: (enabled: boolean) => void;
}

export const ChatView: React.FC<ChatViewProps> = (props) => {
  const { t } = useLocalization();

  const {
    chatSession,
    personas,
    onSendMessage,
    isLoading,
    settings,
    onCancelGeneration,
    onNewChat,
  } = props;

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const chatInputRef = useRef<ChatInputRef | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounter = useRef(0);
  const prevChatIdRef = useRef<string | null | undefined>(undefined);

  const activePersona: Persona | undefined =
    chatSession?.personaId
      ? personas.find((p) => p.id === chatSession.personaId)
      : undefined;

  const getDefaultToolConfig = useCallback(
    () => ({
      codeExecution: false,
      googleSearch: settings.defaultSearch,
      urlContext: false,
    }),
    [settings.defaultSearch]
  );

  const [toolConfig, setToolConfig] = useState(getDefaultToolConfig);

  // Chat солигдоход toolConfig, edit state-ийг reset хийнэ
  useEffect(() => {
    if (chatSession?.id !== prevChatIdRef.current) {
      setToolConfig(getDefaultToolConfig());
      setEditingMessageId(null);
    }
    prevChatIdRef.current = chatSession?.id;
  }, [chatSession, getDefaultToolConfig]);

  // Доош автоматаар scroll
  useEffect(() => {
    if (!chatSession) return;
    if (isLoading || editingMessageId) return;

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [
    chatSession?.id,
    chatSession?.messages.length,
    isLoading,
    editingMessageId,
  ]);

  // ---- Study mode toggle ----
  const handleToggleStudyMode = (enabled: boolean) => {
    if (chatSession) {
      props.onToggleStudyMode(chatSession.id, enabled);
    } else {
      props.onToggleNextChatStudyMode(enabled);
    }
  };

  // ---- Drag & drop ----
  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;

    if (
      e.dataTransfer.types &&
      Array.from(e.dataTransfer.types).includes('Files')
    ) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;

    if (dragCounter.current === 0) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files?.length) {
      chatInputRef.current?.addFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  // ---- Send / suggestion ----
  const handleSendMessageWithTools = (
    message: string,
    files: File[] = [],
    config: any = toolConfig
  ) => {
    if (!message.trim() && files.length === 0) return;
    onSendMessage(message, files, config);
  };

  const handleSendSuggestion = (suggestion: string) => {
    if (isLoading) return;
    handleSendMessageWithTools(suggestion, [], toolConfig);
  };

  const handleSaveEdit = (message: Message, newContent: string) => {
    if (message.role === 'user') {
      props.onEditAndResubmit(message.id, newContent);
    } else {
      props.onUpdateMessageContent(message.id, newContent);
    }
  };

  return (
    <main
      className="glass-pane rounded-[var(--radius-2xl)] flex flex-col h-full overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={handleDrop}
    >
      {/* Dropzone overlay */}
      <div className={`dropzone-overlay ${isDraggingOver ? 'visible' : ''}`}>
        <div className="dropzone-overlay-content">
          <Icon icon="upload" className="w-20 h-20" />
          <h3 className="text-2xl font-bold">Drop files here to upload</h3>
        </div>
      </div>

      {/* Chat header */}
      <ChatHeader
        chatSession={chatSession}
        onNewChat={onNewChat}
        availableModels={props.availableModels}
        onSetModelForActiveChat={props.onSetModelForActiveChat}
        currentModel={props.currentModel}
        isSidebarCollapsed={props.isSidebarCollapsed}
        onToggleSidebar={props.onToggleSidebar}
        onToggleMobileSidebar={props.onToggleMobileSidebar}
      />

      {/* Messages / Welcome */}
      <div className="flex-grow flex flex-col relative min-h-0">
        {/* Chat байгаа үед */}
        <InternalView active={!!chatSession}>
          <div className="flex-grow overflow-y-auto p-4">
            {(chatSession?.messages || []).map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                index={index}
                onImageClick={props.onImageClick}
                settings={settings}
                persona={activePersona}
                isLastMessageLoading={
                  isLoading &&
                  !!chatSession &&
                  index === chatSession.messages.length - 1
                }
                isEditing={editingMessageId === msg.id}
                onEditRequest={() => setEditingMessageId(msg.id)}
                onCancelEdit={() => setEditingMessageId(null)}
                onSaveEdit={handleSaveEdit}
                onDelete={props.onDeleteMessage}
                onRegenerate={props.onRegenerate}
                onCopy={(c) => navigator.clipboard.writeText(c)}
                onShowCitations={props.onShowCitations}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </InternalView>

        {/* Анхны дэлгэц */}
        <InternalView active={!chatSession}>
          <WelcomeView
            currentModel={props.currentModel}
            onSetCurrentModel={props.onSetCurrentModel}
            availableModels={props.availableModels}
          />
        </InternalView>
      </div>

      {/* Suggested replies */}
      {!isLoading &&
        props.suggestedReplies.length > 0 &&
        !editingMessageId && (
          <SuggestedReplies
            suggestions={props.suggestedReplies}
            onSendSuggestion={handleSendSuggestion}
          />
        )}

      {/* Input – state-ийг ChatInput өөрөө удирдана */}
      <ChatInput
        ref={chatInputRef}
        onSendMessage={handleSendMessageWithTools}
        isLoading={isLoading}
        onCancel={onCancelGeneration}
        toolConfig={toolConfig}
        onToolConfigChange={setToolConfig}
        chatSession={chatSession}
        onToggleStudyMode={handleToggleStudyMode}
        isNextChatStudyMode={props.isNextChatStudyMode}
      />
    </main>
  );
};
