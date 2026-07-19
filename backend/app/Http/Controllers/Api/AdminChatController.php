<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatMessageRequest;
use App\Http\Resources\ChatMessageResource;
use App\Http\Resources\ChatThreadResource;
use App\Models\ChatThread;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;

/** 5.2_API_List.md §6 — Admin chat management (FE-041), scope all. */
class AdminChatController extends Controller
{
    public function __construct(private readonly ChatService $chat) {}

    /** GET /admin/chat/threads */
    public function index(): JsonResponse
    {
        return response()->json(['data' => ChatThreadResource::collection($this->chat->listForAdmin())]);
    }

    /**
     * GET /admin/chat/threads/{thread}/messages — gap-filled: not
     * individually enumerated in 5.2_API_List.md, but FE-041 can't function
     * without it (same reasoning as every other gap-fill this module).
     */
    public function messages(ChatThread $thread): JsonResponse
    {
        $messages = $this->chat->messagesFor($thread, 'admin');

        return response()->json(['data' => ChatMessageResource::collection($messages)]);
    }

    /** POST /admin/chat/threads/{thread}/messages */
    public function storeMessage(ChatMessageRequest $request, ChatThread $thread): JsonResponse
    {
        $message = $this->chat->sendMessage($thread, $request->user(), 'admin', $request->validated('message'));

        return response()->json(['data' => new ChatMessageResource($message)], 201);
    }
}
