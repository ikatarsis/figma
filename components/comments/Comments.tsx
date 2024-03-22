'use client'
import React from 'react';
import { ClientSideSuspense } from "@liveblocks/react";
import { CommentsOverlay } from "@/components/comments/CommentsOverlay";

const Comments = () => (
	<ClientSideSuspense fallback={null}>
		{() => <CommentsOverlay />}
	</ClientSideSuspense>
);

export default Comments;
