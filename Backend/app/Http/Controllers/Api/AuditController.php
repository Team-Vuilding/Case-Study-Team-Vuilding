<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditController extends ApiController
{
    public function audits(Request $request): JsonResponse
    {
        $query = DB::table('audit_events')->orderByDesc('id');
        if ($request->is('api/users/activity-logs')) {
            $query->whereIn('event_type', ['Signed in', 'Created account', 'Updated account', 'Deactivated account']);
        } else {
            $query->where('event_type', '!=', 'Signed in');
        }

        return response()->json(['data' => $query->limit(1000)->get()->map(fn ($event) => [
            'id' => $event->id, 'timestamp' => $event->created_at, 'at' => $event->created_at, 'actor' => $event->actor,
            'eventType' => $event->event_type, 'action' => $event->event_type, 'target' => $event->target,
            'severity' => $event->severity, 'description' => $event->description, 'actionTaken' => 'Recorded in the database.',
        ])]);
    }
}
