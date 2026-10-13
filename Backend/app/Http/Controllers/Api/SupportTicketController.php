<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\GmailSupportMailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class SupportTicketController extends Controller
{
    public function contact(Request $request, GmailSupportMailer $mailer): JsonResponse
    {
        $details = $request->validate([
            'name' => ['required', 'string', 'max:100', 'regex:/^[^\r\n]+$/u'],
            'email' => ['required', 'string', 'email:rfc', 'max:254'],
            'category' => ['required', Rule::in(['Technical', 'Billing', 'Account', 'Feedback'])],
            'subject' => ['required', 'string', 'max:120', 'regex:/^[^\r\n]+$/u'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'consent' => ['required', 'accepted'],
        ]);
        // Contact details are self-reported, never an authenticated account or role.
        $visitor = new User(['name' => $details['name'], 'email' => $details['email'], 'access_level' => 'visitor (unverified)']);

        return $this->deliver($visitor, [
            'category' => $details['category'],
            'subject' => $details['subject'],
            'description' => $details['message'],
            'page' => 'contact-support',
            'consent' => $details['consent'],
        ], $mailer);
    }

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

        return $this->deliver($request->user(), $ticket, $mailer);
    }

    private function deliver(User $user, array $ticket, GmailSupportMailer $mailer): JsonResponse
    {
        if (! $mailer->isConfigured()) {
            return response()->json(['message' => 'Support is temporarily unavailable. Your request was not sent. Please try again later.'], 503);
        }

        $reference = 'WBA-'.strtoupper((string) Str::ulid());
        try {
            $mailer->send($user, $ticket, $reference);
        } catch (Throwable) {
            Log::warning('Support ticket email was not confirmed.', ['reference' => $reference]);

            return response()->json(['message' => 'We could not confirm that your request was sent. Keep reference '.$reference.' and wait before trying again.', 'reference' => $reference], 502);
        }

        return response()->json(['data' => ['reference' => $reference, 'status' => 'sent']], 201);
    }
}
