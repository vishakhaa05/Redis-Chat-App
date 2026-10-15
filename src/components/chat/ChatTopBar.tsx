import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Info, X } from "lucide-react";
import { useSelectedUser } from "@/store/useSelectedUser";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const ChatTopBar = () => {
	const { selectedUser, setSelectedUser } = useSelectedUser();
	const [isInfoOpen, setIsInfoOpen] = useState(false);

	return (
		<div className='w-full h-20 flex p-4 justify-between items-center border-b'>
			<div className='flex items-center gap-2'>
				<Avatar className='flex justify-center items-center'>
					<AvatarImage
						src={selectedUser?.image || "/user-placeholder.png"}
						alt='User Image'
						className='w-10 h-10 object-cover rounded-full'
					/>
					<AvatarFallback>{selectedUser?.name?.[0] || selectedUser?.email?.[0] || "?"}</AvatarFallback>
				</Avatar>
				<span className='font-medium'>{selectedUser?.name || selectedUser?.email}</span>
			</div>

			<div className='flex gap-2'>
				<Info
					className='text-muted-foreground cursor-pointer hover:text-primary'
					onClick={() => setIsInfoOpen(true)}
				/>
				<X
					className='text-muted-foreground cursor-pointer hover:text-primary'
					onClick={() => setSelectedUser(null)}
				/>
			</div>

			<Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>User Info</DialogTitle>
						<DialogDescription>Details for {selectedUser?.name}</DialogDescription>
					</DialogHeader>
					<div className='flex flex-col items-center gap-4 py-4'>
						<Avatar className='w-20 h-20'>
							<AvatarImage src={selectedUser?.image || "/user-placeholder.png"} alt='User Image' />
							<AvatarFallback className='text-2xl'>{selectedUser?.name?.[0] || "?"}</AvatarFallback>
						</Avatar>
						<div className='text-center space-y-1'>
							<p className='font-semibold text-lg'>{selectedUser?.name}</p>
							<p className='text-sm text-muted-foreground'>{selectedUser?.email}</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
export default ChatTopBar;
