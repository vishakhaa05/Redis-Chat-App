import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Loader, SendHorizontal, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "./EmojiPicker";
import { Button } from "../ui/button";
import useSound from "use-sound";
import { usePreferences } from "@/store/usePreferences";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageAction } from "@/actions/message.actions";
import { useSelectedUser } from "@/store/useSelectedUser";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { pusherClient } from "@/lib/pusher";
import { Message } from "@/db/dummy";

const ChatBottomBar = () => {
    
	const [message, setMessage] = useState("");
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const [playSound1] = useSound("/sounds/keystroke1.mp3");
	const [playSound2] = useSound("/sounds/keystroke2.mp3");
	const [playSound3] = useSound("/sounds/keystroke3.mp3");
	const [playSound4] = useSound("/sounds/keystroke4.mp3");

	const playSoundFunctions = [playSound1, playSound2, playSound3, playSound4];

    const { soundEnabled } = usePreferences();

	const playRandomKeyStrokeSound = () => {
		const randomIndex = Math.floor(Math.random() * playSoundFunctions.length);
		soundEnabled && playSoundFunctions[randomIndex]();
	};
	const { selectedUser } = useSelectedUser();
	const { user: currentUser } = useKindeBrowserClient();

	const queryClient = useQueryClient();

	const [imgUrl, setImgUrl] = useState("");


	const [playNotificationSound] = useSound("/sounds/notification.mp3");

	const { mutate: sendMessage, isPending } = useMutation({
		mutationFn: sendMessageAction,
		onSuccess: () => {
			if (selectedUser?.id) {
				queryClient.invalidateQueries({ queryKey: ["messages", selectedUser.id] });
			}
		},
	});

	const handleSendMessage = () => {
		if (!message.trim() || !selectedUser?.id) return;

		const currentContent = message.trim();
		const currentTimestamp = Date.now();
		const optimisticMessage: Message = {
			id: currentTimestamp,
			senderId: currentUser?.id || "",
			content: currentContent,
			messageType: "text",
		};

		queryClient.setQueryData(["messages", selectedUser.id], (oldMessages: Message[] | undefined) => {
			return [...(oldMessages || []), optimisticMessage];
		});

		sendMessage({ content: currentContent, messageType: "text", receiverId: selectedUser.id });
		setMessage("");

		textAreaRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}

		if (e.key === "Enter" && e.shiftKey) {
			e.preventDefault();
			setMessage(message + "\n");
		}
	};

	useEffect(() => {
		if (!currentUser?.id || !selectedUser?.id) return;
		const channelName = `${currentUser.id}__${selectedUser.id}`.split("__").sort().join("__");
		const channel = pusherClient?.subscribe(channelName);

		const handleNewMessage = (data: { message: Message }) => {
			queryClient.setQueryData(["messages", selectedUser.id], (oldMessages: Message[] | undefined) => {
				const existing = oldMessages || [];
				const isDuplicate = existing.some(
					(m: any) =>
						(data.message.id && m.id === data.message.id) ||
						(m.senderId === data.message.senderId &&
							m.content === data.message.content &&
							Math.abs((m.timestamp || 0) - ((data.message as any).timestamp || 0)) < 1000)
				);
				if (isDuplicate) return existing;
				return [...existing, data.message];
			});

			if (soundEnabled && data.message.senderId !== currentUser.id) {
				playNotificationSound();
			}
		};

		channel?.bind("newMessage", handleNewMessage);

		return () => {
			channel?.unbind("newMessage", handleNewMessage);
			pusherClient?.unsubscribe(channelName);
		};
	}, [currentUser?.id, selectedUser?.id, queryClient, playNotificationSound, soundEnabled]);

	return (
		<div className='p-3 flex justify-between w-full items-center gap-2 border-t bg-background'>
			{!message.trim() && (
				<CldUploadWidget
					signatureEndpoint={"/api/sign-cloudinary-params"}
					onSuccess={(result, { widget }) => {
						setImgUrl((result.info as CloudinaryUploadWidgetInfo).secure_url);
						widget.close();
					}}
				>
					{({ open }) => {
						return (
							<Button
								variant='ghost'
								size='icon'
								type='button'
								onClick={() => open()}
								className='h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground'
							>
								<ImageIcon size={20} />
							</Button>
						);
					}}
				</CldUploadWidget>
			)}
			<Dialog open={!!imgUrl} onOpenChange={(open) => { if (!open) setImgUrl(""); }}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Image Preview</DialogTitle>
					</DialogHeader>
					<div className='flex justify-center items-center relative h-96 w-full mx-auto'>
						{imgUrl ? (
							<Image src={imgUrl} alt='Image Preview' fill className='object-contain' />
						) : null}
					</div>

					<DialogFooter>
						<Button
							type='submit'
							onClick={() => {
								if (selectedUser?.id && imgUrl) {
									const currentImg = imgUrl;
									const currentTimestamp = Date.now();
									const optimisticMessage: Message = {
										id: currentTimestamp,
										senderId: currentUser?.id || "",
										content: currentImg,
										messageType: "image",
									};

									queryClient.setQueryData(["messages", selectedUser.id], (oldMessages: Message[] | undefined) => {
										return [...(oldMessages || []), optimisticMessage];
									});

									sendMessage({ content: currentImg, messageType: "image", receiverId: selectedUser.id });
									setImgUrl("");
								}
							}}
						>
							Send
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AnimatePresence>
				<motion.div
					key='chat-input-wrapper'
					layout
					initial={{ opacity: 0, scale: 1 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 1 }}
					transition={{
						opacity: { duration: 0.2 },
						layout: {
							type: "spring",
							bounce: 0.15,
						},
					}}
					className='w-full relative flex items-center'
				>
					<Textarea
						autoComplete='off'
						placeholder='Aa'
						rows={1}
						className='w-full border rounded-full flex items-center h-9 min-h-[36px] max-h-24 resize-none overflow-hidden bg-background pl-4 pr-10 py-1.5 text-sm leading-normal focus-visible:ring-1'
						value={message}
						onKeyDown={handleKeyDown}
						onChange={(e) => {
							setMessage(e.target.value);
							playRandomKeyStrokeSound();
						}}
						ref={textAreaRef}
					/>
					<div className='absolute right-2 flex items-center'>
						<EmojiPicker
							onChange={(emoji) => {
								setMessage((prev) => prev + emoji);
								if (textAreaRef.current) {
									textAreaRef.current.focus();
								} 
							}}
						/>
					</div>
				</motion.div>

				{message.trim() ? (
					<Button
						key='send-button'
						className='h-9 w-9 shrink-0'
						variant={"ghost"}
						size={"icon"}
						onClick={handleSendMessage}
					>
						<SendHorizontal size={20} className='text-muted-foreground hover:text-foreground' />
					</Button>
				) : (
					<Button
						key='thumbs-up-button'
						className='h-9 w-9 shrink-0'
						variant={"ghost"}
						size={"icon"}
						disabled={isPending}
						onClick={() => {
							if (selectedUser?.id) {
								const currentTimestamp = Date.now();
								const optimisticMessage: Message = {
									id: currentTimestamp,
									senderId: currentUser?.id || "",
									content: "👍",
									messageType: "text",
								};

								queryClient.setQueryData(["messages", selectedUser.id], (oldMessages: Message[] | undefined) => {
									return [...(oldMessages || []), optimisticMessage];
								});

								sendMessage({ content: "👍", messageType: "text", receiverId: selectedUser.id });
							}
						}}
					>
						{!isPending && <ThumbsUp size={20} className='text-muted-foreground hover:text-foreground' />}
						{isPending && <Loader size={20} className='animate-spin' />}
					</Button>
				)}
			</AnimatePresence>
		</div>
	);
};
export default ChatBottomBar;
