<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatMessageRequest;
use App\Http\Resources\ChatMessageResource;
use App\Http\Resources\ChatThreadResource;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * 5.2_API_List.md §4 — /chat/threads (FR-028), scope own. Customer side
 * only — admin chat management (FE-041, /admin/chat/*) is the later Admin
 * Dashboard module's job (5.2_API_List.md §6).
 */
class ChatController extends Controller
{
    public function __construct(private readonly ChatService $chat) {}

    /** GET /chat/threads — returns (and lazily creates) the customer's own thread. */
    public function index(Request $request): JsonResponse
    {
        $thread = $this->chat->getOrCreateThreadFor($request->user());

        return response()->json(['data' => [new ChatThreadResource($thread)]]);
    }

    /** GET /chat/threads/{thread}/messages — scoped to the user's own thread, 404s otherwise. */
    public function messages(Request $request, int $thread): JsonResponse
    {
        $thread = $request->user()->chatThread()->where('id', $thread)->firstOrFail();
        $messages = $this->chat->messagesFor($thread, 'customer');

        return response()->json(['data' => ChatMessageResource::collection($messages)]);
    }

    /** POST /chat/threads/{thread}/messages */
    public function storeMessage(ChatMessageRequest $request, int $thread): JsonResponse
    {
        $thread = $request->user()->chatThread()->where('id', $thread)->firstOrFail();
        $message = $this->chat->sendMessage($thread, $request->user(), 'customer', $request->validated('message'));

        return response()->json(['data' => new ChatMessageResource($message)], 201);
    }
}
