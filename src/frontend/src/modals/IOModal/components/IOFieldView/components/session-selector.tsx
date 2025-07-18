import type React from "react";
import { useEffect, useRef, useState } from "react";
import { v5 as uuidv5 } from "uuid";
import IconComponent from "@/components/common/genericIconComponent";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select-custom";
import { useUpdateSessionName } from "@/controllers/API/queries/messages/use-rename-session";
import useFlowStore from "@/stores/flowStore";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { useUtilityStore } from "@/stores/utilityStore";
import { useVoiceStore } from "@/stores/voiceStore";
import { cn } from "@/utils/utils";

export default function SessionSelector({
  deleteSession,
  session,
  toggleVisibility,
  isVisible,
  inspectSession,
  updateVisibleSession,
  selectedView,
  setSelectedView,
  playgroundPage,
  setActiveSession,
}: {
  deleteSession: (session: string) => void;
  session: string;
  toggleVisibility: () => void;
  isVisible: boolean;
  inspectSession: (session: string) => void;
  updateVisibleSession: (session: string) => void;
  selectedView?: { type: string; id: string };
  setSelectedView: (view: { type: string; id: string } | undefined) => void;
  playgroundPage: boolean;
  setActiveSession: (session: string) => void;
}) {
  const clientId = useUtilityStore((state) => state.clientId);
  const realFlowId = useFlowsManagerStore((state) => state.currentFlowId);
  const currentFlowId = playgroundPage
    ? uuidv5(`${clientId}_${realFlowId}`, uuidv5.DNS)
    : realFlowId;
  const [isEditing, setIsEditing] = useState(false);
  const [editedSession, setEditedSession] = useState(session);
  const { mutate: updateSessionName } = useUpdateSessionName();
  const inputRef = useRef<HTMLInputElement>(null);
  const _setNewChatOnPlayground = useFlowStore(
    (state) => state.setNewChatOnPlayground,
  );

  useEffect(() => {
    setEditedSession(session);
  }, [session]);

  const handleEditClick = (e?: React.MouseEvent<HTMLDivElement>) => {
    e?.stopPropagation();
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedSession(e.target.value);
  };

  const handleConfirm = () => {
    setIsEditing(false);
    if (editedSession.trim() !== session) {
      updateSessionName(
        { old_session_id: session, new_session_id: editedSession.trim() },
        {
          onSuccess: () => {
            if (isVisible) {
              updateVisibleSession(editedSession.trim());
            }
            if (
              selectedView?.type === "Session" &&
              selectedView?.id === session
            ) {
              setSelectedView({ type: "Session", id: editedSession.trim() });
            }
          },
        },
      );
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedSession(session);
  };

  const handleSelectChange = (value: string) => {
    switch (value) {
      case "rename":
        handleEditClick();
        break;
      case "messageLogs":
        inspectSession(session);
        break;
      case "delete":
        deleteSession(session);
        break;
    }
  };

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      !e.relatedTarget ||
      e.relatedTarget.getAttribute("data-confirm") !== "true"
    ) {
      handleCancel();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleConfirm();
    }
  };

  const setNewSessionCloseVoiceAssistant = useVoiceStore(
    (state) => state.setNewSessionCloseVoiceAssistant,
  );

  return (
    <div
      data-testid="session-selector"
      onClick={(e) => {
        setNewSessionCloseVoiceAssistant(true);
        if (isEditing) e.stopPropagation();
        else toggleVisibility();
      }}
      className={cn(
        "file-component-accordion-div group cursor-pointer rounded-md text-left text-mmd hover:bg-secondary-hover",
        isVisible ? "bg-secondary-hover font-semibold" : "font-normal",
      )}
    >
      <div className="flex w-full items-center justify-between overflow-hidden px-2 py-1 align-middle">
        <div className="flex w-full min-w-0 items-center">
          {isEditing ? (
            <div className="flex items-center">
              <Input
                ref={inputRef}
                value={editedSession}
                onKeyDown={onKeyDown}
                onChange={handleInputChange}
                onBlur={handleOnBlur}
                autoFocus
                className="h-6 flex-grow px-1 py-0"
              />
              <button
                onClick={handleCancel}
                className="hover:text-status-red-hover ml-2 text-status-red"
              >
                <IconComponent name="X" className="h-4 w-4" />
              </button>
              <button
                onClick={handleConfirm}
                data-confirm="true"
                className="ml-2 text-green-500 hover:text-green-600"
              >
                <IconComponent name="Check" className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <ShadTooltip styleClasses="z-50" content={session}>
              <div className="relative w-full overflow-hidden">
                <span className="w-full truncate">
                  {session === currentFlowId ? "Default Session" : session}
                </span>
                <div
                  className={cn(
                    "pointer-events-none absolute left-0 right-0 top-0 h-full whitespace-nowrap",
                  )}
                >
                  <div
                    className={cn(
                      "h-full w-full group-hover:truncate-secondary-hover",
                      isVisible
                        ? "truncate-secondary-hover"
                        : "truncate-muted dark:truncate-canvas",
                    )}
                  ></div>
                </div>
              </div>
            </ShadTooltip>
          )}
        </div>
        <Select value={""} onValueChange={handleSelectChange}>
          <ShadTooltip styleClasses="z-50" side="right" content="Options">
            <SelectTrigger
              onClick={(e) => {
                e.stopPropagation();
              }}
              onFocusCapture={() => {
                inputRef.current?.focus();
              }}
              data-confirm="true"
              className={cn(
                "h-8 w-fit border-none bg-transparent p-2 focus:ring-0",
                isVisible ? "visible" : "invisible group-hover:visible",
              )}
            >
              <IconComponent name="MoreHorizontal" className="h-4 w-4" />
            </SelectTrigger>
          </ShadTooltip>
          <SelectContent side="right" align="start" className="p-0">
            <SelectItem
              value="rename"
              className="cursor-pointer px-3 py-2 focus:bg-muted"
            >
              <div className="flex items-center">
                <IconComponent name="SquarePen" className="mr-2 h-4 w-4" />
                Rename
              </div>
            </SelectItem>
            <SelectItem
              value="messageLogs"
              className="cursor-pointer px-3 py-2 focus:bg-muted"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <IconComponent name="Scroll" className="mr-2 h-4 w-4" />
                  Message logs
                </div>
              </div>
            </SelectItem>
            <SelectItem
              value="delete"
              className="cursor-pointer px-3 py-2 focus:bg-muted"
            >
              <div className="flex items-center text-status-red hover:text-status-red">
                <IconComponent name="Trash2" className="mr-2 h-4 w-4" />
                Delete
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
