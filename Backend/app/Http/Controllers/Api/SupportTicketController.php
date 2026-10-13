<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GmailSupportMailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class SupportTicketController extends Controller
{
    public function store(Request $request, GmailSupportMailer $mailer): JsonResponse
    {
        $ticket = $request->validate([
            'category' => ['required', Rule::in(['access', 'inventory', 'warehouse', 'purchasing', 'technical', 'other'])],
            'subject' => ['required', 'string', 'max:120', 'regex:/^[^\r\n]+$/u'],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
            'page' => ['required', Rule::in(['sign-in', 'dashboard', 'inventory', 'purchase-history', 'audit-logs', 'manage-accounts', 'help-center', 'other'])],
            'steps' => ['nullable', 'string', 'max:2000'],
            'consent' => ['required', 'accepted'],
        ]);
        if (! $mailer->isConfigured()) {
            return response()->json(['message' => 'Ticket email is not configured yet. Your ticket was not sent. Contact '.GmailSupportMailer::RECIPIENT.' directly.'], 503);
        }

        $reference = 'WBA-'.strtoupper((string) Str::ulid());
        try {
            $mailer->send($request->user(), $ticket, $reference);
        } catch (Throwable) {
            Log::warning('Support ticket email was not confirmed.', ['reference' => $reference]);

            return response()->json(['message' => 'We could not confirm that your ticket was sent. Your form has been kept. Contact '.GmailSupportMailer::RECIPIENT.' and mention reference '.$reference.' before resending.', 'reference' => $reference], 502);
        }

        return response()->json(['data' => ['reference' => $reference, 'status' => 'sent']], 201);
    }
}
