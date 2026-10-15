import { useEffect } from "react";
import ChatBottomBar from "./ChatBottomBar";
import ChatTopBar from "./ChatTopBar";
import MessageList from "./MessageList";
import { useSelectedUser } from "@/store/useSelectedUser";

const MessageContainer = () => {
	const { setSelectedUser } = useSelectedUser();

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSelectedUser(null);
		};

		document.addEventListener("keydown", handleEscape);

		return () => document.removeEventListener("keydown", handleEscape);
	}, [setSelectedUser]);

	return (
		<div className='flex flex-col justify-between w-full h-full'>
			<ChatTopBar />

			<div className='w-full flex-1 min-h-0 overflow-hidden flex flex-col'>
				<MessageList />
			</div>

			<ChatBottomBar />
		</div>
	);
};
export default MessageContainer;
