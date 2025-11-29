import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { ChatSession, Message, Settings, Persona } from "../types";
import { Icon } from "./Icon";
import { WelcomeView } from "./WelcomeView";
import { MessageBubble } from "./MessageBubble";
import { ChatInput, ChatInputRef } from "./chat/ChatInput";
import { SuggestedReplies } from "./SuggestedReplies";
import { useLocalization } from "../contexts/LocalizationContext";
import { InternalView } from "./common/InternalView";
import { ChatHeader } from "./chat/ChatHeader";

interface ChatViewProps {
  chatSession: ChatSession | null;
  personas: Persona[];
  onSendMessage: (text: string, files: File[], toolConfig: any) => void;
  isLoading: boolean;
  settings: Settings;
  onCancelGeneration: () => void;
  onSetModelForActiveChat: (m: string) => void;
  currentModel: string;
  onSetCurrentModel: (m: string) => void;
  availableModels: string[];
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;
  onNewChat: () => void;
  onImageClick: (src: string) => void;
  suggestedReplies: string[];
  onDeleteMessage: (id: string) => void;
  onUpdateMessageContent: (id: string, text: string) => void;
  onRegenerate: () => void;
  onEditAndResubmit: (id: string, text: string) => void;
  onShowCitations: (chunks: any[]) => void;
  onToggleStudyMode: (chatId: string, enabled: boolean) => void;
  isNextChatStudyMode: boolean;
  onToggleNextChatStudyMode: (enabled: boolean) => void;
}

export const ChatView: React.FC<ChatViewProps> = (props) => {
  const { t } = useLocalization();

  const chatInputRef = useRef<ChatInputRef | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // ---- Scroll to bottom ----
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [props.chatSession?.id, props.chatSession?.messages.length]);

  // ---- Drag & drop handlers ----
  const dragCounter = useRef(0);

  const handleDragEnter = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer?.types?.includes("Files")) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDraggingOver(false);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files?.length) {
      chatInputRef.current?.addFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const activePersona =
    props.chatSession?.personaId &&
    props.personas.find((p) => p.id === props.chatSession?.personaId);

  // ---- Send messages ----
  const handleSendMessage = (text: string, files: File[], tool: any) => {
    props.onSendMessage(text, files, tool);
  };

  const handleSendSuggestion = (text: string) => {
    if (!props.isLoading) {
      handleSendMessage(text, [], {});
    }
  };

  // ---- Save edited message ----
  const handleSaveEdit = (msg: Message, newText: string) => {
    if (msg.role === "user") {
      props.onEditAndResubmit(msg.id, newText);
    } else {
      props.onUpdateMessageContent(msg.id, newText);
    }
  };

  return (
    <main
      className="glass-pane rounded-[var(--radius-2xl)] flex flex-col h-full overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={handleDrop}
    >
      {/* Dropzone overlay */}
      <div className={`dropzone-overlay ${isDraggingOver ? "visible" : ""}`}>
        <div className="dropzone-overlay-content">
          <Icon icon="upload" className="w-20 h-20" />
          <h3 className="text-2xl font-bold">Drop files here</h3>
        </div>
      </div>

      {/* Header */}
      <ChatHeader
        chatSession={props.chatSession}
        onNewChat={props.onNewChat}
        availableModels={props.availableModels}
        onSetModelForActiveChat={props.onSetModelForActiveChat}
        currentModel={props.currentModel}
        isSidebarCollapsed={props.isSidebarCollapsed}
        onToggleSidebar={props.onToggleSidebar}
        onToggleMobileSidebar={props.onToggleMobileSidebar}
      />

      {/* MESSAGE AREA */}
      <div className="flex-grow flex flex-col relative min-h-0">
        {/* If chat exists */}
        <InternalView active={!!props.chatSession}>
          <div className="flex-grow overflow-y-auto p-4">
            {(props.chatSession?.messages || []).map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                index={index}
                persona={activePersona}
                settings={props.settings}
                isLastMessageLoading={
                  props.isLoading &&
                  index === props.chatSession!.messages.length - 1
                }
                isEditing={editingMessageId === msg.id}
                onEditRequest={() => setEditingMessageId(msg.id)}
                onCancelEdit={() => setEditingMessageId(null)}
                onSaveEdit={handleSaveEdit}
                onDelete={props.onDeleteMessage}
                onRegenerate={props.onRegenerate}
                onCopy={(c) => navigator.clipboard.writeText(c)}
                onImageClick={props.onImageClick}
                onShowCitations={props.onShowCitations}
              />
            ))}

            <div ref={messagesEndRef} />
          </div>
        </InternalView>

        {/* If no chat yet */}
        <InternalView active={!props.chatSession}>
          <WelcomeView
            currentModel={props.currentModel}
            onSetCurrentModel={props.onSetCurrentModel}
            availableModels={props.availableModels}
          />
        </InternalView>
      </div>

      {/* Suggested replies */}
      {!props.isLoading &&
        props.suggestedReplies.length > 0 &&
        !editingMessageId && (
          <SuggestedReplies
            suggestions={props.suggestedReplies}
            onSendSuggestion={handleSendSuggestion}
          />
        )}

      {/* Chat Input */}
      <ChatInput
        ref={chatInputRef}
        onSendMessage={handleSendMessage}
        isLoading={props.isLoading}
        onCancel={props.onCancelGeneration}
        chatSession={props.chatSession}
        toolConfig={{}}
        onToolConfigChange={() => {}}
        onToggleStudyMode={props.onToggleStudyMode}
        isNextChatStudyMode={props.isNextChatStudyMode}
      />
    </main>
  );
};
