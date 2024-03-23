import React, {useCallback, useEffect, useState} from 'react'
import LiveCursors from "@/components/cursor/LiveCursors"
import {useBroadcastEvent, useEventListener, useMyPresence, useOthers} from "@/liveblocks.config"
import CursorChat from "@/components/cursor/CursorChat"
import {CursorMode, CursorState, Reaction} from "@/types/type"
import ReactionSelector from "@/components/reaction/ReactionSelector"
import useInterval from "@/hooks/useInterval"
import FlyingReaction from "@/components/reaction/FlyingReaction"

import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,} from "@/components/ui/context-menu"
import {shortcuts} from "@/constants";


type Props = {
	canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
	undo: () => void;
	redo: () => void;
}

const Live = ({ canvasRef, undo, redo }: Props) => {
	const [{ cursor }, updateMyPresence] = useMyPresence()
	const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden })
	const [reactions, setReactions] = useState<Reaction[]>([])

	const broadcast = useBroadcastEvent()

	//cleaning state, remove unvisible reactions
	useInterval(() => {
		setReactions((reactions) => reactions.filter((r) => r.timestamp > Date.now() - 4000))
	}, 1000)

	useInterval(() => {
		if(cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor){
			setReactions((reactions) => reactions.concat([{
				point: { x: cursor.x, y: cursor.y },
				value: cursorState.reaction,
				timestamp: Date.now()
			}]))

			broadcast({
				x: cursor.x,
				y: cursor.y,
				value: cursorState.reaction,
			})
		}
	}, 100)

	useEventListener((eventData) => {
		const event = eventData.event
		setReactions((reactions) => reactions.concat([{
				point: { x: event.x, y: event.y },
				value: event.value,
				timestamp: Date.now()
		}]))
	})

	useEffect(() => {
		const onKeyUp = (e: KeyboardEvent) => {
			if(e.key === '/'){
				setCursorState({
					mode: CursorMode.Chat,
					previousMessage: null,
					message: ''
				})
			}else if(e.key === 'Escape'){
				updateMyPresence({ message: '' })
				setCursorState({mode: CursorMode.Hidden})
			}else if(e.key === 'e'){
				setCursorState({
					mode: CursorMode.ReactionSelector
				})
			}
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if(e.key === '/'){
				e.preventDefault()
			}
		}

		window.addEventListener('keyup', onKeyUp)
		window.addEventListener('keydown', onKeyDown)

		return () => {
			window.removeEventListener('keyup', onKeyUp)
			window.removeEventListener('keydown', onKeyDown)
		}
	}, [updateMyPresence])


	const handlePointerMove = useCallback((event: React.PointerEvent) => {
		event.preventDefault()

		if(cursor == null || cursorState.mode !== CursorMode.ReactionSelector){
			const x = event.clientX - event.currentTarget.getBoundingClientRect().x
			const y = event.clientY - event.currentTarget.getBoundingClientRect().y

			updateMyPresence({ cursor: {x, y} })
		}
	}, [])

	const handlePointerLeave = useCallback((event: React.PointerEvent) => {
		setCursorState({ mode: CursorMode.Hidden })
		updateMyPresence({ cursor: null, message: null })
	}, [])

	const handlePointerUp = useCallback((event: React.PointerEvent) => {
		setCursorState((state: CursorState) =>
			cursorState.mode === CursorMode.Reaction ? {...state, isPressed: false} : state
		)
	}, [cursorState.mode, setCursorState])

	const handlePointerDown = useCallback((event: React.PointerEvent) => {
		const x = event.clientX - event.currentTarget.getBoundingClientRect().x
		const y = event.clientY - event.currentTarget.getBoundingClientRect().y

		updateMyPresence({ cursor: {x, y} })

		setCursorState((state: CursorState) =>
			cursorState.mode === CursorMode.Reaction ? {...state, isPressed: true} : state
		)
	}, [cursorState.mode, setCursorState])

	const setReaction = useCallback((reaction: string) => {
		setCursorState({
			mode: CursorMode.Reaction,
			reaction,
			isPressed: false
		})

	}, [])

	const handleContextMenuClick = useCallback((key:string) => {
		switch (key){
			case 'Chat':
				setCursorState({
					mode: CursorMode.Chat,
					previousMessage: null,
					message: '',
				})
				break;
			case 'Reactions':
				setCursorState({
					mode: CursorMode.ReactionSelector
				})
				break;
			case 'Undo':
				undo()
				break;
			case 'Redo':
				redo()
				break;
			default:
				break;
		}
	}, [])


	return (
		<ContextMenu>
			<ContextMenuTrigger
					id='canvas'
					onPointerMove={handlePointerMove}
					onPointerDown={handlePointerDown}
					onPointerUp={handlePointerUp}
					onPointerLeave={handlePointerLeave}
					className='relative h-full w-full flex flex-1 justify-center items-center'
				>
					<canvas ref={canvasRef} />

					{reactions.map((reaction) => (
						<FlyingReaction
							key={reaction.timestamp.toString()}
							x={reaction.point.x}
							y={reaction.point.y}
							timestamp={reaction.timestamp}
							value={reaction.value}
						/>
					))}

					{cursor && (
						<CursorChat
							cursor={cursor}
							cursorState={cursorState}
							setCursorState={setCursorState}
							updateMyPresence={updateMyPresence}
						/>
					)}

					{cursorState.mode === CursorMode.ReactionSelector && (
						<ReactionSelector
							setReaction={setReaction}
						/>
					)}

					<LiveCursors />

					{/*<Comments />*/}

				</ContextMenuTrigger>

			<ContextMenuContent className="right-menu-content">
				{shortcuts.map((item) => (
					<ContextMenuItem
						key={item.key}
						className="right-menu-item"
						onClick={() => handleContextMenuClick(item.name)}
					>
						<p>{item.name}</p>
						<p className="text-xs text-primary-grey-300">{item.shortcut}</p>
					</ContextMenuItem>
				))}
			</ContextMenuContent>
		</ContextMenu>
	)
}

export default Live
