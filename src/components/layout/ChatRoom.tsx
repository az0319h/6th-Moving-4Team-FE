"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import {
   setTypingStatus,
   markMessagesAsRead,
   getChatRoomParticipants,
   sendMessageWithWithdrawCheck,
   checkIfOtherUserWithdrawn,
} from "@/lib/firebase/firebaseChat";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import {
   useChatMessages,
   useTypingStatus,
   useLeaveChatRoom,
} from "@/lib/firebase/query";
import profileIcon from "@/assets/images/profileIcon.svg";
import { setCurrentChatId } from "@/lib/utils";
import { IoIosSend } from "react-icons/io";
import { FiLogOut } from "react-icons/fi";
import { useOutsideClick } from "@/lib/hooks/useOutsideClick";
import { ChatMessage, ChatParticipant, ParticipantsMap } from "@/lib/types";
import MessageText from "../common/MessageText";

dayjs.locale("ko");

export default function ChatRoom() {
   const { chatId, setChatId, isInRoom, setIsInRoom } = useChat();
   const { user } = useAuth();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const dropdownRef = useRef(null);
   const [input, setInput] = useState("");
   const [participants, setParticipants] = useState<ParticipantsMap>({});
   const [isOtherWithdrawn, setIsOtherWithdrawn] = useState(false);
   const [sendError, setSendError] = useState<string>("");
   const bottomRef = useRef<HTMLDivElement>(null);
   const textareaRef = useRef<HTMLTextAreaElement>(null);
   const wasTypingRef = useRef(false);

   //맥으로 보낸 경우 딜레이 해결
   const [isComposing, setIsComposing] = useState(false);

   const handleCompositionStart = () => {
      setIsComposing(true);
   };

   const handleCompositionEnd = () => {
      setIsComposing(false);
   };
   // 맥으로 보낸 경우 딜레이 해결 종료

   const { data: messages = [] } = useChatMessages(chatId, user?.id ?? "");
   const { mutate: leaveChatRoomMutate } = useLeaveChatRoom();

   const otherUserId =
      Object.keys(participants).find((id) => id !== user?.id) ?? "";
   const isOtherTyping = useTypingStatus(chatId, otherUserId);

   const otherUserName =
      (participants as Record<string, ChatParticipant>)[otherUserId]
         ?.userName ?? "상대방";

   // 참가자 정보 가져오기
   useEffect(() => {
      if (chatId) {
         getChatRoomParticipants(chatId).then(setParticipants);
      }
   }, [chatId]);

   // 상대방 탈퇴 상태 확인
   useEffect(() => {
      if (chatId && user?.id) {
         checkIfOtherUserWithdrawn(chatId, user.id).then(setIsOtherWithdrawn);
      }
   }, [chatId, user?.id, participants]);

   const updateTypingStatus = useCallback(
      (isTyping: boolean) => {
         if (chatId && user?.id && !isOtherWithdrawn) {
            setTypingStatus(chatId, user.id, isTyping);
         }
      },
      [chatId, user?.id, isOtherWithdrawn],
   );

   // Auto resize textarea
   const adjustTextareaHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
         textarea.style.height = "auto";
         textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
      }
   };

   useEffect(() => {
      adjustTextareaHeight();
   }, [input]);

   useEffect(() => {
      if (!input.trim() || isOtherWithdrawn) {
         updateTypingStatus(false);
         return;
      }

      updateTypingStatus(true);
      const timeout = setTimeout(() => {
         updateTypingStatus(false);
      }, 2000);

      return () => clearTimeout(timeout);
   }, [input, updateTypingStatus, isOtherWithdrawn]);

   useEffect(() => {
      if (chatId && user?.id && messages.length > 0 && isInRoom) {
         const unreadMessages = messages.filter(
            (msg) => msg.senderId !== user.id && !msg.isRead,
         );

         if (unreadMessages.length > 0) {
            console.log("읽음 처리 실행:", unreadMessages.length, "개 메시지");
            markMessagesAsRead(chatId, user.id);
         }
      }
   }, [chatId, user?.id, messages, isInRoom]);

   useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);

   // 타이핑 인디케이터가 등장할 때만 하단으로 스크롤
   useEffect(() => {
      if (isOtherTyping && !wasTypingRef.current) {
         requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
         });
      }
      wasTypingRef.current = isOtherTyping;
   }, [isOtherTyping]);

   useEffect(() => {
      console.log("채팅방 입장");
      setIsInRoom(true);

      // ✅ 현재 채팅방 ID 설정 (알림음 방지용)
      if (chatId) {
         setCurrentChatId(chatId);
      }

      return () => {
         console.log("채팅방 퇴장");
         setIsInRoom(false);
         updateTypingStatus(false);

         setCurrentChatId("NOT_IN_CHAT");
      };
   }, [chatId, setIsInRoom, updateTypingStatus]);

   // 카카오톡처럼 즉시 반응하는 메시지 전송 함수
   const handleSend = async () => {
      if (!input.trim() || !chatId || !user?.id) return;

      const messageText = input.trim();

      // 즉시 입력창 비우기 (카카오톡처럼)
      setInput("");
      setSendError("");
      updateTypingStatus(false);

      try {
         const result = await sendMessageWithWithdrawCheck(
            chatId,
            user.id,
            messageText,
         );

         if (result.success) {
            console.log("메시지 전송 성공");
         } else {
            setSendError(result.error || "메시지 전송에 실패했습니다.");

            if (result.error?.includes("탈퇴한 사용자")) {
               setIsOtherWithdrawn(true);
            }
         }
      } catch (error) {
         console.error("메시지 전송 오류:", error);
         setSendError("메시지 전송에 실패했습니다.");
      }
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isComposing) {
         e.preventDefault();
         handleSend();
      }
   };

   const handleLeaveChatRoom = () => {
      if (chatId && user?.id) {
         leaveChatRoomMutate({ chatId, userId: user.id });
         setChatId("");
      }
   };

   const getProfileImage = (userId: string) => {
      const participant = participants[userId];
      if (
         participant?.profileImage &&
         participant.profileImage !== "undefined"
      ) {
         return participant.profileImage;
      }
      return profileIcon.src;
   };

   // 시스템 메시지 렌더링 함수
   const renderMessage = (msg: ChatMessage) => {
      const isMine = msg.senderId === user?.id;
      const isSystemMessage = msg.messageType === "SYSTEM_WITHDRAW";

      if (isSystemMessage) {
         return (
            <div key={msg.id} className="my-4 flex justify-center">
               <div className="text-14-regular rounded-lg bg-gray-200 px-4 py-2 text-gray-600">
                  {msg.text}
               </div>
            </div>
         );
      }

      return (
         <div
            key={msg.id}
            className={`flex ${isMine ? "flex-row-reverse" : "flex-row"} max-w-full items-end space-x-2`}
         >
            {!isMine && (
               <div className="flex-shrink-0">
                  <img
                     src={getProfileImage(msg.senderId)}
                     alt="프로필"
                     className="h-8 w-8 rounded-full object-cover"
                     onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = profileIcon.src;
                     }}
                  />
               </div>
            )}

            <div
               className={`flex flex-col ${isMine ? "items-end" : "items-start"} min-w-0 flex-1`}
            >
               <div
                  className={`overflow-wrap-anywhere text-14-regular relative max-w-[80%] rounded-xl px-3 py-2 break-words ${
                     isMine
                        ? "bg-primary-blue-300 text-white"
                        : "bg-gray-1000 text-gray-400"
                  }`}
                  style={{ wordBreak: "break-all" }}
               >
                  <MessageText text={msg.text} />
               </div>

               <div
                  className={`mt-1 flex items-center space-x-1 ${isMine ? "flex-row-reverse space-x-reverse" : ""}`}
               >
                  <span className="text-[0.625rem] text-gray-400">
                     {dayjs(msg.createdAt).format("A h:mm")}
                  </span>

                  {isMine && msg.isRead && (
                     <span className="text-primary-blue-300 text-[0.625rem]">
                        읽음
                     </span>
                  )}
               </div>
            </div>

            {isMine && <div className="w-8 flex-shrink-0" />}
         </div>
      );
   };

   // 커스텀 훅으로 외부 클릭 감지
   useOutsideClick(dropdownRef, () => {
      if (isDropdownOpen) {
         setIsDropdownOpen(false);
      }
   });

   if (!chatId) return null;

   return (
      <div className="flex h-full max-w-full flex-col overflow-hidden px-4 pt-4">
         {/* 상단 헤더 */}
         <div className="relative mb-4 flex items-center justify-between">
            <button
               onClick={() => {
                  setChatId("");
               }}
               className="text-sm text-gray-500 hover:underline"
            >
               BACK
            </button>
            <div className="text-16-medium text-gray-400">
               <span className="!text-primary-blue-200">{otherUserName}</span>
               님과의 대화방
            </div>

            {/* 채팅방 나가기 드롭다운 */}
            <div className="relative" ref={dropdownRef}>
               <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex text-gray-500"
               >
                  <FiLogOut size={24} />
               </button>

               {isDropdownOpen && (
                  <div className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                     <div className="border-b border-gray-100 p-3">
                        <p className="text-12-regular leading-relaxed text-gray-500">
                           채팅방을 나가면 대화 내용이
                           <br />
                           모두 삭제됩니다
                        </p>
                     </div>
                     <div className="p-3">
                        <button
                           onClick={handleLeaveChatRoom}
                           className="text-14-regular hover:bg-hover-100 w-full rounded-md py-1 font-medium text-red-600 transition-colors duration-200"
                        >
                           나가기
                        </button>
                        <button
                           onClick={() => setIsDropdownOpen(false)}
                           className="text-14-regular hover:bg-hover-100 mt-1 w-full rounded-md py-1 text-gray-500 transition-colors duration-200"
                        >
                           취소
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* 탈퇴한 사용자와의 채팅 안내 */}
         {isOtherWithdrawn && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
               <div className="flex items-center">
                  <svg
                     className="mr-2 h-5 w-5 text-yellow-400"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                     />
                  </svg>
                  <span className="text-14-regular text-yellow-800">
                     상대방이 서비스를 탈퇴하여 더 이상 메시지를 보낼 수
                     없습니다.
                  </span>
               </div>
            </div>
         )}

         {/* 채팅 목록 */}
         <div className="scrollbar-hide flex-1 space-y-4 overflow-x-hidden overflow-y-auto pb-2">
            {messages.map(renderMessage)}

            {/* 상대방 입력중 (탈퇴하지 않은 경우만) */}
            {isOtherTyping && !isOtherWithdrawn && (
               <div className="flex items-center space-x-2">
                  <img
                     src={getProfileImage(otherUserId)}
                     alt="프로필"
                     className="h-8 w-8 rounded-full object-cover"
                     onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = profileIcon.src;
                     }}
                  />
                  <div className="bg-gray-1000 rounded-xl px-3 py-2">
                     <div className="flex space-x-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                     </div>
                  </div>
               </div>
            )}

            <div ref={bottomRef} />
         </div>

         {/* 에러 메시지 */}
         {sendError && (
            <div className="text-14-regular mb-2 rounded border border-red-200 bg-red-50 p-2 text-red-500">
               {sendError}
            </div>
         )}

         {/* 입력창 */}
         <div className="mt-3 flex gap-2">
            <textarea
               ref={textareaRef}
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onCompositionStart={handleCompositionStart}
               onCompositionEnd={handleCompositionEnd}
               onKeyDown={handleKeyDown}
               rows={1}
               placeholder={
                  isOtherWithdrawn
                     ? "메시지를 보낼 수 없습니다"
                     : "메시지를 입력하세요"
               }
               disabled={isOtherWithdrawn}
               className={`scrollbar-hide bg-gray-1000 flex-1 resize-none overflow-hidden rounded-md px-3 py-2 text-sm leading-5 ${isOtherWithdrawn ? "cursor-not-allowed bg-gray-100 text-gray-400" : ""}`}
            />
            <button
               onClick={handleSend}
               disabled={isOtherWithdrawn || !input.trim()}
               className={`text-14-regular rounded-md px-4 py-2 text-white ${
                  isOtherWithdrawn || !input.trim()
                     ? "cursor-not-allowed bg-gray-400"
                     : "bg-primary-blue-300 hover:bg-primary-blue-500"
               }`}
            >
               <IoIosSend size={20} />
            </button>
         </div>
      </div>
   );
}
