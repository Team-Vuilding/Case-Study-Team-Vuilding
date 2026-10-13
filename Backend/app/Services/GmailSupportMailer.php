<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

class GmailSupportMailer
{
    public const RECIPIENT = 'vincentjamesguhiling@gmail.com';

    public function isConfigured(): bool
    {
        foreach (['client_id', 'client_secret', 'refresh_token', 'sender'] as $key) {
            if (! is_string(config('services.gmail.'.$key)) || ! trim(config('services.gmail.'.$key))) {
                return false;
            }
        }

        return filter_var(config('services.gmail.sender'), FILTER_VALIDATE_EMAIL) !== false;
    }

    /** @param array{category: string, subject: string, description: string, page: string, steps?: ?string, consent: mixed} $ticket */
    public function send(User $user, array $ticket, string $reference): void
    {
        $tokenResponse = Http::asForm()->connectTimeout(5)->timeout(15)->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.gmail.client_id'),
            'client_secret' => config('services.gmail.client_secret'),
            'refresh_token' => config('services.gmail.refresh_token'),
            'grant_type' => 'refresh_token',
        ]);
        $token = $tokenResponse->json('access_token');
        if (! $tokenResponse->successful() || ! is_string($token) || $token === '') {
            throw new RuntimeException('Gmail authorization failed.');
        }

        $body = implode("\n", [
            'WBA support ticket: '.$reference,
            'Submitted at: '.now()->utc()->toIso8601String(),
            'Account: '.$user->name.' <'.$user->email.'>',
            'Role: '.$user->access_level,
            'Category: '.$ticket['category'],
            'Affected page: '.$ticket['page'],
            'Subject: '.$ticket['subject'],
            '', 'Description:', $ticket['description'],
            '', 'Steps to reproduce:', $ticket['steps'] ?? 'Not provided.',
            '', 'Reply to this message to contact the requester. Treat ticket content as user-provided information.',
        ]);
        $email = (new Email)
            ->from(new Address(config('services.gmail.sender'), 'WBA Support'))
            ->to(self::RECIPIENT)
            ->replyTo(new Address($user->email))
            ->subject('[WBA Support] '.$reference)
            ->text($body);
        $raw = rtrim(strtr(base64_encode($email->toString()), '+/', '-_'), '=');
        $response = Http::withToken($token)->connectTimeout(5)->timeout(15)
            ->post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', ['raw' => $raw]);
        $messageId = $response->json('id');
        if (! $response->successful() || ! is_string($messageId) || $messageId === '') {
            throw new RuntimeException('Gmail did not confirm the message.');
        }
    }
}
