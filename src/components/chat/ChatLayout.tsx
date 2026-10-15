"use client";
import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { usePanelRef } from "react-resizable-panels";
import { cn } from "@/lib/utils";
import Sidebar from "../Sidebar";
import MessageContainer from "./MessageContainer";
import { User } from "@/db/dummy";
import { useSelectedUser } from "@/store/useSelectedUser";

interface ChatLayoutProps {
	defaultLayout: number[] | undefined;
	defaultCollapsed?: boolean;
	users: User[];
}
const ChatLayout = ({ defaultLayout, defaultCollapsed = false, users }: ChatLayoutProps) => {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
	const [isMobile, setIsMobile] = useState(false);
	const { selectedUser } = useSelectedUser();
	const sidebarPanelRef = usePanelRef();

	const handleToggleCollapse = () => {
		if (sidebarPanelRef.current) {
			if (isCollapsed || sidebarPanelRef.current.isCollapsed()) {
				sidebarPanelRef.current.expand();
				setIsCollapsed(false);
				document.cookie = `react-resizable-panels:collapsed=false; path=/;`;
			} else {
				sidebarPanelRef.current.collapse();
				setIsCollapsed(true);
				document.cookie = `react-resizable-panels:collapsed=true; path=/;`;
			}
		} else {
			const next = !isCollapsed;
			setIsCollapsed(next);
			document.cookie = `react-resizable-panels:collapsed=${next}; path=/;`;
		}
	};

	useEffect(() => {
		const checkScreenWidth = () => {
			const mobile = window.innerWidth <= 768;
			setIsMobile(mobile);
			if (mobile) {
				setIsCollapsed(true);
				if (sidebarPanelRef.current) {
					sidebarPanelRef.current.collapse();
				}
			}
		};

		checkScreenWidth();
		window.addEventListener("resize", checkScreenWidth);
		return () => {
			window.removeEventListener("resize", checkScreenWidth);
		};
	}, [sidebarPanelRef]);

	useEffect(() => {
		if (defaultCollapsed && sidebarPanelRef.current) {
			sidebarPanelRef.current.collapse();
		}
	}, [defaultCollapsed, sidebarPanelRef]);

	return (
		<ResizablePanelGroup
			className='h-full items-stretch bg-background rounded-lg'
			onLayoutChanged={(sizes) => {
				document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}; path=/;`;
			}}
		>
			<ResizablePanel
				id='sidebar'
				panelRef={sidebarPanelRef}
				defaultSize={isCollapsed ? "80px" : "28%"}
				collapsedSize='80px'
				collapsible={true}
				minSize={isMobile ? "0px" : "200px"}
				maxSize='450px'
				onResize={(panelSize) => {
					const collapsed = sidebarPanelRef.current
						? sidebarPanelRef.current.isCollapsed()
						: (typeof panelSize === "number" ? panelSize : panelSize?.inPixels ?? 200) <= 85;
					setIsCollapsed(collapsed);
					document.cookie = `react-resizable-panels:collapsed=${collapsed}; path=/;`;
				}}
				className={cn(isCollapsed && "min-w-[80px] transition-all duration-300 ease-in-out")}
			>
				<Sidebar isCollapsed={isCollapsed || isMobile} users={users} onToggleCollapse={handleToggleCollapse} />
			</ResizablePanel>

			<ResizableHandle withHandle onDoubleClick={handleToggleCollapse} />

			<ResizablePanel id='main' defaultSize='72%' minSize='300px'>
				{!selectedUser && (
					<div className='flex justify-center items-center h-full w-full px-10'>
						<div className='flex flex-col justify-center items-center gap-4'>
							<img src='/logo.png' alt='Logo' className='w-full md:w-2/3 lg:w-1/2' />
							<p className='text-muted-foreground text-center'>Click on a chat to view the messages</p>
						</div>
					</div>
				)}
				{selectedUser && <MessageContainer />}
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
export default ChatLayout;

/*
{!selectedUser && ()}
{selectedUser && <MessageContainer />}

*/